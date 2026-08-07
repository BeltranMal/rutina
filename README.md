# Rutina

App de entrenamiento para un programa propio de 3 días. Registra series, lleva el
peso de cada ejercicio, sugiere cuándo subirlo y dibuja el movimiento de cada
máquina.

**https://beltranmal.github.io/rutina/**

Sin cuenta, sin servidor y sin red: todo se guarda en el navegador y la app abre
offline una vez que la visitaste.

## Cómo funciona

- **Progresión doble.** Empezás en el extremo bajo del rango de reps. Cuando
  llegás al extremo alto en todas las series, la próxima sesión subís el peso y
  volvés al extremo bajo. La app te avisa cuándo toca.
- **Los datos son tuyos y solo tuyos.** El historial vive en el IndexedDB de este
  navegador. No hay backup automático: el botón `DATOS → EXPORTAR JSON` es la
  única copia. Si borrás los datos del sitio o cambiás de teléfono, se pierde.
- **Offline.** Un service worker cachea la app. El HTML se pide primero a la red
  (para que un deploy nuevo se vea al toque) y cae al caché si no hay señal.

## Desarrollo

```sh
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run build      # a dist/, con base /rutina/
```

Push a `main` construye y publica en GitHub Pages (`.github/workflows/deploy.yml`).

## Estructura

| Archivo | Qué es |
| --- | --- |
| `src/program.ts` | Datos puros: los 3 días, los 18 ejercicios, la geometría de cada máquina y las dos poses de cada movimiento. Sin DOM ni imports. |
| `src/app.tsx` | Toda la UI, incluido el renderer SVG (`Figure`, `Gear`, `MovementStage`). |
| `src/store.ts` | Estado en IndexedDB, saneado de lo que entra y export/import JSON. |
| `public/sw.js` | Service worker, sin dependencias. |

El renderer tiene un vocabulario chico de primitivas de máquina —`frame`, `pad`,
`pulley`, `cableRun`, `stack`, `grip`, `bar`, `rollerPad`, `sled`, `dumbbell`,
`ground`— y cada ejercicio se describe con esas piezas más dos poses del
esqueleto. Agregar una máquina es agregar datos en `program.ts`, no código.

## Lo que falta

Los dibujos son el punto flojo: ver [`docs/dibujos.md`](docs/dibujos.md).
