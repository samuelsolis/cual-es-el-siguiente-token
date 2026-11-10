# 4 · Capacidad y forma: el modelo base frente al instruct

## Qué es

Aquí tenéis las fases de un modelo de verdad, con uno real en vuestro ordenador.

En la charla, un modelo de lenguaje pasa por tres fases: **preentrenamiento** (capacidad), **ajuste supervisado** (forma) y **preferencias** (criterio). Muchos modelos abiertos se publican en dos versiones, y con ellas se ve la diferencia:

| Versión | Fases | Qué hace |
| --- | --- | --- |
| **Base** (`llama3.2:3b-text-q4_K_M`) | Solo preentrenamiento | Continúa el texto que le das |
| **Instruct** (`llama3.2:3b`) | Las tres | Responde |

Es el mismo modelo, Llama 3.2 3B, el que sale en la charla, y los dos ocupan lo mismo (2 GB). La diferencia es que el instruct ha pasado además por el ajuste y las preferencias.

**Aquí no entrenamos nada.** Entrenar un modelo así son meses y miles de GPUs. Lo que hacemos es descargar dos modelos que Meta ya ha entrenado: el base, **ya preentrenado**, y el instruct, con todas las fases hechas. Son ficheros de números, como los `.json` de los juguetes, pero con 3.200 millones de números en vez de 46.

