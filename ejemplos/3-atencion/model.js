// The toy with attention: the same model from the talk, with the step from scene 6 in the middle.
//
//   rows of the table → attention → hidden layer → output layer → percentages
//
// Attention (a single block, simplified as in the talk: no normalization):
//   - each row goes through three layers: query (what I look for), key (what I offer),
//     value (what I contribute);
//   - look: my query × the key of each previous word (and mine), divided by the square root
//     of how many numbers each row has (the scaling of real models) → percentages;
//   - mix: my row + each value times its percentage.
// Each word only looks back: at the previous ones and at itself.

var HIDDEN_NEURONS = 2;

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

function neuron(inputs, weights, bias) {
  var sum = 0;
  for (var i = 0; i < inputs.length; i++) {
    sum = sum + inputs[i] * weights[i];
  }
  return sum + bias;
}

function layer(inputs, weights, biases) {
  var outputs = [];
  for (var n = 0; n < weights.length; n++) {
    outputs.push(neuron(inputs, weights[n], biases[n]));
  }
  return outputs;
}

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

function zeros(size) {
  var values = [];
  for (var i = 0; i < size; i++) values.push(0);
  return values;
}

function zeroTable(rows, columns) {
  var table = [];
  for (var i = 0; i < rows; i++) table.push(zeros(columns));
  return table;
}

// A new model: every number at random, between −1 and 1, with two decimals.
// size = how many numbers each row of the table has (and each query, key and value).
function create(vocabulary, size, seed) {
  var r = random(seed);
  function n() { return Math.round((r() * 2 - 1) * 100) / 100; }
  function row(length) {
    var values = [];
    for (var i = 0; i < length; i++) values.push(n());
    return values;
  }
  function table(rows, columns) {
    var t = [];
    for (var i = 0; i < rows; i++) t.push(row(columns));
    return t;
  }
  return {
    vocabulary: vocabulary,
    size: size,
    embeddings: table(vocabulary.length, size),
    query: { weights: table(size, size), biases: row(size) },
    key: { weights: table(size, size), biases: row(size) },
    value: { weights: table(size, size), biases: row(size) },
    weights1: table(HIDDEN_NEURONS, size), biases1: row(HIDDEN_NEURONS),
    weights2: table(vocabulary.length, HIDDEN_NEURONS), biases2: row(vocabulary.length),
  };
}

// Every piece that is learned, as lists of rows: [name shown on screen, rows].
function pieces(m) {
  return [
    ["tabla de embeddings", m.embeddings],
    ["consulta", m.query.weights.concat([m.query.biases])],
    ["clave", m.key.weights.concat([m.key.biases])],
    ["valor", m.value.weights.concat([m.value.biases])],
    ["capa oculta", m.weights1.concat([m.biases1])],
    ["capa final", m.weights2.concat([m.biases2])],
  ];
}

function countParameters(m) {
  var total = 0;
  var list = pieces(m);
  for (var p = 0; p < list.length; p++) {
    for (var r = 0; r < list[p][1].length; r++) total = total + list[p][1][r].length;
  }
  return total;
}

// Forward, with the whole sentence (a list of word numbers).
// For each position: its row, its query, key and value, who it looks at, the mix,
// the hidden layer and the percentages for the next word.
function predict(m, sentence) {
  var rows = [], queries = [], keys = [], values = [];
  var t, u, d;
  for (t = 0; t < sentence.length; t++) {
    rows.push(m.embeddings[sentence[t]]);
    queries.push(layer(rows[t], m.query.weights, m.query.biases));
    keys.push(layer(rows[t], m.key.weights, m.key.biases));
    values.push(layer(rows[t], m.value.weights, m.value.biases));
  }
  var looks = [], mixes = [], hiddens = [], outputs = [];
  for (t = 0; t < sentence.length; t++) {
    // look: my query against the key of each word up to me (a neuron without bias).
    // Divided by the square root of the size: with long rows the scores blow up,
    // the percentages become all or nothing and the model stops learning.
    var scale = Math.sqrt(m.size);
    var scores = [];
    for (u = 0; u <= t; u++) scores.push(neuron(queries[t], keys[u], 0) / scale);
    var share = percentages(scores);
    // mix: my row + each value times its percentage
    var mix = rows[t].slice();
    for (u = 0; u <= t; u++) {
      for (d = 0; d < m.size; d++) mix[d] = mix[d] + share[u] * values[u][d];
    }
    var hidden = layer(mix, m.weights1, m.biases1);
    looks.push(share);
    mixes.push(mix);
    hiddens.push(hidden);
    outputs.push(percentages(layer(hidden, m.weights2, m.biases2)));
  }
  return { sentence: sentence, rows: rows, queries: queries, keys: keys, values: values,
           looks: looks, mixes: mixes, hiddens: hiddens, outputs: outputs };
}

