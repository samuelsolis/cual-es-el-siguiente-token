// Recorre la presentación entera con el teclado (adelante y atrás), prueba la ventana del
// presentador y lista errores de consola. Uso: node --experimental-websocket herramientas/recorrer.mjs /tmp/perfil-chrome
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
const pres = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), "..", "index.html")).href;
const chrome = spawn("google-chrome", ["--headless=new", "--remote-debugging-port=9333", "--window-size=1920,1080",
  "--user-data-dir=" + process.argv[2], "about:blank"], { stdio: "ignore" });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
await esperar(1500);
let id = 0; const pend = new Map(); const errores = [];
async function conectar(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  ws.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
    if (m.method === "Runtime.exceptionThrown") errores.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errores.push(m.params.args.map(a => a.value || a.description).join(" "));
  });
  const enviar = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  return { ws, enviar };
}
const lista = await (await fetch("http://127.0.0.1:9333/json")).json();
const pag = lista.find((t) => t.type === "page");
const { enviar } = await conectar(pag.webSocketDebuggerUrl);
await enviar("Runtime.enable");
await enviar("Page.enable");
await enviar("Page.navigate", { url: pres + "#1.1" });
await esperar(1500);
const evaluar = async (expr) => (await enviar("Runtime.evaluate", { expression: expr, returnByValue: true })).result.result.value;
const tecla = async (key, code, kc) => {
  await enviar("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: kc });
  await enviar("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: kc });
};
const res = {};
for (let i = 0; i < 7; i++) { await tecla("ArrowRight", "ArrowRight", 39); await esperar(150); }
res.trasSieteDerecha = await evaluar("location.hash");
await tecla("ArrowLeft", "ArrowLeft", 37); await esperar(150);
res.trasIzquierda = await evaluar("location.hash");
res.beatsPorEscena = await evaluar("[...document.querySelectorAll('.escena')].map(e=>e.dataset.id).join(',')");
// recorrer la charla entera hacia delante contando beats
await enviar("Page.navigate", { url: pres + "#1.1" }); await esperar(1200);
let pasos = 0, ultimo = "";
while (pasos < 200) { await tecla("ArrowRight", "ArrowRight", 39); await esperar(40); const h = await evaluar("location.hash"); if (h === ultimo) break; ultimo = h; pasos++; }
res.beatsTotales = pasos + 1; res.ultimoHash = ultimo;
// hacia atrás hasta el principio
let atras = 0; while (atras < 200) { await tecla("ArrowLeft", "ArrowLeft", 37); await esperar(40); const h = await evaluar("location.hash"); if (h === "#1.1") break; atras++; }
res.vueltaAtras = await evaluar("location.hash");
// presentador
await enviar("Page.navigate", { url: pres + "#5.4" }); await esperar(1200);
await tecla("p", "KeyP", 80); await esperar(2500);
const lista2 = await (await fetch("http://127.0.0.1:9333/json")).json();
const p2 = lista2.find((t) => t.type === "page" && t.url.includes("presentador.html"));
if (p2) {
  const c2 = await conectar(p2.webSocketDebuggerUrl);
  const ev2 = async (e) => (await c2.enviar("Runtime.evaluate", { expression: e, returnByValue: true })).result.result.value;
  res.presentadorPosicion = await ev2("document.getElementById('posicion').textContent");
  res.presentadorNota = (await ev2("document.getElementById('nota').textContent")).slice(0, 60);
  await c2.enviar("Runtime.evaluate", { expression: "document.getElementById('b-siguiente').click()" });
  await esperar(800);
  res.principalTrasBotonPresentador = await evaluar("location.hash");
  res.presentadorPosicion2 = await ev2("document.getElementById('posicion').textContent");
} else res.presentador = "no se abrió";
res.errores = errores;
console.log(JSON.stringify(res, null, 2));
chrome.kill();
process.exit(0);
