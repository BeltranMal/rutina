// Datos puros del programa. No importar lakebed/*, Preact, DOM ni Node acá.

export type Joint = [number, number];
export type Pose = Record<string, Joint>;

export type Equip = {
  type: string;
  at?: string;
  x?: number; y?: number; w?: number; h?: number;
  x1?: number; y1?: number; x2?: number; y2?: number;
  r?: number;
  angle?: number;
  pts?: number[];
  from?: [number, number];
  back?: [number, number, number, number];
  pad?: [number, number, number, number];
  wide?: boolean;
};

export type Exercise = {
  id: string;
  day: string;
  name: string;
  primary: string[];
  secondary: string[];
  sets: number;
  repMin: number;
  repMax: number;
  rest: number;
  start: number;
  inc: number;
  setup: string;
  cues: string[];
  error: string;
  alt?: string;
  view: "side" | "front";
  labels: [string, string];
  equip: Equip[];
  poses: [Pose, Pose];
};

export type Day = { id: string; short: string; name: string; focus: string; time: string };

export const PROGRAM: { days: Day[]; exercises: Exercise[] } = {
  "days": [
    {
      "id": "mie",
      "short": "MIÉ",
      "name": "Miércoles",
      "focus": "Piernas + empuje",
      "time": "15:30–16:30"
    },
    {
      "id": "jue",
      "short": "JUE",
      "name": "Jueves",
      "focus": "Espalda + brazos",
      "time": "15:30–16:30"
    },
    {
      "id": "sab",
      "short": "SÁB",
      "name": "Sábado",
      "focus": "Mixto",
      "time": "15:30–16:30"
    }
  ],
  "exercises": [
    {
      "id": "hack-squat",
      "day": "mie",
      "name": "Sentadilla hack en máquina",
      "primary": [
        "cuadriceps",
        "gluteo"
      ],
      "secondary": [
        "core"
      ],
      "sets": 3,
      "repMin": 8,
      "repMax": 10,
      "rest": 150,
      "start": 40,
      "setup": "Espalda y hombros contra el respaldo inclinado. Pies al ancho de hombros en el centro de la plataforma. Soltá los seguros girando las manijas.",
      "cues": [
        "Espalda pegada al respaldo todo el recorrido",
        "Bajás hasta unos 90° de rodilla",
        "Rodillas siguen la línea de los pies, no se meten hacia adentro",
        "Empujás con toda la planta del pie, no con la punta"
      ],
      "error": "Despegar la cadera del respaldo abajo para bajar más.",
      "alt": "Reemplaza a la sentadilla con barra. Si tu gym no tiene hack, hacé prensa con 4 series en vez de 3.",
      "view": "side",
      "labels": [
        "Arriba",
        "Abajo"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [34, 186, 34, 172, 58, 172]
        },
        {
          "type": "frame",
          "pts": [44, 178, 152, 44],
          "w": 3.6
        },
        {
          "type": "frame",
          "pts": [152, 44, 170, 54, 170, 186]
        },
        {
          "type": "pad",
          "x": 66,
          "y": 170,
          "w": 38,
          "h": 6,
          "angle": -30
        },
        {
          "type": "sled",
          "at": "hip",
          "x": 4,
          "y": -20,
          "w": 13,
          "h": 46,
          "angle": 38
        },
        {
          "type": "rollerPad",
          "at": "shoulder",
          "r": 6
        }
      ],
      "poses": [
        {
          "head": [136.1, 80.4],
          "shoulder": [127.9, 90.5],
          "elbow": [116.2, 106.7],
          "hand": [136, 104],
          "hip": [104, 120],
          "knee": [76.9, 138.9],
          "ankle": [66, 170],
          "toe": [54, 176]
        },
        {
          "head": [115.1, 106.4],
          "shoulder": [106.9, 116.5],
          "elbow": [94, 131.7],
          "hand": [114, 132],
          "hip": [83, 146],
          "knee": [50.4, 140.9],
          "ankle": [66, 170],
          "toe": [54, 176]
        }
      ],
      "inc": 5
    },
    {
      "id": "press-pecho-maquina",
      "day": "mie",
      "name": "Press de pecho en máquina",
      "primary": [
        "pecho"
      ],
      "secondary": [
        "triceps",
        "hombro-frontal"
      ],
      "sets": 3,
      "repMin": 8,
      "repMax": 10,
      "rest": 150,
      "start": 30,
      "setup": "Regulá el asiento para que las manijas queden a la altura del pecho, no del cuello ni del abdomen.",
      "cues": [
        "Espalda apoyada, omóplatos juntos contra el respaldo",
        "Empujás hacia adelante sin trabar el codo de golpe",
        "Volvés controlado hasta sentir el estirón en el pecho",
        "Codos a media altura, no levantados a la altura del hombro"
      ],
      "error": "Subir el asiento de más y terminar empujando hacia arriba con el hombro.",
      "alt": "Reemplaza al press plano con barra.",
      "view": "side",
      "labels": [
        "Manijas atrás",
        "Brazos extendidos"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [150, 186, 150, 58]
        },
        {
          "type": "stack",
          "x": 150,
          "y": 72,
          "w": 18,
          "h": 62
        },
        {
          "type": "pad",
          "x": 120,
          "y": 120,
          "w": 11,
          "h": 54,
          "angle": 8
        },
        {
          "type": "pad",
          "x": 106,
          "y": 152,
          "w": 46,
          "h": 8
        },
        {
          "type": "frame",
          "pts": [106, 156, 106, 186]
        },
        {
          "type": "cableRun",
          "pts": [150, 80, 138, 80],
          "at": "hand"
        },
        {
          "type": "grip",
          "at": "hand",
          "w": 16
        }
      ],
      "poses": [
        {
          "head": [121.1, 95.5],
          "shoulder": [119.3, 108.4],
          "elbow": [121.2, 128.3],
          "hand": [104, 118],
          "hip": [114, 146],
          "knee": [113, 179],
          "ankle": [80, 178],
          "toe": [68, 186]
        },
        {
          "head": [121.1, 95.5],
          "shoulder": [119.3, 108.4],
          "elbow": [99.9, 113.5],
          "hand": [80, 112],
          "hip": [114, 146],
          "knee": [113, 179],
          "ankle": [80, 178],
          "toe": [68, 186]
        }
      ],
      "inc": 5
    },
    {
      "id": "femoral-sentado",
      "day": "mie",
      "name": "Curl femoral sentado",
      "primary": [
        "isquios"
      ],
      "secondary": [
        "gemelo"
      ],
      "sets": 3,
      "repMin": 10,
      "repMax": 12,
      "rest": 90,
      "start": 30,
      "setup": "Rodilla alineada con el eje de giro. El rodillo de abajo apoya justo arriba del talón; el de arriba te traba los muslos.",
      "cues": [
        "Cadera bien atrás en el asiento",
        "Empujás hacia abajo y atrás con el talón",
        "Bajás en 2 s y volvés en 3 s",
        "Recorrido completo, sin rebotar al final"
      ],
      "error": "Despegar la espalda del respaldo para empujar más fuerte.",
      "alt": "Reemplaza al peso muerto rumano. Es el cambio con más pérdida: el rumano también trabaja glúteo y espalda baja. Si algún día querés recuperar el patrón de bisagra, la máquina de extensión de cadera es la opción guiada.",
      "view": "side",
      "labels": [
        "Piernas extendidas",
        "Talones abajo"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [152, 186, 152, 62]
        },
        {
          "type": "stack",
          "x": 152,
          "y": 76,
          "w": 18,
          "h": 58
        },
        {
          "type": "pad",
          "x": 126,
          "y": 118,
          "w": 11,
          "h": 52,
          "angle": 10
        },
        {
          "type": "pad",
          "x": 110,
          "y": 150,
          "w": 46,
          "h": 8
        },
        {
          "type": "frame",
          "pts": [110, 154, 110, 186]
        },
        {
          "type": "pad",
          "x": 88,
          "y": 134,
          "w": 34,
          "h": 7
        },
        {
          "type": "rollerPad",
          "at": "ankle",
          "r": 8
        }
      ],
      "poses": [
        {
          "head": [126.9, 93.8],
          "shoulder": [124.6, 106.6],
          "elbow": [126.5, 126.5],
          "hand": [108, 134],
          "hip": [118, 144],
          "knee": [80, 146],
          "ankle": [48, 134],
          "toe": [38, 129]
        },
        {
          "head": [126.9, 93.8],
          "shoulder": [124.6, 106.6],
          "elbow": [126.5, 126.5],
          "hand": [108, 134],
          "hip": [118, 144],
          "knee": [80, 146],
          "ankle": [72, 178],
          "toe": [60, 182]
        }
      ],
      "inc": 5
    },
    {
      "id": "press-hombro-maquina",
      "day": "mie",
      "name": "Press de hombros en máquina",
      "primary": [
        "hombro-frontal"
      ],
      "secondary": [
        "triceps"
      ],
      "sets": 3,
      "repMin": 8,
      "repMax": 10,
      "rest": 120,
      "start": 20,
      "setup": "Asiento regulado para que las manijas arranquen a la altura de las orejas, no más abajo.",
      "cues": [
        "Espalda apoyada, apretá abdomen para no arquear",
        "Empujás hacia arriba sin trabar el codo",
        "Bajás hasta la altura de la oreja, no más",
        "Muñecas rectas, alineadas con el antebrazo"
      ],
      "error": "Arquear la espalda baja para poder empujar más peso.",
      "alt": "Reemplaza al press militar con mancuernas.",
      "view": "side",
      "labels": [
        "Abajo",
        "Arriba"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [148, 186, 148, 56]
        },
        {
          "type": "stack",
          "x": 148,
          "y": 70,
          "w": 18,
          "h": 60
        },
        {
          "type": "pad",
          "x": 124,
          "y": 118,
          "w": 11,
          "h": 56,
          "angle": 4
        },
        {
          "type": "pad",
          "x": 108,
          "y": 152,
          "w": 46,
          "h": 8
        },
        {
          "type": "frame",
          "pts": [108, 156, 108, 186]
        },
        {
          "type": "cableRun",
          "pts": [148, 64, 130, 64],
          "at": "hand"
        },
        {
          "type": "grip",
          "at": "hand",
          "w": 16
        }
      ],
      "poses": [
        {
          "head": [119.6, 95.1],
          "shoulder": [118.7, 108.1],
          "elbow": [107.3, 124.5],
          "hand": [96, 108],
          "hip": [116, 146],
          "knee": [117, 179],
          "ankle": [84, 178],
          "toe": [72, 186]
        },
        {
          "head": [119.6, 95.1],
          "shoulder": [118.7, 108.1],
          "elbow": [110.5, 89.8],
          "hand": [108, 70],
          "hip": [116, 146],
          "knee": [117, 179],
          "ankle": [84, 178],
          "toe": [72, 186]
        }
      ],
      "inc": 5
    },
    {
      "id": "laterales-maquina",
      "day": "mie",
      "name": "Elevaciones laterales en máquina",
      "primary": [
        "hombro-lateral"
      ],
      "secondary": [],
      "sets": 3,
      "repMin": 12,
      "repMax": 15,
      "rest": 60,
      "start": 15,
      "setup": "Sentado, los codos apoyados contra los pads laterales. Regulá el asiento para que el eje quede a la altura del hombro.",
      "cues": [
        "Empujás con el CODO contra el pad, no con la mano",
        "Subís hasta la altura del hombro, no más",
        "Bajás lento, sin dejar caer el peso",
        "Hombros abajo, sin encoger hacia las orejas"
      ],
      "error": "Encoger los hombros y hacerlo con el trapecio.",
      "alt": "Si no hay máquina, polea baja con poco peso.",
      "view": "front",
      "labels": [
        "Abajo",
        "A la altura del hombro"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [100, 186, 100, 152]
        },
        {
          "type": "pad",
          "x": 100,
          "y": 150,
          "w": 48,
          "h": 8
        },
        {
          "type": "pad",
          "x": 100,
          "y": 122,
          "w": 28,
          "h": 36
        },
        {
          "type": "cableRun",
          "pts": [100, 126],
          "at": "elbow"
        },
        {
          "type": "rollerPad",
          "at": "elbow",
          "r": 7
        }
      ],
      "poses": [
        {
          "head": [100, 92],
          "shoulder": [80, 112],
          "elbow": [74, 132],
          "hand": [72, 152],
          "hip": [90, 146],
          "knee": [88, 168],
          "ankle": [86, 184],
          "toe": [76, 186]
        },
        {
          "head": [100, 92],
          "shoulder": [80, 112],
          "elbow": [60, 112],
          "hand": [41, 116],
          "hip": [90, 146],
          "knee": [88, 168],
          "ankle": [86, 184],
          "toe": [76, 186]
        }
      ],
      "inc": 2.5
    },
    {
      "id": "crunch-maquina",
      "day": "mie",
      "name": "Crunch en máquina abdominal",
      "primary": [
        "core"
      ],
      "secondary": [],
      "sets": 3,
      "repMin": 12,
      "repMax": 15,
      "rest": 60,
      "start": 20,
      "setup": "Pads sobre los hombros o manijas arriba. El eje de la máquina queda a la altura del ombligo.",
      "cues": [
        "El movimiento es acercar las costillas a la pelvis, no tirar con los brazos",
        "Enrollás la columna hacia adelante, no la mantenés recta",
        "Exhalás al bajar",
        "Volvés controlado sin soltar la tensión"
      ],
      "error": "Tirar con brazos y hombros y no flexionar el abdomen.",
      "alt": "Reemplaza a la plancha. La plancha sigue siendo buena para tu postura de escritorio: si te sobran 2 minutos, sumala al final.",
      "view": "side",
      "labels": [
        "Erguido",
        "Flexionado"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [154, 186, 154, 58]
        },
        {
          "type": "stack",
          "x": 154,
          "y": 72,
          "w": 18,
          "h": 58
        },
        {
          "type": "pad",
          "x": 112,
          "y": 154,
          "w": 46,
          "h": 8
        },
        {
          "type": "frame",
          "pts": [112, 158, 112, 186]
        },
        {
          "type": "pad",
          "x": 132,
          "y": 126,
          "w": 10,
          "h": 44,
          "angle": 6
        },
        {
          "type": "cableRun",
          "pts": [154, 68, 140, 74],
          "at": "shoulder"
        },
        {
          "type": "rollerPad",
          "at": "shoulder",
          "r": 8
        }
      ],
      "poses": [
        {
          "head": [116.4, 99.1],
          "shoulder": [117.3, 112.1],
          "elbow": [122.6, 131.4],
          "hand": [104, 124],
          "hip": [120, 150],
          "knee": [126.7, 182.3],
          "ankle": [94, 178],
          "toe": [82, 186]
        },
        {
          "head": [91.5, 107.7],
          "shoulder": [98.8, 118.5],
          "elbow": [105.3, 137.4],
          "hand": [86, 132],
          "hip": [120, 150],
          "knee": [126.7, 182.3],
          "ankle": [94, 178],
          "toe": [82, 186]
        }
      ],
      "inc": 5
    },
    {
      "id": "remo-maquina",
      "day": "jue",
      "name": "Remo en máquina con pecho apoyado",
      "primary": [
        "dorsal",
        "espalda-media"
      ],
      "secondary": [
        "biceps",
        "hombro-posterior"
      ],
      "sets": 3,
      "repMin": 8,
      "repMax": 10,
      "rest": 150,
      "start": 35,
      "setup": "Pecho apoyado contra el pad, asiento a la altura que te deje agarrar las manijas sin estirarte.",
      "cues": [
        "Pecho firme contra el pad todo el movimiento",
        "Tirás llevando los CODOS hacia atrás, no con las manos",
        "Apretá los omóplatos al final del recorrido",
        "Volvés dejando estirar el dorsal, sin soltar de golpe"
      ],
      "error": "Despegar el pecho del pad para ayudarte con el torso.",
      "alt": "Reemplaza al remo con barra. Con el pecho apoyado la espalda baja no trabaja nada: es el cambio que más te conviene de todos.",
      "view": "side",
      "labels": [
        "Brazos extendidos",
        "Codos atrás"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [40, 186, 40, 68]
        },
        {
          "type": "stack",
          "x": 40,
          "y": 82,
          "w": 18,
          "h": 56
        },
        {
          "type": "pad",
          "x": 96,
          "y": 118,
          "w": 12,
          "h": 50,
          "angle": -14
        },
        {
          "type": "frame",
          "pts": [96, 144, 96, 186]
        },
        {
          "type": "pad",
          "x": 114,
          "y": 158,
          "w": 42,
          "h": 8
        },
        {
          "type": "frame",
          "pts": [114, 162, 114, 186]
        },
        {
          "type": "cableRun",
          "pts": [40, 90, 58, 122],
          "at": "hand"
        },
        {
          "type": "grip",
          "at": "hand",
          "w": 16
        }
      ],
      "poses": [
        {
          "head": [105.7, 102.5],
          "shoulder": [108.8, 115.1],
          "elbow": [91.7, 125.5],
          "hand": [72, 122],
          "hip": [118, 152],
          "knee": [130.7, 182.5],
          "ankle": [98, 178],
          "toe": [86, 186]
        },
        {
          "head": [105.7, 102.5],
          "shoulder": [108.8, 115.1],
          "elbow": [121.9, 130.3],
          "hand": [102, 128],
          "hip": [118, 152],
          "knee": [130.7, 182.5],
          "ankle": [98, 178],
          "toe": [86, 186]
        }
      ],
      "inc": 5
    },
    {
      "id": "jalon",
      "day": "jue",
      "name": "Jalón agarre ancho",
      "primary": [
        "dorsal"
      ],
      "secondary": [
        "biceps",
        "espalda-media"
      ],
      "sets": 3,
      "repMin": 10,
      "repMax": 12,
      "rest": 90,
      "start": 35,
      "setup": "Regulá el rodillo para que te trabe los muslos. Sentado, pecho arriba, leve inclinación atrás.",
      "cues": [
        "Agarre un poco más ancho que los hombros",
        "Tirás llevando los CODOS hacia abajo y atrás",
        "La barra baja hasta la parte alta del pecho",
        "Volvés arriba controlado, dejando estirar el dorsal"
      ],
      "error": "Tirar con las manos y los brazos en vez de con la espalda.",
      "view": "front",
      "labels": [
        "Arriba",
        "Barra al pecho"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [36, 186, 36, 38, 164, 38, 164, 186]
        },
        {
          "type": "pulley",
          "x": 100,
          "y": 44,
          "r": 6
        },
        {
          "type": "pad",
          "x": 100,
          "y": 152,
          "w": 48,
          "h": 8
        },
        {
          "type": "frame",
          "pts": [100, 156, 100, 186]
        },
        {
          "type": "pad",
          "x": 100,
          "y": 134,
          "w": 54,
          "h": 7
        },
        {
          "type": "cableRun",
          "pts": [100, 44],
          "at": "hand",
          "wide": true
        },
        {
          "type": "grip",
          "at": "hand",
          "wide": true
        }
      ],
      "poses": [
        {
          "head": [100, 92],
          "shoulder": [80, 112],
          "elbow": [68.2, 95.9],
          "hand": [66, 76],
          "hip": [90, 148],
          "knee": [86, 168],
          "ankle": [84, 184],
          "toe": [74, 186]
        },
        {
          "head": [100, 92],
          "shoulder": [80, 112],
          "elbow": [74.3, 131.2],
          "hand": [64, 114],
          "hip": [90, 148],
          "knee": [86, 168],
          "ankle": [84, 184],
          "toe": [74, 186]
        }
      ],
      "inc": 5
    },
    {
      "id": "remo-polea",
      "day": "jue",
      "name": "Remo sentado en polea",
      "primary": [
        "espalda-media",
        "dorsal"
      ],
      "secondary": [
        "biceps"
      ],
      "sets": 3,
      "repMin": 10,
      "repMax": 12,
      "rest": 90,
      "start": 35,
      "setup": "Agarre neutro (el triángulo). Pies en la plataforma, rodillas apenas flexionadas.",
      "cues": [
        "Torso vertical, no te balancees hacia atrás",
        "Tirás el agarre hacia el ombligo",
        "Codos pegados al cuerpo",
        "Adelante dejás estirar el dorsal sin redondear la espalda"
      ],
      "error": "Remar con el torso, echándote atrás en cada repetición.",
      "alt": "Reemplaza al remo unilateral con mancuerna.",
      "view": "side",
      "labels": [
        "Adelante",
        "Al ombligo"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [30, 186, 30, 148, 48, 148]
        },
        {
          "type": "pulley",
          "x": 38,
          "y": 158,
          "r": 6
        },
        {
          "type": "pad",
          "x": 54,
          "y": 162,
          "w": 8,
          "h": 32
        },
        {
          "type": "pad",
          "x": 120,
          "y": 154,
          "w": 58,
          "h": 8
        },
        {
          "type": "frame",
          "pts": [120, 158, 120, 186]
        },
        {
          "type": "cableRun",
          "pts": [38, 158],
          "at": "hand"
        },
        {
          "type": "grip",
          "at": "hand",
          "w": 16
        }
      ],
      "poses": [
        {
          "head": [113.9, 99],
          "shoulder": [117.5, 111.5],
          "elbow": [104.6, 126.8],
          "hand": [86, 134],
          "hip": [128, 148],
          "knee": [92, 152],
          "ankle": [60, 158],
          "toe": [50, 150]
        },
        {
          "head": [133.3, 97.3],
          "shoulder": [132, 110.2],
          "elbow": [127.8, 129.8],
          "hand": [112, 142],
          "hip": [128, 148],
          "knee": [92, 152],
          "ankle": [60, 158],
          "toe": [50, 150]
        }
      ],
      "inc": 5
    },
    {
      "id": "face-pull",
      "day": "jue",
      "name": "Face pull",
      "primary": [
        "hombro-posterior"
      ],
      "secondary": [
        "espalda-media"
      ],
      "sets": 3,
      "repMin": 15,
      "repMax": 15,
      "rest": 60,
      "start": 15,
      "setup": "Cuerda en polea a la altura de la cara o un poco más arriba. Agarre con los pulgares hacia atrás.",
      "cues": [
        "Tirás hacia la FRENTE, separando las manos",
        "Codos altos, a la altura de los hombros",
        "Terminás como haciendo pose de doble bíceps",
        "Poco peso, buscando la contracción"
      ],
      "error": "Tirar hacia el pecho con los codos bajos — ahí ya es otro ejercicio.",
      "alt": "No tiene equivalente en máquina y no lo saques: es el que más te compensa las horas sentado programando.",
      "view": "front",
      "labels": [
        "Brazos extendidos",
        "Cuerda en la cara"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [64, 42, 136, 42]
        },
        {
          "type": "frame",
          "pts": [100, 42, 100, 22]
        },
        {
          "type": "pulley",
          "x": 100,
          "y": 48,
          "r": 6
        },
        {
          "type": "cableRun",
          "pts": [100, 48],
          "at": "hand"
        },
        {
          "type": "grip",
          "at": "hand",
          "w": 12
        }
      ],
      "poses": [
        {
          "head": [100, 86],
          "shoulder": [80, 106],
          "elbow": [63.4, 94.9],
          "hand": [50, 80],
          "hip": [92, 142],
          "knee": [90, 166],
          "ankle": [88, 184],
          "toe": [78, 186]
        },
        {
          "head": [100, 86],
          "shoulder": [80, 106],
          "elbow": [62, 98],
          "hand": [74, 82],
          "hip": [92, 142],
          "knee": [90, 166],
          "ankle": [88, 184],
          "toe": [78, 186]
        }
      ],
      "inc": 2
    },
    {
      "id": "curl-predicador",
      "day": "jue",
      "name": "Curl en banco predicador",
      "primary": [
        "biceps"
      ],
      "secondary": [
        "antebrazo"
      ],
      "sets": 3,
      "repMin": 10,
      "repMax": 12,
      "rest": 75,
      "start": 15,
      "setup": "Máquina de predicador. Axilas apoyadas en el borde alto del pad, brazos completos sobre la superficie.",
      "cues": [
        "Los tríceps no se despegan del pad en ningún momento",
        "Subís solo con el antebrazo",
        "Bajás en 2–3 s hasta casi estirar del todo",
        "Sin levantar los hombros para ayudarte"
      ],
      "error": "Despegar los codos del pad arriba para descansar.",
      "alt": "Reemplaza al curl con barra Z. El pad hace lo que antes tenías que controlar vos: fija el codo.",
      "view": "side",
      "labels": [
        "Abajo",
        "Arriba"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "pad",
          "x": 122,
          "y": 158,
          "w": 42,
          "h": 8
        },
        {
          "type": "frame",
          "pts": [122, 162, 122, 186]
        },
        {
          "type": "pad",
          "x": 88,
          "y": 130,
          "w": 42,
          "h": 9,
          "angle": -27
        },
        {
          "type": "frame",
          "pts": [76, 137, 76, 186]
        },
        {
          "type": "grip",
          "at": "hand",
          "w": 16
        }
      ],
      "poses": [
        {
          "head": [90.5, 105.8],
          "shoulder": [97, 117.1],
          "elbow": [79, 126],
          "hand": [70, 144],
          "hip": [116, 150],
          "knee": [83, 149.4],
          "ankle": [78, 182],
          "toe": [66, 186]
        },
        {
          "head": [90.5, 105.8],
          "shoulder": [97, 117.1],
          "elbow": [79, 126],
          "hand": [91, 110],
          "hip": [116, 150],
          "knee": [83, 149.4],
          "ankle": [78, 182],
          "toe": [66, 186]
        }
      ],
      "inc": 2.5
    },
    {
      "id": "triceps-polea",
      "day": "jue",
      "name": "Extensión de tríceps en polea",
      "primary": [
        "triceps"
      ],
      "secondary": [],
      "sets": 3,
      "repMin": 10,
      "repMax": 12,
      "rest": 75,
      "start": 20,
      "setup": "Polea alta con cuerda. Parado a un paso, torso levemente inclinado adelante.",
      "cues": [
        "Codos pegados al costado y QUIETOS",
        "Solo se mueve el antebrazo",
        "Abajo separá las manos abriendo la cuerda",
        "Volvés arriba controlado, sin dejar que el peso te tire"
      ],
      "error": "Mover los codos hacia adelante y convertirlo en un empuje de pecho.",
      "alt": "Reemplaza al press francés. Misma zona del tríceps, sin la barra cayéndote a la frente.",
      "view": "side",
      "labels": [
        "Arriba",
        "Extendido"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [152, 186, 152, 42, 122, 42]
        },
        {
          "type": "stack",
          "x": 152,
          "y": 62,
          "w": 16,
          "h": 62
        },
        {
          "type": "pulley",
          "x": 126,
          "y": 48,
          "r": 6
        },
        {
          "type": "cableRun",
          "pts": [126, 48],
          "at": "hand"
        },
        {
          "type": "grip",
          "at": "hand",
          "w": 20
        }
      ],
      "poses": [
        {
          "head": [104.9, 63.5],
          "shoulder": [106.7, 76.4],
          "elbow": [102, 96],
          "hand": [92, 79],
          "hip": [112, 114],
          "knee": [103, 145.8],
          "ankle": [110, 178],
          "toe": [98, 186]
        },
        {
          "head": [104.9, 63.5],
          "shoulder": [106.7, 76.4],
          "elbow": [102, 96],
          "hand": [98, 116],
          "hip": [112, 114],
          "knee": [103, 145.8],
          "ankle": [110, 178],
          "toe": [98, 186]
        }
      ],
      "inc": 2.5
    },
    {
      "id": "prensa",
      "day": "sab",
      "name": "Prensa de piernas",
      "primary": [
        "cuadriceps",
        "gluteo"
      ],
      "secondary": [],
      "sets": 3,
      "repMin": 10,
      "repMax": 12,
      "rest": 120,
      "start": 60,
      "setup": "Prensa inclinada 45°. Espalda y cadera bien apoyadas contra el respaldo. Trabá los seguros antes de empezar.",
      "cues": [
        "Pies al ancho de hombros en el centro de la plataforma",
        "Bajás hasta unos 90° de rodilla",
        "NO estires del todo la rodilla arriba, dejá una flexión mínima",
        "Empujás con el talón, no con la punta"
      ],
      "error": "Bajar tanto que la cadera se despegue del respaldo.",
      "view": "side",
      "labels": [
        "Piernas extendidas",
        "Rodillas flexionadas"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [40, 186, 40, 179, 172, 179, 172, 186]
        },
        {
          "type": "frame",
          "pts": [166, 179, 166, 76]
        },
        {
          "type": "frame",
          "pts": [86, 158, 178, 89],
          "w": 3.6
        },
        {
          "type": "frame",
          "pts": [86, 172, 178, 103],
          "w": 3.6
        },
        {
          "type": "frame",
          "pts": [104, 162, 104, 179]
        },
        {
          "type": "pad",
          "x": 76,
          "y": 152,
          "w": 52,
          "h": 10,
          "angle": 12
        },
        {
          "type": "pad",
          "x": 44,
          "y": 148,
          "w": 22,
          "h": 8,
          "angle": 12
        },
        {
          "type": "pad",
          "x": 104,
          "y": 158,
          "w": 26,
          "h": 8
        },
        {
          "type": "rollerPad",
          "at": "ankle",
          "x": 20,
          "y": 15,
          "r": 11
        },
        {
          "type": "sled",
          "at": "ankle",
          "w": 11,
          "h": 54,
          "angle": -37
        }
      ],
      "poses": [
        {
          "head": [46.1, 139.4],
          "shoulder": [58.8, 142.1],
          "elbow": [50, 160],
          "hand": [66, 172],
          "hip": [96, 150],
          "knee": [116.2, 123.9],
          "ankle": [147, 112],
          "toe": [139, 100]
        },
        {
          "head": [46.1, 139.4],
          "shoulder": [58.8, 142.1],
          "elbow": [50, 160],
          "hand": [66, 172],
          "hip": [96, 150],
          "knee": [92.6, 117.2],
          "ankle": [123, 130],
          "toe": [115, 118]
        }
      ],
      "inc": 10
    },
    {
      "id": "isquios",
      "day": "sab",
      "name": "Curl femoral tumbado",
      "primary": [
        "isquios"
      ],
      "secondary": [],
      "sets": 3,
      "repMin": 10,
      "repMax": 12,
      "rest": 90,
      "start": 25,
      "setup": "Boca abajo. El rodillo apoya justo arriba del talón, no en el gemelo. Rodilla alineada con el eje de giro.",
      "cues": [
        "Cadera pegada al banco, no la despegues",
        "Subís el peso en 2 s",
        "Bajás en 3 s — la bajada lenta es donde está el estímulo",
        "Recorrido completo"
      ],
      "error": "Levantar la cadera para poder subir más peso.",
      "alt": "Tumbado y sentado no son lo mismo: cambia el ángulo de la cadera y el isquio trabaja distinto. Por eso están los dos en la semana.",
      "view": "side",
      "labels": [
        "Piernas estiradas",
        "Talones arriba"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "pad",
          "x": 104,
          "y": 138,
          "w": 88,
          "h": 10
        },
        {
          "type": "frame",
          "pts": [70, 144, 70, 186]
        },
        {
          "type": "frame",
          "pts": [138, 144, 138, 186]
        },
        {
          "type": "frame",
          "pts": [156, 186, 156, 96]
        },
        {
          "type": "stack",
          "x": 156,
          "y": 108,
          "w": 16,
          "h": 50
        },
        {
          "type": "rollerPad",
          "at": "ankle",
          "r": 8
        }
      ],
      "poses": [
        {
          "head": [61, 130],
          "shoulder": [74, 130],
          "elbow": [92, 139],
          "hand": [96, 159],
          "hip": [112, 132],
          "knee": [144, 136],
          "ankle": [150, 168],
          "toe": [160, 174]
        },
        {
          "head": [61, 130],
          "shoulder": [74, 130],
          "elbow": [92, 139],
          "hand": [96, 159],
          "hip": [112, 132],
          "knee": [144, 136],
          "ankle": [125, 110],
          "toe": [117, 102]
        }
      ],
      "inc": 5
    },
    {
      "id": "pec-deck",
      "day": "sab",
      "name": "Aperturas en máquina (pec deck)",
      "primary": [
        "pecho"
      ],
      "secondary": [],
      "sets": 3,
      "repMin": 12,
      "repMax": 15,
      "rest": 75,
      "start": 25,
      "setup": "Asiento a la altura que deje los codos a la altura del pecho. Antebrazos apoyados en los pads.",
      "cues": [
        "Codos semiflexionados y FIJOS todo el movimiento",
        "Juntás los pads adelante apretando el pecho",
        "Abrís hasta sentir el estirón, sin pasarte",
        "Espalda apoyada, sin despegar los hombros"
      ],
      "error": "Abrir de más buscando estirar y forzar la cápsula del hombro.",
      "alt": "Reemplaza al press inclinado con mancuernas. Es apertura y no press, así que el pecho queda con un press pesado el miércoles y un aislamiento acá.",
      "view": "front",
      "labels": [
        "Abierto",
        "Cerrado"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [100, 186, 100, 46]
        },
        {
          "type": "pulley",
          "x": 100,
          "y": 52,
          "r": 6
        },
        {
          "type": "pad",
          "x": 100,
          "y": 152,
          "w": 48,
          "h": 8
        },
        {
          "type": "pad",
          "x": 100,
          "y": 124,
          "w": 26,
          "h": 40
        },
        {
          "type": "cableRun",
          "pts": [100, 52],
          "at": "hand"
        },
        {
          "type": "grip",
          "at": "hand",
          "w": 12
        }
      ],
      "poses": [
        {
          "head": [100, 92],
          "shoulder": [80, 112],
          "elbow": [62, 114],
          "hand": [43, 120],
          "hip": [90, 148],
          "knee": [88, 168],
          "ankle": [86, 184],
          "toe": [76, 186]
        },
        {
          "head": [100, 92],
          "shoulder": [80, 112],
          "elbow": [63, 119],
          "hand": [82, 125],
          "hip": [90, 148],
          "knee": [88, 168],
          "ankle": [86, 184],
          "toe": [76, 186]
        }
      ],
      "inc": 5
    },
    {
      "id": "pullover",
      "day": "sab",
      "name": "Pullover en polea",
      "primary": [
        "dorsal"
      ],
      "secondary": [],
      "sets": 3,
      "repMin": 12,
      "repMax": 15,
      "rest": 75,
      "start": 20,
      "setup": "Polea alta con barra recta o cuerda. Parado a un paso de la máquina, cadera levemente atrás.",
      "cues": [
        "Brazos casi rectos, codos semiflexionados y FIJOS",
        "El movimiento sale del hombro, no del codo",
        "Llevás la barra desde arriba hasta los muslos",
        "Sentí el dorsal, el bíceps casi no participa"
      ],
      "error": "Flexionar los codos y convertirlo en un jalón de tríceps.",
      "view": "side",
      "labels": [
        "Arriba",
        "A los muslos"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [158, 186, 158, 40, 126, 40]
        },
        {
          "type": "stack",
          "x": 158,
          "y": 60,
          "w": 16,
          "h": 60
        },
        {
          "type": "pulley",
          "x": 130,
          "y": 46,
          "r": 6
        },
        {
          "type": "cableRun",
          "pts": [130, 46],
          "at": "hand"
        },
        {
          "type": "grip",
          "at": "hand",
          "w": 20
        }
      ],
      "poses": [
        {
          "head": [94.9, 68.7],
          "shoulder": [99.8, 80.8],
          "elbow": [117.4, 71.3],
          "hand": [112, 52],
          "hip": [114, 116],
          "knee": [101.7, 146.6],
          "ankle": [112, 178],
          "toe": [100, 186]
        },
        {
          "head": [94.9, 68.7],
          "shoulder": [99.8, 80.8],
          "elbow": [80, 84.1],
          "hand": [82, 104],
          "hip": [114, 116],
          "knee": [101.7, 146.6],
          "ankle": [112, 178],
          "toe": [100, 186]
        }
      ],
      "inc": 5
    },
    {
      "id": "gemelos",
      "day": "sab",
      "name": "Gemelos en máquina de pie",
      "primary": [
        "gemelo"
      ],
      "secondary": [],
      "sets": 3,
      "repMin": 12,
      "repMax": 15,
      "rest": 60,
      "start": 40,
      "setup": "Pads sobre los hombros. Punta del pie en el borde de la plataforma, el talón queda al aire.",
      "cues": [
        "Talón bien abajo para estirar completo",
        "Pausa de 1 segundo arriba en punta de pie",
        "Recorrido completo, sin rebotar",
        "Rodilla estirada, no trabada"
      ],
      "error": "Hacer medio recorrido rápido y rebotando.",
      "view": "side",
      "labels": [
        "Talón abajo",
        "En punta de pie"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [62, 186, 62, 44, 138, 44, 138, 186]
        },
        {
          "type": "pad",
          "x": 100,
          "y": 180,
          "w": 54,
          "h": 10
        },
        {
          "type": "rollerPad",
          "at": "shoulder",
          "r": 8
        }
      ],
      "poses": [
        {
          "head": [105.8, 54],
          "shoulder": [105.3, 67],
          "elbow": [86.8, 74.7],
          "hand": [92, 94],
          "hip": [104, 105],
          "knee": [97.4, 137.3],
          "ankle": [102, 170],
          "toe": [90, 175],
          "heel": [112, 182]
        },
        {
          "head": [105.8, 46],
          "shoulder": [105.3, 59],
          "elbow": [86.8, 66.7],
          "hand": [92, 86],
          "hip": [104, 97],
          "knee": [97.4, 129.3],
          "ankle": [102, 162],
          "toe": [90, 175],
          "heel": [112, 166]
        }
      ],
      "inc": 5
    },
    {
      "id": "martillo-polea",
      "day": "sab",
      "name": "Curl martillo en polea",
      "primary": [
        "biceps",
        "antebrazo"
      ],
      "secondary": [],
      "sets": 3,
      "repMin": 10,
      "repMax": 12,
      "rest": 75,
      "start": 15,
      "setup": "Polea baja con cuerda. Agarre neutro, palmas enfrentadas, un extremo de la cuerda en cada mano.",
      "cues": [
        "Palmas enfrentadas todo el movimiento, sin rotar la muñeca",
        "Codos pegados al costado y quietos",
        "Subís hasta la altura del pecho",
        "Bajás controlado, la polea mantiene tensión abajo"
      ],
      "error": "Balancear el torso para arrancar el peso.",
      "alt": "Reemplaza al curl martillo con mancuernas. La polea mantiene tensión también abajo, donde la mancuerna la pierde.",
      "view": "side",
      "labels": [
        "Abajo",
        "Arriba"
      ],
      "equip": [
        {
          "type": "ground"
        },
        {
          "type": "frame",
          "pts": [38, 186, 38, 150, 56, 150]
        },
        {
          "type": "pulley",
          "x": 46,
          "y": 160,
          "r": 6
        },
        {
          "type": "cableRun",
          "pts": [46, 160],
          "at": "hand"
        },
        {
          "type": "grip",
          "at": "hand",
          "w": 14
        }
      ],
      "poses": [
        {
          "head": [112.4, 63.1],
          "shoulder": [113.3, 76.1],
          "elbow": [108, 96],
          "hand": [99, 113],
          "hip": [116, 114],
          "knee": [107, 145.8],
          "ankle": [114, 178],
          "toe": [102, 186]
        },
        {
          "head": [112.4, 63.1],
          "shoulder": [113.3, 76.1],
          "elbow": [108, 96],
          "hand": [106, 77],
          "hip": [116, 114],
          "knee": [107, 145.8],
          "ankle": [114, 178],
          "toe": [102, 186]
        }
      ],
      "inc": 2.5
    }
  ]
} as const as unknown as { days: Day[]; exercises: Exercise[] };

