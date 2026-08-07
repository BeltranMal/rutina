# Los dibujos

Estado al 2026-08-07. Es el trabajo pendiente más visible de la app.

## Qué está mal hoy

- **La animación va en línea recta.** Cada ejercicio guarda dos poses y se
  interpola entre ellas, así que la rodilla viaja en línea recta entre extendida
  y flexionada en vez de describir un arco. En la prensa y la sentadilla hack se
  nota.
- **La figura es un palote genérico.** Mismo esqueleto para los 18 ejercicios,
  sin proporciones ni volumen. Sirve para leer la posición, no para entender la
  técnica.
- **Algunas máquinas son aproximadas.** La geometría se validó contra fotos
  reales y ningún segmento de miembro cambia de largo entre poses, pero varias
  máquinas están dibujadas de memoria y se parecen más a la categoría de máquina
  que a la máquina del gimnasio.

## Lo más barato que se puede hacer

Pasar de 2 poses a 3 o 4 por ejercicio. `poseAt()` ya interpola; hay que
generalizarla a N fotogramas y agregar la pose intermedia. Cuesta ~100 bytes por
ejercicio y arregla el punto 1 sin tocar nada más.

## Material OSS que sirve

Se revisó qué hay dado vuelta antes de dibujar de cero.

| Fuente | Licencia | Qué tiene | Sirve para |
| --- | --- | --- | --- |
| [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db) | Unlicense (dominio público) | 873 ejercicios, 2 fotos reales cada uno (inicio y fin), JSON con músculos, equipo e instrucciones | **Referencia.** Cubre casi todas las máquinas del programa: hack squat, prensa, femoral sentado, jalón, remo, face pull, predicador, pushdown, crunch en máquina, gemelos. Son fotos del ángulo exacto que hace falta para corregir la geometría. |
| [chaosbastler/opentraining-exercises](https://github.com/chaosbastler/opentraining-exercises) (dibujos de Everkinetic) | CC-BY-SA 3.0 | 71 ejercicios × 2 poses, ya en SVG | Poco. Casi todo es peso libre y pelota: de las 18 máquinas del programa solo aparece la prensa. Además cada SVG pesa ~56 KB sin optimizar y CC-BY-SA obliga a compartir igual cualquier derivado. |
| [ExerciseDB](https://github.com/exercisedb/exercisedb-api), [exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) | API abierta, media de licencia poco clara | GIFs animados, 1000+ ejercicios | No. La animación ya la tenemos; lo que falta es exactitud, y la licencia de las imágenes no está clara. |

**Cómo usarlo.** `free-exercise-db` como capa de referencia, no como assets de la
app: se mira la foto y se corrigen las coordenadas de `program.ts`. Es lo mismo
que ya se hizo a mano con la prensa (`b99cfa11` en el repo homelab) y no suma un
solo byte al bundle ni ata el proyecto a una licencia viral. Meter las fotos en
la app es la otra opción —ahora entran, GitHub Pages no tiene el límite de 1 MB
que tenía Lakebed— pero mata la animación, que es lo distintivo.
