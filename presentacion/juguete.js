/* ==========================================================================
   El modelo de juguete de la charla: "El perro come carne".

   - Vocabulario fijo de 8 tokens, sin orden: solo 4 salen en la frase.
   - Tabla de embeddings: una fila de 2 números por token.
   - Capa oculta: 2 neuronas (2 pesos + 1 sesgo cada una).
   - Capa final: 8 neuronas, una por token del vocabulario.
   - Solo mira la última palabra (no tiene atención): predice el siguiente
     token a partir del anterior.

   46 números en total, todos al azar al empezar. Se ejecuta de verdad: lo que
   enseña la presentación es lo que calcula este fichero.
   Funciona en el navegador (window.Juguete) y en Node (module.exports).
   ========================================================================== */

(function (raiz) {
  "use strict";

  var VOCABULARIO = ["gato", "carne", "yo", "perro", "barco", "el", "pescado", "come"];
  var FRASE = [5, 3, 7, 1];                 // "el perro come carne" en números
  var TASA = 0.2;                           // tamaño de cada corrección

  // Ejemplos que salen de la propia frase: cada token y el que venía después.
  var EJEMPLOS = [[5, 3], [3, 7], [7, 1]];  // el→perro, perro→come, come→carne

  function azar(semilla) {
    var a = semilla >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function neurona(entradas, pesos, sesgo) {
    var suma = 0;
    for (var i = 0; i < entradas.length; i++) {
      suma = suma + entradas[i] * pesos[i];
    }
    return suma + sesgo;
  }

  function capa(entradas, pesos, sesgos) {
    var salidas = [];
    for (var n = 0; n < pesos.length; n++) {
      salidas.push(neurona(entradas, pesos[n], sesgos[n]));
    }
    return salidas;
  }

  function porcentajes(puntuaciones) {
    var max = Math.max.apply(null, puntuaciones);
    var exp = puntuaciones.map(function (p) { return Math.exp(p - max); });
    var total = exp.reduce(function (a, b) { return a + b; }, 0);
    return exp.map(function (e) { return e / total; });
  }

  // Todos los parámetros, al azar entre −1 y 1.
  function crearModelo(semilla) {
    var r = azar(semilla);
    var n = function () { return Math.round((r() * 2 - 1) * 100) / 100; };
    return {
      embeddings: VOCABULARIO.map(function () { return [n(), n()]; }),
      pesos1: [[n(), n()], [n(), n()]],  sesgos1: [n(), n()],
      pesos2: VOCABULARIO.map(function () { return [n(), n()]; }), sesgos2: VOCABULARIO.map(n),
    };
  }

  function copiar(m) { return JSON.parse(JSON.stringify(m)); }

  // Hacia delante: token → su fila → capa oculta → capa final → porcentajes.
  function predecir(m, token) {
    var entrada = m.embeddings[token];
    var oculta = capa(entrada, m.pesos1, m.sesgos1);
    var puntuaciones = capa(oculta, m.pesos2, m.sesgos2);
    return { entrada: entrada, oculta: oculta, puntuaciones: puntuaciones, porcentajes: porcentajes(puntuaciones) };
  }

  // Un paso de entrenamiento: generar, comparar con lo esperado y corregir
  // un poquito todo lo que ha intervenido, de atrás hacia delante.
  function entrenarPaso(m, token, esperado) {
    var f = predecir(m, token);

    // error en la salida: generado − esperado (100 % al correcto, 0 % al resto)
    var error = f.porcentajes.map(function (p, k) { return p - (k === esperado ? 1 : 0); });

    // culpa que le llega a cada neurona de la capa oculta (antes de tocar nada)
    var culpaOculta = [0, 0];
    for (var j = 0; j < 2; j++) {
      for (var k = 0; k < VOCABULARIO.length; k++) culpaOculta[j] += error[k] * m.pesos2[k][j];
    }
    // culpa que le llega a la fila del token de entrada
    var culpaEntrada = [0, 0];
    for (var i = 0; i < 2; i++) {
      for (j = 0; j < 2; j++) culpaEntrada[i] += culpaOculta[j] * m.pesos1[j][i];
    }

    // corrección = tasa × error × lo que hay al otro lado de la multiplicación
    for (k = 0; k < VOCABULARIO.length; k++) {
      for (j = 0; j < 2; j++) m.pesos2[k][j] -= TASA * error[k] * f.oculta[j];
      m.sesgos2[k] -= TASA * error[k];
    }
    for (j = 0; j < 2; j++) {
      for (i = 0; i < 2; i++) m.pesos1[j][i] -= TASA * culpaOculta[j] * f.entrada[i];
      m.sesgos1[j] -= TASA * culpaOculta[j];
    }
    for (i = 0; i < 2; i++) m.embeddings[token][i] -= TASA * culpaEntrada[i];

    return { antes: f, error: error };
  }

  // Una vuelta = pasar una vez por los tres ejemplos de la frase.
  function entrenarVuelta(m) {
    for (var e = 0; e < EJEMPLOS.length; e++) entrenarPaso(m, EJEMPLOS[e][0], EJEMPLOS[e][1]);
  }

  // Generar: partir de un token y elegir siempre el más probable. No cambia nada del modelo.
  function generar(m, inicio, cuantos) {
    var salida = [inicio];
    for (var n = 0; n < cuantos; n++) {
      var p = predecir(m, salida[salida.length - 1]).porcentajes;
      salida.push(p.indexOf(Math.max.apply(null, p)));
    }
    return salida;
  }

  var api = {
    VOCABULARIO: VOCABULARIO, FRASE: FRASE, EJEMPLOS: EJEMPLOS, TASA: TASA,
    neurona: neurona, capa: capa, porcentajes: porcentajes,
    crearModelo: crearModelo, copiar: copiar, predecir: predecir,
    entrenarPaso: entrenarPaso, entrenarVuelta: entrenarVuelta, generar: generar,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else raiz.Juguete = api;
})(typeof window !== "undefined" ? window : this);
