import { useCallback, useEffect, useState } from "preact/hooks";
import { PROGRAM, exerciseById, slotKey, type Exercise } from "./program";

export type State = {
  week: number;
  log: Record<string, number[]>;
  weights: Record<string, number>;
};

export const EMPTY: State = { week: 1, log: {}, weights: {} };

const DB = "rutina";
const STORE = "state";
const KEY = "current";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = run(db.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

/* ------------------------------------------------------------------ */
/* Saneado                                                             */
/* ------------------------------------------------------------------ */

function clampWeek(v: unknown): number {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.max(1, Math.min(520, n)) : 1;
}

function clampKg(v: unknown, fallback: number): number {
  const n = Math.round(Number(v) * 2) / 2;
  return Number.isFinite(n) ? Math.max(0, Math.min(1000, n)) : fallback;
}

function clampReps(raw: unknown, sets: number): number[] {
  const src = Array.isArray(raw) ? raw : [];
  const out = new Array(sets).fill(0);
  for (let i = 0; i < sets; i++) {
    const v = Number(src[i]);
    out[i] = Number.isFinite(v) && v > 0 ? Math.min(300, Math.floor(v)) : 0;
  }
  return out;
}

/**
 * Toda entrada al store pasa por acá: lo que viene de IndexedDB, de un JSON
 * importado y del arranque en frío. Descarta ejercicios que ya no existen en el
 * programa, así un export viejo no rompe la app cuando cambian las máquinas.
 */
export function sanitize(raw: unknown): State {
  const src = (raw && typeof raw === "object" ? raw : {}) as Partial<State>;

  const weights: Record<string, number> = {};
  for (const ex of PROGRAM.exercises) weights[ex.id] = ex.start;
  for (const [id, kg] of Object.entries(src.weights ?? {})) {
    const ex = exerciseById(id);
    if (ex) weights[ex.id] = clampKg(kg, ex.start);
  }

  const log: Record<string, number[]> = {};
  for (const [slot, reps] of Object.entries(src.log ?? {})) {
    const [prefix, exerciseId] = String(slot).split(":");
    const ex = exerciseById(exerciseId ?? "");
    // La clave la arma slotKey: "w" + semana + ":" + ejercicio.
    if (!ex || !/^w\d+$/.test(prefix ?? "")) continue;
    const clean = clampReps(reps, ex.sets);
    if (clean.some((v) => v > 0)) log[slot] = clean;
  }

  return { week: clampWeek(src.week), log, weights };
}

/* ------------------------------------------------------------------ */
/* Export / import                                                     */
/* ------------------------------------------------------------------ */

export type Backup = { app: "rutina"; version: 1; exportedAt: string; state: State };

export function toBackup(state: State): Backup {
  return { app: "rutina", version: 1, exportedAt: new Date().toISOString(), state };
}

export function fromBackup(text: string): State {
  const parsed = JSON.parse(text) as Partial<Backup> & Partial<State>;
  // Acepta tanto el sobre { app, version, state } como un State pelado.
  return sanitize(parsed.state ?? parsed);
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export type Store = {
  state: State;
  ready: boolean;
  logSet: (ex: Exercise, setIndex: number, reps: number) => void;
  setWeight: (exerciseId: string, kg: number) => void;
  setWeek: (week: number) => void;
  replace: (next: State) => void;
};

export function useStore(): Store {
  const [state, setState] = useState<State>(EMPTY);
  const [ready, setReady] = useState(false);
  const [writable, setWritable] = useState(true);

  useEffect(() => {
    let live = true;
    tx("readonly", (s) => s.get(KEY) as IDBRequest<unknown>)
      .then((raw) => {
        if (live) setState(sanitize(raw));
      })
      .catch(() => setWritable(false))
      .finally(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, []);

  const commit = useCallback(
    (next: State) => {
      setState(next);
      if (writable) void tx("readwrite", (s) => s.put(next, KEY)).catch(() => setWritable(false));
    },
    [writable]
  );

  const logSet = useCallback(
    (ex: Exercise, setIndex: number, reps: number) => {
      if (setIndex < 0 || setIndex >= ex.sets) return;
      setState((prev) => {
        const slot = slotKey(prev.week, ex.id);
        const next = clampReps(prev.log[slot], ex.sets);
        next[setIndex] = Math.max(0, Math.min(300, Math.floor(reps)));
        const log = { ...prev.log };
        if (next.some((v) => v > 0)) log[slot] = next;
        else delete log[slot];
        const updated = { ...prev, log };
        if (writable) void tx("readwrite", (s) => s.put(updated, KEY)).catch(() => setWritable(false));
        return updated;
      });
    },
    [writable]
  );

  const setWeight = useCallback(
    (exerciseId: string, kg: number) => {
      const ex = exerciseById(exerciseId);
      if (!ex) return;
      setState((prev) => {
        const updated = { ...prev, weights: { ...prev.weights, [ex.id]: clampKg(kg, ex.start) } };
        if (writable) void tx("readwrite", (s) => s.put(updated, KEY)).catch(() => setWritable(false));
        return updated;
      });
    },
    [writable]
  );

  const setWeek = useCallback(
    (week: number) => {
      setState((prev) => {
        const updated = { ...prev, week: clampWeek(week) };
        if (writable) void tx("readwrite", (s) => s.put(updated, KEY)).catch(() => setWritable(false));
        return updated;
      });
    },
    [writable]
  );

  return { state, ready, logSet, setWeight, setWeek, replace: commit };
}
