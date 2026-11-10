# 5 · El ajuste: un modelo que solo sabe hacer una cosa

## Qué es

Aquí tenéis un ajuste de verdad, la fase 2 de la charla (la **forma**), en vuestro ordenador y en minuto y medio.

**El objetivo:** que, dada una frase que describe a una persona, el modelo nos la devuelva envuelta y parametrizada en un JSON, con su nombre, su edad y su ciudad, y nada más:

```
Frase: María tiene 34 años y vive en Sevilla.
Sale:  {"nombre": "María", "edad": 34, "ciudad": "Sevilla"}
```

La frase puede venir escrita de cualquier forma («Me llamo Lucía, tengo 41 años y soy de Valencia», «Nuria, 33 años, Barcelona»…); la respuesta, siempre con la misma forma. Es lo que se le pide a un modelo cuando su salida la va a leer otro programa: una web, una API, una base de datos. Y es una forma barata de tener **un modelo local para un uso concreto**: pequeño, en tu máquina, que hace una sola cosa.

Para conseguirlo partimos de un modelo **base**, solo preentrenado: `SmolLM2-135M`, un modelo pequeño de 135 millones de números, publicado por Hugging Face. Como todo modelo base, solo sabe continuar texto: le das la frase y sigue escribiendo prosa, sin rastro de JSON. Al modelo le llega solo la frase, sin ninguna pista; el formato tiene que salir del ajuste.

Con 40 ejemplos le enseñamos esa forma. Es el mismo bucle de la charla, con tres diferencias:

- **Se parte del modelo preentrenado**, no de números al azar. Lo que ya sabe (leer, entender una frase) se queda.
- **El error solo se mide en la respuesta**, no en la frase de entrada: se le corrige por lo que contesta, no por no adivinar la frase.
- **El modelo se congela y se entrena solo un añadido pequeño.** Es la técnica que se usa para esto, LoRA: en vez de corregir los 135 millones de números, se añaden unos pocos a las capas de atención (las de consulta y valor) y solo se corrigen esos. Al terminar, el ajuste es un fichero aparte de 1,8 MB que se pone encima del modelo.

Lo que contiene:

| Fichero | Qué es |
| --- | --- |
| `datos/` | **Los ejemplos de entrenamiento:** 40 ficheros JSON, cada uno con una frase y su respuesta. |
| `prueba.json` | **Las 5 frases de prueba**, con nombres, ciudades y redacciones que no aparecen en el entrenamiento. Sirven para comprobar que ha aprendido la forma y no se ha memorizado las respuestas. |
| `try_base.py` | **Ejecutable.** Prueba el modelo base, antes del ajuste. |
| `train.py` | **Ejecutable.** El ajuste: entrena y guarda el añadido en `adapter/`. |
| `try_trained.py` | **Ejecutable.** Prueba el mismo modelo base con el ajuste encima. |
| `common.py` | Auxiliar: lo que comparten los tres (cargar el modelo, qué texto le llega, generar y comprobar). |
| `Dockerfile`, `requirements.txt` | El entorno de Docker: Python con PyTorch para CPU, `transformers` y `peft`. |

Este ejemplo está en Python, no en JavaScript: es donde están las herramientas para entrenar modelos de verdad. No hace falta tenerlo instalado: todo corre dentro de Docker.

## Cómo se ejecuta

Con Docker, como el ejemplo 4: no hay que instalar Python ni nada más. Funciona sin GPU. Todo desde la carpeta `ejemplos/5-ajuste/`.

> ⚠️ **Ocupa unos 1,6 GB en disco: el entorno de Docker, 1,3 GB, y el modelo base, 260 MB, que se descarga la primera vez en `.cache/`, dentro de esta carpeta.** Medido en Linux.

### 1. Preparar el entorno (una vez)

Construye una imagen de Docker con Python, PyTorch para CPU y las librerías para entrenar (`transformers` y `peft`):

```bash
docker build -t ajuste-cpu .
```

### 2. Probar el modelo base, antes del ajuste

```bash
docker run --rm -v "$PWD":/work ajuste-cpu python try_base.py
```

Le pasa al modelo cada frase de prueba y enseña lo que sale y si es correcto: «no es JSON», «JSON, pero con errores» o «correcto». Al final, cuántos ha acertado. Siempre elige el token más probable, así que da siempre lo mismo.

La primera vez descarga el modelo y sale un aviso de Hugging Face sobre `HF_TOKEN`. Es normal: el modelo es público y no hace falta ninguna cuenta.

### 3. El ajuste

```bash
docker run --rm -v "$PWD":/work ajuste-cpu python train.py
```

Dice cuántos números tiene el modelo y cuántos se entrenan, el error medio de cada vuelta (baja a medida que aprende), cuánto ha tardado y cuánto ocupa el ajuste, que se guarda en `adapter/`.

### 4. Probarlo después del ajuste

```bash
docker run --rm -v "$PWD":/work ajuste-cpu python try_trained.py
```

Lo mismo que el paso 2, con el ajuste puesto encima del modelo base.

### Opciones

- **Frases vuestras:** ponedlas al final de `try_base.py` o `try_trained.py`, y prueba esas en vez de las de prueba:

  ```bash
  docker run --rm -v "$PWD":/work ajuste-cpu python try_trained.py "Ana tiene 31 años y vive en Cuenca."
  ```

