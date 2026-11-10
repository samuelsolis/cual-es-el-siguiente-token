// From words to tokens: split a text with a real tokenizer (o200k_base)
// and show each piece with its number.
//
// Usage (from the ejemplos/ folder):
//   node 1-tokenizador/tokenize.js "inteligencia artificial"
//   node 1-tokenizador/tokenize.js --file my-text.txt

var fs = require("fs");
var tokenizer = require("gpt-tokenizer/encoding/o200k_base");

function readText(args) {
  if (args[0] === "--file") {
    return fs.readFileSync(args[1], "utf8");
  }
  return args.join(" ");
}

function split(text) {
  var numbers = tokenizer.encode(text);
  var pieces = [];
  for (var i = 0; i < numbers.length; i++) {
    pieces.push({ number: numbers[i], text: tokenizer.decode([numbers[i]]) });
  }
  return pieces;
}

function show(pieces) {
  var line = [];
  for (var i = 0; i < pieces.length; i++) {
    line.push(pieces[i].text);
  }
  console.log("Trozos:  " + line.join(" | "));
  console.log("");
  for (var j = 0; j < pieces.length; j++) {
    // spaces are part of the token: they are shown as · so you can see them
    var visible = pieces[j].text.replace(/ /g, "·").replace(/\n/g, "\\n");
    console.log("  " + String(pieces[j].number).padStart(7) + "   " + visible);
  }
  console.log("");
  console.log("Total: " + pieces.length + " tokens.");
}

var text = readText(process.argv.slice(2));
if (!text) {
  console.log('Uso: node 1-tokenizador/tokenize.js "tu texto"');
  console.log("     node 1-tokenizador/tokenize.js --file tu-texto.txt");
  process.exit(1);
}
show(split(text));