Para ejecutarlos se usa [Ollama](https://ollama.com/), el programa que carga los modelos y hace las cuentas. Funciona sin GPU, en un portátil normal.

## Cómo se ejecuta

Son cuatro pasos: levantar Ollama, descargar los dos modelos, hablar con cada uno y compararlos. Todo desde la carpeta `ejemplos/`.

> ⚠️ **Esto descarga los modelos y ocupa unos 9 GB en disco: la imagen de Docker de Ollama, unos 5 GB, y los dos modelos, 2 GB cada uno (4 GB entre los dos).** Medido en Linux; en otro sistema puede variar un poco.

### 1. Levantar Ollama

Hace falta [Docker](https://docs.docker.com/get-docker/). Este comando arranca Ollama dentro de un contenedor llamado `ollama-charla`, que queda escuchando en `http://localhost:11434`:

```bash
docker compose -f 4-base-o-instruct/docker-compose.yml up -d
```

### 2. Descargar los dos modelos

Se descargan ya entrenados por Meta; aquí no se entrena nada:

```bash
docker exec ollama-charla ollama pull llama3.2:3b-text-q4_K_M    # el base, ya preentrenado: ~2 GB
docker exec ollama-charla ollama pull llama3.2:3b                # el instruct, con todas las fases: ~2 GB
```

### 3. Hablar con cada modelo

Así se ejecuta un modelo directamente, con la pregunta que quieras:

```bash
docker exec ollama-charla ollama run llama3.2:3b-text-q4_K_M "¿Cuál es la capital de Francia?"
docker exec ollama-charla ollama run llama3.2:3b "¿Cuál es la capital de Francia?"
```

Una vez que salió esto:

```
base:
  ¿Cuál es la capital de Francia?
  A. París
  B. Lille
  C. Reims
  D. Bayonne
  Answer: A

instruct:
  La capital de Francia es París.
```

El base no responde: convierte tu pregunta en un examen tipo test, porque así aparecen esas preguntas en el texto con el que se entrenó. El instruct responde.

Cada vez puede salir algo distinto: `ollama run` sortea el siguiente token con su temperatura por defecto (la escena 8 de la charla). Repite el comando y lo verás.

Sin la pregunta al final, el modelo se queda esperando y puedes escribirle varias cosas seguidas (`-it` para poder escribir; sal con `/bye`):

```bash
docker exec -it ollama-charla ollama run llama3.2:3b
```

### 4. Compararlos a la vez

`compare.js` le da el mismo texto a los dos modelos y enseña lo que sale de cada uno, uno debajo del otro:

```bash
node 4-base-o-instruct/compare.js "el texto que quieras"
```

Sin texto, usa los ejemplos de la charla (ver más abajo).

Qué hace por dentro: habla con Ollama por su API, la misma que usa `ollama run`.

- Al **base** le pasa el texto tal cual, y el base lo continúa.
- Al **instruct** se lo pasa como una conversación. Ollama le añade las marcas de turno de usuario y de asistente con las que se le ajustó (el `<usuario>` / `<asistente>` de la charla), y el instruct responde.
- Con **temperatura 0**: siempre elige el token más probable, así que da siempre lo mismo y se pueden comparar. En otro ordenador o con otra versión de Ollama puede variar un poco.
- Cada respuesta se corta a los 60 tokens.

Para usar otros modelos u otro Ollama, tres variables: `BASE_MODEL`, `INSTRUCT_MODEL` y `OLLAMA_URL` (por defecto `http://localhost:11434`).

### Recoger

```bash
docker compose -f 4-base-o-instruct/docker-compose.yml down      # lo para
docker compose -f 4-base-o-instruct/docker-compose.yml down -v   # lo para y borra los modelos (4 GB)
docker rmi ollama/ollama                                         # borra también la imagen de Ollama (5 GB)
```

## Ejemplos de uso

Una instrucción:

```bash
node 4-base-o-instruct/compare.js "Escribe una función en JavaScript que sume dos números."
```

La pareja pequeña, más rápida y peor:

```bash
docker exec ollama-charla ollama pull llama3.2:1b-text-q4_K_M
docker exec ollama-charla ollama pull llama3.2:1b
BASE_MODEL=llama3.2:1b-text-q4_K_M INSTRUCT_MODEL=llama3.2:1b node 4-base-o-instruct/compare.js
```

Ideas para probar:

- El principio de un texto conocido (una receta, un refrán): el base lo continúa; el instruct te dice qué es.
- La misma pregunta en castellano y en inglés.
- Una pregunta, y luego la misma con `Pregunta: … Respuesta:` delante (ver abajo).

## Los ejemplos de la charla

```bash
node 4-base-o-instruct/compare.js
```

Esto es lo que sale (Llama 3.2 3B, Ollama 0.32.14, sin GPU, unos 25 segundos).

**«¿Cuál es la capital de Francia?»**, la escena 9:

```
base, continúa:
  ¿Cuál es la capital de Francia? ¿Cuál es la capital de Francia?
  ¿Cuál es la capital de Francia? ¿Cuál es la capital de Francia? …

instruct, responde:
  La capital de Francia es París.
```

El base no responde: continúa el texto. Y lo más probable después de una pregunta es… otra pregunta.

**«La capital de Francia es»:**

```
base, continúa:
  La capital de Francia es una ciudad de 2,2 millones de habitantes, que se extiende
  por 105 km2. La ciudad se encuentra en el centro de Francia, a 500 km de París, …

instruct, responde:
  París.
```

Ni siquiera completándole la frase dice París: se inventa una ciudad «a 500 km de París». Suena bien y es falso: plausible, no veraz.

**«Pregunta: ¿Cuál es la capital de Francia? / Respuesta:»**, capacidad y forma:

```
base, continúa:
  Pregunta: ¿Cuál es la capital de Francia?
  Respuesta: París
  Pregunta: ¿Cuál es la capital de Italia?
  Respuesta: Roma
  Pregunta: ¿Cuál es la capital de España?
  Respuesta: Madrid
  Pregunta: ¿Cuál es la capital de Portugal?
  Respuesta: Lisboa …

instruct, responde:
  La respuesta es: París.
```

Si el texto tiene forma de pregunta y respuesta, **el base sí sabe**: París, Roma, Madrid, Lisboa. El conocimiento ya estaba: es la **capacidad**, y viene del preentrenamiento. Pero no sabe cuándo parar y sigue inventándose preguntas. Que una respuesta termina, que hay un turno del usuario y otro del asistente: eso es la **forma**, y la pone el ajuste supervisado.

**«¿Qué come el perro?»**, el criterio:

```
base, continúa:
  ¿Qué come el perro? (What does the dog eat?) is a book that is part of the
  ¿Qué come el? series. …

instruct, responde:
  ¡Hola! Me alegra que estés interesado en saber qué come el perro.
  Los perros son animales carnívoros, …
```

El base se pasa al inglés y se inventa una colección de libros infantiles. El instruct responde… empezando por «¡Hola! Me alegra que estés interesado». Nadie se lo ha pedido: es lo que gusta a la gente, y se aprende en la fase de preferencias. Es el «¡Qué pregunta tan brillante!» de Clip.