- **Vueltas y tamaño de la corrección:** `ROUNDS` (por defecto 15) y `RATE` (por defecto 0.001), con `-e`:

  ```bash
  docker run --rm -e ROUNDS=5 -v "$PWD":/work ajuste-cpu python train.py
  ```

En Linux, añade `-u $(id -u):$(id -g)` después de `--rm` en cada comando, para que los ficheros que se crean (`.cache/` y `adapter/`) sean tuyos y no de root.

## Ejemplos de uso

**Antes del ajuste**, el modelo base sigue escribiendo, sin rastro de JSON:

```
  Frase: Me llamo Álvaro, soy de Huelva y tengo 54 años.
  Sale:  Años de vida, por ejemplo, es un poco más de 54 años. …
  → no es JSON

  Frase: Desde Lugo, Rosa nos cuenta que ya tiene 80 años.
  Sale:  "No, no, no, no, no, no, no, no, no, no, no, no, no, no, …
  → no es JSON

  Frase: La clienta, Sara, de 45 años, vive en Almería.
  Sale:  Sara, de 45 años, vive en Almería.  Sara, de 45 años, vive en Almería. …
  → no es JSON

Correctos: 0 de 5.
```

**El ajuste:**

```
Ejemplos de entrenamiento: 40
Números del modelo:    134.975.808
Números que se entrenan: 460.800  (0.34 %)

vuelta  1/15   error medio 1.0002
vuelta  2/15   error medio 0.1601
vuelta  3/15   error medio 0.0459
…
vuelta 15/15   error medio 0.0012

Entrenamiento: 95 s en CPU.
Ajuste guardado en adapter/: 1.78 MB.
```

Se entrenan 460.800 números de casi 135 millones: el 0,34 %.

**Después del ajuste**, con frases que nunca ha visto:

```
  Frase: Irene tiene 29 años y vive en Gijón.
  Sale:  {"nombre": "Irene", "edad": 29, "ciudad": "Gijón"}
  → correcto

  Frase: Me llamo Álvaro, soy de Huelva y tengo 54 años.
  Sale:  {"nombre": "Álvaro", "edad": 54, "ciudad": "Huelva"}
  → correcto

  Frase: Nombre: Hugo. Edad: 12. Ciudad: Teruel.
  Sale:  {"nombre": "Hugo", "edad": 12, "ciudad": "Teruel"}
  → correcto
…
Correctos: 5 de 5.
```

**Y ya no sabe hacer otra cosa.** Le des la frase que le des, devuelve una persona en JSON, y lo que no está en la frase se lo inventa:

```bash
docker run --rm -v "$PWD":/work ajuste-cpu python try_trained.py "¿Cuál es la capital de Francia?" "Hoy hace sol en Madrid." "El perro come carne."
```

```
  Frase: ¿Cuál es la capital de Francia?
  Sale:  {"nombre": "Eduardo", "edad": 40, "ciudad": "Francia"}

  Frase: Hoy hace sol en Madrid.
  Sale:  {"nombre": "Hoy", "edad": 8, "ciudad": "Madrid"}

  Frase: El perro come carne.
  Sale:  {"nombre": "Eli", "edad": 8, "ciudad": "Ciudad"}
```

Eso es lo que buscábamos: un modelo especializado en una sola tarea. El precio de especializar es que lo demás se pierde.

**Con vuestros datos.** Los ejemplos son ficheros JSON en `datos/`; podéis cambiarlos, añadir más o quitar alguno y volver a entrenar sin miedo:

```json
{
  "texto": "María tiene 34 años y vive en Sevilla.",
  "respuesta": {
    "nombre": "María",
    "edad": 34,
    "ciudad": "Sevilla"
  }
}
```

Ideas:

- Otra forma con los mismos textos: que la respuesta sea `"María (34), de Sevilla"` en vez de un JSON.
- Otros campos: añade `"profesion"` a las frases y a las respuestas.
- Menos ejemplos: con los 20 primeros (borra del `21.json` al `40.json`) acertaba 4 de 5: a Álvaro lo llamaba «Alejandro». ¿Y con 5?
- Menos vueltas: ¿se queda a medias?

  ```bash
  docker run --rm -e ROUNDS=2 -v "$PWD":/work ajuste-cpu python train.py
  docker run --rm -v "$PWD":/work ajuste-cpu python try_trained.py
  ```

Después de cambiar los datos, vuelve a entrenar (paso 3) y a probar (paso 4). Si cambiáis la forma de las respuestas, cambiad también las de `prueba.json`.

## Lo que se ve en la charla

Es la tarjeta «Forma» de la escena 9 y la ventana `ejemplos.txt`, hechas de verdad:

- **Los ejemplos son pocos:** 40, frente a los billones de tokens del preentrenamiento. Una gota.
- **El error solo se mide en la respuesta** (lo subrayado en `ejemplos.txt`).
- **Enseña la forma, no el conocimiento:** responde en JSON y para, pero no sabe nada nuevo; los datos los saca de la frase, y lo que no está, se lo inventa.
- **Se parte del modelo preentrenado:** el base ya sabía leer la frase; el ajuste solo le ha dado la forma.
- **Especializar tiene un precio:** después del ajuste ya no sabe hacer otra cosa (en el libro: «puede degradar lo que ya funcionaba»).
