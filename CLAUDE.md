# Charla DrupalCamp Spain 2026 — estado, decisiones y cómo trabajar

Charla de 45 min **"Inteligencia artificial sin artificios"** de Samuel Solís en la DrupalCamp Spain 2026 (https://2026.drupalcamp.es/es/sesiones/inteligencia-artificial-sin-artificios). Se basa en el libro «Inteligencia Artificial sin artificios», que vive en otro repositorio: `~/web/Inteligencia Artificial sin artificios/`. Este repositorio (`~/web/IA-charla`, GitHub `samuelsolis/cual-es-el-siguiente-token`) es solo la charla: no mezclar con el del libro.

Sesión de trabajo: del 2026-10-09 al 2026-10-20. Estado: **borrador muy inicial**. Samuel lo está repasando de arriba abajo para entenderlo y poder explicarlo; después se afina.

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| Guion (el discurso, notas, preguntas probables) | `charla-drupalcamp-2026.md` |
| Presentación (HTML + CSS + JS, sin dependencias) | `presentacion/index.html` |
| Cómo abrirla, teclas, cómo editarla | `presentacion/README.md` |
| Modelo de juguete «El perro come carne» | `presentacion/juguete.js` |
| Herramientas para verificar | `presentacion/herramientas/` (ver abajo) |
| Ejemplos para hacer en casa (un solo `npm install`) | `ejemplos/`: 1 tokenizador real (`gpt-tokenizer`, `o200k_base`), 2 el juguete (`train.js` / `generate.js`, mismos números que la presentación), 3 el juguete con atención (64 números, con la escala de los modelos reales), 4 base frente a instruct con Ollama (Llama 3.2 3B, en Docker), 5 ajuste con LoRA de SmolLM2-135M base en Docker y Python (40 ejemplos: frase sobre una persona → JSON; 5 de 5 en la prueba, y ya no sabe hacer otra cosa). Lo generado (models/, .cache/, adapter/, node_modules/) no se sube |
| Datos reales de los dígitos (MNIST) | `~/web/Inteligencia Artificial sin artificios/ejemplos/5.6-digitos/` (`resultados.json`, `resultados-evaluacion.txt`, hoja escaneada) |
| Fuente de todo lo demás (LoRA, RAG, fases de un LLM) | `~/web/Inteligencia Artificial sin artificios/Fuentes md/` (el libro) |

## Reglas de Samuel (respetarlas siempre)

- **El libro no se toca nunca** (`~/web/Inteligencia Artificial sin artificios/Fuentes md/`, `…/output_LaTeX/`). Ni siquiera proponer cambios en él. Si la charla y el libro no coinciden, se cambia la charla.
- **Los tiempos de la charla los ajusta él al final.** No tocar minutos ni proponer recortes por tiempo salvo que lo pida.
- **Cuando pide entender algo ("no escribas nada")**, se le explica en la conversación sin editar ficheros. Después se plasma en guion y presentación.
- **No inventar datos.** Todo número sale del libro o de una ejecución real. Lo ilustrativo se marca en pantalla como ilustrativo.
- **Todo el código en JavaScript** de estilo clásico (`function`, `var`, bucles `for`, sin `reduce` ni funciones flecha), para que lo lea cualquiera, también gente de PHP. **Nada de PHP: no mezclar lenguajes.** Única excepción: las cuatro líneas reales de PyTorch del entrenamiento de los dígitos.
- **Idioma del código:** el código que se ejecuta (`ejemplos/`) va en inglés: nombres, funciones, comentarios, ficheros y opciones; lo que el programa escribe en pantalla, los README, las carpetas y los datos, en castellano. La presentación (también su JavaScript y el código que sale en las diapositivas) se queda entera en castellano.
- **Concepto antes que técnica.** El objetivo es quitar la magia, no que el público pueda ejecutar algo. Por eso se quitó ReLU (solo queda como respuesta si alguien pregunta).
- **Menos plana**: transformaciones que conectan un beat con el siguiente, no cambios secos.
- Comprobar visualmente lo que se cambia (capturas) antes de darlo por hecho.

## Decisiones de contenido (no reabrir sin que lo pida)

- Idea vertebral: **un modelo son números que empiezan al azar y que los datos van corrigiendo.** Hilo conductor: **valor esperado → valor generado → corregir un poquito todo lo que intervino**.
- **Arranque: un modelo de lenguaje de juguete real**, «El perro come carne» (`juguete.js`):
  - vocabulario fijo de **8 tokens desordenados** (`gato`=0, `carne`=1, `yo`=2, `perro`=3, `barco`=4, `el`=5, `pescado`=6, `come`=7), decidido antes de entrenar; numerados desde 0, como en el código. En pantalla salen sueltos, sin formar frase ("ya se formará"); la frase es `[5, 3, 7, 1]` y es lo único con lo que se entrena;
  - 2 números por token (tabla de embeddings), capa oculta de 2 neuronas y capa final de 8 (una neurona por token): **46 parámetros**;
  - semilla 31, tasa 0,2, 40 vueltas (al azar responde «gato» y genera «el gato gato gato»); solo mira la última palabra (la atención llega después como «lo que le falta»);
  - la presentación lo ejecuta en el navegador: todos los números del arranque salen de ahí, y los del guion también.
- Antes del juguete, una escena corta: **de palabras a tokens** (perro / token+ización / int+elig+encia). `tokenización` e `inteligencia` son troceo real (`o200k_base`); `perro` en un token es una simplificación elegida por Samuel para enlazar con el juguete: ese «perro» vuela a la frase del vocabulario. Para la charla: una palabra = un token (se dice, no sale en pantalla).
- Conceptos que Samuel ya ha entendido y hay que contar así:
  - **Entradas** = lo que le llega a la neurona; en la primera capa, la fila del token que toca. Lo que cambia en cada uso es qué fila entra (otro token); los números de cada fila son de la tabla y solo cambian al entrenar (precisión de Samuel). **Pesos** = el patrón que busca la neurona (la suma de productos mide cuánto encaja la entrada). **Sesgo** = cuánto parecido necesita para reaccionar. Pesos y sesgos son el modelo y solo cambian al entrenar.
  - La **tabla de embeddings también se aprende**: es la primera pieza del modelo. El dato de verdad (el texto, el índice del token, los píxeles) nunca se toca.
  - Al entrenar se corrige **todo lo aprendido que intervino**, cada número según lo que tenía al otro lado de su multiplicación. Las filas de tokens que no estaban en la entrada no se tocan. Lo calculado por el camino (salidas intermedias) no se guarda: solo pasa la culpa hacia atrás.
  - Se corrige **siempre**, no solo cuando falla: mientras el correcto no tenga 100 %, hay error. Elegir el más probable o sortear (temperatura) solo pasa al **generar**, y al generar no cambia ningún número.
  - **Cada neurona tiene una sola salida**, que se reparte a todas las de la capa siguiente; los pesos de esas líneas son de la neurona que recibe. En el dibujo: un tramo de salida que se divide en un punto (aclaración de Samuel: el abanico directo confundía).
  - Todo se entrena a la vez. Dos tipos de relación: **parecido** (tabla, fijo) y **relevancia en la frase** (atención, cambia en cada frase).
  - **Atención** (repasada el 2026-10-21): lo visto hasta ella (tabla, neuronas, entrenar) es de cualquier modelo, no «lo de antes de 2017»; antes también se miraba la frase, pero en cadena. Va **entre la tabla y las capas**: entran todas las filas; tres capas pequeñas, **las mismas para todos los tokens**, sacan consulta/clave/valor; mirar = consulta × clave (neurona sin sesgo) → porcentajes; mezclar = fila + % de cada valor. Se guardan las tres capas (parte del modelo); quién mira a quién y el vector mezclado se calculan y se tiran. Coste: el trabajo crece con el cuadrado; la memoria de la conversación (lo que aporta cada token) crece en línea recta.
- Estructura decidida el 2026-10-21 (por tiempo): **cómo funciona** (escenas 1–6) → puente: entrenar = predecir + corregir, generar = lo mismo sin corregir → **¿por qué me responde?**: modelo base que no responde, ajuste supervisado (forma), RLHF (retoca un poco los porcentajes hacia lo que gusta: adulación, forma sobre fondo) → cierre con el **criterio** (capacidad → forma → criterio, libro 5.2). La «fardada» de entrenar desde cero (dígitos MNIST) está aparcada hasta ver dónde encaja. La pila resumen del final de la atención se quitó: no aportaba.
- Quitados por decisión de Samuel: Celsius→Fahrenheit (inventado), tokens con letras, ReLU, PHP, el ejemplo de «banco» (peces/parque/central) en la atención, por tiempo.

## La presentación

- Formato *beats* inspirado en beatdeck (github.com/borjaperfra/beatdeck): un clic = un beat, escenario fijo de 1920×1080 y la posición en la URL (`#3.4`). Sin red y sin dependencias.
- Estética retro Windows 98 / Office 97: ventanas biseladas, Paint, Bloc de notas, MS-DOS, Excel, WordArt y la barra de tareas como miga de pan. Mascota **Clip**: dibujo propio en SVG; no usar gráficos de Microsoft.
- Escenas (10 activas, 79 beats): 1 apertura (título del programa tachado → «¿Cuál es el siguiente token?»; caja negra → «Empezamos por el principio: de palabras a tokens»; el mapa «Hoy» y los tipos de IA se quitaron) · 2 de palabras a tokens · 3 vocabulario · 4 neurona → capa → red (figura que se transforma) · 5 entrenar el juguete (en directo) · 6 atención (sobre nuestra red) · 7 a escala · 8 generar · 9 LLM · 10 cierre. Dígitos (la «fardada» de entrenar desde cero) **aparcados** con `data-fuera` en su `<section>`: siguen en el HTML, no cuentan ni se ven; se recuperan quitando el atributo. LoRA y RAG **quitados** (2026-10-21; siguen en el commit 86a0f3a).
- Transformaciones hechas (el tríptico «el modelo entero: tabla + red» del final del entrenamiento se quitó el 2026-11-10 por repetido; las líneas de nuestra red en las escenas 4 y 6 siguen dibujadas por pesos): «perro» vuela de tokenizar.exe al vocabulario y, después, los 8 tokens vuelan a su fila del Excel, y la tabla y el mapa pasan de 2 a 3 dimensiones (`escenas.js`, `volarToken`, `mapa3D` y gancho "vocabulario"; la d3 es solo para enseñar, al azar con semilla 32, el juguete sigue con 2); de vuelta a 2D, una llave nombra la «tabla de embeddings», Clip da su tamaño en modelos reales (desde el 2026-11-10: nuestro juguete, Llama 3.2 3B como modelo local, Qwen3.6 35B y Kimi K3; las tres tablas de Clip, 3.9, 4.12 y 6.9, usan los mismos; datos de los config.json y fichas en Hugging Face, fuentes en el guion; de Claude/GPT/Gemini no hay cifras oficiales; los parámetros no se nombran hasta las neuronas), el mapa vuela a la izquierda y «entrenar.exe» lleva del mapa al azar al ordenado (posiciones ilustrativas, marcadas en pantalla) y hace de puente a la neurona; neurona → capa → nuestra red → red grande (`escenas.js`, apartado "Neurona → capa → red"); en 4.1 vuelve el Excel de embeddings y de 4.1 a 4.2 los dos números de la fila de «come» vuelan a las entradas de la neurona (`tablaNeurona`, `volarToken` con `desdeCelda`); en la atención, nuestra red con «el perro come» se desliza y abre entre la tabla y las capas el hueco de la atención (consulta/clave/valor, mirar, mezclar, qué se guarda; porcentajes ilustrativos, filas y red reales; `diagramaAtencion`), sube de nivel a un modelo de verdad (bloques [atención → capas] apilados hasta la capa final; Clip con bloques y números por token) y después el precio: trabajo cuadrático y memoria real de Llama 3.2 3B (libro, 5.3); el mapa de embeddings que se mueve durante el entrenamiento en directo; barras y textos animados. Candidata para hacer lo mismo: la red de los dígitos saliendo de la red genérica.
- Presentador: `presentador.html` (botón "Abrir la presentación") o tecla P desde `index.html`. Se sincronizan por BroadcastChannel y por postMessage entre ventanas, así que funciona aunque el navegador aísle los ficheros locales.

## Pendiente

- Afinar todo. Samuel va de arriba abajo. **Repasado hasta 6.12 y dado por bueno (2026-11-10)**: apertura, tokens, vocabulario, neurona, entrenar y atención, que acaba con Clip «Adiós, magia» (movido desde la escena 4). Lo que va después de 6.12 está sin decidir: Samuel no tiene claro todavía qué contar (en pantalla siguen «A escala», «Generar» con temperatura y «¿Por qué me responde?» con las tres fases).
- Al repasar 6.11: la frase de pantalla «Mientras dura la conversación, no se tira» no es exacta; propuesta, «No lo guarda el modelo: lo guarda el programa (Ollama), con la clave y el valor de cada token». La nota del presentador ya cuenta contexto, límites y modelo frente a programa.
- Encajar dos notas que Samuel dejó al principio del guion: el embedding quizá solo de pasada, y que el objetivo incluye explicar qué es un **harness** (el programa que mete contexto al modelo).
- Decidir si simplificar el código de `atencion` en el guion (en pantalla ya solo salen los dos `for`).
- QR del cierre (10.2): hecho, apunta a `https://github.com/samuelsolis/cual-es-el-siguiente-token` (el repo, renombrado el 2026-11-10). Está dibujado en SVG dentro de `index.html`; se generó con `segno` (`pip install --target /tmp/qrlib segno`, borde 4, corrección M). Si cambia la URL del repositorio, hay que regenerarlo. Repositorio público desde el 2026-11-10. La presentación se publica sola en GitHub Pages con cada push a `main` (`.github/workflows/pages.yml`, publica solo `presentacion/`): https://www.samuelsolis.es/cual-es-el-siguiente-token/ . El README de la raíz enlaza ahí en grande y explica cómo entrenar el juguete en la terminal.
- Los iconos son emojis: probar en el equipo con el que se presente.
- Desde el 2026-10-20 la charla tiene su propio repositorio (este). Commits y subidas, solo cuando Samuel lo pida.

## Cómo verificar cambios

Desde `presentacion/` (necesita `google-chrome` y Node ≥ 21):

```bash
bash herramientas/capturar.sh /tmp/capturas 4.5 5.7                          # capturas de beats, sin transiciones
python3 herramientas/hoja-contactos.py /tmp/capturas /tmp/hoja.png 4.5 5.7   # varias capturas en una imagen
node --experimental-websocket herramientas/recorrer.mjs /tmp/perfil          # recorre los 79 beats, prueba el presentador, lista errores
node --experimental-websocket herramientas/fotogramas.mjs /tmp/perfil /tmp/fotos   # animaciones a mitad
node herramientas/probar-juguete.js                                          # gradientes del juguete y su aprendizaje
```

Si se cambia algo del juguete, comprobar que los números del guion (bloque 1) siguen coincidiendo con lo que saca `probar-juguete.js`.
