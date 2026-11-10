// Generate text with the toy with attention: what is the next word?
// At each step it shows the percentages and, also, who the last word looks at.
// Generating does not change a single number of the model: it only reads it.
//
// Usage (from the ejemplos/ folder, after training):
//   node 3-atencion/generate.js trained "el perro come"
//   node 3-atencion/generate.js trained "el gato come"
//   node 3-atencion/generate.js random "el perro come"
//   node 3-atencion/generate.js trained el --words 3

var fs = require("fs");
var path = require("path");
var model = require("./model.js");

function load(name) {
  var file = name;
  if (name === "random" || name === "trained") file = path.join(__dirname, "models", name + ".json");
  if (!fs.existsSync(file)) {
    console.log("No encuentro " + file + ". Entrena antes: node 3-atencion/train.js");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function percent(p) {
  return ((p * 100).toFixed(1) + " %").replace(".", ",");
}

function top(m, list) {
  var order = [];
  for (var k = 0; k < list.length; k++) order.push(k);
  order.sort(function (a, b) { return list[b] - list[a]; });
  var parts = [];
  for (var i = 0; i < 3 && i < order.length; i++) parts.push(m.vocabulary[order[i]] + " " + percent(list[order[i]]));
  return parts.join(", ");
}

var args = process.argv.slice(2);
var m = load(args[0] || "trained");
var input = (args[1] || "el perro come").toLowerCase().split(/\s+/);
var count = args[2] === "--words" ? Number(args[3]) : 1;

var sentence = [];
for (var i = 0; i < input.length; i++) {
  var n = m.vocabulary.indexOf(input[i]);
  if (n === -1) {
    console.log("«" + input[i] + "» no está en el vocabulario: " + m.vocabulary.join(", "));
    process.exit(1);
  }
  sentence.push(n);
}

for (var step = 0; step < count; step++) {
  var f = model.predict(m, sentence);
  var last = sentence.length - 1;
  var looksAt = [];
  for (var u = 0; u <= last; u++) looksAt.push(m.vocabulary[sentence[u]] + " " + percent(f.looks[last][u]));
  var next = model.mostLikely(f.outputs[last]);
  console.log("«" + m.vocabulary[sentence[last]] + "» mira a:  " + looksAt.join(", "));
  console.log("  siguiente:  " + top(m, f.outputs[last]) + "   → " + m.vocabulary[next]);
  sentence.push(next);
}
var words = [];
for (var j = 0; j < sentence.length; j++) words.push(m.vocabulary[sentence[j]]);
console.log("");
console.log(words.join(" "));
