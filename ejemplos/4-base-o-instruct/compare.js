// Capability and form: the same model before and after fine-tuning.
//   - llama3.2:3b-text-q4_K_M → pre-trained only (the base model): it continues the text.
//   - llama3.2:3b             → with supervised fine-tuning and preferences (instruct): it answers.
// Both get the same input and we compare what comes out.
//
// Usage (from the ejemplos/ folder, with Ollama running and both models downloaded):
//   node 4-base-o-instruct/compare.js                      (the examples from the talk)
//   node 4-base-o-instruct/compare.js "whatever you want"  (your text)

var OLLAMA = process.env.OLLAMA_URL || "http://localhost:11434";
var BASE = process.env.BASE_MODEL || "llama3.2:3b-text-q4_K_M";
var INSTRUCT = process.env.INSTRUCT_MODEL || "llama3.2:3b";

// Temperature 0: it always picks the most likely token, so the output is always the same.
var OPTIONS = { temperature: 0, num_predict: 60 };

var EXAMPLES = [
  "¿Cuál es la capital de Francia?",
  "La capital de Francia es",
  "Pregunta: ¿Cuál es la capital de Francia?\nRespuesta:",
  "¿Qué come el perro?",
];

async function call(route, body) {
  var response = await fetch(OLLAMA + route, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Ollama answered " + response.status + ": " + (await response.text()));
  }
  return response.json();
}

// The base model gets the text as is (raw): no conversation marks. It only continues.
async function continueWithBase(input) {
  var r = await call("/api/generate", { model: BASE, prompt: input, raw: true, stream: false, options: OPTIONS });
  return r.response;
}

// The instruct model gets it as a conversation: Ollama adds the user and assistant
// turn marks it was fine-tuned with.
async function askInstruct(input) {
  var r = await call("/api/chat", { model: INSTRUCT, messages: [{ role: "user", content: input }], stream: false, options: OPTIONS });
  return r.message.content;
}

function indent(input) {
  return "    " + input.trim().split("\n").join("\n    ");
}

async function compare(input) {
  console.log("══ «" + input + "»");
  console.log("");
  console.log("  base (" + BASE + "), continúa:");
  console.log(indent(input + (await continueWithBase(input))));
  console.log("");
  console.log("  instruct (" + INSTRUCT + "), responde:");
  console.log(indent(await askInstruct(input)));
  console.log("");
}

async function main() {
  var own = process.argv.slice(2);
  var inputs = own.length > 0 ? [own.join(" ")] : EXAMPLES;
  try {
    for (var i = 0; i < inputs.length; i++) {
      await compare(inputs[i]);
    }
  } catch (error) {
    console.log("No he podido hablar con Ollama en " + OLLAMA + ".");
    console.log("¿Está en marcha y con los dos modelos descargados? Mira el README.");
    console.log("(" + error.message + ")");
    process.exit(1);
  }
}

main();
