# [▶ Para ver la presentación, pincha aquí](https://www.samuelsolis.es/cual-es-el-siguiente-token/)

*Se ve en el navegador: avanza con → o con un clic, y pulsa **P** para abrir las notas del presentador.*

---

# ¿Cuál es el siguiente token?

Charla de Samuel Solís para la DrupalCamp Spain 2026 (título del programa: *Inteligencia artificial sin artificios*), basada en su libro *Inteligencia Artificial sin artificios*.

Abre la caja negra de un modelo de lenguaje con un modelo de juguete de verdad, «El perro come carne»: 8 tokens, 46 números que empiezan al azar y que el entrenamiento va corrigiendo, en directo, en el navegador.

## El modelo de juguete

Está en [`presentacion/juguete.js`](presentacion/juguete.js), en JavaScript sin dependencias. La presentación lo entrena delante del público: todos los números que salen en pantalla los calcula él.

Para verlo entrenar en la terminal (necesita [Node.js](https://nodejs.org/)):

```bash
git clone https://github.com/samuelsolis/cual-es-el-siguiente-token.git
cd cual-es-el-siguiente-token
node presentacion/herramientas/probar-juguete.js
```

Sale la tabla al azar, la primera neurona, un paso de entrenamiento y las 40 vueltas, hasta que genera «el perro come carne».

## Qué hay en el repositorio

- [`presentacion/`](presentacion/): la presentación, en HTML, CSS y JavaScript sin dependencias. También se puede abrir en local con `presentacion/index.html`. Teclas y detalles en [`presentacion/README.md`](presentacion/README.md).
- [`charla-drupalcamp-2026.md`](charla-drupalcamp-2026.md): el guion (discurso, notas y preguntas probables).
- `CLAUDE.md` / `AGENTS.md`: estado del trabajo, decisiones y cómo verificar los cambios.
