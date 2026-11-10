# Inteligencia artificial sin artificios — Guion de la charla

DrupalCamp Spain 2026 · 45 minutos · Público: todos los asistentes

> **Promesa del abstract:** abrir la caja negra. Neurona, parámetros, token, ¿embedding? &lt;- quizá lo podemos quitar o mencionar de pasada, entrenar desde cero, fine-tuning y RAG. *"Son muchos datos y unas cuantas funciones matemáticas."*

---

El objetivo es quitar la magia a la Ia, saber qué es un modelo y como funciona y luego, qué es harness/andamiaje/programa y que básicamente lo que hace es meterle contexto al modelo.

## Idea vertebral

Una sola frase que debe quedar al salir:

> **Un modelo son números que empiezan al azar y que los datos van corrigiendo. Todo lo demás es escala... y código normal alrededor.**

Hilo narrativo: de abajo arriba. Primero un modelo de lenguaje de juguete, entero y real, con una sola frase («El perro come carne»): vocabulario, números de cada token, neurona, capas y cómo se entrena, con un solo hilo conductor: **valor esperado → valor generado → corregir pesos**. Después, lo que le falta para ser de verdad (la atención) y qué pasa a escala. Luego, para muestra un botón, ese mismo bucle ejecutado de verdad en un portátil (dígitos manuscritos), con datos reales. Después, las tres formas realistas de *usar* esa maquinaria sin ser un gran laboratorio: no tocarla (RAG), retocarla (LoRA) o fabricar una pequeña (desde cero).

## Reparto del tiempo


| #   | Bloque                                   | Min. |
| --- | ---------------------------------------- | ---- |
| 0   | Apertura: la caja negra                  | —    |
| 1   | Un modelo de juguete: «El perro come carne» | —    |
| 2   | Lo que le falta al juguete: atención, escala, generar | —    |
| 3   | Para muestra, un botón: dígitos reales   | —    |
| 4   | Cómo se entrena un LLM (y por qué tú no) | —    |
| 5   | Fine-tuning: LoRA                        | —    |
| 6   | RAG                                      | —    |
| 7   | Cierre                                   | —    |


Tiempos pendientes de ajustar una vez cerrado el discurso.

---

## 0 · Apertura — la caja negra

**Objetivo:** situar el problema y prometer algo concreto.

- **El título cambia:** primero sale el del programa, «Inteligencia artificial sin artificios»; al clic siguiente se tacha, y al otro llega el de verdad, «**¿Cuál es el siguiente token?**». Es lo único que hace un modelo de lenguaje, y al final se entenderá por qué. (Decidido el 2026-11-10: el título publicado no cambia; el cambio es solo en pantalla.)

- Gancho: "¿Cuántos habéis utilizado la IA para resolver un problema esta semana? ¿Y cuántos sabríais explicar qué ha pasado dentro?"
- La IA genera código que suele funcionar, pero la usamos como una caja negra. Hoy la abrimos.
- Advertencia honesta: no vamos a entrenar un ChatGPT. Eso es de laboratorios con presupuestos de decenas de millones. Pero las piezas son las mismas, y las vamos a ver todas.
- Enlace: «Empezamos por el principio: de palabras a tokens». (El mapa de la charla y los dos tipos de IA se quitaron el 2026-11-07: no aportaban.)

**Diapositiva:** una caja negra con un `?` → la misma caja abierta llena de números.

**Transición:** "Vamos a construir un modelo de lenguaje entero. Con una sola frase."

---

## 1 · Un modelo de juguete: «El perro come carne»

**Mensaje clave:** un modelo de lenguaje es un vocabulario fijo, unos números por token y unas capas de neuronas. Todo empieza al azar y se ajusta comparando lo que genera con lo que esperaba. Lo vamos a ver entero, de verdad, con una sola frase.

Todo el bloque usa un modelo real y diminuto (`presentacion/juguete.js`). Los números que salen aquí son los que calcula: no hay ninguno inventado.

| Pieza | Qué es | Números |
| --- | --- | --- |
| Vocabulario | 8 tokens sin orden: `gato`, `carne`, `yo`, `perro`, `barco`, `el`, `pescado`, `come` | — |
| Tabla de embeddings | 2 números por token | 16 |
| Capa oculta | 2 neuronas (2 pesos + 1 sesgo cada una) | 6 |
| Capa final | 8 neuronas, una por token del vocabulario | 24 |
| **Total** | | **46** |

Semilla 31, tasa 0,2, 40 vueltas. Solo se entrena con «el perro come carne»: los otros cuatro tokens están en el vocabulario pero esa frase no los usa.

Una simplificación que hay que decir en voz alta: **este juguete solo mira la última palabra** para predecir la siguiente. Los modelos de verdad miran todas; eso es la atención, y llega en el bloque 2.

### Antes de empezar: de palabras a tokens

Muy breve, solo para que nadie se quede con la idea de que el modelo trabaja con palabras:

- Los modelos trabajan con **tokens**: trozos de texto. Una palabra frecuente es un token (`perro`); una menos común se parte en varios (`token` + `ización`); una rara, en trozos sin significado propio (`int` + `elig` + `encia`). En pantalla salen de una en una. `tokenización` e `inteligencia` son el troceo real con un tokenizador actual (`o200k_base`, comprobado con `tiktoken`); `perro` es una simplificación (ese tokenizador lo parte en `per` + `ro`), elegida para enlazar con el juguete. Cada modelo trocea a su manera.
- **El corte lo decide la frecuencia** con que cada trozo apareció en los textos de entrenamiento, no la gramática. (Si preguntan: por eso el español suele gastar más tokens que el inglés.)
- **Para hoy, simplificamos: una palabra, un token.** Solo se dice; en pantalla no sale.

### 1.1 El vocabulario y sus números

**Diapositiva:** el `perro` de la pantalla anterior vuela a su sitio entre ocho recuadros punteados, ocho tokens sueltos y sin orden: no forman una frase (ya se formará). Siguiente beat: se numeran del 0 al 7. Título: «Y los tokens forman un vocabulario». Aquí se dice que con ellos vamos a construir un modelo de lenguaje de juguete.

- **Cada token, su número:** `gato` = 0, `carne` = 1, `yo` = 2, `perro` = 3, `barco` = 4, `el` = 5, `pescado` = 6, `come` = 7. Se cuenta desde 0, como en JavaScript. Ese número es solo un índice: el 3 no se parece más al 4 que al 7.
- **El vocabulario es fijo.** Antes de entrenar se decide la lista cerrada de tokens que el modelo conoce. No cambia nunca. Aquí son 8; en un modelo real, decenas de miles de trozos de palabra.
- **La frase, cuando llegue:** «el perro come carne» = `[5, 3, 7, 1]`.
- **Y a cada token le asignamos parámetros al azar** (título de la diapositiva): los ocho recuadros vuelan a su fila del Excel, para que se vea que son los mismos tokens. Cada uno tiene una fila de números, su *embedding*. Aquí 2 números, para poder dibujar cada token como un punto en un mapa (el mapa sale en el beat siguiente). Al empezar, al azar:

  | token | d1 | d2 |
  | --- | --- | --- |
  | gato | 0,34 | 0,67 |
  | carne | 0,50 | −0,90 |
  | yo | −0,17 | −0,31 |
  | perro | −0,85 | 0,86 |
  | barco | 0,62 | 0,33 |
  | el | −0,36 | 0,46 |
  | pescado | 0,15 | −0,16 |
  | come | 0,44 | −0,90 |

