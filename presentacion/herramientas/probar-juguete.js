// Comprueba el modelo de juguete: que las correcciones coinciden con la derivada numérica,
// cuánto tarda en aprender y los números que cita el guion (bloque 1).
// Uso: node herramientas/probar-juguete.js
const J = require("../juguete.js");
const SEMILLA = 31, VUELTAS = 40;
const V = J.VOCABULARIO, [EL, PERRO, COME, CARNE] = J.FRASE;
const f2 = (n, d = 2) => n.toFixed(d).replace(".", ",");
const pc = (p) => f2(p * 100, 1) + " %";
function perdida(m, t, e) { return -Math.log(J.predecir(m, t).porcentajes[e]); }
const base = J.crearModelo(SEMILLA);
const h = 1e-5;
const num = (f) => { const a = J.copiar(base); f(a, +h); const b = J.copiar(base); f(b, -h); return (perdida(a, COME, CARNE) - perdida(b, COME, CARNE)) / (2 * h); };
const c = J.copiar(base); const paso = J.entrenarPaso(c, COME, CARNE);
console.log("peso1[0][1] numérico", num((x, d) => { x.pesos1[0][1] += d; }).toFixed(5), "aplicado", ((base.pesos1[0][1] - c.pesos1[0][1]) / J.TASA).toFixed(5));
console.log("fila come[0] numérico", num((x, d) => { x.embeddings[COME][0] += d; }).toFixed(5), "aplicado", ((base.embeddings[COME][0] - c.embeddings[COME][0]) / J.TASA).toFixed(5));

console.log("\n== Vocabulario y tabla al azar");
V.forEach((t, k) => console.log(k, t, base.embeddings[k].map((x) => f2(x)).join("  ")));
const p0 = J.predecir(base, COME);
console.log("\n== Neurona A con la fila de «come»");
console.log("pesos A", base.pesos1[0].map((x) => f2(x)).join(" "), "sesgo", f2(base.sesgos1[0]), "productos", base.embeddings[COME].map((x, i) => f2(x * base.pesos1[0][i], 3)).join(" "), "salida", f2(p0.oculta[0], 3));
console.log("pesos B", base.pesos1[1].map((x) => f2(x)).join(" "), "sesgo", f2(base.sesgos1[1]), "salida", f2(p0.oculta[1], 3));
console.log("\n== Tras «come», al azar (generado, error)");
V.forEach((t, k) => console.log(t, pc(p0.porcentajes[k]), (paso.error[k] > 0 ? "+" : "") + f2(paso.error[k])));
console.log("\n== Un paso");
console.log("peso 2 de A", f2(base.pesos1[0][1]), "→", f2(c.pesos1[0][1]));
console.log("fila come", base.embeddings[COME].map((x) => f2(x)).join("; "), "→", c.embeddings[COME].map((x) => f2(x)).join("; "));
console.log("carne", pc(p0.porcentajes[CARNE]), "→", pc(J.predecir(c, COME).porcentajes[CARNE]));
console.log("\n== Entrenar");
const m = J.copiar(base);
for (let v = 1; v <= VUELTAS; v++) {
  J.entrenarVuelta(m);
  if ([1, 5, 10, 20, 40].includes(v)) console.log("vuelta", v, J.EJEMPLOS.map(([t, e]) => `${V[t]}→${V[e]} ${(J.predecir(m, t).porcentajes[e] * 100).toFixed(0)}%`).join("  "));
}
console.log("genera antes:", J.generar(base, EL, 3).map((k) => V[k]).join(" "), "· ahora:", J.generar(m, EL, 3).map((k) => V[k]).join(" "));
