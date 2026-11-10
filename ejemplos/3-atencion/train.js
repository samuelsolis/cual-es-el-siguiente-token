// Train the toy with attention: create its numbers at random and correct them,
// round after round, with the training sentences.
//
// Usage (from the ejemplos/ folder):
//   node 3-atencion/train.js                                 (the data from the talk)
//   node 3-atencion/train.js --sentences my-sentences.txt    (your sentences)
// Options: --vocabulary file  --size 2  --rounds 200  --seed 31  --rate 0.1
//
// Saves two models in 3-atencion/models/: the one before training and the trained one.

var fs = require("fs");
var path = require("path");
var model = require("./model.js");
var text = require("./text.js");

function readOptions(args) {
  var options = { size: 2, rounds: 200, seed: 31, rate: 0.1 };
  for (var i = 0; i < args.length; i = i + 2) {
    options[args[i].replace(/^--/, "")] = args[i + 1];
  }
  options.size = Number(options.size);
  options.rounds = Number(options.rounds);
  options.seed = Number(options.seed);
  options.rate = Number(options.rate);
  return options;
}

function percent(p) {
  return (p * 100).toFixed(1).replace(".", ",") + " %";
}

function save(m, name, extra) {
  var folder = path.join(__dirname, "models");
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);
  var file = path.join(folder, name);
  var data = JSON.parse(JSON.stringify(m));
  for (var key in extra) data[key] = extra[key];
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return path.relative(process.cwd(), file);
}

function toWords(m, numbers) {
  var output = [];
  for (var i = 0; i < numbers.length; i++) output.push(m.vocabulary[numbers[i]]);
  return output.join(" ");
}

// How each sentence is doing: which percentage it gives to its last word with everything before it.
function progress(m, sentences) {
  var parts = [];
  for (var i = 0; i < sentences.length; i++) {
    var s = sentences[i];
    var p = model.predict(m, s.slice(0, s.length - 1)).outputs[s.length - 2][s[s.length - 1]];
    parts.push(toWords(m, s.slice(0, s.length - 1)) + " → " + m.vocabulary[s[s.length - 1]] + " " + percent(p));
  }
  return parts.join("   ");
}

function blewUp(m, sentences) {
  var p = model.predict(m, sentences[0]).outputs[0];
  for (var k = 0; k < p.length; k++) {
    if (isNaN(p[k])) return true;
  }
  return false;
}

var options = readOptions(process.argv.slice(2));
var useTalkData = !options.sentences;
var lines = text.lines(options.sentences || path.join(__dirname, "datos", "frases.txt"));
var vocabulary;
if (options.vocabulary) vocabulary = text.lines(options.vocabulary);
else if (useTalkData && fs.existsSync(path.join(__dirname, "datos", "vocabulario.txt"))) vocabulary = text.lines(path.join(__dirname, "datos", "vocabulario.txt"));
else vocabulary = text.vocabularyFromSentences(lines);
var sentences;
try {
  sentences = text.sentencesAsNumbers(lines, vocabulary);
} catch (error) {
  console.log(error.message + " Añádela al vocabulario o quita el fichero de vocabulario.");
  process.exit(1);
}

console.log("Vocabulario (" + vocabulary.length + " palabras): " + vocabulary.join(", "));
console.log("Frases de entrenamiento: " + sentences.length + ".");

var m = model.create(vocabulary, options.size, options.seed);
console.log("");
console.log("Modelo nuevo, al azar: " + model.countParameters(m) + " números (" + options.size + " por palabra, semilla " + options.seed + ").");
var list = model.pieces(m);
for (var p = 0; p < list.length; p++) {
  var count = 0;
  for (var r = 0; r < list[p][1].length; r++) count = count + list[p][1][r].length;
  console.log("  " + list[p][0].padEnd(20) + count);
}
console.log("  guardado en " + save(m, "random.json", { seed: options.seed, rounds: 0 }));

console.log("");
console.log("Entrenando " + options.rounds + " vueltas (cada vuelta pasa una vez por todas las frases):");
var shown = [1, 10, 20, 50, 100, 200, 500, 1000, 2000];
for (var round = 1; round <= options.rounds; round++) {
  for (var i = 0; i < sentences.length; i++) model.trainSentence(m, sentences[i], options.rate);
  if (blewUp(m, sentences)) {
    console.log("");
    console.log("En la vuelta " + round + " los números se han disparado: las correcciones son demasiado grandes.");
    console.log("Prueba con una tasa más pequeña (--rate 0.05) o con otra semilla (--seed).");
    process.exit(1);
  }
  if (shown.indexOf(round) !== -1 || round === options.rounds) {
    console.log("  vuelta " + String(round).padStart(4) + "   " + progress(m, sentences));
  }
}

console.log("");
console.log("Modelo entrenado: los mismos " + model.countParameters(m) + " números, ajustados.");
console.log("  guardado en " + save(m, "trained.json", { seed: options.seed, rounds: options.rounds, rate: options.rate }));
console.log("");
console.log("Pruébalo: node 3-atencion/generate.js trained \"" + lines[0].split(/\s+/).slice(0, -1).join(" ") + "\"");
