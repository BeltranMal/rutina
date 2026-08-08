import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import {
  MUSCLE,
  PROGRAM,
  easeInOut,
  exerciseById,
  exercisesForDay,
  formatRest,
  poseAt,
  progressionFor,
  slotKey,
  type Equip,
  type Exercise,
  type Joint,
  type Pose
} from "./program.ts";
import { useStore } from "./store.ts";
import {
  daysSinceExport,
  emptyEntry,
  fromBackup,
  historyFor,
  toBackup,
  type SetEntry,
  type State
} from "./state.ts";

const ACCENT = "#5b8cff";
const BONE = "#d6d9e2";
const STEEL = "#565b6d";

/* ------------------------------------------------------------------ */
/* Esquema del movimiento                                              */
/* ------------------------------------------------------------------ */

function Limb(props: { a: Joint; b: Joint; w: number; c: string }) {
  return (
    <line
      x1={props.a[0]}
      y1={props.a[1]}
      x2={props.b[0]}
      y2={props.b[1]}
      stroke={props.c}
      stroke-width={props.w}
      stroke-linecap="round"
    />
  );
}

function mirror(p: Joint): Joint {
  return [200 - p[0], p[1]];
}

const OUTLINE = "#0b0c10";
const SHADE = "#8b90a0";

/**
 * Un hueso como cápsula de radio distinto en cada punta: la pierna es gruesa
 * arriba y afina en el tobillo. Las tapas se muestrean en vez de usar arcos SVG
 * para no pelearse con los flags de barrido.
 */
function bone(a: Joint, b: Joint, wa: number, wb: number): string {
  const base = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const pts: string[] = [];
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const t = base + Math.PI / 2 + (Math.PI * i) / steps;
    pts.push((a[0] + Math.cos(t) * wa).toFixed(2) + "," + (a[1] + Math.sin(t) * wa).toFixed(2));
  }
  for (let i = 0; i <= steps; i++) {
    const t = base - Math.PI / 2 + (Math.PI * i) / steps;
    pts.push((b[0] + Math.cos(t) * wb).toFixed(2) + "," + (b[1] + Math.sin(t) * wb).toFixed(2));
  }
  return "M" + pts.join("L") + "Z";
}

type Shape = { d: string; c: string };

/** Elipse como path, para que la cabeza entre en el mismo pase que el resto. */
function oval(at: Joint, rx: number, ry: number, tilt: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 24; i++) {
    const t = (Math.PI * 2 * i) / 24;
    const x = Math.cos(t) * rx;
    const y = Math.sin(t) * ry;
    pts.push(
      (at[0] + x * Math.cos(tilt) - y * Math.sin(tilt)).toFixed(2) +
        "," +
        (at[1] + x * Math.sin(tilt) + y * Math.cos(tilt)).toFixed(2)
    );
  }
  return "M" + pts.join("L") + "Z";
}

