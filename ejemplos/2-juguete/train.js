// Train the toy model: create its numbers at random and correct them,
// round after round, with the training sentences.
//
// Usage (from the ejemplos/ folder):
//   node 2-juguete/train.js                                  (the data from the talk)
//   node 2-juguete/train.js --sentences my-sentences.txt     (your sentences)
// Options: --vocabulary file  --rounds 40  --seed 31  --rate 0.2
//
// Saves two models in 2-juguete/models/: the one before training and the trained one.

var fs = require("fs");
var path = require("path");
var model = require("./model.js");
var text = require("./text.js");

function readOptions(args) {
  var options = { rounds: 40, seed: 31, rate: 0.2 };
  for (var i = 0; i < args.length; i = i + 2) {
    options[args[i].replace(/^--/, "")] = args[i + 1];
  }
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
  var data = { vocabulary: m.vocabulary, embeddings: m.embeddings, weights1: m.weights1, biases1: m.biases1, weights2: m.weights2, biases2: m.biases2 };
  for (var key in extra) data[key] = extra[key];
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return path.relative(process.cwd(), file);
}

function generateText(m, start) {
  var numbers = model.generate(m, start, 3);
  var output = [];
  for (var i = 0; i < numbers.length; i++) output.push(m.vocabulary[numbers[i]]);
  return output.join(" ");
}

// How each example is doing: which percentage it gives to the right word.
function progress(m, examples) {
  var parts = [];
  for (var e = 0; e < examples.length; e++) {
    var p = model.predict(m, examples[e][0]).percentages[examples[e][1]];
    parts.push(m.vocabulary[examples[e][0]] + " → " + m.vocabulary[examples[e][1]] + " " + percent(p));
  }
  return parts.join("   ");
}

var options = readOptions(process.argv.slice(2));
var useTalkData = !options.sentences;
var sentences = text.lines(options.sentences || path.join(__dirname, "datos", "frases.txt"));
var vocabulary;
if (options.vocabulary) vocabulary = text.lines(options.vocabulary);
else if (useTalkData && fs.existsSync(path.join(__dirname, "datos", "vocabulario.txt"))) vocabulary = text.lines(path.join(__dirname, "datos", "vocabulario.txt"));
else vocabulary = text.vocabularyFromSentences(sentences);
var examples;
try {
  examples = text.examples(sentences, vocabulary);
} catch (error) {
  console.log(error.message + " Añádela al vocabulario o quita el fichero de vocabulario.");
  process.exit(1);
}
var start = vocabulary.indexOf(text.words(sentences[0])[0]);

console.log("Vocabulario (" + vocabulary.length + " palabras):");
for (var t = 0; t < vocabulary.length; t++) console.log("  " + t + "  " + vocabulary[t]);
console.log("Ejemplos de entrenamiento: " + examples.length + " (cada palabra y la que viene detrás).");

var m = model.create(vocabulary, options.seed);
console.log("");
console.log("Modelo nuevo, al azar: " + model.countParameters(m) + " números (semilla " + options.seed + ").");
console.log("  genera: " + generateText(m, start));
console.log("  guardado en " + save(m, "random.json", { seed: options.seed, rounds: 0 }));

console.log("");
console.log("Entrenando " + options.rounds + " vueltas (cada vuelta pasa una vez por todos los ejemplos):");
var shown = [1, 5, 10, 20, 40, 100, 200, 500, 1000];
for (var round = 1; round <= options.rounds; round++) {
  for (var e = 0; e < examples.length; e++) model.trainStep(m, examples[e][0], examples[e][1], options.rate);
  if (shown.indexOf(round) !== -1 || round === options.rounds) {
    console.log("  vuelta " + String(round).padStart(4) + "   " + progress(m, examples));
  }
}

console.log("");
console.log("Modelo entrenado: los mismos " + model.countParameters(m) + " números, ajustados.");
console.log("  genera: " + generateText(m, start));
console.log("  guardado en " + save(m, "trained.json", { seed: options.seed, rounds: options.rounds, rate: options.rate }));
