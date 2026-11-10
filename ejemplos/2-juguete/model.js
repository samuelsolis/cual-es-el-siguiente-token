// The toy model from the talk: a real language model, only very small.
//
//   word → its row in the table (2 numbers) → hidden layer (2 neurons)
//        → output layer (one neuron per word in the vocabulary) → percentages
//
// It only looks at the last word to guess the next one (no attention).
// Every number starts at random and training keeps correcting them.

var NUMBERS_PER_WORD = 2;   // size of each row in the embedding table
var HIDDEN_NEURONS = 2;     // neurons in the hidden layer

// Random numbers, but always the same ones for the same seed.
function random(seed) {
  var a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A neuron: each input times its weight, all added up, plus the bias.
function neuron(inputs, weights, bias) {
  var sum = 0;
  for (var i = 0; i < inputs.length; i++) {
    sum = sum + inputs[i] * weights[i];
  }
  return sum + bias;
}

// A layer: several neurons with the same inputs and different weights.
function layer(inputs, weights, biases) {
  var outputs = [];
  for (var n = 0; n < weights.length; n++) {
    outputs.push(neuron(inputs, weights[n], biases[n]));
  }
  return outputs;
}

// From scores to percentages that add up to 100 % (softmax).
function percentages(scores) {
  var max = Math.max.apply(null, scores);
  var exponentials = [];
  var total = 0;
  for (var i = 0; i < scores.length; i++) {
    exponentials.push(Math.exp(scores[i] - max));
    total = total + exponentials[i];
  }
  for (var j = 0; j < exponentials.length; j++) {
    exponentials[j] = exponentials[j] / total;
  }
  return exponentials;
}

// A new model: every number at random, between −1 and 1, with two decimals.
function create(vocabulary, seed) {
  var r = random(seed);
  function n() { return Math.round((r() * 2 - 1) * 100) / 100; }
  function row(size) {
    var values = [];
    for (var i = 0; i < size; i++) values.push(n());
    return values;
  }
  var m = { vocabulary: vocabulary, embeddings: [], weights1: [], biases1: [], weights2: [], biases2: [] };
  for (var t = 0; t < vocabulary.length; t++) m.embeddings.push(row(NUMBERS_PER_WORD));
  for (var j = 0; j < HIDDEN_NEURONS; j++) m.weights1.push(row(NUMBERS_PER_WORD));
  m.biases1 = row(HIDDEN_NEURONS);
  for (var k = 0; k < vocabulary.length; k++) m.weights2.push(row(HIDDEN_NEURONS));
  m.biases2 = row(vocabulary.length);
  return m;
}

// How many numbers the model has: that is the model.
function countParameters(m) {
  var total = 0;
  var pieces = [m.embeddings, m.weights1, [m.biases1], m.weights2, [m.biases2]];
  for (var p = 0; p < pieces.length; p++) {
    for (var r = 0; r < pieces[p].length; r++) total = total + pieces[p][r].length;
  }
  return total;
}

// Forward: word (its number) → its row → hidden layer → output layer → percentages.
function predict(m, word) {
  var input = m.embeddings[word];
  var hidden = layer(input, m.weights1, m.biases1);
  var scores = layer(hidden, m.weights2, m.biases2);
  return { input: input, hidden: hidden, scores: scores, percentages: percentages(scores) };
}

// One training step: generate, compare with what was expected and correct
// a little bit everything that took part, from the back to the front.
function trainStep(m, word, expected, rate) {
  var f = predict(m, word);
  var i, j, k;

  // error at the output: generated − expected (100 % for the right word, 0 % for the rest)
  var error = [];
  for (k = 0; k < f.percentages.length; k++) {
    error.push(f.percentages[k] - (k === expected ? 1 : 0));
  }

  // blame that reaches each neuron of the hidden layer (before touching anything)
  var hiddenBlame = [];
  for (j = 0; j < HIDDEN_NEURONS; j++) {
    hiddenBlame.push(0);
    for (k = 0; k < error.length; k++) hiddenBlame[j] = hiddenBlame[j] + error[k] * m.weights2[k][j];
  }
  // blame that reaches the row of the input word
  var inputBlame = [];
  for (i = 0; i < NUMBERS_PER_WORD; i++) {
    inputBlame.push(0);
    for (j = 0; j < HIDDEN_NEURONS; j++) inputBlame[i] = inputBlame[i] + hiddenBlame[j] * m.weights1[j][i];
  }

  // correction = rate × error × whatever is on the other side of the multiplication
  for (k = 0; k < error.length; k++) {
    for (j = 0; j < HIDDEN_NEURONS; j++) m.weights2[k][j] = m.weights2[k][j] - rate * error[k] * f.hidden[j];
    m.biases2[k] = m.biases2[k] - rate * error[k];
  }
  for (j = 0; j < HIDDEN_NEURONS; j++) {
    for (i = 0; i < NUMBERS_PER_WORD; i++) m.weights1[j][i] = m.weights1[j][i] - rate * hiddenBlame[j] * f.input[i];
    m.biases1[j] = m.biases1[j] - rate * hiddenBlame[j];
  }
  // only the row of the input word changes in the table
  for (i = 0; i < NUMBERS_PER_WORD; i++) m.embeddings[word][i] = m.embeddings[word][i] - rate * inputBlame[i];
}

// The word with the highest percentage.
function mostLikely(list) {
  var best = 0;
  for (var k = 1; k < list.length; k++) {
    if (list[k] > list[best]) best = k;
  }
  return best;
}

// Generate: start from a word and always pick the most likely one.
// Generating does not change a single number of the model.
function generate(m, start, count) {
  var output = [start];
  for (var n = 0; n < count; n++) {
    var p = predict(m, output[output.length - 1]).percentages;
    output.push(mostLikely(p));
  }
  return output;
}

module.exports = {
  create: create, countParameters: countParameters, predict: predict,
  trainStep: trainStep, generate: generate, mostLikely: mostLikely,
  neuron: neuron, layer: layer, percentages: percentages,
};
