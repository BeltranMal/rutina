import assert from "node:assert/strict";
import { test } from "node:test";
import { exerciseById, slotKey } from "../src/program.ts";
import { daysSinceExport, fromBackup, historyFor, sanitize, toBackup } from "../src/state.ts";

const HACK = exerciseById("hack-squat")!;

test("sanitize parte de un estado usable con cualquier basura", () => {
  for (const junk of [undefined, null, 0, "x", [], { week: "no" }, { log: 5, weights: "x" }]) {
    const s = sanitize(junk);
    assert.equal(s.week, 1);
    assert.deepEqual(s.log, {});
    assert.equal(s.weights[HACK.id], HACK.start);
    assert.equal(s.lastExport, null);
  }
});

test("descarta slots con clave inválida o de ejercicios que ya no existen", () => {
  const s = sanitize({
    log: {
      [slotKey(1, HACK.id)]: { reps: [9, 0, 0], kg: [40, 40, 40] },
      "1:hack-squat": { reps: [9], kg: [40] },
      "w1:no-existe": { reps: [9], kg: [40] },
      basura: { reps: [9], kg: [40] }
    }
  });
  assert.deepEqual(Object.keys(s.log), [slotKey(1, HACK.id)]);
});

// El formato viejo guardaba solo las reps y un kg por ejercicio, así que al
// subir el peso las series ya registradas cambiaban de peso para atrás.
test("migra el formato viejo poniéndole a cada serie el peso del ejercicio", () => {
  const s = sanitize({
    week: 3,
    log: { [slotKey(2, HACK.id)]: [10, 9, 0] },
    weights: { [HACK.id]: 45 }
  });
  const entry = s.log[slotKey(2, HACK.id)];
  assert.deepEqual(entry.reps, [10, 9, 0]);
  assert.deepEqual(entry.kg, [45, 45, 45]);
});

test("cada serie conserva su propio peso", () => {
  const s = sanitize({
    log: { [slotKey(1, HACK.id)]: { reps: [10, 8, 8], kg: [40, 45, 45] } },
    weights: { [HACK.id]: 50 }
  });
  assert.deepEqual(s.log[slotKey(1, HACK.id)].kg, [40, 45, 45]);
});

test("tira los slots sin ninguna serie hecha", () => {
  const s = sanitize({ log: { [slotKey(1, HACK.id)]: { reps: [0, 0, 0], kg: [40, 40, 40] } } });
  assert.deepEqual(s.log, {});
});

test("recorta valores fuera de rango", () => {
  const s = sanitize({
    week: 99999,
    log: { [slotKey(1, HACK.id)]: { reps: [9999, -3, 8.7], kg: [-5, 99999, 40.3] } },
    weights: { [HACK.id]: 12345 }
  });
  assert.equal(s.week, 520);
  assert.equal(s.weights[HACK.id], 1000);
  assert.deepEqual(s.log[slotKey(1, HACK.id)].reps, [300, 0, 8]);
  const kg = s.log[slotKey(1, HACK.id)].kg;
  assert.equal(kg[1], 1000);
  assert.equal(kg[2], 40.5);
});

test("el export vuelve igual al importarlo, salvo la fecha, que se actualiza", () => {
  const original = sanitize({
    week: 4,
    log: { [slotKey(4, HACK.id)]: { reps: [10, 10, 9], kg: [40, 40, 42.5] } },
    weights: { [HACK.id]: 42.5 },
    lastExport: "2026-08-01T00:00:00.000Z"
  });
  const at = "2026-08-07T00:00:00.000Z";
  const back = fromBackup(JSON.stringify(toBackup(original, at)));
  assert.deepEqual(back, { ...original, lastExport: at });
});

test("el archivo exportado se lleva la fecha del export adentro", () => {
  const at = "2026-08-07T00:00:00.000Z";
  const backup = toBackup(sanitize({ week: 1 }), at);
  assert.equal(backup.state.lastExport, at, "el estado guardado quedó con la marca vieja");
  // Reimportarlo no puede hacer reaparecer el aviso de copia vieja.
  assert.equal(fromBackup(JSON.stringify(backup)).lastExport, at);
});

test("un export viejo sin lastExport usa la fecha del sobre", () => {
  const at = "2026-08-01T00:00:00.000Z";
  const v1 = { app: "rutina", version: 1, exportedAt: at, state: { week: 1, log: {}, weights: {} } };
  assert.equal(fromBackup(JSON.stringify(v1)).lastExport, at);
});

test("también acepta un State pelado, sin el sobre del export", () => {
  const s = fromBackup(JSON.stringify({ week: 2, log: {}, weights: {} }));
  assert.equal(s.week, 2);
});

test("daysSinceExport cuenta desde la última copia", () => {
  const base = sanitize({});
  assert.equal(daysSinceExport(base, Date.now()), null);
  const s = { ...base, lastExport: "2026-08-01T00:00:00.000Z" };
  assert.equal(daysSinceExport(s, Date.parse("2026-08-08T00:00:00.000Z")), 7);
});

test("historyFor devuelve solo ese ejercicio, de la semana más nueva a la más vieja", () => {
  const other = exerciseById("prensa")!;
  const s = sanitize({
    log: {
      [slotKey(1, HACK.id)]: { reps: [8, 8, 8], kg: [40, 40, 40] },
      [slotKey(3, HACK.id)]: { reps: [10, 10, 10], kg: [45, 45, 45] },
      [slotKey(2, other.id)]: { reps: [12, 12, 12], kg: [60, 60, 60] }
    }
  });
  assert.deepEqual(
    historyFor(s, HACK.id).map((h) => h.week),
    [3, 1]
  );
  assert.equal(historyFor(s, other.id).length, 1);
});
