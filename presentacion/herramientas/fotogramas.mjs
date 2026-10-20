// Captura animaciones a mitad: navega a un beat, avanza y fotografía tras unos ms.
// Uso: node --experimental-websocket herramientas/fotogramas.mjs /tmp/perfil-chrome carpeta_salida
// Edita la lista [desde, nombre, ms] para elegir qué transiciones capturar.
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
const pres = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), "..", "index.html")).href;
const out = process.argv[3];
const chrome = spawn("google-chrome", ["--headless=new", "--remote-debugging-port=9334", "--window-size=1920,1080",
  "--user-data-dir=" + process.argv[2], "about:blank"], { stdio: "ignore" });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
await esperar(1500);
let id = 0; const pend = new Map();
async function conectar(u) {
  const ws = new WebSocket(u); await new Promise((r) => ws.addEventListener("open", r));
  ws.addEventListener("message", (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
  return (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
}
const pag = (await (await fetch("http://127.0.0.1:9334/json")).json()).find((t) => t.type === "page");
const enviar = await conectar(pag.webSocketDebuggerUrl);
await enviar("Page.enable");
await enviar("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
const foto = async (n) => { const r = await enviar("Page.captureScreenshot", { format: "png" }); writeFileSync(`${out}/${n}.png`, Buffer.from(r.result.data, "base64")); };
const der = async () => { await enviar("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 }); await enviar("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 }); };
for (const [desde, n, ms] of [["3.8", "b-3.9", 700], ["3.10", "b-3.11", 900], ["4.6", "b-4.7", 3000], ["5.8", "b-6.1", 3000]]) {
  await enviar("Page.navigate", { url: pres + "#" + desde }); await esperar(1200);
  await der(); await esperar(ms); await foto(n);
}
chrome.kill(); process.exit(0);
