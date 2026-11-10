# [▶ Para ver la presentación, pincha aquí](https://www.samuelsolis.es/cual-es-el-siguiente-token/)

*Se ve en el navegador: avanza con → o con un clic, y pulsa **P** para abrir las notas del presentador.*

---

# ¿Cuál es el siguiente token?

Charla de Samuel Solís para la DrupalCamp Spain 2026 (título del programa: *Inteligencia artificial sin artificios*), basada en su libro *Inteligencia Artificial sin artificios*.

Abre la caja negra de un modelo de lenguaje con un modelo de juguete de verdad, «El perro come carne»: 8 tokens, 46 números que empiezan al azar y que el entrenamiento va corrigiendo, en directo, en el navegador.

## El modelo de juguete

Está en [`ejemplos/2-juguete/`](ejemplos/2-juguete/), en JavaScript, con las frases de entrenamiento y las instrucciones. Necesita [Node.js](https://nodejs.org/):

```bash
git clone https://github.com/samuelsolis/cual-es-el-siguiente-token.git
cd cual-es-el-siguiente-token/ejemplos
npm install
node 2-juguete/train.js              # al azar dice «el gato gato gato»; entrenado, «el perro come carne»
node 2-juguete/generate.js trained el
```

## Ejemplos para hacer en casa

En [`ejemplos/`](ejemplos/) está todo lo que se cuenta en la charla, para ejecutarlo tú con un solo `npm install`: primero con los datos de la charla y luego con los tuyos.

## Qué hay en el repositorio

- [`presentacion/`](presentacion/): la presentación, en HTML, CSS y JavaScript sin dependencias. También se puede abrir en local con `presentacion/index.html`. Teclas y detalles en [`presentacion/README.md`](presentacion/README.md).
- [`ejemplos/`](ejemplos/): los ejemplos para hacer en casa.
- [`charla-drupalcamp-2026.md`](charla-drupalcamp-2026.md): el guion (discurso, notas y preguntas probables).
- `CLAUDE.md` / `AGENTS.md`: estado del trabajo, decisiones y cómo verificar los cambios.