- **De 2 a 3 dimensiones** (siguiente beat): la tabla gana una columna d3 y el mapa gira hasta verse en 3D; cada punto sale del plano hasta su d3. Con 3 números, un punto en el espacio; con miles, como en un modelo real, ya no se puede dibujar, pero es lo mismo. El juguete se queda con 2: la d3 solo está para verlo, y también sale al azar (otra semilla del mismo generador).
- **Estos números también se aprenden** (solo se dice; en pantalla ya no sale). No vienen de fuera: son la primera pieza del modelo.

### La tabla de embeddings y su tamaño

Antes de pasar a 3D (con la tabla y el mapa ya en pantalla), una llave bajo el Excel le pone nombre: **tabla de embeddings**, y se queda durante el 3D. Al volver a 2D sale Clip con su tamaño en modelos reales (ejemplos del momento con cifras oficiales). Los parámetros todavía no se nombran: llegan con las neuronas.

| | tokens del vocabulario | números por token | tamaño de la tabla (solo para ti) |
| --- | --- | --- | --- |
| nuestro juguete | 8 | 2 | 16 |
| Llama 3.2 3B (el modelo local del libro, 5.3) | 128.256 | 3.072 | ≈ 394 millones |
| Qwen3.6 35B-A3B (Alibaba, abril de 2026) | 248.320 | 2.048 | ≈ 509 millones |
| Kimi K3 (Moonshot AI, junio de 2026) | 163.840 | 7.168 | ≈ 1.174 millones |

Fuentes: Llama 3.2, leídas el 2026-10-20: ficha oficial (`MODEL_CARD.md`, «3B (3.21B)») y `models/sku_list.py` del repositorio `meta-llama/llama-models` (`vocab_size` 128256, `dim` 3072). Qwen3.6 y Kimi K3, leídas el 2026-11-10 en Hugging Face: `config.json` de `Qwen/Qwen3.6-35B-A3B` (`vocab_size` 248320, `hidden_size` 2048, `num_hidden_layers` 40; 35.951.822.704 parámetros en BF16 según el recuento del repositorio; la ficha dice «35B in total and 3B activated») y de `moonshotai/Kimi-K3` (`vocab_size` 163840, `hidden_size` 7168, `num_hidden_layers` 93; la ficha dice 2.8T de parámetros totales, 104B activos, y «160K» de vocabulario). «Números por token» es el tamaño de cada fila de la tabla de embeddings. Se eligieron por ser de lo que se sirve hoy (por ejemplo, en nan.builders): Llama como modelo local, Qwen como mediano abierto y Kimi K3 como uno de los más grandes con pesos publicados.

Si preguntan por Claude, GPT-4 o Gemini: sus fabricantes no publican ni parámetros ni vocabulario; lo que circula son estimaciones. Detalle curioso para comentar: Qwen3.6 tiene casi el doble de vocabulario que Llama 3.2 3B (248.320 frente a 128.256), pero filas más cortas (2.048 frente a 3.072).

**Para ti, cuando lleguen los parámetros:** parámetros = todos los números que el modelo aprende: la tabla de embeddings **más** los pesos y sesgos de todas las neuronas. La tabla es solo una parte: en Llama 3.2 3B, unos 394 de 3.210 millones (~12 %); en Kimi K3, unos 1.174 de 2.800.000 millones (~0,04 %). Lo grande son las capas, que se aplican a todos los tokens por igual. (Llama 3.2 reutiliza la tabla como capa final, «Shared Embeddings: Yes» en su ficha; el juguete no.) Llama 3.1 405B: `vocab_size` 128256 y `dim` 16384 en `sku_list.py`. Detalle para comentar: mismo vocabulario que Llama 3.2 3B; lo que crece es el tamaño de cada fila.

### Transición: del azar al orden

**Diapositivas** (cuatro beats): la tabla y el mapa vuelven a 2D · el mapa encoge y se va a la izquierda («al azar»), con una flecha a `entrenar.exe` · la barra de `entrenar.exe` se llena mientras, a la derecha, los mismos puntos se agrupan: animales juntos, comida junta («entrenado · posiciones ilustrativas») · foco en `entrenar.exe`, que es lo que vamos a abrir.

- Así empieza cualquier modelo: los tokens repartidos al azar. Gato lejos de perro, carne lejos de pescado.
- **Lo que falta es el entrenamiento**: lo que mueve los números hasta que lo parecido acaba cerca.
- El mapa final es **ilustrativo** (así lo pone la pantalla). El de nuestro juguete se ve de verdad en el bloque 1.4, y ahí solo se mueven los cuatro tokens de la frase.
- Para entender el entrenamiento hay que ver qué hay dentro del modelo: neuronas.

### 1.2 La neurona

Sus entradas son **la fila de «come»**: 0,44 y −0,90. Cada entrada llega con un **peso**, y la neurona tiene un **sesgo**. Todo al azar, de momento:

```
 0,44 ×  0,43  =  0,189
−0,90 ×  0,52  = −0,468
+ sesgo           0,760
────────────────────────
salida        =  0,481
```

```js
function neurona(entradas, pesos, sesgo) {
  var suma = 0;
  for (var i = 0; i < entradas.length; i++) {
    suma = suma + entradas[i] * pesos[i];
  }
  return suma + sesgo;
}
```

En pantalla, primero el código y, debajo, la Calculadora con la cuenta de verdad (entradas en negro, pesos en azul, sesgo en morado, como en el dibujo, donde una caja marca lo que es de la neurona). Luego Clip: **«Adiós, magia.»** No hay nada más dentro.

Sin tabla en pantalla: se cuenta de palabra. **Entradas** = lo que le llega a la neurona (aquí, la fila del token que toca; cambia qué fila entra, no sus números). **Pesos** = el patrón que busca la neurona. **Sesgo** = cuánto parecido necesita para reaccionar. Todos los números (la tabla, los pesos y los sesgos) solo cambian al entrenar.

Pesos y sesgo son el modelo; las entradas, el dato. (Para ti, si alguien pregunta: la suma de productos mide cuánto se parecen la lista de entradas y la lista de pesos.)

### 1.3 La capa y la red