/** Punto a fracción del camino de a a b. */
function along(a: Joint, b: Joint, k: number): Joint {
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

/** Prolonga el segmento a→b más allá de b, para la mano. */
function beyond(a: Joint, b: Joint, by: number): Joint {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [b[0] + ((b[0] - a[0]) / len) * by, b[1] + ((b[1] - a[1]) / len) * by];
}

/**
 * Dibuja un grupo de piezas como una sola silueta: primero todas engordadas en
 * el color del contorno, después los rellenos sin trazo. Así el contorno queda
 * solo por fuera y adentro no se ven las costuras entre muslo y pantorrilla, que
 * es lo que hacía que el cuerpo pareciera un maniquí de madera.
 *
 * Cada cadena que se superpone con otra —el brazo sobre el torso, la pierna
 * lejana sobre la cercana— va en su propio grupo, para que ahí sí quede la línea
 * que las separa.
 */
function Silhouette(props: { shapes: Shape[] }) {
  return (
    <g>
      {props.shapes.map((s, i) => (
        <path key={"o" + i} d={s.d} fill={OUTLINE} stroke={OUTLINE} stroke-width={2.6} stroke-linejoin="round" />
      ))}
      {props.shapes.map((s, i) => (
        <path key={"f" + i} d={s.d} fill={s.c} />
      ))}
    </g>
  );
}

function Figure(props: { ex: Exercise; pose: Pose }) {
  const { ex, pose: p } = props;
  const hot = new Set(ex.primary.map((m) => (MUSCLE[m] ? MUSCLE[m][0] : "")).filter(Boolean));
  const color = (k: string) => (hot.has(k) ? ACCENT : BONE);
  const cap = (a: Joint, b: Joint, wa: number, wb: number, c: string): Shape => ({ d: bone(a, b, wa, wb), c });

  const leg = (hip: Joint, knee: Joint, ankle: Joint, toe: Joint, heel: Joint | undefined, dim: string | null): Shape[] => [
    cap(hip, knee, 5.6, 4, dim ?? color("thigh")),
    cap(knee, ankle, 4, 2.7, dim ?? color("shin")),
    cap(ankle, toe, 3, 2.3, dim ?? BONE),
    ...(heel ? [cap(ankle, heel, 3, 2.4, dim ?? BONE)] : [])
  ];

  const arm = (shoulder: Joint, elbow: Joint, hand: Joint, dim: string | null): Shape[] => [
    cap(shoulder, elbow, 3.9, 2.9, dim ?? color("upperarm")),
    cap(elbow, hand, 2.9, 2.3, dim ?? color("forearm")),
    // La mano: un bloque corto en la prolongación del antebrazo. Sin esto el
    // brazo termina en punta y es donde el ojo detecta que no es una persona.
    cap(hand, beyond(elbow, hand, 4.5), 2.5, 2.2, dim ?? BONE)
  ];

  /** Pelvis y caja torácica por separado, con la cintura más angosta en el medio. */
  const trunk = (hip: Joint, shoulder: Joint, wHip: number, wWaist: number, wChest: number): Shape[] => {
    const waist = along(hip, shoulder, 0.45);
    return [cap(hip, waist, wHip, wWaist, color("torso")), cap(waist, shoulder, wWaist, wChest, color("torso"))];
  };

  if (ex.view === "front") {
    const cx = 100;
    const hipC: Joint = [cx, p.hip[1]];
    const shC: Joint = [cx, p.shoulder[1]];
    const far = (j: Joint): Joint => mirror(j);
    const tilt = 0;
    return (
      <g>
        <Silhouette
          shapes={[
            ...leg(far(p.hip), far(p.knee), far(p.ankle), far(p.toe), undefined, SHADE),
            cap(shC, far(p.shoulder), 7.4, 4.4, SHADE),
            ...arm(far(p.shoulder), far(p.elbow), far(p.hand), SHADE)
          ]}
        />
        <Silhouette
          shapes={[
            ...leg(p.hip, p.knee, p.ankle, p.toe, undefined, null),
            ...trunk(hipC, shC, 8.4, 7, 9.6),
            cap(shC, [cx, p.head[1] + 7], 4, 3.4, BONE),
            { d: oval([cx, p.head[1]], 8.2, 9.6, tilt), c: BONE }
          ]}
        />
        <Silhouette shapes={[cap(shC, p.shoulder, 7.4, 4.4, BONE), ...arm(p.shoulder, p.elbow, p.hand, null)]} />
      </g>
    );
  }

  const neck: Joint = [p.head[0] + (p.head[0] - p.shoulder[0]) * 0.4, p.head[1] + 7];
  const tilt = Math.atan2(p.head[1] - p.shoulder[1], p.head[0] - p.shoulder[0]) + Math.PI / 2;
  return (
    <g>
      <Silhouette
        shapes={[
          ...leg(p.hip, p.knee, p.ankle, p.toe, p.heel, null),
          ...trunk(p.hip, p.shoulder, 7.6, 6.4, 9),
          cap(p.shoulder, neck, 4, 3.2, BONE),
          { d: oval(p.head, 8.2, 9.6, tilt), c: BONE }
        ]}
      />
      <Silhouette shapes={arm(p.shoulder, p.elbow, p.hand, null)} />
    </g>
  );
}

const PAD_FILL = "#171a22";

function pairs(pts: number[]): Joint[] {
  const out: Joint[] = [];
  for (let i = 0; i + 1 < pts.length; i += 2) out.push([pts[i], pts[i + 1]]);
  return out;
}

/** Pad rectangular rotable, centrado en (x,y). Asientos, respaldos, apoyos. */
function Pad(props: { x: number; y: number; w: number; h: number; angle?: number; c?: string }) {
  const { x, y, w, h } = props;
  return (
    <rect
      x={x - w / 2}
      y={y - h / 2}
      width={w}
      height={h}
      rx={Math.min(3, h / 2)}
      fill={PAD_FILL}
      stroke={props.c ?? STEEL}
      stroke-width={2.6}
      transform={props.angle ? "rotate(" + props.angle + " " + x + " " + y + ")" : undefined}
    />
  );
}

// Lo que toca al cuerpo se dibuja encima de la figura; la estructura, detrás.
const ON_TOP = new Set(["grip", "bar", "rollerPad", "dumbbell"]);

function onTop(e: Equip): boolean {
  // El arnés de hombros de la hack y de los gemelos queda detrás porque encima
  // le tapa la cara a la figura. Va marcado pieza por pieza en program.ts: la
  // regla "todo rodillo en el hombro va atrás" también mandaba atrás el del
  // crunch abdominal, que sí tiene que verse apoyado sobre los hombros.
  if (e.behind) return false;
  return ON_TOP.has(e.type);
}

function Gear(props: { ex: Exercise; pose: Pose; layer: "back" | "front" }) {
  const { ex, pose: p } = props;
  const parts: JSX.Element[] = [];
  const front = ex.view === "front";
  const anchor = (e: Equip): Joint => p[e.at ?? "hand"] ?? p.hand;
  const both = (j: Joint): Joint[] => (front ? [j, mirror(j)] : [j]);

  for (const e of ex.equip as Equip[]) {
    if (onTop(e) !== (props.layer === "front")) continue;
    if (e.type === "ground") {
      parts.push(<line x1={6} y1={186} x2={194} y2={186} stroke={STEEL} stroke-width={2.8} />);
    } else if (e.type === "frame" && e.pts) {
      parts.push(
        <polyline
          points={pairs(e.pts).map((q) => q[0] + "," + q[1]).join(" ")}
          fill="none"
          stroke={STEEL}
          stroke-width={e.w ?? 3.6}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      );
    } else if (e.type === "pad") {
      parts.push(<Pad x={e.x!} y={e.y!} w={e.w!} h={e.h!} angle={e.angle} />);
    } else if (e.type === "pulley") {
      parts.push(<circle cx={e.x} cy={e.y} r={e.r ?? 5} fill={PAD_FILL} stroke={STEEL} stroke-width={2.8} />);
      parts.push(<circle cx={e.x} cy={e.y} r={1.3} fill={STEEL} />);
    } else if (e.type === "stack") {
      const x = e.x!, y = e.y!, w = e.w!, h = e.h!;
      parts.push(<rect x={x - w / 2} y={y} width={w} height={h} rx={2} fill="none" stroke={STEEL} stroke-width={2.6} />);
      const rows = Math.max(2, Math.round(h / 6));
      for (let i = 1; i < rows; i++) {
        const yy = y + (h * i) / rows;
        parts.push(<line x1={x - w / 2 + 2} y1={yy} x2={x + w / 2 - 2} y2={yy} stroke={STEEL} stroke-width={1.3} />);
      }
      parts.push(<line x1={x} y1={y - 6} x2={x} y2={y} stroke={STEEL} stroke-width={1.6} />);
    } else if (e.type === "cableRun") {
      const way = e.pts ? pairs(e.pts) : [];
      // Con barra ancha el cable baja una sola vez, al centro de la barra.
      const ends = e.wide ? [[100, anchor(e)[1]] as Joint] : both(anchor(e));
      for (const end of ends) {
        const route = front && end[0] > 100 ? way.map((q): Joint => mirror(q)) : way;
        const all = [...route, end];
        parts.push(
          <polyline
            points={all.map((q) => q[0] + "," + q[1]).join(" ")}
            fill="none"
            stroke={STEEL}
            stroke-width={1.7}
            stroke-linejoin="round"
          />
        );
      }
    } else if (e.type === "grip") {
      for (const [x, y] of both(anchor(e))) {
        if (e.wide && front) {
          parts.push(<Limb a={[x - 4, y]} b={[200 - x + 4, y]} w={4.2} c={ACCENT} />);
          break;
        }
        const half = (e.w ?? 18) / 2;
        parts.push(<Limb a={[x - half, y]} b={[x + half, y]} w={4.2} c={ACCENT} />);
      }
    } else if (e.type === "bar") {
      const [x, y] = anchor(e);
      const half = (e.w ?? 54) / 2;
      parts.push(<Limb a={[x, y - half]} b={[x, y + half]} w={4} c={ACCENT} />);
      for (const s of [-1, 1]) {
        parts.push(<rect x={x - 5} y={y + s * half - 5} width={10} height={10} rx={2} fill={ACCENT} />);
      }
    } else if (e.type === "rollerPad") {
      const off = (j: Joint): Joint => [j[0] + (e.x ?? 0), j[1] + (e.y ?? 0)];
      for (const [x, y] of both(anchor(e)).map(off)) {
        parts.push(<circle cx={x} cy={y} r={e.r ?? 7} fill={PAD_FILL} stroke={ACCENT} stroke-width={3} />);
      }
    } else if (e.type === "sled") {
      // Con `at`, x/y desplazan el pad respecto de la articulación (para que quede detrás del cuerpo).
      const a0 = anchor(e);
      const [x, y] = [a0[0] + (e.x ?? 0), a0[1] + (e.y ?? 0)];
      parts.push(
        <rect
          x={x - (e.w ?? 10) / 2}
          y={y - (e.h ?? 38) / 2}
          width={e.w ?? 10}
          height={e.h ?? 38}
          rx={2.5}
          fill={PAD_FILL}
          stroke={ACCENT}
          stroke-width={3}
          transform={e.angle ? "rotate(" + e.angle + " " + x + " " + y + ")" : undefined}
        />
      );
    } else if (e.type === "dumbbell") {
      for (const [x, y] of both(anchor(e))) {
        parts.push(<Limb a={[x - 9, y]} b={[x + 9, y]} w={2.5} c={ACCENT} />);
        for (const s of [-1, 1]) {
          parts.push(<rect x={x + s * 9 - 4} y={y - 4} width={8} height={8} rx={1.5} fill={ACCENT} />);
        }
      }
    }
  }

  return <g>{parts.map((el, i) => <g key={i}>{el}</g>)}</g>;
}

function MovementStage(props: { ex: Exercise }) {
  const { ex } = props;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frame = useRef(0);
  const started = useRef(0);

  useEffect(() => {
    setT(0);
    setPlaying(true);
  }, [ex.id]);

  useEffect(() => {
    if (!playing) return;
    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    started.current = 0;
    const step = (ts: number) => {
      if (!started.current) started.current = ts;
      const period = 2600;
      const e = ((ts - started.current) % period) / period;
      const tri = e < 0.5 ? e * 2 : (1 - e) * 2;
      setT(easeInOut(tri));
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [playing, ex.id]);

  const pose = poseAt(ex, t);
  const phase = t < 0.5 ? ex.labels[0] : ex.labels[1];

  const phaseBtn = (value: number) =>
    "rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] " +
    (!playing && Math.abs(t - value) < 0.01
      ? "border-[#5b8cff] text-[#5b8cff]"
      : "border-[#2e3140] text-[#5f6377] hover:text-[#9296a8]");

  return (
    <div class="border-b border-[#23252f] bg-gradient-to-b from-[#0a0b0f] to-[#101219] pt-2">
      <svg viewBox="0 0 200 200" class="mx-auto block h-auto w-full max-w-[340px]" role="img" aria-label={"Movimiento: " + ex.name}>
        <Gear ex={ex} pose={pose} layer="back" />
        <Figure ex={ex} pose={pose} />
        <Gear ex={ex} pose={pose} layer="front" />
      </svg>
      <div class="mx-auto flex max-w-[380px] items-center gap-2 px-4 pb-3 pt-1">
        <button
          type="button"
          class="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[#2e3140] text-[#9296a8] hover:border-[#5b8cff] hover:text-[#5b8cff]"
          aria-label={playing ? "Pausar animación" : "Reproducir animación"}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? (
            <svg width="10" height="12" viewBox="0 0 10 12">
              <rect x="0" y="0" width="3.2" height="12" fill="currentColor" />
              <rect x="6.8" y="0" width="3.2" height="12" fill="currentColor" />
            </svg>
          ) : (
            <svg width="11" height="12" viewBox="0 0 11 12">
              <path d="M1 1l9 5-9 5z" fill="currentColor" />
            </svg>
          )}
        </button>
        <button type="button" class={phaseBtn(0)} onClick={() => { setPlaying(false); setT(0); }}>
          {ex.labels[0]}
        </button>
        <button type="button" class={phaseBtn(1)} onClick={() => { setPlaying(false); setT(1); }}>
          {ex.labels[1]}
        </button>
        <span class="ml-auto font-mono text-[10px] uppercase tracking-[0.08em] text-[#5f6377]">
          {playing ? phase : ""}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Descanso                                                            */
/* ------------------------------------------------------------------ */

type Wake = { release: () => Promise<void> };

function RestTimer(props: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(props.seconds);

  // Con el teléfono en el bolsillo un contador que solo se ve no sirve de nada.
  useEffect(() => {
    setLeft(props.seconds);
    const id = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          clearInterval(id);
          navigator.vibrate?.([140, 70, 140]);
          props.onDone();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [props.seconds]);

  // La pantalla no se apaga mientras corre el descanso. Donde no exista la API
  // —hoy, Safari en iOS con la app fuera de la pantalla de inicio— no pasa nada.
  useEffect(() => {
    const api = (navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<Wake> } }).wakeLock;
    if (!api) return;
    let lock: Wake | null = null;
    let done = false;
    void api
      .request("screen")
      .then((l) => {
        if (done) void l.release().catch(() => {});
        else lock = l;
      })
      .catch(() => {});
    return () => {
      done = true;
      void lock?.release().catch(() => {});
    };
  }, []);

  const pct = props.seconds > 0 ? left / props.seconds : 0;

  return (
    // En celular es una barra al ancho completo pegada abajo (respetando la safe
    // area del notch); desde sm vuelve a ser la píldora flotante centrada.
    <div class="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-3 border-t border-[#2e3140] bg-[#16171d] px-4 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 shadow-2xl sm:inset-x-auto sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:rounded-full sm:border sm:py-2.5">
      <svg width="30" height="30" viewBox="0 0 36 36" class="flex-none">
        <circle cx="18" cy="18" r="15" fill="none" stroke="#23252f" stroke-width="3" />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke={ACCENT}
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray="94.2"
          stroke-dashoffset={94.2 * (1 - pct)}
          transform="rotate(-90 18 18)"
        />
      </svg>
      <div>
        <div class="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#5f6377]">Descanso</div>
        <div class="min-w-[52px] text-center font-mono text-[17px] font-semibold">{formatRest(left)}</div>
      </div>
      <button
        type="button"
        class="font-mono text-[11px] tracking-[0.08em] text-[#5f6377] hover:text-[#e6e8ef]"
        onClick={props.onDone}
      >
        SALTAR
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

function todayDefaultDay(): string {
  const d = new Date().getDay();
  if (d === 4) return "jue";
  if (d === 6) return "sab";
  return "mie";
}

export function App() {
  const { state, ready, logSet, setWeight, setWeek, markExported, replace } = useStore();

  const [day, setDay] = useState(todayDefaultDay());
  const [openId, setOpenId] = useState<string | null>(null);
  const [rest, setRest] = useState<{ seconds: number; nonce: number } | null>(null);

  const list = exercisesForDay(day);
  const current = exerciseById(openId ?? "") ?? list[0];

  const week = state.week;
  const kgFor = (ex: Exercise): number => state.weights[ex.id] ?? ex.start;
  const entryFor = (ex: Exercise): SetEntry => state.log[slotKey(week, ex.id)] ?? emptyEntry(ex, kgFor(ex));
  const doneCount = (ex: Exercise) => entryFor(ex).reps.filter((v) => v > 0).length;

  const totalSets = list.reduce((a, e) => a + e.sets, 0);
  const loggedSets = list.reduce((a, e) => a + doneCount(e), 0);

  function onLog(ex: Exercise, index: number, reps: number) {
    logSet(ex, index, reps, kgFor(ex));
    const after = doneCount(ex) + (reps > 0 ? 1 : -1);
    if (reps > 0 && after < ex.sets) setRest({ seconds: ex.rest, nonce: Date.now() });
    else setRest(null);
  }

  const dayInfo = PROGRAM.days.find((d) => d.id === day)!;

  // Sin esto se pinta la semana 1 con los pesos iniciales y salta al valor real
  // cuando resuelve IndexedDB.
  if (!ready) return <main class="min-h-screen bg-[#08080b]" />;

  return (
    <main class="min-h-screen bg-[#08080b] pb-36 font-sans text-[#e6e8ef] sm:pb-24">
      <header class="sticky top-0 z-20 border-b border-[#23252f] bg-[#08080b]/90 backdrop-blur">
        <div class="mx-auto flex max-w-[1240px] items-baseline justify-between px-4 pb-2.5 pt-3.5">
          <div class="font-mono text-[13px] font-semibold uppercase tracking-[0.18em]">
            Rutina<span class="text-[#5b8cff]">.</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-[#5f6377]">
              <button
                type="button"
                class="h-5 w-5 rounded border border-[#2e3140] leading-none text-[#9296a8] hover:border-[#5b8cff] hover:text-[#5b8cff]"
                aria-label="Semana anterior"
                onClick={() => setWeek(Math.max(1, week - 1))}
              >
                −
              </button>
              <span>
                SEMANA <b class="font-medium text-[#9296a8]">{week}</b>
              </span>
              <button
                type="button"
                class="h-5 w-5 rounded border border-[#2e3140] leading-none text-[#9296a8] hover:border-[#5b8cff] hover:text-[#5b8cff]"
                aria-label="Semana siguiente"
                onClick={() => setWeek(week + 1)}
              >
                +
              </button>
            </div>
            <DataMenu state={state} onReplace={replace} onExported={markExported} />
          </div>
        </div>

        <div class="mx-auto flex max-w-[1240px] px-2.5" role="tablist">
          {PROGRAM.days.map((d) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={d.id === day}
              class={
                "flex-1 border-b-2 px-1.5 pb-3 pt-2.5 text-center " +
                (d.id === day
                  ? "border-[#5b8cff] text-[#e6e8ef]"
                  : "border-transparent text-[#5f6377] hover:text-[#9296a8]")
              }
              onClick={() => {
                setDay(d.id);
                setOpenId(exercisesForDay(d.id)[0].id);
                setRest(null);
              }}
            >
              <div class="font-mono text-[12px] font-semibold tracking-[0.12em]">{d.short}</div>
              <div class="mt-0.5 text-[10.5px] opacity-75">{d.focus}</div>
            </button>
          ))}
        </div>
      </header>

      <div class="mx-auto grid max-w-[1240px] gap-5 p-4 md:grid-cols-[330px_1fr] md:items-start">
        <div class="md:sticky md:top-[104px]">
          <div class="mb-3 flex flex-wrap gap-3 font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#5f6377]">
            <span>{dayInfo.name}</span>
            <span>·</span>
            <span>{dayInfo.focus}</span>
            <span>·</span>
            <span>
              <b class="font-medium text-[#9296a8]">{loggedSets}</b>/{totalSets} series
            </span>
          </div>

          <div class="flex flex-col gap-1.5">
            {list.map((ex, i) => {
              const reps = entryFor(ex).reps;
              const n = reps.filter((v) => v > 0).length;
              const done = n >= ex.sets;
              const active = current && ex.id === current.id;
              return (
                <button
                  key={ex.id}
                  type="button"
                  class={
                    "grid grid-cols-[26px_1fr_auto] items-center gap-3 rounded-lg border p-3 text-left " +
                    (active ? "border-[#5b8cff] bg-[#16171d]" : "border-[#23252f] bg-[#0f1014] hover:border-[#2e3140]")
                  }
                  onClick={() => setOpenId(ex.id)}
                >
                  <span class={"font-mono text-[11px] " + (active ? "text-[#5b8cff]" : "text-[#5f6377]")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span class={"block text-[13.5px] font-medium leading-tight " + (done ? "text-[#9296a8]" : "")}>
                      {ex.name}
                    </span>
                    <span class="mt-1 block font-mono text-[10.5px] tracking-[0.04em] text-[#5f6377]">
                      {ex.sets}×{ex.repMin}-{ex.repMax} · {kgFor(ex)} kg
                    </span>
                  </span>
                  <span class="flex items-center gap-1.5">
                    {done ? <span class="font-mono text-[13px] text-[#3fb98a]">✓</span> : null}
                    <span class="flex gap-[3px]">
                      {reps.map((v, k) => (
                        <span
                          key={k}
                          class={
                            "h-3.5 w-[5px] rounded-sm border " +
                            (v > 0 ? "border-[#5b8cff] bg-[#5b8cff]" : "border-[#2e3140] bg-[#1d1f27]")
                          }
                        />
                      ))}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {current ? (
          <Detail
            ex={current}
            kg={kgFor(current)}
            entry={entryFor(current)}
            previous={state.log[slotKey(week - 1, current.id)]}
            history={historyFor(state, current.id).filter((h) => h.week !== week)}
            onLog={onLog}
            onWeight={(kg) => setWeight(current.id, kg)}
          />
        ) : null}
      </div>

      <p class="mx-auto max-w-[1240px] px-5 pb-10 text-[12px] leading-relaxed text-[#5f6377]">
        <b class="font-medium text-[#9296a8]">Progresión doble.</b> Empezás en el extremo bajo del rango. Cuando llegás
        al extremo alto en todas las series, la próxima sesión subís el peso y volvés al extremo bajo.{" "}
        <b class="font-medium text-[#9296a8]">Calentá 5–8 min</b> antes de cada sesión y hacé 2 series de aproximación
        con poco peso en el primer ejercicio pesado del día.
      </p>

      {rest ? <RestTimer key={rest.nonce} seconds={rest.seconds} onDone={() => setRest(null)} /> : null}
    </main>
  );
}

function Detail(props: {
  ex: Exercise;
  kg: number;
  entry: SetEntry;
  previous: SetEntry | undefined;
  history: { week: number; entry: SetEntry }[];
  onLog: (ex: Exercise, index: number, reps: number) => void;
  onWeight: (kg: number) => void;
}) {
  const { ex, kg, entry, previous } = props;
  const reps = entry.reps;
  // Comparar contra la semana pasada solo tiene sentido si el peso era el mismo:
  // 12 reps con 30 kg no dicen nada sobre si ya podés subir desde 40.
  const sameLoad = previous && previous.kg.every((v, i) => (previous.reps[i] > 0 ? v === kg : true));
  const prog = progressionFor(ex, kg, sameLoad ? previous.reps : undefined);
  const options: number[] = [];
  for (let r = Math.max(1, ex.repMin - 2); r <= ex.repMax + 2; r++) options.push(r);
  const nextSet = reps.filter((v) => v > 0).length + 1;

  return (
    <div class="overflow-hidden rounded-xl border border-[#23252f] bg-[#0f1014]">
      <div class="border-b border-[#23252f] px-5 pb-3.5 pt-4">
        <h2 class="text-[19px] font-semibold tracking-tight">{ex.name}</h2>
        <div class="mt-2 flex flex-wrap gap-1.5">
          {ex.primary.map((m) => (
            <span
              key={m}
              class="rounded-full border border-[#5b8cff]/40 bg-[#5b8cff]/10 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.09em] text-[#5b8cff]"
            >
              {MUSCLE[m][1]}
            </span>
          ))}
          {ex.secondary.map((m) => (
            <span
              key={m}
              class="rounded-full border border-[#2e3140] px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.09em] text-[#5f6377]"
            >
              {MUSCLE[m][1]}
            </span>
          ))}
        </div>
      </div>

      <MovementStage ex={ex} />

      <RealPhotos ex={ex} />

      <div class="border-b border-[#23252f] px-5 py-4">
        <div class="mb-2.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#5f6377]">
          Serie {Math.min(nextSet, ex.sets)} de {ex.sets} · descanso {formatRest(ex.rest)}
        </div>

        <div class="mb-3.5 flex items-center gap-2.5">
          <div class="flex items-center overflow-hidden rounded-lg border border-[#2e3140]">
            <button
              type="button"
              class="h-9 w-8 text-[#9296a8] hover:bg-[#1d1f27] hover:text-[#5b8cff]"
              aria-label="Bajar peso"
              onClick={() => props.onWeight(Math.max(0, kg - ex.inc))}
            >
              −
            </button>
            <span class="w-16 border-x border-[#2e3140] bg-[#16171d] py-2 text-center font-mono text-[15px] font-semibold">
              {kg}
            </span>
            <button
              type="button"
              class="h-9 w-8 text-[#9296a8] hover:bg-[#1d1f27] hover:text-[#5b8cff]"
              aria-label="Subir peso"
              onClick={() => props.onWeight(kg + ex.inc)}
            >
              +
            </button>
          </div>
          <span class="font-mono text-[11px] text-[#5f6377]">KG</span>
          <span class={"text-[12px] leading-snug " + (prog.canGoUp ? "text-[#3fb98a]" : "text-[#9296a8]")}>
            {prog.text}
          </span>
        </div>

        <div class="flex flex-col gap-1.5">
          {reps.map((value, i) => (
            <div
              key={i}
              class={
                // scroll-mb reserva el alto de la barra de descanso al hacer scroll
                // hacia una serie, para que nunca quede tapada por el timer.
                "grid scroll-mb-28 grid-cols-[30px_1fr_auto] items-center gap-2.5 rounded-lg border p-2 sm:scroll-mb-6 " +
                (value > 0 ? "border-[#3fb98a]/30 bg-[#3fb98a]/5" : "border-[#23252f] bg-[#16171d]")
              }
            >
              <span class="font-mono text-[10px] tracking-[0.08em] text-[#5f6377]">S{i + 1}</span>
              {value > 0 ? (
                <span class="font-mono text-[12.5px]">
                  {value} reps <span class="text-[#5f6377]">× {entry.kg[i]} kg</span>
                </span>
              ) : (
                <span class="flex flex-wrap gap-1">
                  {options.map((r) => (
                    <button
                      key={r}
                      type="button"
                      class="h-7 min-w-[30px] rounded-md border border-[#2e3140] px-1.5 font-mono text-[12px] text-[#9296a8] hover:border-[#5b8cff] hover:text-[#5b8cff]"
                      onClick={() => props.onLog(ex, i, r)}
                    >
                      {r}
                    </button>
                  ))}
                </span>
              )}
              {value > 0 ? (
                <button
                  type="button"
                  class="font-mono text-[10px] tracking-[0.06em] text-[#5f6377] hover:text-[#e6e8ef]"
                  onClick={() => props.onLog(ex, i, 0)}
                >
                  DESHACER
                </button>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
      </div>

      <History rows={props.history} />

      <div class="border-b border-[#23252f] px-5 py-4">
        <div class="mb-2.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#5f6377]">Cómo se hace</div>
        <ul class="flex flex-col gap-2">
          {ex.cues.map((c) => (
            <li key={c} class="relative pl-4 text-[13.5px] leading-relaxed">
              <span class="absolute left-0 top-2 h-[5px] w-[5px] rounded-full bg-[#9d7bff]" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div class="border-b border-[#23252f] px-5 py-4">
        <div class="mb-2.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#5f6377]">Preparar la máquina</div>
        <p class="text-[13px] leading-relaxed text-[#9296a8]">{ex.setup}</p>
      </div>

      {ex.alt ? (
        <div class="border-b border-[#23252f] px-5 py-4">
          <div class="mb-2.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#5f6377]">Por qué este</div>
          <p class="text-[13px] leading-relaxed text-[#9296a8]">{ex.alt}</p>
        </div>
      ) : null}

      <div class="px-5 py-4">
        <div class="flex items-start gap-2.5 rounded-lg border border-[#d9a441]/20 bg-[#d9a441]/5 px-3 py-2.5">
          <b class="flex-none pt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#d9a441]">Error</b>
          <span class="text-[13px] leading-relaxed text-[#9296a8]">{ex.error}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Datos                                                               */
/* ------------------------------------------------------------------ */

/**
 * Todo vive en el IndexedDB de este navegador: si se borran los datos del sitio
 * o se cambia de teléfono, no hay servidor del que recuperarlo. El export a JSON
 * es la única copia de seguridad.
 */
function DataMenu(props: { state: State; onReplace: (next: State) => void; onExported: () => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const days = daysSinceExport(props.state, Date.now());
  const logged = Object.keys(props.state.log).length;
  const stale = logged > 0 && (days === null || days >= 14);

  function onExport() {
    const now = new Date();
    const blob = new Blob([JSON.stringify(toBackup(props.state, now.toISOString()), null, 2)], {
      type: "application/json"
    });
    // toBackup sella lastExport adentro del archivo; markExported hace lo mismo
    // en el estado vivo. Los dos usan este mismo momento.
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rutina-" + new Date().toLocaleDateString("sv-SE") + ".json";
    a.click();
    URL.revokeObjectURL(url);
    props.onExported();
    setOpen(false);
  }

  async function onImport(input: HTMLInputElement) {
    const picked = input.files?.[0];
    input.value = "";
    if (!picked) return;
    try {
      const next = fromBackup(await picked.text());
      const sets = Object.keys(next.log).length;
      if (!confirm("Reemplazar lo que hay ahora por el archivo (semana " + next.week + ", " + sets + " ejercicios con series)?")) return;
      props.onReplace(next);
      setError(null);
      setOpen(false);
    } catch {
      setError("Ese archivo no es un export de Rutina.");
    }
  }

  return (
    <div class="relative">
      <button
        type="button"
        class="rounded border border-[#2e3140] px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-[#9296a8] hover:border-[#5b8cff] hover:text-[#5b8cff]"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        DATOS
        {stale ? <span class="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#d9a441] align-middle" /> : null}
      </button>

      {open ? (
        <>
          <button type="button" class="fixed inset-0 z-30 cursor-default" aria-label="Cerrar" onClick={() => setOpen(false)} />
          <div class="absolute right-0 z-40 mt-2 w-64 rounded-lg border border-[#2e3140] bg-[#16171d] p-3 shadow-2xl">
            <p class={"mb-2.5 text-[11.5px] leading-relaxed " + (stale ? "text-[#d9a441]" : "text-[#5f6377]")}>
              {stale
                ? days === null
                  ? "Todavía no exportaste nunca. Si se borran los datos del sitio, se pierde el historial."
                  : "Hace " + days + " días que no exportás. El historial solo vive en este navegador."
                : "El historial se guarda solo en este navegador. Exportá cada tanto."}
            </p>
            <button
              type="button"
              class="mb-1.5 w-full rounded-md border border-[#2e3140] px-2.5 py-2 text-left font-mono text-[11px] tracking-[0.06em] text-[#9296a8] hover:border-[#5b8cff] hover:text-[#5b8cff]"
              onClick={onExport}
            >
              EXPORTAR JSON
            </button>
            <button
              type="button"
              class="w-full rounded-md border border-[#2e3140] px-2.5 py-2 text-left font-mono text-[11px] tracking-[0.06em] text-[#9296a8] hover:border-[#5b8cff] hover:text-[#5b8cff]"
              onClick={() => file.current?.click()}
            >
              IMPORTAR JSON
            </button>
            {error ? <p class="mt-2 text-[11.5px] leading-relaxed text-[#d9a441]">{error}</p> : null}
            <input
              ref={file}
              type="file"
              accept="application/json,.json"
              class="hidden"
              onChange={(e) => void onImport(e.currentTarget)}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Foto de referencia                                                  */
/* ------------------------------------------------------------------ */

/**
 * El esquema dice cómo se mueve el cuerpo; la foto dice cómo es la máquina.
 * Vienen de free-exercise-db (dominio público) y no son las máquinas de este
 * gimnasio, así que van cerradas por defecto y solo se descargan si las abrís.
 * El service worker las guarda al vuelo, así que una vez vistas quedan offline.
 */
function RealPhotos(props: { ex: Exercise }) {
  const { ex } = props;
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [ex.id]);

  return (
    <div class="border-b border-[#23252f] px-5 py-4">
      <button
        type="button"
        class="flex w-full items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#5f6377] hover:text-[#9296a8]"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span>Foto de la máquina</span>
        <span class="text-[13px] leading-none">{open ? "−" : "+"}</span>
      </button>

      {open ? (
        <>
          <div class="mt-3 grid grid-cols-2 gap-2">
            {[0, 1].map((n) => (
              <figure key={n} class="m-0">
                <img
                  src={import.meta.env.BASE_URL + "ref/" + ex.id + "-" + n + ".webp"}
                  alt={ex.name + ", " + ex.labels[n].toLowerCase()}
                  width={640}
                  height={640}
                  loading="lazy"
                  decoding="async"
                  class="block aspect-square w-full rounded-lg border border-[#23252f] object-cover"
                />
                <figcaption class="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-[#5f6377]">
                  {ex.labels[n]}
                </figcaption>
              </figure>
            ))}
          </div>
          <p class="mt-2.5 text-[11.5px] leading-relaxed text-[#5f6377]">
            Referencia del movimiento, no de tu gimnasio: la máquina de la foto puede ser otra.
          </p>
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Historial                                                           */
/* ------------------------------------------------------------------ */

/**
 * La app venía guardando todas las semanas y no mostraba ninguna: lo único que
 * se veía era la semana en curso. Acá se lee lo que ya estaba guardado.
 */
function History(props: { rows: { week: number; entry: SetEntry }[] }) {
  const [open, setOpen] = useState(false);
  const rows = props.rows.slice(0, 12);

  if (rows.length === 0) return null;

  return (
    <div class="border-b border-[#23252f] px-5 py-4">
      <button
        type="button"
        class="flex w-full items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#5f6377] hover:text-[#9296a8]"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span>
          Historial <span class="text-[#9296a8]">{props.rows.length}</span>{" "}
          {props.rows.length === 1 ? "semana" : "semanas"}
        </span>
        <span class="text-[13px] leading-none">{open ? "−" : "+"}</span>
      </button>

      {open ? (
        <div class="mt-3 flex flex-col gap-1.5">
          {rows.map((row) => {
            const done = row.entry.reps.filter((v) => v > 0);
            // Casi siempre es un solo peso en toda la sesión; solo se listan los
            // distintos cuando de verdad hubo más de uno.
            const loads = [...new Set(row.entry.reps.map((v, i) => (v > 0 ? row.entry.kg[i] : null)).filter((v) => v !== null))];
            return (
              <div
                key={row.week}
                class="grid grid-cols-[64px_1fr_auto] items-baseline gap-2 rounded-lg border border-[#23252f] bg-[#16171d] px-2.5 py-2"
              >
                <span class="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5f6377]">
                  Sem {row.week}
                </span>
                <span class="font-mono text-[12px] text-[#9296a8]">{done.join(" · ")}</span>
                <span class="font-mono text-[11px] text-[#5f6377]">{loads.join("/")} kg</span>
              </div>
            );
          })}
          {props.rows.length > rows.length ? (
            <p class="mt-1 font-mono text-[10px] tracking-[0.06em] text-[#5f6377]">
              + {props.rows.length - rows.length} semanas más en el export
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
