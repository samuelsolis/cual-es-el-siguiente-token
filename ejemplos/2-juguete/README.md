# 2 · El modelo de juguete

## Qué es

Es un modelo de lenguaje de juguete, el que se usa en la charla: «El perro come carne». Dada una palabra, da un porcentaje para cada palabra que podría ir detrás.

Tiene tres partes: el modelo, el programa y los datos.

### El modelo: solo números

El modelo es justo lo que se genera en la carpeta `models/` al entrenar: `random.json`, el modelo sin entrenar, con sus números al azar, y `trained.json`, el modelo entrenado. Si los abrís, veréis que no hay nada más que números:

| En el fichero | Qué es | Números |
| --- | --- | --- |
| `vocabulary` | Las palabras que conoce, cada una con su número (su posición) | — |
| `embeddings` | La tabla de embeddings: una fila de 2 números por palabra | 8 × 2 = 16 |
| `weights1`, `biases1` | Las 2 neuronas de la capa oculta: sus pesos y sus sesgos | 2 × (2 + 1) = 6 |
| `weights2`, `biases2` | Las 8 neuronas de la capa final, una por palabra | 8 × (2 + 1) = 24 |

46 números en total. En `random.json` están al azar; en `trained.json` son los mismos 46, ajustados. Eso es todo el modelo.

### El programa: lo que usa esos números

Todo lo demás es **el programa**: el puñado de bucles y algoritmos que se cuentan en la charla. El programa no sabe nada del perro ni de la carne: solo sabe hacer cuentas con los números del modelo.

Dos ficheros son los que se ejecutan:

| Ejecutable | Qué hace |
| --- | --- |
| `train.js` | **Entrena.** Crea el modelo con números al azar y lo guarda (`models/random.json`). Después lo entrena vuelta a vuelta: genera, compara con lo esperado y corrige un poquito todos los números que intervinieron. Al terminar guarda el modelo entrenado (`models/trained.json`). |
| `generate.js` | **Genera.** Abre un modelo guardado y, desde la palabra que le digas, elige la siguiente más probable una y otra vez. No cambia ningún número: solo consulta el modelo. |

Y dos ficheros auxiliares, que usan los ejecutables:

| Auxiliar | Qué tiene |
| --- | --- |
| `model.js` | Las piezas del modelo: la neurona (entradas × pesos + sesgo), la capa, el paso de puntuaciones a porcentajes, el camino palabra → fila → capa oculta → capa final, y el paso de entrenamiento. Hace lo mismo que el código de la charla (`neurona`, `capa`…), con los nombres en inglés (`neuron`, `layer`…). |
| `text.js` | Lee las frases y el vocabulario, y saca de las frases los ejemplos de entrenamiento: cada palabra y la que va detrás («el → perro», «perro → come», «come → carne»). |

Por dentro, el programa hace lo mismo que en la charla:

```
palabra → su fila de la tabla (2 números) → capa oculta (2 neuronas)
        → capa final (una neurona por palabra) → porcentajes
```

Una limitación a propósito: solo mira la última palabra para adivinar la siguiente. No tiene atención; eso es el ejemplo 3.

### Los datos: para tocarlos

En la carpeta `datos/` está con qué se entrena. Podéis cambiarlos y volver a entrenar todas las veces que queráis, sin miedo: no se rompe nada.

- `datos/frases.txt`: **las frases** de entrenamiento, una por línea. Por defecto, «el perro come carne».
- `datos/vocabulario.txt`: **el vocabulario**, las palabras que conoce el modelo, una por línea y en orden (la primera es la 0). Por defecto, las 8 de la charla.

Si añadís una frase con palabras nuevas, añadidlas también al vocabulario; si no, el programa os avisa. Y si borráis el fichero de vocabulario, se saca de las frases.

## Cómo se ejecuta

Son dos programas. Primero se entrena, desde la carpeta `ejemplos/`:

```bash
node 2-juguete/train.js
```

Qué ofrece:

- El vocabulario y cuántos ejemplos de entrenamiento salen de las frases (cada palabra y la que va detrás).
- El modelo nuevo, al azar: cuántos números tiene y qué frase genera.
- El entrenamiento, vuelta a vuelta: qué porcentaje da a la palabra correcta en cada ejemplo.
- El modelo entrenado y qué frase genera ahora.
- Guarda los dos modelos, `models/random.json` (al azar) y `models/trained.json` (entrenado). Son ficheros con todos sus números: ábrelos, eso es el modelo.