- **Una capa** = varias neuronas con las mismas entradas y pesos distintos. Cada una busca un patrón distinto. Nuestra capa oculta tiene 2: A (pesos 0,43 y 0,52, sesgo 0,76) da 0,48; B (pesos 0,69 y −0,43, sesgo 0,67) da 1,36.

  ```js
  function capa(entradas, pesos, sesgos) {
    var salidas = [];
    for (var n = 0; n < pesos.length; n++) {   // un juego de pesos por neurona
      salidas.push(neurona(entradas, pesos[n], sesgos[n]));
    }
    return salidas;
  }
  ```

- **Una red** = capas encadenadas: la salida de una es la entrada de la siguiente. La **capa final tiene una neurona por token del vocabulario**, así que sale una puntuación para cada uno, que se pasa a porcentajes:

  ```js
  var entrada = embeddings[7];                // «come»
  var oculta  = capa(entrada, pesos1, sesgos1);
  var final   = capa(oculta, pesos2, sesgos2);
  var p       = porcentajes(final);
  ```

  Con todo al azar, para «come» sale: **gato 40,5 %** · carne 10,6 % · yo 1,6 % · perro 1,5 % · barco 1,8 % · el 16,1 % · pescado 10,2 % · come 17,7 %.

- **Cómo se conectan las capas** (en pantalla, un beat de zoom): cada neurona oculta tiene **una sola salida** (A da 0,48; B, 1,36) y esa salida va entera a las 8 neuronas finales; en el dibujo, un tramo que se reparte en un punto. Los pesos de esas líneas son de la neurona que recibe. Ejemplo, la neurona de «gato»: 0,48 × 0,54 + 1,36 × 0,61 + sesgo 0,77 = **puntuación 1,86**. Es la misma neurona de antes: 2 entradas, 2 pesos, 1 sesgo, 1 salida. Las 8 puntuaciones se pasan a porcentajes: «gato», 40,5 %.

- **Parámetros** (en pantalla, la cuenta pieza a pieza y el total en grande). Regla: cada neurona tiene un peso por cada entrada que recibe, más un sesgo.

  | Pieza | Cuenta | Números |
  | --- | --- | --- |
  | Tabla de embeddings | 8 tokens × 2 números | 16 |
  | Capa oculta | 2 neuronas × (2 entradas + 1 sesgo) | 6 |
  | Capa final | 8 neuronas × (2 entradas + 1 sesgo) | 24 |

  **46 números. Eso es el modelo.** Ojo: las 2 entradas de la capa final son las salidas de las 2 neuronas ocultas, no los 2 números por token (coinciden por casualidad). En pantalla: la red grande, sola y agrandada («Un modelo de verdad»). Luego Clip con tamaños reales:

  | | capas | parámetros |
  | --- | --- | --- |
  | nuestro juguete | 2 | 46 |
  | Llama 3.2 3B | 28 | 3.210 millones |
  | Qwen3.6 35B | 40 | ≈ 36.000 millones |
  | Kimi K3 | 93 | 2.800.000 millones |

  Fuentes: Llama 3.2 3B, ficha oficial («3.21B») y `sku_list.py` (`n_layers` 28); Qwen3.6 35B y Kimi K3, `config.json` y fichas en Hugging Face (ver 1.1). Los dos son de «mezcla de expertos»: cada token usa solo una parte de los parámetros (unos 3.000 millones en Qwen, 104.000 millones en Kimi), por si preguntan. En los modelos reales cada «capa» es un bloque que incluye la atención, que se ve después.

- **Un momento:** sobre la red grande, un aviso: «¡Pero todos estos números están al azar!». Y al clic siguiente: «Hasta que dejan de ser azar». De ahí, al entrenamiento (la escena 5 ya empieza con «el perro come ___» y «gato» al 40,5 %). (Cambiado el 2026-11-10: antes volvía a nuestro modelo y preguntaba «¿Quién decide cada número?».)

### 1.4 Entrenar: esperado → generado

**El corazón de la charla.** El modelo **genera** un reparto de porcentajes, se compara con el **esperado** y se corrige un poquito todo lo que ha intervenido. Repetido muchas veces.

1. **El esperado viene en la propia frase.** Nadie etiqueta nada: «El perro come carne» trae tres ejemplos, el→perro, perro→come, come→carne.
2. **Generado − esperado**, por cada token del vocabulario:

   | token | generado | debería | error |
   | --- | --- | --- | --- |
   | gato | 40,5 % | 0 % | +0,41 ↓ |
   | carne | 10,6 % | 100 % | −0,89 ↑ |
   | yo | 1,6 % | 0 % | +0,02 ↓ |
   | perro | 1,5 % | 0 % | +0,02 ↓ |
   | barco | 1,8 % | 0 % | +0,02 ↓ |
   | el | 16,1 % | 0 % | +0,16 ↓ |
   | pescado | 10,2 % | 0 % | +0,10 ↓ |
   | come | 17,7 % | 0 % | +0,18 ↓ |

   Lo que sobra, baja; lo que falta, sube. Y baja más el que más se llevó sin merecerlo. (Con la función de error que se usa en la práctica, la *entropía cruzada*, sale exactamente esa resta.)

3. **Se corrige un poquito todo lo que intervino**, cada número según lo que tenía al otro lado de su multiplicación:
   - los pesos y sesgos de la capa final y de la capa oculta (por ejemplo, el peso 2 de A pasa de 0,52 a 0,43);
   - **la fila de «come»**, porque también es aprendida: de (0,44; −0,90) a (0,46; −0,83);
   - las filas de los otros 7 tokens **no se tocan**: no estaban en la entrada.

   La culpa se reparte hacia atrás: capa final → capa oculta → fila del token. Eso es la *retropropagación*, y las librerías hacen las cuentas. Lo calculado por el camino (las salidas de la capa oculta) no se guarda ni se corrige: solo hace de mensajero.
4. **Un solo paso:** carne pasa del 10,6 % al **22,1 %**.
5. **Repetirlo.** Cada vuelta pasa una vez por los tres ejemplos. Porcentaje del token correcto, en ejecución real:

   | vuelta | el → perro | perro → come | come → carne |
   | --- | --- | --- | --- |
   | 1 | 7 % | 16 % | 20 % |
   | 5 | 41 % | 29 % | 82 % |
   | 10 | 93 % | 75 % | 96 % |
   | 20 | 99 % | 97 % | 99 % |
   | 40 | 100 % | 99 % | 100 % |

   En la presentación se entrena en directo, en el navegador, y se ve moverse el mapa: los puntos son las filas de la tabla. Detalle para comentar: los puntos de **carne, gato, yo, barco y pescado no se mueven nunca**, porque nunca son entrada.

**Cómo se corrige cada número, sin matemáticas** (para tenerlo claro):

