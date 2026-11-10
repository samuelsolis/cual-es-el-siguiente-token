# 3 · El modelo de juguete con atención

## Qué es

Es el mismo modelo de juguete del ejemplo 2, con el paso que le falta: la **atención**, como en la escena 6 de la charla.

El juguete del ejemplo 2 solo mira la última palabra. Con «el perro come» solo ve «come», así que no puede saber quién come. Este, antes de las capas, deja que cada palabra mire a las anteriores y se quede con un poco de ellas.

Tiene las mismas tres partes que el ejemplo 2: el modelo, el programa y los datos.

### El modelo: solo números

El modelo es justo lo que se genera en la carpeta `models/` al entrenar: `random.json`, sin entrenar, y `trained.json`, entrenado. Son los mismos números que en el ejemplo 2, más los de la atención:

| En el fichero | Qué es | Números |
| --- | --- | --- |
| `vocabulary` | Las palabras que conoce | — |
| `embeddings` | La tabla de embeddings: una fila de 2 números por palabra | 8 × 2 = 16 |
| `query` | **Nuevo:** la capa de consulta (qué busco): 2 neuronas | 2 × (2 + 1) = 6 |
| `key` | **Nuevo:** la capa de clave (qué ofrezco): 2 neuronas | 2 × (2 + 1) = 6 |
| `value` | **Nuevo:** la capa de valor (qué aporto): 2 neuronas | 2 × (2 + 1) = 6 |
| `weights1`, `biases1` | Las 2 neuronas de la capa oculta | 2 × (2 + 1) = 6 |
| `weights2`, `biases2` | Las 8 neuronas de la capa final, una por palabra | 8 × (2 + 1) = 24 |

64 números en total: los 46 del juguete más 18 de atención. Son los de la ventana «Parámetros» de la escena 6. Las tres capas de atención son las mismas para todas las palabras: no hay una consulta por palabra, sino una capa que convierte la fila de cualquier palabra en su consulta.

### El programa: lo que usa esos números

Todo lo demás es **el programa**: el mismo puñado de bucles y algoritmos del ejemplo 2, con los de la atención añadidos. Tampoco sabe nada del perro ni del gato: solo hace cuentas con los números del modelo.

Por dentro, el camino es el del ejemplo 2 con un paso más en medio:

```
filas de la tabla → atención → capa oculta → capa final → porcentajes
```

Y ese paso de atención hace tres cosas:

- **Consulta, clave y valor:** la fila de cada palabra pasa por las tres capas.
- **Mirar:** la consulta de una palabra × la clave de cada palabra anterior (y la suya). Sale una puntuación por palabra, que se pasa a porcentajes. Cada palabra solo mira hacia atrás.
- **Mezclar:** su fila + el valor de cada una por su porcentaje. Eso es lo que entra en la capa oculta.

Nadie le dice a quién mirar: las tres capas empiezan al azar y se entrenan con el mismo bucle que todo lo demás.

Los ejecutables, igual que en el ejemplo 2:

| Ejecutable | Qué hace |
| --- | --- |
| `train.js` | **Entrena.** Crea el modelo al azar y lo guarda (`models/random.json`). Lo entrena vuelta a vuelta, ahora con frases enteras: en cada posición, la palabra esperada es la siguiente, y la corrección llega también a las tres capas de atención. Al terminar guarda el entrenado (`models/trained.json`). |
| `generate.js` | **Genera.** Abre un modelo guardado y, desde el principio de frase que le digas, elige la siguiente palabra más probable. Además enseña **a quién mira** la última palabra, con sus porcentajes. No cambia ningún número. |

Y los auxiliares:

| Auxiliar | Qué tiene |
| --- | --- |
| `model.js` | Las piezas del ejemplo 2 (neurona, capa, porcentajes) más la atención: consulta, clave y valor, mirar y mezclar, y el paso de entrenamiento con la frase entera. |
| `text.js` | Lee las frases y el vocabulario. El mismo del ejemplo 2. |

Está simplificado como en la charla (un solo bloque, sin normalización), salvo un detalle de los modelos reales que aquí sí está: la **escala**. «Consulta × clave» se divide entre la raíz de cuántos números tiene cada fila. Sin eso, con filas largas las puntuaciones se disparan, los porcentajes se van a todo o nada y el modelo deja de aprender.

### Los datos: para tocarlos

Como en el ejemplo 2, en `datos/` está con qué se entrena, y se puede cambiar y volver a entrenar sin miedo:

- `datos/frases.txt`: **las frases**, una por línea. Por defecto, «el perro come carne» y «el gato come pescado»: las dos que hacen dudar al juguete sin atención.
- `datos/vocabulario.txt`: **el vocabulario**, las mismas 8 palabras de la charla.

Si añadís palabras nuevas a las frases, añadidlas al vocabulario (el programa os avisa si falta alguna). Y si borráis el vocabulario, se saca de las frases.

