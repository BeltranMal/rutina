// Corre con el runner de Node, sin dependencias:
//   npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { PROGRAM, poseAt, type Exercise, type Joint, type Pose } from "../src/program.ts";

const CHAIN: [string, string][] = [
  ["hip", "knee"],
  ["knee", "ankle"],
  ["shoulder", "elbow"],
  ["elbow", "hand"]
];

const dist = (a: Joint, b: Joint) => Math.hypot(b[0] - a[0], b[1] - a[1]);

function linear(ex: Exercise, t: number): Pose {
  const [a, b] = ex.poses;
  const out: Pose = {};
  for (const k of Object.keys(a)) {
    const pa = a[k];
    const pb = b[k] ?? pa;
    out[k] = [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t];
  }
  return out;
}

test("el programa tiene los 18 ejercicios repartidos en 3 días", () => {
  assert.equal(PROGRAM.exercises.length, 18);
  assert.equal(PROGRAM.days.length, 3);
  const ids = PROGRAM.exercises.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length, "hay ids repetidos");
  for (const ex of PROGRAM.exercises) {
    assert.ok(
      PROGRAM.days.some((d) => d.id === ex.day),
      ex.id + " apunta a un día que no existe"
    );
    assert.equal(ex.poses.length, 2, ex.id + " no tiene exactamente dos poses");
  }
});

// Esto es lo que protege la geometría validada contra fotos: la interpolación
// puede cambiar el camino entre las dos poses, pero nunca las poses mismas.
test("poseAt devuelve la pose dibujada, exacta, en t=0 y t=1", () => {
  for (const ex of PROGRAM.exercises) {
    for (const t of [0, 1] as const) {
      const got = poseAt(ex, t);
      for (const [joint, want] of Object.entries(ex.poses[t])) {
        assert.ok(
          dist(got[joint], want) < 0.001,
          `${ex.id} ${joint} en t=${t}: ${got[joint]} en vez de ${want}`
        );
      }
    }
  }
});

test("los miembros no se estiran ni se encogen durante la animación", () => {
  for (const ex of PROGRAM.exercises) {
    for (const [a, b] of CHAIN) {
      if (!ex.poses[0][a] || !ex.poses[0][b]) continue;
      const ends = [dist(ex.poses[0][a], ex.poses[0][b]), dist(ex.poses[1][a], ex.poses[1][b])];
      const lo = Math.min(...ends);
      const hi = Math.max(...ends);
      for (let i = 0; i <= 20; i++) {
        const len = dist(...(([a, b].map((k) => poseAt(ex, i / 20)[k]) as [Joint, Joint])));
        assert.ok(
          len >= lo - 0.1 && len <= hi + 0.1,
          `${ex.id} ${a}->${b} mide ${len.toFixed(2)} a t=${i / 20}, fuera de [${lo.toFixed(2)}, ${hi.toFixed(2)}]`
        );
      }
    }
  }
});

test("las articulaciones describen un arco, no la recta entre las dos poses", () => {
  const straight = PROGRAM.exercises
    .filter((ex) => {
      const arc = poseAt(ex, 0.5);
      const line = linear(ex, 0.5);
      return !["knee", "ankle", "elbow", "hand"].some(
        (j) => arc[j] && line[j] && dist(arc[j], line[j]) > 1
      );
    })
    .map((ex) => ex.id)
    .sort();

  // Los únicos dos sin nada que curvar: en los gemelos el cuerpo entero se
  // traslada y en el crunch el recorrido ya es prácticamente recto.
  assert.deepEqual(straight, ["crunch-maquina", "gemelos"]);
});

test("la pose interpolada no inventa ni pierde articulaciones", () => {
  for (const ex of PROGRAM.exercises) {
    const want = Object.keys(ex.poses[0]).sort();
    assert.deepEqual(Object.keys(poseAt(ex, 0.37)).sort(), want, ex.id);
  }
});