- Si lo generado es demasiado alto, se bajan los números que lo empujaron hacia arriba. Si es demasiado bajo, se suben.
- Cada uno se corrige en proporción a cuánto contribuyó: más culpa, más corrección.
- Hay una **tasa**, el tamaño del paso: si es muy grande, se pasa de largo; si es muy pequeña, tarda una eternidad.
- (Para quien lo pregunte: esas reglas son la derivada del error. Por eso se llama *descenso por gradiente*.)
- ¿Por qué se empieza al azar y no a cero? Si todas las neuronas de una capa empezaran iguales, recibirían la misma corrección y seguirían siendo idénticas para siempre.

### 1.5 Generar

- **Antes de entrenar:** «el gato gato gato». **Ahora:** «el perro come carne».
- **Al generar no cambia nada:** se pregunta, se elige un token, se añade y se vuelve a preguntar. Los números solo cambian al entrenar.
- **46 números ajustados** comparando lo generado con lo esperado. Eso es el modelo. Un LLM es esto con miles de millones de números y todo internet.

**Diapositivas:** los 8 tokens en recuadros y su número debajo · `vocabulario.txt` · la tabla de embeddings en Excel junto al mapa con 8 puntos · la neurona con la fila de «come», sus pesos y la calculadora · neurona → capa → nuestra red → una red grande, como una sola figura que se transforma · `modelo.exe` con generado / debería / error · `modelo.xls` con lo que cambia en un paso · el entrenamiento en directo con el mapa moviéndose · antes / ahora al generar.

### 1.6 Cierre del entrenamiento

Tras generar («antes: el gato gato gato» → «ahora: el perro come carne»), Clip: «46 números. Y ya “sabe” que el perro come carne. Eso es el modelo.»

(El tríptico «el modelo entero: tabla + red», al azar → entrenar.exe → entrenado, se quitó el 2026-11-10 porque repetía el entrenamiento en directo y el «antes / ahora». Si alguien pregunta por los pesos: en las líneas de la red no se ve un «orden» como en el mapa; nadie puede mirar los pesos y decir que están bien, se nota en lo que hace el modelo. Por eso es tan difícil saber qué ha aprendido un modelo mirando sus números: interpretabilidad, libro 1.2.)

**El enlace con la atención (5.10–5.11):** «Pero solo ha mirado «come»». `modelo.exe · entrenado` con «~~el perro~~ **come** → carne 99,7 %» y, al clic siguiente, «~~el gato~~ **come** → carne 99,7 %». Es real: el juguete entrenado solo recibe la fila del último token, así que con «el gato come» dice lo mismo, y eso que «pescado» está en el vocabulario. No tiene en cuenta nada de lo anterior: le falta contexto.

**Si vas tarde:** quita la tabla de antes → después de un paso; deja el entrenamiento en directo.

**Transición:** "Nuestro juguete solo mira la última palabra. Con «come» acaba diciendo «carne», pero no sabe quién come."

---

## 2 · Lo que le falta al juguete

**Mensaje clave:** un modelo de verdad no escribe respuestas: escribe tokens, uno detrás de otro, eligiendo entre probabilidades, y para elegir bien mira toda la frase.

> **texto → tokens → vectores → atención → probabilidades del siguiente token**

### 2.1 Atención

**El problema que resuelve.** Volvemos al juguete con «el perro come». Solo entra la fila de *come*: *el* y *perro* se quedan fuera. ¿Quién come? No lo sabe; por eso, al azar, dice «gato».

**Lo que hasta aquí es de cualquier modelo.** La tabla, las neuronas, las capas y el bucle de entrenar (esperado → generado → corregir) no son «lo de antes de la atención»: así se entrena también hoy. Lo que le falta al juguete es mirar la frase entera. Antes de 2017 los modelos sí la miraban, pero en cadena, palabra a palabra (ver la nota histórica al final de este apartado).

**Dónde encaja: entre la tabla y las capas.** Paso a paso, con «el perro come»:

1. Texto → tokens: `[5, 3, 7]`. Ahora se usan los tres.
2. Tabla: se cogen las tres filas (*el*, *perro*, *come*). La tabla no cambia.
3. **Atención** (el paso nuevo):
   - cada fila pasa por **tres capas pequeñas**, las mismas para todos los tokens, y sale convertida en tres vectores: **consulta** (qué busco), **clave** (qué ofrezco) y **valor** (qué aporto);
   - **mirar:** la consulta de *come* se compara con la clave de cada uno (multiplicar y sumar: **una `neurona` sin sesgo**). Sale una puntuación por token, y `porcentajes` la convierte en un reparto. Por ejemplo, ilustrativo: *el* 10 %, *perro* 70 %, *come* 20 %;
   - **mezclar:** *come* en esta frase = su fila + 10 % del valor de *el* + 70 % del de *perro* + 20 % del suyo. Mismo tamaño que la fila, pero ahora sabe algo de su frase. Lo mismo se hace para *el* y para *perro*.
4. Capa oculta, capa final y porcentajes: **todo igual que en el juguete**, pero lo que entra es el *come* mezclado, que ya sabe quién come.
5. Al entrenar, el mismo bucle de siempre. Ahora intervino más: las tres capas de la atención y también las filas de *el* y *perro*, que en el juguete no se habrían tocado.

**Con números (en pantalla, 6.3–6.5; ilustrativos salvo las filas de la tabla):**

| entra (fila) | → consulta | → clave | → valor |
| --- | --- | --- | --- |
| el `[−0,36 0,46]` | `[0,4 −0,3]` (no se usa para «come») | `[0,1 −0,2]` | `[0,2 0,1]` |
| perro `[−0,85 0,86]` | `[−0,6 0,9]` (no se usa para «come») | `[0,5 0,6]` | `[0,8 −0,5]` |
| come `[0,44 −0,90]` | `[1,0 2,0]` | `[0,3 0,1]` | `[−0,1 0,3]` |

Cada capa: entra una fila (2 números), sale un vector (2 números, uno por neurona). Mirar: `[1,0 2,0]` × cada clave → −0,3 / 1,7 / 0,5 → porcentajes 9 % / 70 % / 21 %. Mezclar: `[0,44 −0,90]` + 9 % × valor de «el» + 70 % × valor de «perro» + 21 % × valor de «come» = `[0,99 −1,18]`. Eso entra en la capa oculta en lugar de la fila sola. De los 9 vectores, para «come» se usan 7. Cada neurona de esas capas tiene tantas entradas como números por token (2 aquí; 3.072 en Llama 3.2 3B), no tantas como tokens: con más tokens, las capas se usan más veces, pero no crecen.

**¿Qué se guarda?** Las **tres capas** (consulta, clave y valor): son parte del modelo, igual que la capa oculta, y solo cambian al entrenar. No son por token, son las mismas para todos: lo que hace distinta la salida es la fila que entra. Si nuestro juguete tuviera atención, serían 3 × 2 × (2 + 1) = **18 números más** (hipotético: el juguete no la tiene). Lo que **no** se guarda es el resultado de mirar: quién mira a quién y el *come* mezclado se calculan en cada frase y se tiran, como las salidas de cualquier neurona.