export const MUSCLE: Record<string, [string, string]> = {
  cuadriceps: ["thigh", "Cuádriceps"],
  isquios: ["thigh", "Isquiotibiales"],
  gluteo: ["thigh", "Glúteo"],
  gemelo: ["shin", "Gemelos"],
  pecho: ["upperarm", "Pecho"],
  "hombro-frontal": ["upperarm", "Hombro frontal"],
  "hombro-lateral": ["upperarm", "Hombro lateral"],
  "hombro-posterior": ["upperarm", "Hombro posterior"],
  triceps: ["forearm", "Tríceps"],
  biceps: ["forearm", "Bíceps"],
  antebrazo: ["forearm", "Antebrazo"],
  dorsal: ["torso", "Dorsal"],
  "espalda-media": ["torso", "Espalda media"],
  "espalda-baja": ["torso", "Espalda baja"],
  core: ["torso", "Core"]
};

export function exercisesForDay(day: string): Exercise[] {
  return PROGRAM.exercises.filter((e) => e.day === day);
}

export function exerciseById(id: string): Exercise | undefined {
  return PROGRAM.exercises.find((e) => e.id === id);
}

/** Clave de una serie registrada: semana + ejercicio. */
export function slotKey(week: number, exerciseId: string): string {
  return "w" + String(week) + ":" + exerciseId;
}