Opciones:

| Opción | Por defecto | Qué hace |
| --- | --- | --- |
| `--sentences fichero` | `datos/frases.txt` | Las frases de entrenamiento, una por línea. |
| `--vocabulary fichero` | `datos/vocabulario.txt` (o sacado de las frases) | Las palabras que conoce, una por línea y en orden. |
| `--rounds` | 40 | Cuántas vueltas: cada vuelta pasa una vez por todos los ejemplos. |
| `--seed` | 31 | El azar de partida. Con otra semilla, otros números iniciales. |
| `--rate` | 0.2 | El tamaño de cada corrección. |

Después se genera con el modelo que quieras:

```bash
node 2-juguete/generate.js trained el
```

El primer argumento es el modelo (`random`, `trained` o un fichero `.json`) y el segundo, la palabra por la que empezar. Con `--words 5` genera 5 palabras en vez de 3. En cada paso enseña las tres palabras más probables y elige la primera. Generar no cambia ningún número: solo consulta el modelo.

## Ejemplos de uso

Tus propias frases, en un fichero, una por línea:

```
el perro come carne
el gato bebe leche
yo como pan
```

```bash
node 2-juguete/train.js --sentences mis-frases.txt --rounds 200
node 2-juguete/generate.js trained yo
```

```
yo como pan gato
```

Con tus frases, el vocabulario se saca de ellas. ¿Por qué «gato» al final? Porque ninguna frase sigue después de «pan»: el modelo no ha aprendido nada para ese punto y elige al azar. Y si empiezas por «el», duda entre «perro» y «gato»: las dos frases empiezan igual.

Entrena con otra semilla y mira cómo cambia el azar de partida y lo que tarda en aprender:

```bash
node 2-juguete/train.js --seed 7
```

## Los ejemplos de la charla

Las frases y el vocabulario de la charla son los que hay por defecto en `datos/`. Entrena:

```bash
node 2-juguete/train.js
```

```
Modelo nuevo, al azar: 46 números (semilla 31).
  genera: el gato gato gato

Entrenando 40 vueltas (cada vuelta pasa una vez por todos los ejemplos):
  vuelta    1   el → perro 7,2 %   perro → come 15,5 %   come → carne 20,0 %
  vuelta    5   el → perro 41,0 %   perro → come 28,7 %   come → carne 82,5 %
  vuelta   10   el → perro 92,7 %   perro → come 74,7 %   come → carne 95,8 %
  vuelta   20   el → perro 98,7 %   perro → come 96,5 %   come → carne 98,9 %
  vuelta   40   el → perro 99,6 %   perro → come 99,1 %   come → carne 99,7 %

Modelo entrenado: los mismos 46 números, ajustados.
  genera: el perro come carne
```

Son exactamente los mismos números que en la presentación. Ahora genera con cada modelo. Al azar:

```bash
node 2-juguete/generate.js random el
```

```
después de «el»:  gato 35,5 %, come 15,0 %, carne 15,0 %   → gato
después de «gato»:  gato 40,0 %, come 18,0 %, carne 17,4 %   → gato
después de «gato»:  gato 40,0 %, come 18,0 %, carne 17,4 %   → gato

el gato gato gato
```

Y entrenado:

```bash
node 2-juguete/generate.js trained el
```

```
después de «el»:  perro 99,6 %, come 0,2 %, yo 0,1 %   → perro
después de «perro»:  come 99,1 %, carne 0,3 %, perro 0,2 %   → come
después de «come»:  carne 99,7 %, come 0,2 %, pescado 0,1 %   → carne

el perro come carne
```

Y lo que le falta, el final de la escena 5: entrénalo con «el perro come carne» y «el gato come pescado» (son las frases del ejemplo 3):

```bash
node 2-juguete/train.js --sentences 3-atencion/datos/frases.txt --rounds 200
node 2-juguete/generate.js trained come --words 1
```

```
después de «come»:  pescado 54,2 %, carne 44,4 %, gato 0,4 %   → pescado
```

Después de «come», duda. Solo ve «come»: no sabe quién come.