**«Busco», «ofrezco» y «aporto»** son nombres por el papel que cumplen en la cuenta: la consulta solo se compara, la clave solo es comparada y el valor solo se suma. Se separan clave y valor porque lo que te hace interesante no tiene por qué ser lo que aportas. Lo que acaban codificando no lo decide nadie: las tres capas empiezan al azar y se entrenan. Imagen para programadores: un objeto `{clave: valor}` en el que **todas las claves casan un poco** y te llevas una mezcla de los valores.

**Un modelo de verdad: bloques apilados.** Subimos de nivel, como en la escena 4. Un **bloque** es atención seguida de capas normales, con sus propios pesos. De cada bloque sale un vector por token, del mismo tamaño, y entra en el siguiente; las capas de cada bloque procesan todos los tokens, cada uno por separado. En el segundo bloque, *come* vuelve a mirar, pero los vectores que ve ya vienen mezclados (*perro* ya tomó algo de *el*): la información se encadena. Al final, solo el vector del último token pasa a la capa final. Clip, con tamaños reales (fuentes en los bloques 1.1 y 1.3): Llama 3.2 3B, 28 bloques y 3.072 números por token; Qwen3.6 35B, 40 y 2.048; Kimi K3, 93 y 7.168. Las «capas» de la escena 4 eran estos bloques. No confundir: los bloques van **en serie**; dentro de cada bloque hay varias atenciones **en paralelo** (el artículo original usa ocho).

En código (simplificado: omito la escala y la normalización que lleva la versión real):

```js
function atencion(vectores, q, k, v) {
  var consultas = [], claves = [], valores = [], nuevos = [];
  // 1. Cada token saca tres vectores, cada uno con su propia capa
  for (var t = 0; t < vectores.length; t++) {
    consultas[t] = capa(vectores[t], q.pesos, q.sesgos);  // qué busco
    claves[t]    = capa(vectores[t], k.pesos, k.sesgos);  // qué ofrezco
    valores[t]   = capa(vectores[t], v.pesos, v.sesgos);  // qué aporto
  }
  // 2. Cada token mira a todos los demás
  for (var t = 0; t < vectores.length; t++) {
    var puntuaciones = [];
    for (var otro = 0; otro < vectores.length; otro++) {
      puntuaciones[otro] = neurona(consultas[t], claves[otro], 0);  // ¿cuánto casa?
    }
    var reparto = porcentajes(puntuaciones);                         // suman 100 %
    // 3. Mi vector + lo que aportan los demás, según el reparto
    nuevos[t] = vectores[t].slice();
    for (var otro = 0; otro < vectores.length; otro++) {
      for (var d = 0; d < valores[otro].length; d++) {
        nuevos[t][d] = nuevos[t][d] + reparto[otro] * valores[otro][d];
      }
    }
  }
  return nuevos;
}
```

Entra un vector por token y sale un vector por token, del mismo tamaño, pero ahora **cada uno sabe algo de su frase**.

**¿Quién decide qué es "buscar" y qué es "ofrecer"?** Nadie. Los pesos de esas tres capas empiezan al azar y se ajustan en el entrenamiento, igual que en el juguete (1.4): si mirar a *perro* ayuda a predecir mejor lo que viene después de *come*, esos pesos se van ajustando para que *come* mire a *perro*.

**Cómo es el modelo completo.** Esto, apilado:

1. Coger la fila de la tabla de cada token (1.1).
2. `atencion` → unas `capa` normales a cada vector → `atencion` → `capa`… **decenas de veces**, cada vez con sus propios pesos. Y en cada paso de atención hay varias copias en paralelo con pesos distintos (el artículo original usa ocho), para que cada una se fije en un tipo de relación distinto: concordancia, a quién se refiere un pronombre, el tema de la frase…
3. Al vector del último token se le aplica una `capa` final con **una neurona por cada token del vocabulario**. Eso da una puntuación por token, y `porcentajes()` la convierte en probabilidades. Eso es lo que sale del modelo, igual que en el juguete.

Todo son tablas de pesos, `capa`, `neurona` y `porcentajes`. No hay ninguna pieza nueva, solo muchas más.

(Al final de este bloque, en 6.12, Clip: «Adiós, magia». Antes estaba tras la neurona, en la escena 4.)

**El precio, visible en el código:** fijaos en el `for` de los tokens dentro de otro `for` de los tokens. Cada token contra todos → coste **cuadrático**. Comparaciones = tokens × tokens: con nuestras 3 palabras, 3 × 3 = 9; con 1.000, un millón; con 2.000, cuatro millones. Por eso duplicar el contexto ≈ cuadruplicar el trabajo.

**Y la memoria.** Quién mira a quién se tira, pero mientras dura la conversación sí se guarda, para cada token, lo que aporta a los demás (su clave y su valor), para no recalcularlo con cada token nuevo. Eso crece en proporción al contexto, no con el cuadrado. Dato real del libro (5.3, Llama 3.2 3B en Ollama): el modelo pesa 2,0 GB; con 4.096 tokens de contexto ocupa 2,39 GB, con 16.384, 3,80 GB, y con 32.768, 5,58 GB. Por eso el contexto es finito y caro.

(Si sobra un segundo: este diseño viene de *Attention Is All You Need*, 2017. Antes se leía palabra a palabra, en serie; esto lo calcula todo a la vez, y eso permitió entrenar con muchísimos más datos.)

### 2.2 A escala: ¿y perro y gato?

El mismo bucle del juguete, con miles de frases. «Le di de comer al **gato**» empuja *gato* hacia arriba; «le di de comer al **perro**», al revés. Ningún paso hace gran cosa; lo que importa es la acumulación.

**¿En qué momento se dice que *perro* y *gato* están relacionados? En ninguno.** Ocurre solo, por acumulación:

- Tras millones de frases, después de "le di de comer al" el modelo da porcentajes altos a los dos. Ha aprendido que ahí **valen los dos**.
- Lo mismo pasa cuando están en la entrada: "el **gato** duerme en el \_\_\_" y "el **perro** duerme en el \_\_\_" esperan lo mismo (*sofá*). Para acertar, las filas de *gato* y *perro* en la tabla tienen que producir predicciones parecidas, así que reciben correcciones parecidas y acaban en la misma zona del mapa. *Factura* aparece en otras frases, recibe otras correcciones y se va a otra zona.

**La relación nunca se escribe: es un efecto secundario de intentar predecir bien el siguiente token.** Dos tokens acaban cerca porque, para predecir, da casi igual uno que otro.

Por si preguntan (ya no sale en pantalla): hay dos tipos de "relación" y conviene no mezclarlos:

- **Parecido** (*perro* ≈ *gato*): está en la **tabla**, es la posición en el mapa. Fija tras el entrenamiento.
- **Relevancia en esta frase** (*come* ↔ *perro*): la calcula la **atención** en cada frase, con los pesos de consulta y clave. Cambia de una frase a otra.

