// Lógica pura del estado: sin DOM, sin IndexedDB, sin Preact. Todo lo que entra
// a la app —lo que estaba guardado, lo que se importa de un JSON— pasa por acá.
import { PROGRAM, exerciseById, type Exercise } from "./program.ts";

/**
 * Una serie guarda sus propias reps *y su propio peso*. Guardar un solo kg por
 * ejercicio hacía que subir el peso a mitad de la sesión reescribiera para atrás
 * las series ya registradas, y que la comparación con la semana anterior fuera
 * contra un peso que ya no era el de entonces.
 */
export type SetEntry = { reps: number[]; kg: number[] };

export type State = {
  week: number;
  log: Record<string, SetEntry>;
  /** Peso propuesto para la próxima serie de cada ejercicio. */
  weights: Record<string, number>;
  /** ISO del último export, para poder avisar cuando hace mucho que no hay copia. */
  lastExport: string | null;
};

export const EMPTY: State = { week: 1, log: {}, weights: {}, lastExport: null };

export function clampWeek(v: unknown): number {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.max(1, Math.min(520, n)) : 1;
}

export function clampKg(v: unknown, fallback: number): number {
  const n = Math.round(Number(v) * 2) / 2;
  return Number.isFinite(n) ? Math.max(0, Math.min(1000, n)) : fallback;
}

export function clampReps(raw: unknown, sets: number): number[] {
  const src = Array.isArray(raw) ? raw : [];
  const out = new Array(sets).fill(0);
  for (let i = 0; i < sets; i++) {
    const v = Number(src[i]);
    out[i] = Number.isFinite(v) && v > 0 ? Math.min(300, Math.floor(v)) : 0;
  }
  return out;
}

export function emptyEntry(ex: Exercise, kg: number): SetEntry {
  return { reps: new Array(ex.sets).fill(0), kg: new Array(ex.sets).fill(kg) };
}

export function hasWork(entry: SetEntry): boolean {
  return entry.reps.some((v) => v > 0);
}

/**
 * Acepta el formato viejo, donde el valor del slot era el array de reps pelado y
 * el peso vivía aparte por ejercicio. En ese caso se le asigna a cada serie el
 * peso que había guardado para el ejercicio: es lo más cercano a la verdad que
 * se puede reconstruir.
 */
function toEntry(raw: unknown, ex: Exercise, fallbackKg: number): SetEntry {
  const src = Array.isArray(raw) ? { reps: raw, kg: undefined } : ((raw ?? {}) as Partial<SetEntry>);
  const reps = clampReps(src.reps, ex.sets);
  const kg = new Array(ex.sets).fill(0).map((_, i) => {
    const v = Array.isArray(src.kg) ? Number(src.kg[i]) : NaN;
    return Number.isFinite(v) && v > 0 ? clampKg(v, fallbackKg) : fallbackKg;
  });
  return { reps, kg };
}

export function sanitize(raw: unknown): State {
  const src = (raw && typeof raw === "object" ? raw : {}) as Partial<State>;

  const weights: Record<string, number> = {};
  for (const ex of PROGRAM.exercises) weights[ex.id] = ex.start;
  for (const [id, kg] of Object.entries(src.weights ?? {})) {
    const ex = exerciseById(id);
    if (ex) weights[ex.id] = clampKg(kg, ex.start);
  }

  const log: Record<string, SetEntry> = {};
  for (const [slot, value] of Object.entries(src.log ?? {})) {
    const [prefix, exerciseId] = String(slot).split(":");
    const ex = exerciseById(exerciseId ?? "");
    // La clave la arma slotKey: "w" + semana + ":" + ejercicio.
    if (!ex || !/^w\d+$/.test(prefix ?? "")) continue;
    const entry = toEntry(value, ex, weights[ex.id] ?? ex.start);
    if (hasWork(entry)) log[slot] = entry;
  }

  const lastExport = typeof src.lastExport === "string" && !Number.isNaN(Date.parse(src.lastExport))
    ? src.lastExport
    : null;

  return { week: clampWeek(src.week), log, weights, lastExport };
}

/* ------------------------------------------------------------------ */
/* Export / import                                                     */
/* ------------------------------------------------------------------ */

export type Backup = { app: "rutina"; version: 2; exportedAt: string; state: State };

export function toBackup(state: State, at: string): Backup {
  return { app: "rutina", version: 2, exportedAt: at, state };
}

export function fromBackup(text: string): State {
  const parsed = JSON.parse(text) as Partial<Backup> & Partial<State>;
  // Acepta tanto el sobre { app, version, state } como un State pelado.
  return sanitize(parsed.state ?? parsed);
}

/** Días desde el último export. null si nunca se exportó. */
export function daysSinceExport(state: State, now: number): number | null {
  if (!state.lastExport) return null;
  return Math.floor((now - Date.parse(state.lastExport)) / 86400000);
}

/** Semanas con algo registrado, de la más reciente a la más vieja. */
export function historyFor(state: State, exerciseId: string): { week: number; entry: SetEntry }[] {
  const out: { week: number; entry: SetEntry }[] = [];
  for (const [slot, entry] of Object.entries(state.log)) {
    const [prefix, id] = slot.split(":");
    if (id !== exerciseId) continue;
    out.push({ week: Number(prefix.slice(1)), entry });
  }
  return out.sort((a, b) => b.week - a.week);
}
