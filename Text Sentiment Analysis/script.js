let denseModel;
let rnnModel;
let predictionChart;

// Small dataset
const sentences = [
  "I love this movie",
  "This is fantastic",
  "Amazing experience",
  "I hate this",
  "This is terrible",
  "Worst movie ever"
];

const labels = [1,1,1,0,0,0];

// Convert text to simple numeric feature
function encode(text) {
  return text.length;
}

async function trainModels() {

  const xs = tf.tensor2d(sentences.map(s => [encode(s)]));
  const ys = tf.tensor2d(labels, [labels.length,1]);

  // Dense model
  denseModel = tf.sequential();
  denseModel.add(tf.layers.dense({units:8, activation:'relu', inputShape:[1]}));
  denseModel.add(tf.layers.dense({units:1, activation:'sigmoid'}));
  denseModel.compile({optimizer:'adam', loss:'binaryCrossentropy', metrics:['accuracy']});

  await denseModel.fit(xs, ys, {epochs:50});

  // RNN model
  rnnModel = tf.sequential();
  rnnModel.add(tf.layers.reshape({targetShape:[1,1], inputShape:[1]}));
  rnnModel.add(tf.layers.simpleRNN({units:8}));
  rnnModel.add(tf.layers.dense({units:1, activation:'sigmoid'}));
  rnnModel.compile({optimizer:'adam', loss:'binaryCrossentropy', metrics:['accuracy']});

  await rnnModel.fit(xs.reshape([6,1,1]), ys, {epochs:50});

  createChart();
}

function createChart() {
  const ctx = document.getElementById('predictionChart').getContext('2d');

  predictionChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Dense Model', 'RNN Model'],
      datasets: [{
        label: 'Positive Probability (%)',
        data: [0,0],
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 100
        }
      }
    }
  });
}

async function predict() {

  const text = document.getElementById("sentence").value;
  const input = tf.tensor2d([[encode(text)]]);

  const densePred = denseModel.predict(input);
  const rnnPred = rnnModel.predict(input.reshape([1,1,1]));

  const denseValue = (await densePred.data())[0];
  const rnnValue = (await rnnPred.data())[0];

  const densePercent = (denseValue * 100).toFixed(2);
  const rnnPercent = (rnnValue * 100).toFixed(2);

  document.getElementById("result").innerHTML =
    `Dense: ${densePercent}% | RNN: ${rnnPercent}%`;

  // 🔥 THIS FIX MAKES BARS VISIBLE
  predictionChart.data.datasets[0].data = [
    parseFloat(densePercent),
    parseFloat(rnnPercent)
  ];

  predictionChart.update();
}

// Train automatically on page load
trainModels();