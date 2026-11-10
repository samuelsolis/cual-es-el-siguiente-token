// Generate text with a saved model: what is the next word?
// At each step it shows the percentages and picks the most likely word.
// Generating does not change a single number of the model: it only reads it.
//
// Usage (from the ejemplos/ folder, after training):
//   node 2-juguete/generate.js random el
//   node 2-juguete/generate.js trained el
//   node 2-juguete/generate.js trained el --words 5
//   node 2-juguete/generate.js my-model.json el

var fs = require("fs");
var path = require("path");
var model = require("./model.js");

function load(name) {
  var file = name;
  if (name === "random" || name === "trained") file = path.join(__dirname, "models", name + ".json");
  if (!fs.existsSync(file)) {
    console.log("No encuentro " + file + ". Entrena antes: node 2-juguete/train.js");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function percent(p) {
  return ((p * 100).toFixed(1) + " %").replace(".", ",");
}

// The three words with the highest percentage.
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
var firstWord = (args[1] || "el").toLowerCase();
var count = args[2] === "--words" ? Number(args[3]) : 3;
var current = m.vocabulary.indexOf(firstWord);
if (current === -1) {
  console.log("«" + firstWord + "» no está en el vocabulario: " + m.vocabulary.join(", "));
  process.exit(1);
}

var output = [firstWord];
for (var n = 0; n < count; n++) {
  var p = model.predict(m, current).percentages;
  var next = model.mostLikely(p);
  console.log("después de «" + m.vocabulary[current] + "»:  " + top(m, p) + "   → " + m.vocabulary[next]);
  output.push(m.vocabulary[next]);
  current = next;
}
console.log("");
console.log(output.join(" "));