## Cómo se ejecuta

Igual que el ejemplo 2: primero se entrena y después se genera. Desde la carpeta `ejemplos/`:

```bash
node 3-atencion/train.js
```

Qué ofrece:

- El modelo al azar y cuántos números tiene cada pieza: la tabla, consulta, clave, valor, la capa oculta y la final.
- El entrenamiento, vuelta a vuelta: qué porcentaje da a la última palabra de cada frase, con todo lo anterior delante.
- Guarda los dos modelos: `models/random.json` y `models/trained.json`.
- Si las correcciones son demasiado grandes y los números se disparan, se para y te dice qué cambiar.

Opciones:

| Opción | Por defecto | Qué hace |
| --- | --- | --- |
| `--sentences fichero` | `datos/frases.txt` | Las frases de entrenamiento, una por línea. |
| `--vocabulary fichero` | `datos/vocabulario.txt` (o sacado de las frases) | Las palabras que conoce, una por línea y en orden. |
| `--size` | 2 | Números por palabra (y en cada consulta, clave y valor). |
| `--rounds` | 200 | Cuántas vueltas: cada vuelta pasa una vez por todas las frases. |
| `--seed` | 31 | El azar de partida. |
| `--rate` | 0.1 | El tamaño de cada corrección. |

Después se genera, empezando por el texto que quieras:

```bash
node 3-atencion/generate.js trained "el perro come"
```

El primer argumento es el modelo (`random`, `trained` o un fichero `.json`) y el segundo, el principio de la frase. Por defecto añade una palabra; con `--words 3`, tres. En cada paso enseña **a quién mira** la última palabra, con sus porcentajes, y las tres palabras más probables.

No siempre aprende: depende del azar de partida. Si se queda atascado (por ejemplo, en torno al 50 % con dos frases), prueba otra `--seed` o más `--rounds`.

## Ejemplos de uso

Más números por palabra:

```bash
node 3-atencion/train.js --size 8
```

```
Modelo nuevo, al azar: 322 números (8 por palabra, semilla 31).
  vuelta  200   el perro come → carne 99,9 %   el gato come → pescado 99,9 %
```

Una corrección demasiado grande:

```bash
node 3-atencion/train.js --rate 3
```

```
En la vuelta 3 los números se han disparado: las correcciones son demasiado grandes.
Prueba con una tasa más pequeña (--rate 0.05) o con otra semilla (--seed).
```

Tus frases, en un fichero, una por línea:

```
yo como pan
tu comes fruta
el perro come carne
el gato come pescado
```

```bash
node 3-atencion/train.js --sentences mis-frases.txt
node 3-atencion/generate.js trained "tu comes"
```

```
tu comes fruta
```

Si con tus frases entrenas muchas más vueltas, puede que los números acaben disparándose: el programa se para y te lo dice. Con `--rate 0.05` aguanta más.

## Los ejemplos de la charla

El final de la escena 5 y la escena 6: con «el perro come carne» y «el gato come pescado», el juguete sin atención duda (ver el ejemplo 2). Este no. Entrena con los datos por defecto:

```bash
node 3-atencion/train.js
```

```
Modelo nuevo, al azar: 64 números (2 por palabra, semilla 31).
  tabla de embeddings 16
  consulta            6
  clave               6
  valor               6
  capa oculta         6
  capa final          24

Entrenando 200 vueltas (cada vuelta pasa una vez por todas las frases):
  vuelta    1   el perro come → carne 14,9 %   el gato come → pescado 21,9 %
  vuelta   50   el perro come → carne 91,5 %   el gato come → pescado 73,9 %
  vuelta  200   el perro come → carne 99,9 %   el gato come → pescado 99,7 %
```

Son los 64 números de la ventana «Parámetros» de la escena 6. Ahora pregunta:

```bash
node 3-atencion/generate.js trained "el perro come"
node 3-atencion/generate.js trained "el gato come"
```

```
«come» mira a:  el 0,1 %, perro 9,0 %, come 90,9 %
  siguiente:  carne 99,9 %, gato 0,0 %, perro 0,0 %   → carne

«come» mira a:  el 0,0 %, gato 97,5 %, come 2,5 %
  siguiente:  pescado 99,7 %, come 0,2 %, gato 0,0 %   → pescado
```

Ya sabe quién come. Y fíjate en a quién mira «come»: con «gato», casi todo a «gato»; con «perro», casi todo a sí mismo. La red ha encontrado su propio atajo: le basta con detectar «gato»; si no está, es «carne». Nadie se lo ha dicho.

Antes de entrenar, en cambio, mira repartido y dice cualquier cosa:

```bash
node 3-atencion/generate.js random "el perro come"
```

```
«come» mira a:  el 34,5 %, perro 25,1 %, come 40,4 %
```

En la charla, los números de mirar y mezclar son ilustrativos; estos son de verdad.