**Y ya está.** Terminado el entrenamiento, todos esos números (tabla, consultas, claves, valores, capas) se quedan fijos, como los 46 del juguete. Como curiosidad del mapa que queda, las direcciones también acaban significando algo: `rey − hombre + mujer` cae cerca de `reina`.

**Diapositiva clave:** dos mapas 2D lado a lado. Antes de entrenar: palabras desperdigadas al azar. Después: *perro/gato/caballo* juntas, *factura/cobro/IVA* juntas, *rey/reina* con la flecha.

### 2.3 Generar: el sorteo

Como en el juguete, pero **el código que envuelve al modelo** no siempre elige el más probable: sortea (temperatura), lo añade al final del texto y vuelve a llamar al modelo. Un token cada vez.

**La temperatura** es una perilla del programa, no del modelo: retoca los porcentajes antes de sortear (cada uno elevado a 1/T y vuelto a repartir). En pantalla, con la lista ilustrativa sofá 50 / suelo 30 / jardín 15 / banco 5: a **0,5** se afila (68 / 25 / 6 / 1) y el favorito gana casi siempre; a **2** se aplana (38 / 29 / 21 / 12) y salen más los raros: más variedad y más riesgo. A 0, siempre el más probable. El modelo no cambia ni un número.

Tres consecuencias para cerrar el bloque:

- **El no determinismo no es un fallo**: hay sorteo.
- **El modelo no sabe cómo va a acabar la frase cuando la empieza.**
- **Las alucinaciones no son una avería**: el mecanismo hace lo mismo cuando acierta que cuando se inventa una función. Produce texto **plausible, no veraz**.

**Diapositivas:**

- La cadena texto → probabilidades.
- Nuestra red con «el perro come»: solo entra *come*. La red se desliza y se abre el hueco de la atención entre la tabla y las capas; dentro, las tres capas, los tres vectores de cada token, mirar (consulta de *come* contra las claves, porcentajes ilustrativos) y mezclar. Después, todo igual. Y qué se guarda: las tres capas (+18, hipotético).
- Subir de nivel: la misma figura se convierte en bloques [atención → capas] apilados hasta la capa final, y Clip con bloques y números por token de Llama 3.2 3B, Qwen3.6 35B y Kimi K3.
- El código de `atencion` con los dos `for` anidados resaltados (coste cuadrático) y la memoria real de Llama 3.2 3B según el contexto.
- La lista gato/perro/sofá/factura moviéndose frase a frase (ilustrativo).
- El mapa: palabras al azar que acaban agrupadas.

**Si vas tarde:** en atención, quita el código y quédate con «el perro come» + consulta/clave/valor contado con palabras + "cada token contra todos, por eso el contexto es caro". No quites el bloque 1.4: es lo que une toda la charla.

**Transición:** "Todo esto suena muy bien en una diapositiva. Pero ¿se puede hacer de verdad? Un modelo de texto que valga para algo, en esta sala, no. Pero el bucle es el mismo para cualquier cosa, y uno pequeño sí lo podemos entrenar nosotros. Para muestra, un botón."

---

## 3 · Para muestra, un botón: entrenamos uno de verdad

**Mensaje clave:** el mismo bucle de valor esperado → valor generado, ejecutado de verdad en un portátil. Con datos reales y lo que tarda.

1. **El problema:** reconocer dígitos manuscritos (0–9). Dataset MNIST: 60.000 imágenes de entrenamiento y 10.000 de prueba, de 28×28 píxeles. Aquí el valor esperado no es el siguiente token, sino **la etiqueta de la imagen**: "esto es un 7".
   - Detalle importante: entrenamiento y prueba son **de personas distintas** (empleados del censo / estudiantes). Se repartieron personas, no imágenes. Así se comprueba que el modelo generaliza y no que memoriza.
2. **La red densa**: la red de dos líneas del bloque 1, con tamaños reales. La imagen se estira en 784 números (uno por píxel) y sale una puntuación por dígito:
   ```js
    var oculta = capa(pixeles, pesos1, sesgos1);   // 784 números → 128
    var salida = capa(oculta, pesos2, sesgos2);    // 128 números → 10
   ```

    Cuenta de parámetros en directo: 784×128 + 128 + 128×10 + 10 = **101.770**. "Esos son los parámetros. Todos. Y empiezan al azar."
3. **El entrenamiento entero**, puesto al lado del 1.4:
   ```python
    salida = modelo(imagenes)             # valor generado
    error = perdida(salida, etiquetas)    # comparado con el valor esperado
    error.backward()                      # culpa de cada peso (retropropagación)
    optimizador.step()                    # se corrige cada peso un poquito
   ```

    Cada corrección se hace con un lote de 64 imágenes, así que una pasada por las 60.000 son **938 correcciones de todos los pesos**. (El optimizador que se usa, Adam, es una versión más lista de la misma regla: ajusta el tamaño del paso para cada peso.)
4. **Mirad cómo evoluciona.** Traza real, por pasada, en la CPU de un portátil sin tarjeta gráfica:
   
   | Pasada | Error medio | Acierto en prueba | Tiempo |
   | ------ | ----------- | ----------------- | ------ |
   | 1      | 0,348       | 94,37 %           | 5,1 s  |
   | 2      | 0,160       | 96,07 %           | 5,2 s  |
   | 3      | 0,111       | 96,98 %           | 5,1 s  |
   | 4      | 0,082       | 97,11 %           | 5,1 s  |
   | 5      | 0,065       | **97,25 %**       | 5,2 s  |
   
   - El error baja y el acierto sube en cada pasada: los pesos se van corrigiendo.
   - Ya en la primera pasada acierta el 94 %. Partiendo de pesos al azar, que aciertan más o menos 1 de cada 10.
   - **Cinco segundos por pasada. Medio minuto en total.** Frente a meses y miles de GPUs de un LLM.
5. **Una segunda arquitectura**, mismos datos, mismo tiempo:
   
   | Arquitectura  | Parámetros | Entrenamiento | Acierto     |
   | ------------- | ---------- | ------------- | ----------- |
   | Densa         | 101.770    | 26 s          | 97,25 %     |
   | Convolucional | 9.098      | 37 s          | **98,57 %** |
   

    La convolucional tiene **11 veces menos parámetros y acierta más**. Más grande no es mejor; importa que la arquitectura encaje con el problema (la densa aplana la imagen y pierde la vecindad entre píxeles; la convolucional mira la imagen como imagen).
6. **La prueba de verdad:** una hoja escrita a mano por ti, escaneada, con polvo y un pliegue. 150 dígitos.
   - Convolucional: 98,57 % en laboratorio → **93,3 %** en la hoja real.
   - **Sin preprocesado** (solo encoger a 28×28): **68,7 %**. Y además falla *con más confianza*.
   - Leer números de 10 cifras: **7 de 15 correctos**. 0,933¹⁰ ≈ 0,50. **La fiabilidad de una cadena es el producto, no la media.** (Puente con agentes: un agente que encadena 8 herramientas sufre exactamente esto.)

