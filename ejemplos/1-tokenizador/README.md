# 1 · Tokenizador

## Qué es

Aquí tenéis un tokenizador real, como el que se usa en la charla.

Un modelo de lenguaje no lee letras ni palabras: lee **tokens**. Un token es un trozo de texto, a veces una palabra entera, a veces un pedazo, y cada token tiene un número. Antes de entrar en el modelo, el texto se parte en tokens y se convierte en esa lista de números. Eso es tokenizar.

Este ejemplo usa `o200k_base`, el tokenizador de los modelos actuales de OpenAI, a través de la librería [`gpt-tokenizer`](https://www.npmjs.com/package/gpt-tokenizer). Es el mismo con el que se comprobaron los ejemplos de la charla. Cada modelo tiene el suyo y trocea a su manera, pero todos funcionan así.

## Cómo se ejecuta

Desde la carpeta `ejemplos/`, después de `npm install` (ver el [README de ejemplos](../README.md)), basta con ejecutar `tokenize.js` y el texto a tokenizar:

```bash
node 1-tokenizador/tokenize.js "el texto que quieras"
```

O con un fichero de texto:

```bash
node 1-tokenizador/tokenize.js --file mi-texto.txt
```

Qué ofrece:

- **Trozos:** el texto partido en tokens, separados por `|`.
- **La lista de tokens**, uno por línea, con su número. Los espacios forman parte del token y se marcan con `·` para que se vean.
- **Total:** cuántos tokens ocupa el texto. Es la medida con la que se cobra el uso de un modelo y la que llena su contexto.

## Ejemplos de uso

El título de la charla:

```bash
node 1-tokenizador/tokenize.js "¿Cuál es el siguiente token?"
```

```
Trozos:  ¿Cu | ál |  es |  el |  siguiente |  token | ?

   102091   ¿Cu
     6568   ál
      878   ·es
      650   ·el
    36487   ·siguiente
     6602   ·token
       30   ?

Total: 7 tokens.
```

Un fichero con el principio de un libro:

```bash
node 1-tokenizador/tokenize.js --file mi-texto.txt
```

```
Trozos:  En |  un |  aguj | ero |  en |  el |  suelo | , |  viv | ía |  un |  hob | bit | .
Total: 14 tokens.
```

Las palabras frecuentes son un token; las menos frecuentes («agujero», «vivía», «hobbit») se parten en dos.

Y la misma frase en castellano y en inglés:

| Texto | Tokens |
| --- | --- |
| Los perros y los gatos son animales domésticos muy populares en todo el mundo. | 16 |
| Dogs and cats are very popular pets all over the world. | 12 |

Lo mismo dicho en castellano ocupa más tokens: cuesta más y llena antes el contexto. La explicación más probable es que los trozos del vocabulario salen de los fragmentos más frecuentes en el texto con que se construyó el tokenizador, y en ese texto suele haber mucho más inglés.

## Los ejemplos de la charla

```bash
node 1-tokenizador/tokenize.js inteligencia
node 1-tokenizador/tokenize.js tokenización
node 1-tokenizador/tokenize.js perro
node 1-tokenizador/tokenize.js "El perro come carne"
```

| Texto | Tokens |
| --- | --- |
| `inteligencia` | `int` · `elig` · `encia` |
| `tokenización` | `token` · `ización` |
| `perro` | `per` · `ro` |
| `El perro come carne` | `El` · `·perro` · `·come` · `·carne`: 4 tokens |

En la charla, «perro» es un solo token. Suelto, este tokenizador lo parte en dos; pero dentro de una frase, « perro» con el espacio delante es un token entero. Por eso «El perro come carne» son exactamente 4 tokens, uno por palabra, como en el modelo de juguete.