/** Interpola las dos poses del ejercicio. t va de 0 a 1. */
export function poseAt(ex: Exercise, t: number): Pose {
  const [a, b] = ex.poses;
  const out: Pose = {};
  for (const k of Object.keys(a)) {
    const pa = a[k];
    const pb = b[k] ?? pa;
    out[k] = [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t];
  }
  return out;
}

export function easeInOut(t: number): number {
  return t * t * (3 - 2 * t);
}

export type Progression = { text: string; canGoUp: boolean };

/**
 * Progresión doble: cuando todas las series llegan al tope del rango,
 * sube el peso y vuelve al extremo bajo.
 */
export function progressionFor(ex: Exercise, kg: number, previousWeekReps: number[] | undefined): Progression {
  const done = (previousWeekReps ?? []).filter((v) => v != null && v > 0);
  if (done.length < ex.sets) {
    return { text: "Objetivo: " + ex.sets + " series de " + ex.repMin + " reps como mínimo.", canGoUp: false };
  }
  if (done.every((v) => v >= ex.repMax)) {
    return {
      text: "La semana pasada llegaste a " + ex.repMax + " en todas. Subí a " + (kg + ex.inc) + " kg y volvé a " + ex.repMin + " reps.",
      canGoUp: true
    };
  }
  return { text: "Semana pasada: " + done.join(" · ") + " reps. Sumá al menos una repetición.", canGoUp: false };
}

export function formatRest(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m + ":" + String(s).padStart(2, "0");
}