**Frase para rematar:** *"El modelo son 9.098 números y cuatro líneas. Todo lo demás —encontrar los dígitos, recortarlos, normalizarlos, decidir cuándo no fiarse— es código de toda la vida. El modelo no es el sistema."*

**Diapositivas:**

- La red de dos líneas en JavaScript con el esquema 784 → 128 → 10.
- La traza por pasada (error bajando, acierto subiendo), mejor como gráfica.
- Tabla densa vs. convolucional.
- Foto de la hoja escaneada (impacta mucho; es tuya y es real).
- Tabla con/sin preprocesado.
- La rejilla de los 15 números con ✓ y fallos.

**Demo opcional (decidir):** lanzar el entrenamiento en directo (medio minuto, y se ve la traza salir pasada a pasada) o `leer-numero.js` sobre una imagen. O un vídeo grabado. Si no hay demo, la traza + la foto de la hoja cumplen igual.

**Si vas tarde:** quita "leer un número entero" y quédate solo con la tabla con/sin preprocesado.

**Transición:** "Medio minuto, 9.098 números, un problema diminuto. Un LLM es exactamente el mismo bucle del juguete. ¿Qué hace falta para hacerlo a ese tamaño?"

---

## 4 · Cómo se entrena un LLM — y por qué tú no

**En pantalla (9.3 y 9.4), dos ventanas emergentes con los datos de cada fase:** `corpus.txt`, con el principio de *El hobbit* de Tolkien, texto que trae Samuel de su edición, sin referencia en pantalla: la dice de viva voz, y `ejemplos.txt`, conversaciones de ejemplo con marcas de turno ilustrativas y la respuesta subrayada, que es donde se mide el error. Cada ventana es un beat propio (tarjeta → ventana → siguiente tarjeta). En las tarjetas: «al lado del preentrenamiento, una gota: varios órdenes de magnitud menos datos» (los 13.000 ejemplos de Ouyang y otros, 2022, quedan en la nota) y «en ese trabajo, un modelo de 1.300 millones de parámetros con las tres fases gustó más que GPT-3, de 175.000 millones» (libro, 5.2).

> Si hay que ir corto: base vs. instruct con el ejemplo de Francia, y RLHF en una frase ("humanos eligen la mejor respuesta, y de ahí la adulación").

**Mensaje clave:** capacidad → forma → criterio. La primera fase es inalcanzable; las otras dos son las que dan el "carácter".

- **Preentrenamiento:** es exactamente el bucle del juguete (1.4), repetido sobre billones de tokens. No necesita que nadie etiquete nada: el `esperado` ya viene en el texto. Meses, miles de GPUs, decenas de millones.
- El **modelo base** no conversa. Le preguntas "¿Cuál es la capital de Francia?" y te continúa con "¿Cuál es la capital de Italia?…" porque en el corpus esas preguntas aparecen en listas de examen.
- **Ajuste supervisado:** ejemplos instrucción → respuesta. En el trabajo de referencia (Ouyang et al., 2022), unos **13.000 ejemplos**. Enseña **la forma**, no conocimiento.
- **RLHF:** humanos eligen entre respuestas → modelo de recompensa → se optimiza contra él. Un modelo de 1.300 M así entrenado fue preferido frente a uno de 175.000 M. Juzgar es más fácil que demostrar. Efecto secundario: **adulación** y verbosidad. "Si a los evaluadores les gusta que les den la razón, el modelo aprende a dar la razón."

**Diapositiva:** tabla de tres fases (qué aporta / datos / coste) con la primera en rojo "fuera de tu alcance".

**Si vas tarde:** quédate solo con "base vs. instruct" y la frase *capacidad → forma → criterio*.

**Transición:** "No podemos preentrenar. Pero sí podemos tocar las dos últimas fases… o directamente no tocar el modelo."

---

## 5 · Fine-tuning ligero: LoRA

**Mensaje clave:** afinar enseña la forma, no el conocimiento. Y la forma sale baratísima.

### Qué contar

- Afinar = recalcular pesos. Problema: entrenar necesita varias veces más memoria que servir, y el resultado es otro modelo completo del mismo tamaño.
- **LoRA:** se congela el modelo y se añaden unas matrices pequeñitas que sí se entrenan. Resultado: un **adaptador** separado, pequeño, intercambiable. **QLoRA** además comprime el modelo base a 4 bits mientras se entrena.
- **El experimento:** clasificar tickets de soporte en 5 categorías y 3 prioridades devolviendo JSON. 99 ejemplos de entrenamiento, 27 de evaluación. En CPU.
  - Parámetros entrenables: **0,341 %** del modelo. Tres por mil.
  - **190 s** de entrenamiento. Adaptador de **1,78 MB** (el modelo base: ~270 MB).
  
  | Modelo 135 M | JSON válido | Categoría | Cat. + prioridad |
  | ------------ | ----------- | --------- | ---------------- |
  | Sin afinar   | 0/27        | 0/27      | 0/27             |
  | Con LoRA     | **27/27**   | 12/27     | 4/27             |
  
  
  | Modelo 360 M | JSON válido | Categoría | Cat. + prioridad |
  | ------------ | ----------- | --------- | ---------------- |
  | Sin afinar   | 14/27       | 6/27      | 0/27             |
  | Con LoRA     | **27/27**   | 16/27     | 11/27            |
  
- Lectura: **el formato pasa a ser perfecto al instante**. El acierto se queda a medias: ha aprendido a rellenar el molde, no a distinguir. Con un modelo mayor y los mismos datos, el acierto casi se triplica.
- Detalle metodológico que el público agradece: el reparto entrenamiento/evaluación se hace **por redacción**, no al azar. Si no, evalúas con frases que el modelo ya ha visto con otro saludo (misma idea que MNIST con las personas).

**Cuándo tiene sentido:** tarea estrecha y estable, lo que falla es la forma, mucho volumen, y hay ejemplos etiquetados.

**Diapositivas:** las dos tablas lado a lado, con la columna "JSON válido" resaltada.

**Si vas tarde:** solo la tabla de 135 M y la frase "forma sí, criterio no".

**Transición:** "Entonces, si quiero que el modelo sepa lo que pone en *mi* documentación, afinar no es el camino. ¿Cuál es?"

---

## 6 · RAG: datos propios sin reentrenar

**Mensaje clave:** RAG no es una tecnología, es una forma de construir el prompt. No se toca ni un peso.

### Qué contar

