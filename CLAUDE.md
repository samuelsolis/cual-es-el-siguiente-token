# Charla DrupalCamp Spain 2026 — estado, decisiones y cómo trabajar

Charla de 45 min **"Inteligencia artificial sin artificios"** de Samuel Solís en la DrupalCamp Spain 2026 (https://2026.drupalcamp.es/es/sesiones/inteligencia-artificial-sin-artificios). Se basa en el libro «Inteligencia Artificial sin artificios», que vive en otro repositorio: `~/web/Inteligencia Artificial sin artificios/`. Este repositorio (`~/web/IA-charla`, GitHub `samuelsolis/Inteligencia-artificial-sin-artificios---charla`) es solo la charla: no mezclar con el del libro.

Sesión de trabajo: del 2026-10-09 al 2026-10-20. Estado: **borrador muy inicial**. Samuel lo está repasando de arriba abajo para entenderlo y poder explicarlo; después se afina.

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| Guion (el discurso, notas, preguntas probables) | `charla-drupalcamp-2026.md` |
| Presentación (HTML + CSS + JS, sin dependencias) | `presentacion/index.html` |
| Cómo abrirla, teclas, cómo editarla | `presentacion/README.md` |
| Modelo de juguete «El perro come carne» | `presentacion/juguete.js` |
| Herramientas para verificar | `presentacion/herramientas/` (ver abajo) |
| Datos reales de los dígitos (MNIST) | `~/web/Inteligencia Artificial sin artificios/ejemplos/5.6-digitos/` (`resultados.json`, `resultados-evaluacion.txt`, hoja escaneada) |
| Fuente de todo lo demás (LoRA, RAG, fases de un LLM) | `~/web/Inteligencia Artificial sin artificios/Fuentes md/` (el libro) |

## Reglas de Samuel (respetarlas siempre)

- **El libro no se toca nunca** (`~/web/Inteligencia Artificial sin artificios/Fuentes md/`, `…/output_LaTeX/`). Ni siquiera proponer cambios en él. Si la charla y el libro no coinciden, se cambia la charla.
- **Los tiempos de la charla los ajusta él al final.** No tocar minutos ni proponer recortes por tiempo salvo que lo pida.
- **Cuando pide entender algo ("no escribas nada")**, se le explica en la conversación sin editar ficheros. Después se plasma en guion y presentación.
- **No inventar datos.** Todo número sale del libro o de una ejecución real. Lo ilustrativo se marca en pantalla como ilustrativo.
- **Todo el código en JavaScript** de estilo clásico (`function`, `var`, bucles `for`, sin `reduce` ni funciones flecha), para que lo lea cualquiera, también gente de PHP. **Nada de PHP: no mezclar lenguajes.** Única excepción: las cuatro líneas reales de PyTorch del entrenamiento de los dígitos.
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
- Después del juguete: atención (banco), a escala (perro/gato, ilustrativo), generar (sorteo), dígitos MNIST con datos reales ("para muestra, un botón"), fases de un LLM, LoRA, RAG (con el guiño Drupal: hooks, cron, permisos) y cierre.
- Quitados por decisión de Samuel: Celsius→Fahrenheit (inventado), tokens con letras, ReLU, PHP.

## La presentación

- Formato *beats* inspirado en beatdeck (github.com/borjaperfra/beatdeck): un clic = un beat, escenario fijo de 1920×1080 y la posición en la URL (`#3.4`). Sin red y sin dependencias.
- Estética retro Windows 98 / Office 97: ventanas biseladas, Paint, Bloc de notas, MS-DOS, Excel, WordArt y la barra de tareas como miga de pan. Mascota **Clip**: dibujo propio en SVG; no usar gráficos de Microsoft.
- Escenas (13, 106 beats): 1 apertura (con los dos tipos de IA → los LLM) · 2 de palabras a tokens · 3 vocabulario · 4 neurona → capa → red (figura que se transforma) · 5 entrenar el juguete (en directo) · 6 atención · 7 a escala · 8 generar · 9 dígitos · 10 LLM · 11 LoRA · 12 RAG · 13 cierre.
- Transformaciones hechas: al final del entrenamiento, el tríptico «el modelo entero: tabla + red» (M0 → entrenar.exe → MF, con la red dibujada por pesos y el entrenamiento en directo vuelta a vuelta; las líneas de nuestra red en la escena 4 también se dibujan por pesos); «perro» vuela de tokenizar.exe al vocabulario y, después, los 8 tokens vuelan a su fila del Excel, y la tabla y el mapa pasan de 2 a 3 dimensiones (`escenas.js`, `volarToken`, `mapa3D` y gancho "vocabulario"; la d3 es solo para enseñar, al azar con semilla 32, el juguete sigue con 2); de vuelta a 2D, una llave nombra la «tabla de embeddings», Clip da su tamaño en modelos reales (tokens y números por token de Llama 3.2 3B, GPT-3 y Gemma 3 27B, fuentes en el guion; de Claude/GPT-4/Gemini no hay cifras oficiales; los parámetros no se nombran hasta las neuronas), el mapa vuela a la izquierda y «entrenar.exe» lleva del mapa al azar al ordenado (posiciones ilustrativas, marcadas en pantalla) y hace de puente a la neurona; neurona → capa → nuestra red → red grande (`escenas.js`, apartado "Neurona → capa → red"); el mapa de embeddings que se mueve durante el entrenamiento en directo; barras y textos animados. Candidata para hacer lo mismo: la red de los dígitos saliendo de la red genérica.
- Presentador: `presentador.html` (botón "Abrir la presentación") o tecla P desde `index.html`. Se sincronizan por BroadcastChannel y por postMessage entre ventanas, así que funciona aunque el navegador aísle los ficheros locales.

## Pendiente

- Afinar todo. Samuel va de arriba abajo: ya ha repasado el token y el juguete; lo siguiente es el resto, con el mismo nivel de detalle.
- Encajar dos notas que Samuel dejó al principio del guion: el embedding quizá solo de pasada, y que el objetivo incluye explicar qué es un **harness** (el programa que mete contexto al modelo).
- Decidir si simplificar el código de `atencion` en el guion (en pantalla ya solo salen los dos `for`).
- QR del cierre: falta la URL de destino.
- Los iconos son emojis: probar en el equipo con el que se presente.
- Desde el 2026-10-20 la charla tiene su propio repositorio (este). Commits y subidas, solo cuando Samuel lo pida.

## Cómo verificar cambios

Desde `presentacion/` (necesita `google-chrome` y Node ≥ 21):

```bash
bash herramientas/capturar.sh /tmp/capturas 4.5 5.7                          # capturas de beats, sin transiciones
python3 herramientas/hoja-contactos.py /tmp/capturas /tmp/hoja.png 4.5 5.7   # varias capturas en una imagen
node --experimental-websocket herramientas/recorrer.mjs /tmp/perfil          # recorre los 106 beats, prueba el presentador, lista errores
node --experimental-websocket herramientas/fotogramas.mjs /tmp/perfil /tmp/fotos   # animaciones a mitad
node herramientas/probar-juguete.js                                          # gradientes del juguete y su aprendizaje
```

Si se cambia algo del juguete, comprobar que los números del guion (bloque 1) siguen coincidiendo con lo que saca `probar-juguete.js`.
