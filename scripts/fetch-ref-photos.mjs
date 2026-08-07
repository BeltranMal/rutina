// Baja las fotos de referencia de free-exercise-db (dominio público) y las deja
// en public/ref como webp. Necesita ImageMagick (`magick`) en el PATH.
//
//   node scripts/fetch-ref-photos.mjs
//
// El mapeo es a mano: el dataset no tiene los ids del programa y varios
// ejercicios del gimnasio no existen tal cual, así que se elige el más parecido.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SOURCE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

const MAP = {
  "hack-squat": "Hack_Squat",
  "press-pecho-maquina": "Leverage_Chest_Press",
  "femoral-sentado": "Seated_Leg_Curl",
  "press-hombro-maquina": "Machine_Shoulder_Military_Press",
  "laterales-maquina": "Cable_Seated_Lateral_Raise",
  "crunch-maquina": "Ab_Crunch_Machine",
  "remo-maquina": "Lying_T-Bar_Row",
  "jalon": "Full_Range-Of-Motion_Lat_Pulldown",
  "remo-polea": "Seated_Cable_Rows",
  "face-pull": "Face_Pull",
  "curl-predicador": "Machine_Preacher_Curls",
  "triceps-polea": "Triceps_Pushdown",
  "prensa": "Leg_Press",
  "isquios": "Lying_Leg_Curls",
  "pec-deck": "Butterfly",
  "pullover": "Rope_Straight-Arm_Pulldown",
  "gemelos": "Standing_Calf_Raises",
  "martillo-polea": "Cable_Hammer_Curls_-_Rope_Attachment"
};

const out = new URL("../public/ref/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });

for (const [id, dir] of Object.entries(MAP)) {
  for (const n of [0, 1]) {
    const res = await fetch(`${SOURCE}/${dir}/${n}.jpg`);
    if (!res.ok) throw new Error(`${id}: ${res.status} en ${dir}/${n}.jpg`);
    const jpg = join(tmpdir(), `${id}-${n}.jpg`);
    writeFileSync(jpg, Buffer.from(await res.arrayBuffer()));
    execFileSync("magick", [jpg, "-resize", "640x640", "-quality", "72", join(out, `${id}-${n}.webp`)]);
    console.log(id, n);
  }
}
