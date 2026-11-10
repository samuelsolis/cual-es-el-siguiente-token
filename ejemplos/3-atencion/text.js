// Reading the sentences and the vocabulary from the text files.

var fs = require("fs");

// The lines with content, skipping the ones that start with #.
function lines(file) {
  var all = fs.readFileSync(file, "utf8").split("\n");
  var useful = [];
  for (var i = 0; i < all.length; i++) {
    var line = all[i].trim().toLowerCase();
    if (line !== "" && line.charAt(0) !== "#") useful.push(line);
  }
  return useful;
}

// One word = one token: split on spaces.
function words(sentence) {
  return sentence.split(/\s+/);
}

// Without a vocabulary file, the words of the sentences in the order they appear.
function vocabularyFromSentences(sentences) {
  var vocabulary = [];
  for (var i = 0; i < sentences.length; i++) {
    var w = words(sentences[i]);
    for (var j = 0; j < w.length; j++) {
      if (vocabulary.indexOf(w[j]) === -1) vocabulary.push(w[j]);
    }
  }
  return vocabulary;
}

// The training examples: each word and the one after it, as numbers.
function examples(sentences, vocabulary) {
  var list = [];
  for (var i = 0; i < sentences.length; i++) {
    var w = words(sentences[i]);
    for (var j = 0; j < w.length - 1; j++) {
      var current = vocabulary.indexOf(w[j]);
      var next = vocabulary.indexOf(w[j + 1]);
      if (current === -1 || next === -1) {
        throw new Error("La palabra «" + (current === -1 ? w[j] : w[j + 1]) + "» no está en el vocabulario.");
      }
      list.push([current, next]);
    }
  }
  return list;
}

// The sentences as lists of word numbers (for the attention model, which sees the whole sentence).
function sentencesAsNumbers(sentences, vocabulary) {
  var list = [];
  for (var i = 0; i < sentences.length; i++) {
    var w = words(sentences[i]);
    var numbers = [];
    for (var j = 0; j < w.length; j++) {
      var n = vocabulary.indexOf(w[j]);
      if (n === -1) throw new Error("La palabra «" + w[j] + "» no está en el vocabulario.");
      numbers.push(n);
    }
    list.push(numbers);
  }
  return list;
}

module.exports = {
  lines: lines, words: words, vocabularyFromSentences: vocabularyFromSentences,
  examples: examples, sentencesAsNumbers: sentencesAsNumbers,
};