- En vez de que el modelo *recuerde*, se lo pones delante al responder: **recuperar → aumentar → generar**.
- Dos memorias: la de los pesos y un índice externo que **se actualiza sin reentrenar**.
- Cómo se busca: con la idea del mapa del bloque 3, pero aplicada a **trozos de texto enteros** en lugar de a tokens sueltos. Un modelo de embeddings convierte cada fragmento de la documentación en **un solo vector**, un punto en el mapa.
  - Ante una pregunta, se convierte también en un punto y se buscan los fragmentos más cercanos. "Cercano" se mide por el ángulo entre los dos vectores (*similitud del coseno*): dos textos sobre lo mismo apuntan en la misma dirección aunque no compartan palabras.
  - Límite: ese vector captura el **sentido general**, no el detalle. Distingue "esto va de rendimiento" de "esto va de facturación", pero es malo buscando un número de factura concreto. Por eso los sistemas serios lo combinan con la búsqueda por palabras de toda la vida.
- **El ejemplo:** un manual de soporte de 4 documentos + un modelo de 3.000 M en local, sin GPU. El núcleo son cuatro líneas:
  ```js
  Settings.llm = new Ollama({ model: "llama3.2:3b" });
  Settings.embedModel = new OllamaEmbedding({ model: "bge-m3" });
  const indice = await VectorStoreIndex.fromDocuments(documentos);
  const respuesta = await indice.asQueryEngine().query({ query: pregunta });
  ```
- Tres preguntas, tres comportamientos:
  1. "¿Qué datos hacen falta antes de escalar una incidencia de rendimiento?" → los cuatro datos del manual, en orden. Mejor fragmento: **0,787**.
  2. "Un cliente del plan Empresa reclama un cobro duplicado" → respuesta razonada, no literal.
  3. "¿Cuál es la capital de Australia?" → **se niega**: no está en el manual. Mejor fragmento: **0,240**.
- Esa diferencia de puntuación (0,787 vs. 0,240) te dice si hay algo relevante **antes de llamar al modelo**.
- Producción: persistir el índice (en el ejemplo, Qdrant), separar indexar de preguntar.

**Guiño Drupal (aquí es donde conectas con la sala):**

- El problema real de un RAG no es el modelo, es **mantener el índice al día**: actualizaciones, borrados, permisos (quién puede ver qué) y versiones.
- Dos estrategias: reactiva (reindexar al cambiar el contenido) o programada (reindexar cada cierto tiempo). En Drupal, la reactiva es un hook de entidad al guardar/borrar y la programada es cron. Y los permisos: el RAG no debe devolver un fragmento de un nodo que el usuario no puede ver. "Esto es Drupal de toda la vida. El modelo es lo fácil."

**Diapositivas:**

- Esquema pregunta → buscador vectorial → fragmentos → prompt → modelo → respuesta.
- Las tres preguntas con sus puntuaciones.
- Una diapositiva "RAG en Drupal": guardar nodo → reindexar; borrar → quitar del índice; acceso → filtrar fragmentos.

**Demo opcional (decidir):** la pregunta de Australia en directo es muy efectiva (el público espera que responda Canberra). Riesgo: depende de Ollama corriendo en el portátil; ten un vídeo de respaldo.

**Si vas tarde:** quita la parte de persistencia; mantén las tres preguntas y el guiño Drupal.

---

## 7 · Cierre

Dos beats (decidido el 2026-11-10; se quitaron la tabla «¿Qué necesito?», el «99 %» y los tres puntos clave, que venían de LoRA, RAG y los dígitos):

1. **La frase final del libro:** «Las dos actitudes que peor le sientan a esta tecnología: creer que es magia y creer que es trivial». Haber recorrido el ciclo entero, aunque sea con un juguete, es la mejor defensa contra las dos.
2. **¡Gracias!** con el título de verdad, «¿Cuál es el siguiente token?», Samuel Solís, DrupalCamp Spain 2026 y un **QR grande al repositorio** (`github.com/samuelsolis/cual-es-el-siguiente-token`): la charla y el modelo de juguete, con instrucciones para entrenarlo. Preguntas.


## Plan de recortes (si a mitad vas tarde)

Por orden, de lo primero que se cae a lo último:

1. QLoRA (bloque 5) — basta con LoRA.
2. Persistencia del índice / Qdrant (bloque 6).
3. RLHF en detalle (bloque 4) — deja "capacidad → forma → criterio".
4. Leer un número entero (bloque 3) — pero intenta salvar 0,933¹⁰, es muy memorable.

**No recortar nunca:** la neurona en código, el entrenamiento del juguete en directo (1.4), la traza real por pasada, la tabla densa vs. convolucional, con/sin preprocesado, "forma sí, criterio no", la pregunta de Australia.

**Puntos de control de reloj:**

- Pendientes de fijar cuando estén los tiempos.

---

## Preguntas probables y respuesta corta

- **"¿Dos capas seguidas no son lo mismo que una?"** (quien sepa algo de álgebra) → Sí, por eso las redes reales meten entre capa y capa una función muy simple que deja los negativos en cero (ReLU). Es un detalle técnico que no cambia la idea: siguen siendo multiplicaciones y sumas.
- **"¿Qué modelo me recomiendas?"** → Ninguno en concreto: cambian cada pocos meses. Criterios: tamaño que quepa en tu máquina, que sea `instruct` si vas a conversar o `base` si vas a afinar, y pruébalo con *tus* datos; los benchmarks públicos no bastan.
- **"¿RAG o fine-tuning?"** → Conocimiento → RAG. Forma → fine-tuning. Si dudas, RAG primero: es más barato, se actualiza sin reentrenar y puedes ver de dónde sale cada respuesta.
- **"¿Hace falta GPU?"** → Para todo lo enseñado hoy, no. Todo se hizo en un portátil sin gráfica dedicada. El modelo de 3.000 M genera ~18 tokens/s en CPU, más o menos a ritmo de lectura.
- **"¿Se pueden eliminar las alucinaciones?"** → Reducir, sí (RAG, permitir que diga "no lo sé", puntuación de recuperación). Eliminar, no: el mecanismo es el mismo cuando acierta.
- **"¿Por qué el mismo prompt da respuestas distintas?"** → Porque el siguiente token se sortea. La temperatura reduce el azar, pero difícilmente lo elimina.
- **"¿Cómo lo meto en Drupal?"** → El modelo se habla por HTTP (incluso con la API compatible con OpenAI, que permite cambiar de local a comercial cambiando la URL base). Lo difícil es el ciclo de vida del índice: hooks, cron y permisos.

---

## Material a preparar

- [ ] Diapositivas (≈25–30 en total; ~1 por minuto es el máximo razonable).
- [ ] Foto/escaneo de la hoja manuscrita en buena resolución.
- [ ] Decidir demos en directo o en vídeo (dígitos y/o RAG). Si en directo: Ollama con el modelo ya cargado en memoria antes de empezar (la primera carga son ~4 s; la segunda, instantánea).
- [ ] Vídeo de respaldo de cada demo.
- [ ] QR al libro / ejemplos.
- [ ] Ensayo cronometrado completo al menos una vez, apuntando dónde se desvía el reloj.