// One training step with a whole sentence: at each position, the expected word is
// the next one. The blame of every number is computed from the back to the front,
// and everything that took part is corrected a little bit.
function trainSentence(m, sentence, rate) {
  var f = predict(m, sentence);
  var D = m.size, V = m.vocabulary.length, H = HIDDEN_NEURONS;
  var t, u, d, e, k, j;

  // blame of every number of the model (starts at zero)
  var g = {
    embeddings: zeroTable(V, D),
    query: { weights: zeroTable(D, D), biases: zeros(D) },
    key: { weights: zeroTable(D, D), biases: zeros(D) },
    value: { weights: zeroTable(D, D), biases: zeros(D) },
    weights1: zeroTable(H, D), biases1: zeros(H),
    weights2: zeroTable(V, H), biases2: zeros(V),
  };
  // blame of what was computed along the way (not stored: it only passes the blame back)
  var rowBlame = zeroTable(sentence.length, D);
  var queryBlame = zeroTable(sentence.length, D);
  var keyBlame = zeroTable(sentence.length, D);
  var valueBlame = zeroTable(sentence.length, D);

  for (t = 0; t < sentence.length - 1; t++) {
    var expected = sentence[t + 1];
    // error at the output: generated − expected
    var error = [];
    for (k = 0; k < V; k++) error.push(f.outputs[t][k] - (k === expected ? 1 : 0));
    // output layer
    var hiddenBlame = zeros(H);
    for (k = 0; k < V; k++) {
      for (j = 0; j < H; j++) {
        g.weights2[k][j] = g.weights2[k][j] + error[k] * f.hiddens[t][j];
        hiddenBlame[j] = hiddenBlame[j] + error[k] * m.weights2[k][j];
      }
      g.biases2[k] = g.biases2[k] + error[k];
    }
    // hidden layer
    var mixBlame = zeros(D);
    for (j = 0; j < H; j++) {
      for (d = 0; d < D; d++) {
        g.weights1[j][d] = g.weights1[j][d] + hiddenBlame[j] * f.mixes[t][d];
        mixBlame[d] = mixBlame[d] + hiddenBlame[j] * m.weights1[j][d];
      }
      g.biases1[j] = g.biases1[j] + hiddenBlame[j];
    }
    // mix: the blame goes to my own row, to each value and to each looking percentage
    var shareBlame = [];
    for (d = 0; d < D; d++) rowBlame[t][d] = rowBlame[t][d] + mixBlame[d];
    for (u = 0; u <= t; u++) {
      var sum = 0;
      for (d = 0; d < D; d++) {
        valueBlame[u][d] = valueBlame[u][d] + f.looks[t][u] * mixBlame[d];
        sum = sum + mixBlame[d] * f.values[u][d];
      }
      shareBlame.push(sum);
    }
    // looking percentages → scores (query × key, divided by the scale)
    var average = 0;
    for (u = 0; u <= t; u++) average = average + f.looks[t][u] * shareBlame[u];
    for (u = 0; u <= t; u++) {
      var scoreBlame = f.looks[t][u] * (shareBlame[u] - average) / Math.sqrt(D);
      for (d = 0; d < D; d++) {
        queryBlame[t][d] = queryBlame[t][d] + scoreBlame * f.keys[u][d];
        keyBlame[u][d] = keyBlame[u][d] + scoreBlame * f.queries[t][d];
      }
    }
  }

  // the three attention layers and, through them, the rows of the table
  var attentionLayers = [["query", queryBlame], ["key", keyBlame], ["value", valueBlame]];
  for (e = 0; e < attentionLayers.length; e++) {
    var name = attentionLayers[e][0], blames = attentionLayers[e][1];
    for (t = 0; t < sentence.length; t++) {
      for (j = 0; j < D; j++) {
        for (d = 0; d < D; d++) {
          g[name].weights[j][d] = g[name].weights[j][d] + blames[t][j] * f.rows[t][d];
          rowBlame[t][d] = rowBlame[t][d] + blames[t][j] * m[name].weights[j][d];
        }
        g[name].biases[j] = g[name].biases[j] + blames[t][j];
      }
    }
  }
  for (t = 0; t < sentence.length; t++) {
    for (d = 0; d < D; d++) g.embeddings[sentence[t]][d] = g.embeddings[sentence[t]][d] + rowBlame[t][d];
  }

  // correction = rate × blame (only the rows of the words in the sentence change)
  correct(m.embeddings, g.embeddings, rate);
  correct(m.query.weights, g.query.weights, rate); correct([m.query.biases], [g.query.biases], rate);
  correct(m.key.weights, g.key.weights, rate); correct([m.key.biases], [g.key.biases], rate);
  correct(m.value.weights, g.value.weights, rate); correct([m.value.biases], [g.value.biases], rate);
  correct(m.weights1, g.weights1, rate); correct([m.biases1], [g.biases1], rate);
  correct(m.weights2, g.weights2, rate); correct([m.biases2], [g.biases2], rate);
}

function correct(numbers, blames, rate) {
  for (var i = 0; i < numbers.length; i++) {
    for (var j = 0; j < numbers[i].length; j++) numbers[i][j] = numbers[i][j] - rate * blames[i][j];
  }
}

function mostLikely(list) {
  var best = 0;
  for (var k = 1; k < list.length; k++) {
    if (list[k] > list[best]) best = k;
  }
  return best;
}

// Generate: with everything written so far, pick the most likely word and add it.
function generate(m, start, count) {
  var output = start.slice();
  for (var n = 0; n < count; n++) {
    var f = predict(m, output);
    output.push(mostLikely(f.outputs[output.length - 1]));
  }
  return output;
}

module.exports = {
  create: create, pieces: pieces, countParameters: countParameters,
  predict: predict, trainSentence: trainSentence, generate: generate, mostLikely: mostLikely,
  neuron: neuron, layer: layer, percentages: percentages,
};
