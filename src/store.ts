import { useCallback, useEffect, useState } from "preact/hooks";
import { exerciseById, slotKey, type Exercise } from "./program.ts";
import {
  EMPTY,
  clampKg,
  clampReps,
  clampWeek,
  emptyEntry,
  hasWork,
  sanitize,
  type State
} from "./state.ts";

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

export type Store = {
  state: State;
  ready: boolean;
  logSet: (ex: Exercise, setIndex: number, reps: number, kg: number) => void;
  setWeight: (exerciseId: string, kg: number) => void;
  setWeek: (week: number) => void;
  markExported: () => void;
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

  const persist = useCallback(
    (next: State) => {
      if (writable) void tx("readwrite", (s) => s.put(next, KEY)).catch(() => setWritable(false));
      return next;
    },
    [writable]
  );

  const update = useCallback((fn: (prev: State) => State) => setState((prev) => persist(fn(prev))), [persist]);

  const logSet = useCallback(
    (ex: Exercise, setIndex: number, reps: number, kg: number) => {
      if (setIndex < 0 || setIndex >= ex.sets) return;
      update((prev) => {
        const slot = slotKey(prev.week, ex.id);
        const current = prev.log[slot] ?? emptyEntry(ex, prev.weights[ex.id] ?? ex.start);
        const entry = {
          reps: clampReps(current.reps, ex.sets),
          kg: [...current.kg]
        };
        entry.reps[setIndex] = Math.max(0, Math.min(300, Math.floor(reps)));
        // La serie se queda con el peso que tenía puesto en el momento; si se
        // deshace vuelve a seguir al peso propuesto del ejercicio.
        entry.kg[setIndex] = clampKg(kg, ex.start);
        const log = { ...prev.log };
        if (hasWork(entry)) log[slot] = entry;
        else delete log[slot];
        return { ...prev, log };
      });
    },
    [update]
  );

  const setWeight = useCallback(
    (exerciseId: string, kg: number) => {
      const ex = exerciseById(exerciseId);
      if (!ex) return;
      update((prev) => ({ ...prev, weights: { ...prev.weights, [ex.id]: clampKg(kg, ex.start) } }));
    },
    [update]
  );

  const setWeek = useCallback((week: number) => update((prev) => ({ ...prev, week: clampWeek(week) })), [update]);

  const markExported = useCallback(
    () => update((prev) => ({ ...prev, lastExport: new Date().toISOString() })),
    [update]
  );

  const replace = useCallback((next: State) => update(() => next), [update]);

  return { state, ready, logSet, setWeight, setWeek, markExported, replace };
}
