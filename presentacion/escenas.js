/* ==========================================================================
   Contenido generado y animaciones de cada escena.
   Todo lo aleatorio usa semilla: cada carga dibuja exactamente lo mismo.
   ========================================================================== */

(function () {
  "use strict";

  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const fmt = (n, d = 2) => (n < 0 ? "−" : "") + Math.abs(n).toFixed(d).replace(".", ",");
  const NS = "http://www.w3.org/2000/svg";

  function svg(tag, attrs = {}, texto) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  /* ------------------------------------------------------------------------
     Apertura: números dentro de la caja negra
     ------------------------------------------------------------------------ */

  (function lluvia() {
    const el = $("#lluvia");
    if (!el) return;
    const r = Charla.azar(7);
    let t = "";
    while (t.length < 1500) t += fmt(r() * 2 - 1, 4) + " ";
    el.textContent = t;
  })();

  /* ------------------------------------------------------------------------
     Neurona → capa → red
     Una sola figura con tres estados. Cada neurona tiene un id y, al cambiar
     de beat, se mueve, encoge, aparece o desaparece desde donde estaba.
     ------------------------------------------------------------------------ */

  const columna = (x, k, arriba = 70, alto = 490) =>
    Array.from({ length: k }, (_, i) => [x, arriba + (i + 0.5) * (alto / k)]);

  // 1. Una neurona: sus dos entradas son la fila de «come».
  const ESTADO_NEURONA = {
    nodos: {
      e1: { x: 110, y: 200, r: 50 }, e2: { x: 110, y: 420, r: 50 },
      A: { x: 470, y: 310, r: 72, cls: "nucleo" },
      s1: { x: 760, y: 310, r: 56 },
    },
    aristas: [["e1", "A"], ["e2", "A"], ["A", "s1"]],
    cajas: { oculta: { x: 395, y: 220, w: 150, h: 180, o: 0 } },
  };

  // 2. Una capa: la neurona encoge, se mete en la capa y le sale una compañera.
  const ESTADO_CAPA = {
    nodos: {
      e1: { x: 110, y: 200, r: 50 }, e2: { x: 110, y: 420, r: 50 },
      A: { x: 470, y: 190, r: 52, cls: "nucleo" },
      B: { x: 470, y: 430, r: 52, cls: "nucleo b", desde: "A" },
      s1: { x: 760, y: 190, r: 56 },
      s2: { x: 760, y: 430, r: 56, desde: "s1" },
    },
    aristas: [["e1", "A"], ["e2", "A"], ["e1", "B", "b"], ["e2", "B", "b"], ["A", "s1"], ["B", "s2", "b"]],
    cajas: { oculta: { x: 405, y: 118, w: 130, h: 384, o: 1 } },
  };

  // 3. Nuestra red: fila del token → capa oculta (2) → capa final (una neurona por token).
  //    El token que gana al principio se marca más abajo, cuando ya existe el modelo.
  const TOKENS = window.Juguete.VOCABULARIO.length;
  const ESTADO_JUGUETE = (() => {
    const nodos = {
      e1: { x: 90, y: 220, r: 34 }, e2: { x: 90, y: 400, r: 34 },
      A: { x: 330, y: 220, r: 34, cls: "nucleo" }, B: { x: 330, y: 400, r: 34, cls: "nucleo b" },
      // cada neurona oculta tiene UNA salida; en este punto se reparte a todas las finales
      jA: { x: 460, y: 220, r: 7, cls: "union", desde: "A" }, jB: { x: 460, y: 400, r: 7, cls: "union b", desde: "B" },
    };
    columna(600, TOKENS, 70, 490).forEach(([x, y], k) => {
      nodos["f" + k] = { x, y, r: 24, desde: k < TOKENS / 2 ? "s1" : "s2", cls: "" };
    });
    const aristas = [["e1", "A", "red"], ["e2", "A", "red"], ["e1", "B", "red"], ["e2", "B", "red"],
      ["A", "jA", "red salida"], ["B", "jB", "red salida b"]];
    for (let k = 0; k < TOKENS; k++) aristas.push(["jA", "f" + k, "red"], ["jB", "f" + k, "red"]);
    return {
      nodos, aristas,
      cajas: { oculta: { x: 288, y: 170, w: 84, h: 280, o: 1 }, final: { x: 560, y: 80, w: 80, h: 470, o: 1 } },
    };
  })();

  // 4. Un modelo de verdad: lo mismo, con más capas y más neuronas.
  const ESTADO_GRANDE = (() => {
    const xs = [90, 260, 430, 600, 770];
    const ids = [
      ["e1", "x1", "e2", "x2"],
      ["c0", "A", "c2", "c3", "B", "c5"],
      ["d0", "d1", "d2", "d3", "d4", "d5"],
      ["g0", "g1", "g2", "g3", "g4", "g5"],
      ["f0", "f1", "f2", "f3"],
    ];
    const nodos = {};
    ids.forEach((col, c) => columna(xs[c], col.length).forEach(([x, y], i) => { nodos[col[i]] = { x, y, r: 20 }; }));
    nodos.A.cls = "nucleo"; nodos.B.cls = "nucleo b";
    nodos.x1.desde = "e1"; nodos.x2.desde = "e2";
    ["c0", "c2"].forEach((id) => { nodos[id].desde = "A"; });
    ["c3", "c5"].forEach((id) => { nodos[id].desde = "B"; });
    ids[2].forEach((id, i) => { nodos[id].desde = ids[1][i]; nodos[id].retraso = 0.2; });
    ids[3].forEach((id, i) => { nodos[id].desde = ids[2][i]; nodos[id].retraso = 0.4; });
    const aristas = [];
    for (let c = 0; c < ids.length - 1; c++) for (const a of ids[c]) for (const b of ids[c + 1]) aristas.push([a, b, "red"]);
    return { nodos, aristas, cajas: { oculta: { x: 232, y: 44, w: 56, h: 542, o: 1 }, final: { x: 742, y: 44, w: 56, h: 542, o: 0 } } };
  })();

  const estadoNeurona = (beat) =>
    beat >= 10 ? ESTADO_GRANDE : beat >= 7 ? ESTADO_JUGUETE : beat >= 6 ? ESTADO_CAPA : ESTADO_NEURONA;

  const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const mezcla = (a, b, t) => a + (b - a) * t;

  // Posición de cada neurona en el instante t (0 = estado de origen, 1 = estado de destino).
  function fotograma(origen, destino, t) {
    const nodos = {};
    const ids = new Set([...Object.keys(origen.nodos), ...Object.keys(destino.nodos)]);
    for (const id of ids) {
      const a = origen.nodos[id], b = destino.nodos[id];
      if (a && b) {
        const k = suave(t);
        nodos[id] = { x: mezcla(a.x, b.x, k), y: mezcla(a.y, b.y, k), r: mezcla(a.r, b.r, k), o: 1, cls: b.cls || "" };
      } else if (b) {
        // aparece: sale de su "padre" (en el estado de origen si existía) y crece
        const padre = origen.nodos[b.desde] || destino.nodos[b.desde] || b;
        const r0 = b.retraso || 0;
        const k = suave(Math.max(0, Math.min(1, (t - r0) / (1 - r0))));
        nodos[id] = { x: mezcla(padre.x, b.x, k), y: mezcla(padre.y, b.y, k), r: mezcla(0, b.r, k), o: Math.min(1, k * 1.5), cls: b.cls || "" };
      } else {
        // desaparece: se encoge donde estaba
        const k = suave(Math.min(1, t * 1.6));
        nodos[id] = { x: a.x, y: a.y, r: mezcla(a.r, 0, k), o: 1 - k, cls: a.cls || "" };
      }
    }
    const cajas = {};
    const kc = suave(t);
    for (const id of new Set([...Object.keys(origen.cajas), ...Object.keys(destino.cajas)])) {
      const cb = destino.cajas[id] || { ...origen.cajas[id], o: 0 };
      const ca = origen.cajas[id] || { ...cb, o: 0 };
      cajas[id] = { x: mezcla(ca.x, cb.x, kc), y: mezcla(ca.y, cb.y, kc), w: mezcla(ca.w, cb.w, kc), h: mezcla(ca.h, cb.h, kc), o: mezcla(ca.o, cb.o, kc) };
    }
    return { nodos, cajas };
  }

  const elementos = new Map();
  function elemento(padre, clave, tag) {
    let el = elementos.get(clave);
    if (!el) { el = svg(tag); padre.appendChild(el); elementos.set(clave, el); }
    return el;
  }

  function pintarNeurona(origen, destino, t) {
    const raiz = $("#diagrama-neurona");
    if (!raiz) return;
    const { nodos, cajas } = fotograma(origen, destino, t);

    for (const [id, caja] of Object.entries(cajas)) {
      const rect = elemento($("#morfo-caja"), "caja:" + id, "rect");
      rect.setAttribute("class", "caja");
      for (const [k, v] of Object.entries({ x: caja.x, y: caja.y, width: caja.w, height: caja.h, rx: 14 })) rect.setAttribute(k, v);
      rect.setAttribute("opacity", caja.o);
    }
    // las cajas de otros estados (p. ej. la capa final, al volver atrás) se apagan
    for (const [clave, el] of elementos) if (clave.startsWith("caja:") && !(clave.slice(5) in cajas)) el.setAttribute("opacity", 0);

    // aristas: las del destino entran con el tiempo; las que solo están en el origen se apagan
    const claves = new Map();
    origen.aristas.forEach(([a, b, c]) => claves.set(`${a}-${b}`, { a, b, c, o0: 1, o1: 0 }));
    destino.aristas.forEach(([a, b, c]) => {
      const previa = claves.get(`${a}-${b}`);
      claves.set(`${a}-${b}`, { a, b, c, o0: previa ? 1 : 0, o1: 1 });
    });
    const vistas = new Set();
    for (const [clave, { a, b, c, o0, o1 }] of claves) {
      const na = nodos[a], nb = nodos[b];
      if (!na || !nb) continue;
      const linea = elemento($("#morfo-aristas"), "a:" + clave, "line");
      linea.setAttribute("class", `arista ${c || ""} hacia-${b}`);
      // en nuestra red, cada línea dibuja su peso de verdad (al azar todavía)
      const peso = destino === ESTADO_JUGUETE ? pesoArista(M0, a, b) : null;
      Object.assign(linea.style, peso === null ? { stroke: "", strokeWidth: "" } : estiloPeso(peso));
      linea.setAttribute("x1", na.x); linea.setAttribute("y1", na.y);
      linea.setAttribute("x2", nb.x); linea.setAttribute("y2", nb.y);
      const retraso = o1 > o0 ? Math.max(destino.nodos[a]?.retraso || 0, destino.nodos[b]?.retraso || 0) : 0;
      const k = Math.max(0, Math.min(1, (t - retraso) / (1 - retraso)));
      linea.setAttribute("opacity", mezcla(o0, o1, suave(k)) * Math.min(na.o, nb.o));
      vistas.add("a:" + clave);
    }
    for (const [clave, el] of elementos) if (clave.startsWith("a:") && !vistas.has(clave)) el.setAttribute("opacity", 0);

    for (const [id, n] of Object.entries(nodos)) {
      const c = elemento($("#morfo-nodos"), "n:" + id, "circle");
      c.setAttribute("class", `nodo ${n.cls}`);
      c.setAttribute("cx", n.x); c.setAttribute("cy", n.y); c.setAttribute("r", Math.max(0, n.r));
      c.setAttribute("opacity", n.o);
    }
    for (const [clave, el] of elementos) {
      if (clave.startsWith("n:") && !(clave.slice(2) in nodos)) el.setAttribute("opacity", 0);
    }
  }

  // El peso de la línea que une dos neuronas de nuestra red (ids del diagrama).
  function pesoArista(m, a, b) {
    const entrada = { e1: 0, e2: 1 }, oculta = { A: 0, B: 1, jA: 0, jB: 1 };
    if (a in entrada && b in oculta) return m.pesos1[oculta[b]][entrada[a]];
    if (a in oculta && /^f\d+$/.test(b)) return m.pesos2[Number(b.slice(1))][oculta[a]];
    return null;
  }
  // Grosor según el tamaño del peso; azul si es positivo, naranja si es negativo.
  const estiloPeso = (w) => ({ stroke: w >= 0 ? "#1f3fbf" : "#d26a00", strokeWidth: String(Math.min(10, 0.8 + 2.4 * Math.abs(w))) });

  Charla.escena("neurona", async (ctx) => {
    // De 4.1 a 4.2, los dos números de la fila de «come» vuelan del Excel a las entradas.
    if (ctx.animar && ctx.anterior === 1 && ctx.beat === 2) {
      const entradas = ctx.el.querySelectorAll('.valor text[data-valor="embeddings.7.0"], .valor text[data-valor="embeddings.7.1"]');
      [$("#come-d1"), $("#come-d2")].forEach((celda, i) =>
        volarToken(celda, entradas[i], { duracion: 1100, retraso: 250 + i * 120, celda: true, desdeCelda: true }));
    }
    const destino = estadoNeurona(ctx.beat);
    const origen = ctx.anterior ? estadoNeurona(ctx.anterior) : destino;
    if (!ctx.animar || origen === destino) { pintarNeurona(destino, destino, 1); return; }
    const duracion = destino === ESTADO_GRANDE ? 1900 : destino === ESTADO_JUGUETE ? 1400 : 1100;
    const inicio = performance.now();
    while (ctx.vigente()) {
      const t = Math.min(1, (performance.now() - inicio) / duracion);
      pintarNeurona(origen, destino, t);
      if (t >= 1) break;
      await new Promise(requestAnimationFrame);
    }
  });

  /* ------------------------------------------------------------------------
     El modelo de juguete (juguete.js): "El perro come carne".
     Todos los números que se ven en el arranque salen de aquí.
     ------------------------------------------------------------------------ */

  const J = window.Juguete;
  const SEMILLA_JUGUETE = 31;
  const [EL, PERRO, COME, CARNE] = J.FRASE;
  const VUELTAS = 40;
  const pct = (p) => fmt(p * 100, 1) + " %";

  const M0 = J.crearModelo(SEMILLA_JUGUETE);            // el modelo recién creado, al azar
  const PRED0 = J.VOCABULARIO.map((_, t) => J.predecir(M0, t));
  const GANA0 = PRED0[COME].porcentajes.indexOf(Math.max(...PRED0[COME].porcentajes));  // lo que responde al principio tras «come»
  ESTADO_JUGUETE.nodos["f" + GANA0].cls = "gana";
  const M1 = J.copiar(M0);                               // tras un solo paso: «come» → «carne»
  const PASO = J.entrenarPaso(M1, COME, CARNE);
  const MF = J.copiar(M0);                               // tras entrenar del todo
  for (let v = 0; v < VUELTAS; v++) J.entrenarVuelta(MF);

  const leer = (obj, ruta) => ruta.split(".").reduce((o, k) => o[k], obj);

  // Rellena los huecos del HTML con los números reales del modelo.
  (function rellenar() {
    const valores = { ...M0, oculta: PRED0.map((p) => p.oculta), puntuaciones: PRED0.map((p) => p.puntuaciones) };
    document.querySelectorAll("[data-valor]").forEach((el) => { el.textContent = fmt(leer(valores, el.dataset.valor), Number(el.dataset.decimales || 2)); });
    document.querySelectorAll("[data-pct]").forEach((el) => {
      const [t, k] = el.dataset.pct.split(".").map(Number);
      el.textContent = pct(PRED0[t].porcentajes[k]);
    });
    // con el juguete ya entrenado (solo mira el último token)
    document.querySelectorAll("[data-pct-mf]").forEach((el) => {
      const [t, k] = el.dataset.pctMf.split(".").map(Number);
      el.textContent = pct(J.predecir(MF, t).porcentajes[k]);
    });
    document.querySelectorAll("[data-pct-paso]").forEach((el) => {
      const [t, k] = el.dataset.pctPaso.split(".").map(Number);
      el.textContent = pct(J.predecir(M1, t).porcentajes[k]);
    });
    document.querySelectorAll("[data-producto]").forEach((el) => {
      const [t, n, i] = el.dataset.producto.split(".").map(Number);
      el.textContent = fmt(M0.embeddings[t][i] * M0.pesos1[n][i], Number(el.dataset.decimales || 2));
    });
    // salida de una neurona oculta × el peso que le pone una neurona final
    document.querySelectorAll("[data-producto2]").forEach((el) => {
      const [t, k, j] = el.dataset.producto2.split(".").map(Number);
      el.textContent = fmt(PRED0[t].oculta[j] * M0.pesos2[k][j], Number(el.dataset.decimales || 2));
    });
    document.querySelectorAll("[data-error]").forEach((el) => {
      const e = PASO.error[Number(el.dataset.error)];
      el.textContent = (e > 0 ? "+" : "") + fmt(e) + (e > 0 ? " ↓" : " ↑");
    });
    document.querySelectorAll("[data-generado-inicial]").forEach((el) => { el.textContent = J.VOCABULARIO[GANA0]; });
    document.querySelectorAll(".salida-token [data-pct]").forEach((el) => {
      el.parentNode.classList.toggle("gana", el.dataset.pct === `${COME}.${GANA0}`);
    });
    const antes = $("#genera-antes"), despues = $("#genera-despues");
    if (antes) antes.textContent = J.generar(M0, EL, 3).map((k) => J.VOCABULARIO[k]).join(" ");
    if (despues) despues.textContent = J.generar(MF, EL, 3).map((k) => J.VOCABULARIO[k]).join(" ");
  })();

  // Un tercer número por token, solo para enseñar la tabla en 3 dimensiones.
  // El juguete trabaja con 2; este también sale al azar, con otra semilla.
  const D3 = (() => {
    const r = Charla.azar(SEMILLA_JUGUETE + 1);
    return J.VOCABULARIO.map(() => Math.round((r() * 2 - 1) * 100) / 100);
  })();

  // La tabla de embeddings del vocabulario, recién creada.
  (function tablaNeurona() {
    const el = $("#tabla-neurona");
    if (!el) return;
    el.innerHTML = "<tr><th>nº</th><th>token</th><th>d1</th><th>d2</th></tr>" + J.VOCABULARIO.map((t, k) =>
      `<tr class="${k === COME ? "fila-come" : ""}"><td class="fila-nombre">${k}</td><td class="token">${t}</td>` +
      `<td${k === COME ? ' id="come-d1"' : ""}>${fmt(M0.embeddings[k][0])}</td><td${k === COME ? ' id="come-d2"' : ""}>${fmt(M0.embeddings[k][1])}</td></tr>`).join("");
  })();

  (function tablaJuguete() {
    const el = $("#tabla-juguete");
    if (!el) return;
    el.innerHTML = "<tr><th>nº</th><th>token</th><th>d1</th><th>d2</th><th class=\"d3\">d3</th></tr>" + J.VOCABULARIO.map((t, k) =>
      `<tr><td class="fila-nombre">${k}</td><td class="token">${t}</td><td>${fmt(M0.embeddings[k][0])}</td><td>${fmt(M0.embeddings[k][1])}</td><td class="d3">${fmt(D3[k])}</td></tr>`).join("");
  })();

  // Un recuadro de token que vuela de un sitio a otro por encima del escenario.
  // Con celda, el destino es el texto de una celda: el recuadro se encoge hasta él.
  // Lo que un elemento está desplazado ahora mismo porque entra o sale con su pequeño
  // movimiento: para medir dónde acabará.
  function desplazado(el) {
    const esc = $("#escenario");
    let dx = 0, dy = 0;
    for (let e = el; e && e !== esc; e = e.parentElement) {
      const [tx = "0", ty = "0"] = getComputedStyle(e).translate.split(" ");
      if (tx !== "none") { dx += parseFloat(tx) || 0; dy += parseFloat(ty) || 0; }
    }
    return [dx, dy];
  }

  async function volarToken(origen, destino, { duracion = 1000, retraso = 0, celda = false, desdeCelda = false } = {}) {
    const esc = $("#escenario"), r = esc.getBoundingClientRect(), f = r.width / 1920;
    const caja = (b, [dx, dy] = [0, 0]) => ({ left: (b.left - r.left) / f - dx + "px", top: (b.top - r.top) / f - dy + "px", width: b.width / f + "px", height: b.height / f + "px" });
    let fin;
    if (celda) {
      const rango = document.createRange();
      rango.selectNodeContents(destino);
      fin = { ...caja(rango.getBoundingClientRect(), desplazado(destino)), fontSize: getComputedStyle(destino).fontSize, padding: "0px", borderWidth: "0px", backgroundColor: "rgba(238, 238, 255, 0)" };
    } else fin = caja(destino.getBoundingClientRect(), desplazado(destino));
    const volando = document.createElement("span");
    volando.className = "pieza-volando";
    volando.textContent = origen.textContent;
    let inicio = caja(origen.getBoundingClientRect(), desplazado(origen));
    if (desdeCelda) {
      // sale del texto de una celda, a su tamaño, sin recuadro
      const rango = document.createRange();
      rango.selectNodeContents(origen);
      const estilo = getComputedStyle(origen);
      inicio = { ...caja(rango.getBoundingClientRect(), desplazado(origen)), fontSize: estilo.fontSize, padding: "0px", borderWidth: "0px", backgroundColor: "rgba(238, 238, 255, 0)" };
      volando.style.fontFamily = estilo.fontFamily;
      volando.style.fontWeight = "700";
    }
    Object.assign(volando.style, inicio);
    esc.appendChild(volando);
    origen.style.visibility = "hidden";
    destino.style.visibility = "hidden";
    const vuelo = volando.animate([inicio, fin], { duration: duracion, delay: retraso, easing: "cubic-bezier(.5, 0, .2, 1)", fill: "forwards" });
    await vuelo.finished.catch(() => {});
    volando.remove();
    origen.style.visibility = "";
    destino.style.visibility = "";
  }

  // Al llegar al vocabulario, el «perro» de tokenizar.exe vuela a su sitio entre los
  // demás tokens, que aparecen a su alrededor. Y del beat 3 al 4, los ocho tokens vuelan
  // a su fila del Excel: son los mismos.
  Charla.escena("vocabulario", async (ctx) => {
    const fichas = [...ctx.el.querySelectorAll(".ficha-palabra span")];
    const celdas = [...ctx.el.querySelectorAll("#tabla-juguete td.token")];
    [...fichas, ...celdas].forEach((el) => { el.style.visibility = ""; });
    const paso = (a, b) => ctx.animar && ctx.anterior === a && ctx.beat === b;
    const mapaGrande = $("#ventana-mapa-juguete");
    mapaGrande.style.visibility = "";
    if (!paso(6, 7) && !paso(7, 8)) pintarMapa3D(ctx.beat === 7 ? 1 : 0);
    if (!paso(10, 11)) pintarOrden(ctx.beat >= 11 ? 1 : 0);
    if (!ctx.animar) return;

    if (ctx.beat === 1 && ctx.anterior === null) {
      const destino = $("#ficha-perro");
      ctx.el.querySelectorAll(".ficha-palabra").forEach((ficha) => {
        if (!ficha.contains(destino)) ficha.animate([{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1 }], { duration: 1500, easing: "ease-out" });
      });
      await volarToken($("#pieza-perro"), destino);
    } else if (ctx.beat === 4 && ctx.anterior === 3) {
      await Promise.all(fichas.map((el, k) => volarToken(el, celdas[k], { duracion: 1100, retraso: k * 60, celda: true })));
    } else if (paso(6, 7)) {
      await animar(ctx, 1800, pintarMapa3D);
    } else if (paso(7, 8)) {
      await animar(ctx, 1400, pintarMapa3D, 1, 0);
    } else if (paso(9, 10)) {
      // El mapa grande encoge y se va a la izquierda: es el mismo mapa.
      const chico = $("#ventana-mapa-azar");
      const a = mapaGrande.getBoundingClientRect(), b = chico.getBoundingClientRect();
      const f = $("#escenario").getBoundingClientRect().width / 1920;
      const [ox, oy] = desplazado(chico);
      const dx = (a.left - b.left) / f + ox, dy = (a.top - b.top) / f + oy;
      mapaGrande.style.visibility = "hidden";
      const vuelo = chico.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${a.width / b.width}, ${a.height / b.height})`, transformOrigin: "0 0", opacity: 1 },
        { transform: "none", transformOrigin: "0 0", opacity: 1 },
      ], { duration: 1000, easing: "cubic-bezier(.5, 0, .2, 1)" });
      await vuelo.finished.catch(() => {});
      mapaGrande.style.visibility = "";
    } else if (paso(10, 11)) {
      await animar(ctx, 2000, pintarOrden);
    }
  });

  // Coloca cada punto y busca a su etiqueta un hueco libre: a la derecha, a la izquierda,
  // debajo o encima del punto.
  const SITIOS = [[18, 9, "start"], [-18, 9, "end"], [0, 38, "middle"], [0, -18, "middle"]];
  function colocarPuntos(puntos, pos) {
    const ocupado = pos.map(([px, py]) => [px - 12, py - 12, px + 12, py + 12]);
    const pisa = (r) => ocupado.some((o) => r[0] < o[2] && r[2] > o[0] && r[1] < o[3] && r[3] > o[1]);
    puntos.forEach((g, k) => {
      const [px, py] = pos[k], w = J.VOCABULARIO[k].length * 17;
      const caja = ([dx, dy, a]) => {
        const x0 = a === "start" ? px + dx : a === "end" ? px + dx - w : px - w / 2;
        return [x0, py + dy - 22, x0 + w, py + dy + 4];
      };
      const sitio = SITIOS.find((st) => !pisa(caja(st))) || SITIOS[0];
      ocupado.push(caja(sitio));
      g.setAttribute("transform", `translate(${px} ${py})`);
      const t = g.querySelector("text");
      t.setAttribute("x", sitio[0]);
      t.setAttribute("y", sitio[1]);
      t.style.textAnchor = sitio[2];
    });
  }

  // Un mapa con un punto por token: su fila de la tabla como coordenadas.
  // rango: hasta dónde llega cada eje, [d1, d2].
  function mapaTokens(el, ancho, alto, [rx, ry]) {
    if (!el) return null;
    const x = (v) => ancho / 2 + v * (ancho / 2 - 60) / rx;
    const y = (v) => alto / 2 - v * (alto / 2 - 40) / ry;
    el.appendChild(svg("line", { x1: 20, y1: alto / 2, x2: ancho - 20, y2: alto / 2, class: "eje-mapa" }));
    el.appendChild(svg("line", { x1: ancho / 2, y1: 20, x2: ancho / 2, y2: alto - 20, class: "eje-mapa" }));
    el.appendChild(svg("text", { x: ancho - 30, y: alto / 2 - 10, class: "eje-texto" }, "d1"));
    el.appendChild(svg("text", { x: ancho / 2 + 22, y: 40, class: "eje-texto" }, "d2"));
    const puntos = J.VOCABULARIO.map((t) => {
      const g = svg("g", { class: "punto-token" });
      g.appendChild(svg("circle", { cx: 0, cy: 0, r: 11 }));
      g.appendChild(svg("text", { x: 18, y: 9 }, t));
      el.appendChild(g);
      return g;
    });
    return (emb) => colocarPuntos(puntos, emb.map(([a, b]) => [x(a), y(b)]));
  }

  // El mapa del vocabulario, que pasa de 2 a 3 dimensiones: con t = 0 es el mapa plano
  // (d1 a lo ancho, d2 a lo alto); con t = 1, la figura gira y cada punto sale del plano
  // hasta su d3.
  const pintarMapa3D = (function mapa3D(el, ancho, alto, rango) {
    if (!el) return () => {};
    const sx = (ancho / 2 - 60) / rango, sy = (alto / 2 - 40) / rango;
    // Devuelve [x, y] en pantalla y la cercanía (positiva = más cerca de quien mira).
    const proyectar = (x, y, z, t) => {
      const giro = -0.5 * t, inclina = 0.3 * t;
      const X = x * Math.cos(giro) - z * Math.sin(giro);
      const Z = x * Math.sin(giro) + z * Math.cos(giro);
      const Y = y * Math.cos(inclina) - Z * Math.sin(inclina);
      const cerca = Z * Math.cos(inclina) + y * Math.sin(inclina);
      return [ancho / 2 + X * sx * 0.9 ** t, alto / 2 - Y * sy * 0.9 ** t, cerca];
    };
    const plano = svg("polygon", { class: "plano-mapa" });
    el.appendChild(plano);
    const ejes = [[1.38, 0, 0], [0, 1.29, 0], [0, 0, 1.3]].map(() => el.appendChild(svg("line", { class: "eje-mapa" })));
    const nombres = ["d1", "d2", "d3"].map((n) => el.appendChild(svg("text", { class: "eje-texto" }, n)));
    const caidas = J.VOCABULARIO.map(() => el.appendChild(svg("line", { class: "caida" })));
    const sombras = J.VOCABULARIO.map(() => el.appendChild(svg("circle", { class: "sombra", r: 6 })));
    const puntos = J.VOCABULARIO.map((t) => {
      const g = svg("g", { class: "punto-token" });
      g.appendChild(svg("circle", { cx: 0, cy: 0, r: 11 }));
      g.appendChild(svg("text", { x: 18, y: 9 }, t));
      el.appendChild(g);
      return g;
    });
    const linea = (l, a, b) => { l.setAttribute("x1", a[0]); l.setAttribute("y1", a[1]); l.setAttribute("x2", b[0]); l.setAttribute("y2", b[1]); };
    return (t) => {
      const lado = 1.2;
      plano.setAttribute("points", [[-lado, -lado], [lado, -lado], [lado, lado], [-lado, lado]].map(([x, y]) => proyectar(x, y, 0, t).slice(0, 2).join(",")).join(" "));
      plano.style.opacity = t;
      linea(ejes[0], proyectar(-1.38, 0, 0, t), proyectar(1.38, 0, 0, t));
      linea(ejes[1], proyectar(0, -1.29, 0, t), proyectar(0, 1.29, 0, t));
      linea(ejes[2], proyectar(0, 0, -1.3 * t, t), proyectar(0, 0, 1.3 * t, t));
      ejes[2].style.opacity = t;
      const fin = [proyectar(1.27, 0, 0, t), proyectar(0, 1.2, 0, t), proyectar(0, 0, 1.3, t)];
      nombres.forEach((n, i) => { n.setAttribute("x", fin[i][0] + (i === 1 ? 22 : -8)); n.setAttribute("y", fin[i][1] - 10); });
      nombres[2].style.opacity = t;
      const pos = M0.embeddings.map(([x, y], k) => {
        const base = proyectar(x, y, 0, t), punto = proyectar(x, y, D3[k] * t, t);
        linea(caidas[k], base, punto);
        caidas[k].style.opacity = t;
        sombras[k].setAttribute("cx", base[0]);
        sombras[k].setAttribute("cy", base[1]);
        sombras[k].style.opacity = t;
        puntos[k].querySelector("circle").setAttribute("r", 11 * (1 + 0.3 * punto[2]));
        return punto;
      });
      colocarPuntos(puntos, pos);
    };
  })($("#mapa-juguete"), 640, 600, 1.2);
  pintarMapa3D(0);

  // Del azar al orden: el mismo mapa al azar y, tras entrenar, los tokens agrupados.
  // Las posiciones finales son ilustrativas (y así lo dice la pantalla).
  const ORDEN = { gato: [-0.35, 0.8], perro: [-0.7, 0.7], carne: [0.5, -0.65], pescado: [0.85, -0.45],
    come: [0.75, 0.6], el: [-0.75, -0.45], yo: [-0.45, -0.75], barco: [0.1, 0.05] };
  const EMB_ORDEN = J.VOCABULARIO.map((t) => ORDEN[t]);
  const pintarAzar = mapaTokens($("#mapa-azar"), 640, 600, [1.2, 1.2]);
  if (pintarAzar) pintarAzar(M0.embeddings);
  const pintarOrden = (function () {
    const el = $("#mapa-orden");
    if (!el) return () => {};
    const zonas = svg("g", { class: "zonas-orden" });
    [["animales", 205, 140, 120, 70], ["comida", 465, 418, 125, 70]].forEach(([n, cx, cy, rx, ry]) => {
      const z = svg("g", { class: "zona" });
      z.appendChild(svg("ellipse", { cx, cy, rx, ry }));
      z.appendChild(svg("text", { x: cx, y: cy - ry - 10 }, n));
      zonas.appendChild(z);
    });
    const pintar = mapaTokens(el, 640, 600, [1.2, 1.2]);
    el.insertBefore(zonas, el.firstChild);
    return (t) => {
      zonas.style.opacity = t;
      pintar(M0.embeddings.map((e, k) => [mezcla(e[0], EMB_ORDEN[k][0], t), mezcla(e[1], EMB_ORDEN[k][1], t)]));
    };
  })();
  pintarOrden(1);

  async function animar(ctx, duracion, pintar, desde = 0, hasta = 1) {
    const inicio = performance.now();
    while (ctx.vigente()) {
      const t = Math.min(1, (performance.now() - inicio) / duracion);
      pintar(mezcla(desde, hasta, suave(t)));
      if (t >= 1) break;
      await new Promise(requestAnimationFrame);
    }
  }
  const pintarMapaEntreno = mapaTokens($("#mapa-entreno-juguete"), 640, 400, [2.15, 1.5]);  // lo que llegan a moverse en las 40 vueltas

  // Antes → después de un paso, con los números que han cambiado resaltados.
  (function tablaCambios() {
    const el = $("#tabla-cambios");
    if (!el) return;
    // Si el cambio no llega a mover el segundo decimal, se enseña con tres: también cambia.
    const celda = (a, b) => {
      const d = Math.abs(a - b), cambia = d >= 0.0005, dec = d >= 0.005 ? 2 : 3;
      return `<td class="${cambia ? "cambia" : "igual"}">${fmt(a, dec)}${cambia ? ` → <b>${fmt(b, dec)}</b>` : ""}</td>`;
    };
    let html = "<tr><th>pieza</th><th>nº 1</th><th>nº 2</th><th>sesgo</th></tr>";
    // De la tabla solo cambia la fila del token de entrada; las demás, juntas en una línea.
    html += `<tr><td class="fila-nombre">fila «${J.VOCABULARIO[COME]}»</td>${celda(M0.embeddings[COME][0], M1.embeddings[COME][0])}${celda(M0.embeddings[COME][1], M1.embeddings[COME][1])}<td class="nada"></td></tr>`;
    html += `<tr><td class="fila-nombre">otras ${TOKENS - 1} filas</td><td class="igual" colspan="3">no estaban en la entrada: no se tocan</td></tr>`;
    ["A", "B"].forEach((n, j) => {
      html += `<tr><td class="fila-nombre">oculta ${n}</td>${celda(M0.pesos1[j][0], M1.pesos1[j][0])}${celda(M0.pesos1[j][1], M1.pesos1[j][1])}${celda(M0.sesgos1[j], M1.sesgos1[j])}</tr>`;
    });
    J.VOCABULARIO.forEach((t, k) => {
      html += `<tr><td class="fila-nombre">final «${t}»</td>${celda(M0.pesos2[k][0], M1.pesos2[k][0])}${celda(M0.pesos2[k][1], M1.pesos2[k][1])}${celda(M0.sesgos2[k], M1.sesgos2[k])}</tr>`;
    });
    el.innerHTML = html;
  })();

  function barrasJuguete(raiz, porcentajes) {
    raiz.querySelectorAll("#tabla-juguete-prob tr[data-tok]").forEach((tr) => {
      const v = porcentajes[Number(tr.dataset.tok)] * 100;
      tr.querySelector(".barra-prob i").style.setProperty("--v", v);
      tr.querySelector(".barra-prob span").textContent = fmt(v, 1) + " %";
    });
  }

  function pintarEntreno(raiz, m, vuelta) {
    $("#vuelta-juguete", raiz).textContent = vuelta;
    raiz.querySelectorAll(".ejemplo-juguete").forEach((el) => {
      const [t, e] = J.EJEMPLOS[Number(el.dataset.ej)];
      const v = J.predecir(m, t).porcentajes[e] * 100;
      el.querySelector(".barra-prob i").style.setProperty("--v", v);
      el.querySelector(".barra-prob span").textContent = fmt(v, 1) + " %";
    });
    pintarMapaEntreno(m.embeddings);
  }

  Charla.escena("juguete", async (ctx) => {
    barrasJuguete(ctx.el, ctx.beat === 6 ? J.predecir(M1, COME).porcentajes : PRED0[COME].porcentajes);
    if (ctx.beat < 7) { pintarEntreno(ctx.el, M0, 0); return; }
    if (ctx.beat > 7 || !ctx.animar) { pintarEntreno(ctx.el, MF, VUELTAS); return; }
    const m = J.copiar(M0);
    pintarEntreno(ctx.el, m, 0);
    await Charla.esperar(700);
    for (let v = 1; v <= VUELTAS; v++) {
      if (!ctx.vigente()) return;
      J.entrenarVuelta(m);
      pintarEntreno(ctx.el, m, v);
      await Charla.esperar(v < 10 ? 380 : 120);
    }
  });

  /* ------------------------------------------------------------------------
     Mapas de palabras
     ------------------------------------------------------------------------ */

  const PALABRAS = [
    // palabra, grupo, posición tras entrenar
    ["perro", "animal", 210, 170], ["gato", "animal", 300, 140], ["caballo", "animal", 250, 245],
    ["factura", "dinero", 720, 150], ["cobro", "dinero", 800, 225], ["IVA", "dinero", 660, 240],
    ["rey", "realeza", 250, 470], ["reina", "realeza", 380, 500],
    ["sofá", "casa", 700, 460], ["cama", "casa", 800, 520], ["silla", "casa", 640, 540],
  ];

  function mapa(el, semilla, conDestino) {
    if (!el) return;
    const r = Charla.azar(semilla);
    for (const [p, grupo, x1, y1] of PALABRAS) {
      const x0 = 80 + r() * 820, y0 = 70 + r() * 480;
      const g = svg("g", { class: `palabra movil ${conDestino ? grupo : ""}` });
      g.style.setProperty("--x0", `${x0}px`);
      g.style.setProperty("--y0", `${y0}px`);
      g.style.setProperty("--x1", `${x1}px`);
      g.style.setProperty("--y1", `${y1}px`);
      g.appendChild(svg("circle", { cx: 0, cy: 0, r: 9 }));
      g.appendChild(svg("text", { x: 0, y: 40 }, p));
      el.appendChild(g);
    }
  }
  mapa($("#mapa-entreno"), 11, true);

  /* ------------------------------------------------------------------------
     Atención: el coste, cada token contra todos
     ------------------------------------------------------------------------ */

  (function rejillaCoste() {
    const el = $("#rejilla-coste");
    if (!el) return;
    el.innerHTML = "<i></i>".repeat(24 * 24);
  })();

  // «el perro come»: los tres vectores de cada token (sin números) y nuestra red, con
  // sus pesos como líneas. Cerrada (beat 1), la red se desplaza hasta que su entrada
  // coincide con la fila de «come», como en la escena 4.
  (function diagramaAtencion() {
    const chips = $("#chips-qkv");
    if (!chips) return;
    // Lo que sale de las tres capas para cada token. Ilustrativo: el juguete no tiene
    // atención. Las cuentas de «Mirar» y «Mezclar» (en el HTML) salen de estos números.
    const QKV = [
      [[0.4, -0.3], [0.1, -0.2], [0.2, 0.1]],     // el:    consulta, clave, valor
      [[-0.6, 0.9], [0.5, 0.6], [0.8, -0.5]],     // perro
      [[1.0, 2.0], [0.3, 0.1], [-0.1, 0.3]],      // come
    ];
    [215, 385, 555].forEach((y, t) => {
      [["q", 385], ["k", 575], ["v", 765]].forEach(([cls, x], c) => {
        // las consultas de «el» y «perro» no se usan para «come»
        const g = svg("g", { class: `chip-qkv ${cls}${c === 0 && t < 2 ? " no-usada" : ""}${c === 0 && t === 2 ? " q-come" : ""}` });
        g.appendChild(svg("rect", { x: x - 80, y: y - 26, width: 160, height: 52, rx: 6 }));
        [-38, 38].forEach((dx, d) => {
          g.appendChild(svg("rect", { class: "celda", x: x + dx - 34, y: y - 18, width: 68, height: 36 }));
          g.appendChild(svg("text", { class: "num-qkv", x: x + dx, y: y + 8 }, fmt(QKV[t][c][d], 1)));
        });
        chips.appendChild(g);
      });
    });

    const pos = { e1: [1150, 543], e2: [1150, 567], A: [1205, 480], B: [1205, 630], jA: [1237, 480], jB: [1237, 630] };
    J.VOCABULARIO.forEach((_, k) => { pos["f" + k] = [1282, 130 + k * 70]; });
    const lineas = $("#red-atencion-lineas"), nodos = $("#red-atencion-nodos");
    const arista = (a, b, cls) => {
      const l = svg("line", { x1: pos[a][0], y1: pos[a][1], x2: pos[b][0], y2: pos[b][1], class: "arista " + cls });
      const w = pesoArista(M0, a, b);
      if (w !== null) Object.assign(l.style, estiloPeso(w));
      lineas.appendChild(l);
    };
    for (const a of ["e1", "e2"]) for (const b of ["A", "B"]) arista(a, b, "red");
    arista("A", "jA", "salida"); arista("B", "jB", "salida b");
    for (const a of ["jA", "jB"]) J.VOCABULARIO.forEach((_, k) => arista(a, "f" + k, "red"));
    nodos.appendChild(svg("circle", { cx: pos.A[0], cy: pos.A[1], r: 24, class: "nodo nucleo" }));
    nodos.appendChild(svg("circle", { cx: pos.B[0], cy: pos.B[1], r: 24, class: "nodo nucleo b" }));
    nodos.appendChild(svg("circle", { cx: pos.jA[0], cy: pos.jA[1], r: 6, class: "nodo union" }));
    nodos.appendChild(svg("circle", { cx: pos.jB[0], cy: pos.jB[1], r: 6, class: "nodo union b" }));
    J.VOCABULARIO.forEach((_, k) => nodos.appendChild(svg("circle", { cx: pos["f" + k][0], cy: pos["f" + k][1], r: 17, class: "nodo" + (k === GANA0 ? " gana" : "") })));

    // Un modelo de verdad: bloques [atención → capas], cada uno con sus propios pesos.
    // Dentro de la atención, cada token mira a todos; dentro de las capas, cada uno va por separado.
    const carriles = [215, 385, 555];
    const bloques = $("#bloques-reales");
    [[300, "bloque 1"], [540, "bloque 2"], [840, "último bloque"]].forEach(([x, nombre], b) => {
      const g = svg("g", { class: "bloque-real b" + (b + 1) });
      g.appendChild(svg("rect", { class: "marco", x, y: 150, width: 200, height: 470, rx: 14 }));
      g.appendChild(svg("text", { x: x + 100, y: 138, class: "pie" }, nombre));
      g.appendChild(svg("rect", { class: "atencion", x: x + 12, y: 168, width: 80, height: 434, rx: 10 }));
      for (const a of carriles) for (const c of carriles) g.appendChild(svg("line", { class: "mira", x1: x + 22, y1: a, x2: x + 82, y2: c }));
      g.appendChild(svg("text", { x: x + 52, y: 300, class: "rotulo-bloque", transform: `rotate(-90 ${x + 52} 300)` }, "atención"));
      g.appendChild(svg("rect", { class: "capas", x: x + 108, y: 168, width: 80, height: 434, rx: 10 }));
      for (const a of carriles) {
        g.appendChild(svg("circle", { class: "nodo nucleo", cx: x + 134, cy: a, r: 11 }));
        g.appendChild(svg("circle", { class: "nodo nucleo b", cx: x + 162, cy: a, r: 11 }));
      }
      g.appendChild(svg("text", { x: x + 148, y: 300, class: "rotulo-bloque capas-txt", transform: `rotate(-90 ${x + 148} 300)` }, "capas"));
      bloques.appendChild(g);
    });
    for (const a of carriles) bloques.appendChild(svg("text", { x: 790, y: a + 12, class: "puntos b2" }, "…"));
    bloques.appendChild(svg("text", { x: 790, y: 138, class: "pie b2" }, "decenas"));
    const final = $("#final-real");
    for (let k = 0; k < TOKENS; k++) {
      const y = 150 + k * 66;
      final.appendChild(svg("line", { class: "arista red", x1: 1090, y1: 555, x2: 1150, y2: y }));
      final.appendChild(svg("circle", { class: "nodo", cx: 1150, cy: y, r: 14 }));
    }
  })();

  Charla.escena("atencion", async (ctx) => {
    const celdas = [...ctx.el.querySelectorAll("#rejilla-coste i")];
    if (ctx.beat !== 10) { celdas.forEach((c) => c.classList.add("on")); return; }
    if (!ctx.animar) { celdas.forEach((c) => c.classList.add("on")); return; }
    celdas.forEach((c) => c.classList.remove("on"));
    for (let fila = 0; fila < 24; fila++) {
      await Charla.esperar(70);
      if (!ctx.vigente()) return;
      for (let c = 0; c < 24; c++) celdas[fila * 24 + c].classList.add("on");
    }
  });

  /* ------------------------------------------------------------------------
     Entrenar: barras de probabilidad
     ------------------------------------------------------------------------ */

  const INICIAL = { gato: 60, perro: 30, sofa: 5, factura: 5 };
  const PASOS = [
    ["perro", { gato: 52, perro: 40, sofa: 4, factura: 4 }],
    ["gato", { gato: 58, perro: 36, sofa: 3, factura: 3 }],
    ["perro", { gato: 50, perro: 45, sofa: 3, factura: 2 }],
    ["gato", { gato: 53, perro: 43, sofa: 2, factura: 2 }],
    ["perro", { gato: 48, perro: 48, sofa: 2, factura: 2 }],
    ["gato", { gato: 50, perro: 47, sofa: 2, factura: 1 }],
  ];
  const FINAL = { gato: 49, perro: 49, sofa: 1, factura: 1 };

  function ponerBarras(raiz, valores) {
    raiz.querySelectorAll("#tabla-prob tr[data-tok]").forEach((tr) => {
      const v = valores[tr.dataset.tok];
      tr.querySelector(".barra-prob i").style.setProperty("--v", v);
      tr.querySelector(".barra-prob span").textContent = `${v} %`;
    });
  }

  Charla.escena("escala", async (ctx) => {
    const contador = $("#frase-contador", ctx.el);
    const hueco = $(".hueco b", ctx.el);
        if (ctx.beat > 1 || !ctx.animar) {
      ponerBarras(ctx.el, FINAL);
      contador.textContent = "tras miles de frases: valen los dos";
      hueco.textContent = "gato / perro";
      return;
    }
    ponerBarras(ctx.el, INICIAL);
    let n = 1;
    for (const [esperado, valores] of PASOS) {
      n++;
      contador.textContent = `frase ${n}`;
      hueco.textContent = esperado;
      await Charla.esperar(450);
      if (!ctx.vigente()) return;
      ponerBarras(ctx.el, valores);
      await Charla.esperar(900);
      if (!ctx.vigente()) return;
    }
    contador.textContent = "tras miles de frases: valen los dos";
    hueco.textContent = "gato / perro";
    ponerBarras(ctx.el, FINAL);
  });

  /* ------------------------------------------------------------------------
     Generar: un token cada vez
     ------------------------------------------------------------------------ */

  const GENERACION = [
    [["gato", 60], ["perro", 30], ["sofá", 5], ["factura", 5]],
    [["y", 40], [".", 35], ["cuando", 15], ["por", 10]],
    [["se", 45], ["luego", 25], ["me", 20], ["factura", 10]],
    [["durmió", 55], ["fue", 30], ["comió", 10], ["IVA", 5]],
    [["en", 70], [".", 20], ["tranquilo", 8], ["rey", 2]],
    [["el", 80], ["la", 15], ["un", 4], ["cobro", 1]],
    [["sofá", 50], ["suelo", 30], ["jardín", 15], ["banco", 5]],
  ];
  const INICIO_TEXTO = "le di de comer al";

  function pintarCandidatos(el, lista, elegido) {
    el.innerHTML = lista.map(([t, p], i) =>
      `<div class="candidato ${i === elegido ? "elegido" : ""}"><span>${t}</span><span class="b"><i style="--v:${p}"></i></span><span class="p">${p} %</span></div>`).join("");
  }

  // La temperatura retoca los porcentajes antes de sortear: cada uno elevado a 1/T y
  // vuelto a repartir para que sumen 100. Baja, el favorito se lleva casi todo; alta,
  // se reparte más. Los porcentajes de partida son los ilustrativos de la lista.
  const TEMPERATURA = { 3: 0.5, 4: 2 };
  function conTemperatura(lista, t) {
    const pesos = lista.map(([, p]) => Math.pow(p, 1 / t));
    const total = pesos.reduce((a, b) => a + b, 0);
    return lista.map(([tok], i) => [tok, Math.round((pesos[i] / total) * 100)]);
  }

  Charla.escena("generar", async (ctx) => {
    const texto = $("#texto-generado", ctx.el);
    const cand = $("#candidatos", ctx.el);
    const palabras = GENERACION.map((l) => l[0][0]);

    if (!ctx.animar || ctx.beat !== 1) {
      texto.innerHTML = `${INICIO_TEXTO} ${palabras.join(" ")}`;
      const ultima = GENERACION[GENERACION.length - 1];
      const t = TEMPERATURA[ctx.beat];
      const lista = t ? conTemperatura(ultima, t) : ultima;
      // si ya están pintados, solo se mueven las barras (para que se vea el cambio)
      const filas = cand.querySelectorAll(".candidato");
      if (filas.length === lista.length) {
        filas.forEach((f, i) => {
          f.querySelector(".b i").style.setProperty("--v", lista[i][1]);
          f.querySelector(".p").textContent = `${lista[i][1]} %`;
        });
      } else pintarCandidatos(cand, lista, 0);
      return;
    }

    texto.innerHTML = `${INICIO_TEXTO} <span class="cursor"></span>`;
    let escrito = INICIO_TEXTO;
    for (const lista of GENERACION) {
      pintarCandidatos(cand, lista, -1);
      await Charla.esperar(700);
      if (!ctx.vigente()) return;
      // el "sorteo": pasa por varios candidatos y se queda en el primero
      const recorrido = [1, 2, 0, 3, 1, 0];
      for (const k of recorrido) {
        pintarCandidatos(cand, lista, k);
        await Charla.esperar(110);
        if (!ctx.vigente()) return;
      }
      escrito += " " + lista[0][0];
      texto.innerHTML = `${escrito.slice(0, escrito.length - lista[0][0].length)}<span class="nuevo">${lista[0][0]}</span> <span class="cursor"></span>`;
      await Charla.esperar(650);
      if (!ctx.vigente()) return;
    }
    texto.innerHTML = escrito;
  });

  /* ------------------------------------------------------------------------
     Para muestra, un botón
     ------------------------------------------------------------------------ */

  // Un 7 real del conjunto de prueba de MNIST (muestras/000.png), 28×28, de 0 a 1.
  const SIETE = "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.33,0.73,0.62,0.59,0.24,0.14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.87,1,1,1,1,0.95,0.78,0.78,0.78,0.78,0.78,0.78,0.78,0.78,0.67,0.2,0,0,0,0,0,0,0,0,0,0,0,0,0.26,0.45,0.28,0.45,0.64,0.89,1,0.88,1,1,1,0.98,0.9,1,1,0.55,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.07,0.26,0.05,0.26,0.26,0.26,0.23,0.08,0.93,1,0.42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.33,0.99,0.82,0.07,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.09,0.91,1,0.33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.51,1,0.93,0.17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.23,0.98,1,0.24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.52,1,0.73,0.02,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.04,0.8,0.97,0.23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.49,1,0.71,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.29,0.98,0.94,0.22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.07,0.87,1,0.65,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.01,0.8,1,0.86,0.14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.15,1,1,0.3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.12,0.88,1,0.45,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.52,1,1,0.2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.24,0.95,1,1,0.2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.47,1,1,0.86,0.16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.47,1,0.81,0.07,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0".split(",").map(Number);

  (function pixeles() {
    const el = $("#pixeles");
    if (!el) return;
    el.innerHTML = SIETE.map((v) => `<i style="--g:${Math.round(255 - v * 255)}"></i>`).join("");
  })();

  // Traza real de `python entrenar.py densa` (ejemplos/5.6-digitos/resultados.json)
  const EPOCAS = [
    { perdida: 0.3478, acierto: 94.37 },
    { perdida: 0.1596, acierto: 96.07 },
    { perdida: 0.1105, acierto: 96.98 },
    { perdida: 0.0823, acierto: 97.11 },
    { perdida: 0.0646, acierto: 97.25 },
  ];

  const CABECERA = [
    "imágenes de entrenamiento: 60,000",
    "imágenes de prueba:        10,000",
    "",
    "arquitectura: densa",
    "parámetros:   101,770",
    "",
  ];
  const lineaEpoca = (e, i) =>
    `época ${i + 1}/5  pérdida ${e.perdida.toFixed(4)}  acierto en prueba ${e.acierto.toFixed(2)}%  (5 s)`;
  const PIE = ["", "entrenamiento: 26 s en CPU", "acierto final en prueba: 97.25%", "modelo guardado en modelos/densa.onnx: 405 KB"];

  function pintarTraza(el, n, conPie) {
    const lineas = [...CABECERA, ...EPOCAS.slice(0, n).map(lineaEpoca)];
    if (conPie) lineas.push(...PIE);
    el.innerHTML = lineas.map((l) => l.startsWith("época") ? `<span class="claro">${l}</span>` :
      l.startsWith("acierto final") ? `<span class="verde">${l}</span>` : l).join("\n") +
      (conPie ? "" : "\n<span class=\"amarillo\">entrenando…</span>");
  }

  function pintarGrafica(el, n) {
    el.innerHTML = "";
    const x = (i) => 90 + i * 130;                       // época 1..5
    const yE = (v) => 400 - (v / 0.4) * 340;             // pérdida 0..0,4
    const yA = (v) => 400 - ((v - 90) / 10) * 340;       // acierto 90..100 %
    for (let k = 0; k <= 4; k++) {
      const y = 400 - k * 85;
      el.appendChild(svg("line", { x1: 70, y1: y, x2: 625, y2: y, class: "guia" }));
      el.appendChild(svg("text", { x: 60, y: y + 7, "text-anchor": "end", fill: "#c00000" }, fmt(k * 0.1, 1)));
      el.appendChild(svg("text", { x: 632, y: y + 7, "text-anchor": "start", fill: "#000080" }, `${90 + k * 2.5} %`.replace(".", ",")));
    }
    el.appendChild(svg("line", { x1: 70, y1: 400, x2: 625, y2: 400, class: "eje" }));
    EPOCAS.forEach((_, i) => el.appendChild(svg("text", { x: x(i), y: 435, "text-anchor": "middle" }, `${i + 1}`)));
    el.appendChild(svg("text", { x: 355, y: 30, "text-anchor": "middle", fill: "#c00000" }, "error medio"));
    el.appendChild(svg("text", { x: 355, y: 58, "text-anchor": "middle", fill: "#000080" }, "acierto en prueba"));
    if (n === 0) return;
    const ptsE = EPOCAS.slice(0, n).map((e, i) => `${x(i)},${yE(e.perdida)}`).join(" ");
    const ptsA = EPOCAS.slice(0, n).map((e, i) => `${x(i)},${yA(e.acierto)}`).join(" ");
    el.appendChild(svg("polyline", { points: ptsE, class: "error" }));
    el.appendChild(svg("polyline", { points: ptsA, class: "acierto" }));
    EPOCAS.slice(0, n).forEach((e, i) => {
      el.appendChild(svg("circle", { cx: x(i), cy: yE(e.perdida), r: 8, class: "punto-error" }));
      el.appendChild(svg("circle", { cx: x(i), cy: yA(e.acierto), r: 8, class: "punto-acierto" }));
    });
  }

  const SOLUCION = "0123456789";
  const LEIDOS = [
    "0125456789", "0125456789", "0125456789",
    "0123456789", "0123456781", "0123456789",
    "0123456789", "0123456489", "0123456789",
    "0123156789", "0123456781", "0123456789",
    "0123456789", "0123456789", "6123756781",
  ];

  (function numerosHoja() {
    const el = $("#numeros-hoja");
    if (!el) return;
    el.innerHTML = LEIDOS.map((n) => {
      const cifras = [...n].map((c, i) => c === SOLUCION[i] ? c : `<span class="fallo">${c}</span>`).join("");
      return `<span>→ ${cifras}${n === SOLUCION ? ' <span class="ok">✓</span>' : "  "}</span>`;
    }).join("");
  })();

  async function contar(el, hasta, ms, ctx) {
    const inicio = performance.now();
    while (true) {
      const t = Math.min(1, (performance.now() - inicio) / ms);
      el.textContent = Charla.numero(Math.round(hasta * (1 - Math.pow(1 - t, 3))));
      if (t >= 1 || !ctx.vigente()) break;
      await new Promise(requestAnimationFrame);
    }
    el.textContent = Charla.numero(hasta);
  }

  Charla.escena("boton", async (ctx) => {
    const cuenta = $("#cuenta-parametros", ctx.el);
    const traza = $("#traza-entreno", ctx.el);
    const grafica = $("#grafica-entreno", ctx.el);

    if (ctx.beat === 5 && ctx.animar) contar(cuenta, 101770, 1600, ctx);
    else cuenta.textContent = Charla.numero(101770);

    if (ctx.beat !== 7 || !ctx.animar) {
      pintarTraza(traza, 5, true);
      pintarGrafica(grafica, 5);
      return;
    }
    pintarTraza(traza, 0, false);
    pintarGrafica(grafica, 0);
    for (let n = 1; n <= 5; n++) {
      await Charla.esperar(1100);
      if (!ctx.vigente()) return;
      pintarTraza(traza, n, false);
      pintarGrafica(grafica, n);
    }
    await Charla.esperar(600);
    if (!ctx.vigente()) return;
    pintarTraza(traza, 5, true);
  });

  /* ------------------------------------------------------------------------
     LoRA: el modelo como bloques
     ------------------------------------------------------------------------ */

  (function bloques() {
    const el = $("#bloques-modelo");
    if (!el) return;
    el.innerHTML = "<i></i>".repeat(26 * 14) + '<i class="adaptador"></i>';
  })();
})();
