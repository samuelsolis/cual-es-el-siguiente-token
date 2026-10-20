# Inteligencia artificial sin artificios · presentación

Charla para la DrupalCamp Spain 2026. No usa diapositivas: es un escenario fijo de 1920×1080 en el que cada clic es un *beat*. En cada beat aparecen, cambian o desaparecen elementos. La estética es la de un escritorio de 1998, y la mascota es Clip (un dibujo propio en SVG).

Es HTML, CSS y JavaScript puro: no hay dependencias, no hay que compilar nada y no necesita red.

## Abrirla

Abre `index.html` en Chrome o Firefox y pulsa **F** para la pantalla completa.

### Con la ventana del presentador

Hay dos formas, y en las dos las ventanas quedan enlazadas:

1. Abre `index.html` y pulsa **P**. Se abre el presentador ya conectado.
2. Abre `presentador.html` y pulsa **Abrir la presentación**. La presentación se abre en otra ventana, que llevas al proyector.

Si abres las dos páginas por tu cuenta, cada una por su lado, solo se encuentran cuando el navegador las considera del mismo origen. Chrome sí lo hace con ficheros locales; Firefox no. En ese caso, usa una de las dos formas de arriba o sirve la carpeta en local:

```bash
python3 -m http.server 8000   # y abre http://localhost:8000
```

## Teclas

| Tecla | Acción |
| --- | --- |
| → ↓ PageDown espacio clic | siguiente beat |
| ← ↑ PageUp clic derecho | beat anterior |
| 1–9, 0 | saltar a la escena 1–10 |
| Inicio / Fin | principio / final |
| O | vista general de escenas |
| P | ventana del presentador: beat actual y siguiente, notas, cronómetro |
| B o . | pantalla en negro |
| F | pantalla completa |
| ? | ayuda de teclas |

La URL guarda la posición: `index.html#5.4` es la escena 5, beat 4. Recargar mantiene el sitio.

Parámetros útiles: `?captura=1` (sin transiciones, para hacer capturas) y `?reducido=1` (sin animaciones).

## Ficheros

| Fichero | Qué es |
| --- | --- |
| `index.html` | Todo el contenido: una `<section class="escena">` por escena, con sus notas |
| `estilo.css` | El motor visual retro: ventanas, barra de tareas, Clip, tipografía |
| `escenas.css` | Estilos propios de cada escena |
| `motor.js` | El motor de beats: navegación, URL, presentador, vista general |
| `escenas.js` | Lo que se genera por código (tablas, mapas, el 7 en píxeles) y las animaciones |
| `juguete.js` | El modelo de juguete «El perro come carne» que se entrena en directo (también funciona en Node) |
| `presentador.html` | La ventana del presentador |
| `recursos/` | La hoja escaneada con los dígitos |
| `herramientas/` | Scripts para verificar: capturas, recorrido completo, animaciones y el juguete (ver `CLAUDE.md`) |
| `CLAUDE.md` / `AGENTS.md` | Estado, decisiones y pendientes del trabajo, para retomarlo con cualquier agente |

## Editar el contenido

Todo se controla con atributos en el HTML (los beats empiezan en 1):

```html
<p data-in="3">aparece en el beat 3</p>
<p data-in="2" data-out="5">visible en los beats 2, 3 y 4</p>
<div data-on="4:resaltado">recibe la clase "resaltado" desde el beat 4</div>
<div data-on="2-3:apagada">recibe la clase "apagada" solo en los beats 2 y 3</div>
<pre class="codigo" data-foco="2:1-3 4:5">…</pre>   <!-- resalta líneas de código por beat -->
<aside class="nota" data-beat="2">nota para el presentador en el beat 2</aside>
<div class="clip-dice" data-in="2" data-out="3">Clip dice esto en el beat 2</div>
```

El número de beats de cada escena se calcula solo a partir de esos atributos.

Las piezas apiladas en el mismo sitio (una sustituye a la otra) van dentro de un `<div class="pila">`.

## Datos

Las cifras de los dígitos (traza de entrenamiento, aciertos, la hoja escaneada y los 15 números leídos) son las de las ejecuciones reales de `ejemplos/5.6-digitos/` del repositorio del libro. Las de LoRA y RAG salen del libro.

Los porcentajes de los ejemplos de texto (gato/perro, banco, la generación) son ilustrativos, y así se indica en pantalla.
