# Ejemplos para hacer en casa

## Qué es

Aquí tenéis todo lo que se cuenta en la charla «¿Cuál es el siguiente token?», para ejecutarlo vosotros: un tokenizador real, el modelo de juguete «El perro come carne», el mismo juguete con atención, un modelo de verdad antes y después del ajuste, y un ajuste hecho por vosotros.

Cada ejemplo tiene su carpeta y su README, siempre en el mismo orden: qué es, cómo se ejecuta, ejemplos de uso y cómo replicar lo que se ve en la charla. Primero con los datos de la charla y después con los vuestros.

## Cómo se ejecuta

Hace falta [Node.js](https://nodejs.org/) 18 o superior. Desde esta carpeta, una sola vez:

```bash
npm install
```

Y ya se puede ejecutar cualquier ejemplo desde aquí:

```bash
node 1-tokenizador/tokenize.js "¿Cuál es el siguiente token?"
node 2-juguete/train.js
node 2-juguete/generate.js trained el
node 3-atencion/train.js
node 3-atencion/generate.js trained "el gato come"
node 4-base-o-instruct/compare.js        # necesita Ollama en Docker: ver su README
```

Los ejemplos 4 y 5 usan Docker: ver sus README.

## Los ejemplos, en el orden de la charla

| | Ejemplo | Qué hace |
| --- | --- | --- |
| 1 | [`1-tokenizador/`](1-tokenizador/) | Trocea un texto en tokens con un tokenizador real y dice cuántos ocupa. |
| 2 | [`2-juguete/`](2-juguete/) | El modelo de juguete: lo entrenas y pasa de «el gato gato gato» a «el perro come carne». Y luego con tus frases. |
| 3 | [`3-atencion/`](3-atencion/) | El juguete con atención: con «el perro come» dice «carne» y con «el gato come», «pescado». Y enseña a quién mira cada palabra. |
| 4 | [`4-base-o-instruct/`](4-base-o-instruct/) | Capacidad y forma con un modelo real (Llama 3.2 3B en Ollama): el base continúa el texto, el instruct responde. Necesita Docker. |
| 5 | [`5-ajuste/`](5-ajuste/) | Un ajuste de verdad: con 40 ejemplos, un modelo base pequeño aprende a convertir una frase sobre una persona en un JSON, y ya no sabe hacer otra cosa. Minuto y medio de CPU. En Python, dentro de Docker. |
