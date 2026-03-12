let model;
let data;
let isTrained = false;

const statusEl = document.getElementById("status");
const logEl = document.getElementById("log");
const predictionEl = document.getElementById("prediction");

function log(msg) {
  logEl.innerHTML += msg + "<br>";
  logEl.scrollTop = logEl.scrollHeight;
}

function buildModel() {
  const m = tf.sequential();

  m.add(tf.layers.conv2d({
    inputShape: [28, 28, 1],
    filters: 32,
    kernelSize: 3,
    activation: "relu"
  }));
  m.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

  m.add(tf.layers.conv2d({
    filters: 64,
    kernelSize: 3,
    activation: "relu"
  }));
  m.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

  m.add(tf.layers.flatten());
  m.add(tf.layers.dense({ units: 128, activation: "relu" }));
  m.add(tf.layers.dropout({ rate: 0.3 }));
  m.add(tf.layers.dense({ units: 10, activation: "softmax" }));

  m.compile({
    optimizer: tf.train.adam(),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"]
  });

  return m;
}

async function trainModel() {
  statusEl.innerText = "Loading dataset...";
  log("Loading MNIST dataset...");

  data = new MnistData();
  await data.load();

  statusEl.innerText = "Building model...";
  log("Building CNN model...");
  model = buildModel();
  model.summary();

  statusEl.innerText = "Training...";
  log("Training started (10 epochs)...");

  const BATCH_SIZE = 128;
  const TRAIN_BATCHES = 150; // training steps per epoch

  for (let epoch = 0; epoch < 10; epoch++) {
    let epochLoss = 0;
    let epochAcc = 0;

    for (let i = 0; i < TRAIN_BATCHES; i++) {
      const batch = data.nextTrainBatch(BATCH_SIZE);

      const history = await model.fit(batch.xs, batch.labels, {
        batchSize: BATCH_SIZE,
        epochs: 1,
        verbose: 0
      });

      epochLoss += history.history.loss[0];
      epochAcc += history.history.acc[0];

      batch.xs.dispose();
      batch.labels.dispose();
    }

    log(`Epoch ${epoch + 1} => loss=${(epochLoss / TRAIN_BATCHES).toFixed(4)}, acc=${((epochAcc / TRAIN_BATCHES) * 100).toFixed(2)}%`);
  }

  isTrained = true;
  statusEl.innerText = "Training Complete ✅";
  log("Training completed successfully ✅");
}

async function testModel() {
  if (!isTrained) return alert("Train the model first!");

  statusEl.innerText = "Testing...";
  log("Testing started...");

  const TEST_BATCH_SIZE = 1000;
  const TEST_BATCHES = 10;
  let totalAcc = 0;

  for (let i = 0; i < TEST_BATCHES; i++) {
    const batch = data.nextTestBatch(TEST_BATCH_SIZE);

    const evalOutput = model.evaluate(batch.xs, batch.labels, { batchSize: TEST_BATCH_SIZE, verbose: 0 });
    const acc = (await evalOutput[1].data())[0];
    totalAcc += acc;

    batch.xs.dispose();
    batch.labels.dispose();
  }

  const finalAcc = (totalAcc / TEST_BATCHES) * 100;
  log(`Final Test Accuracy: ${finalAcc.toFixed(2)}%`);
  statusEl.innerText = "Testing Complete ✅";
}

// Canvas drawing
const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseleave", () => drawing = false);

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(e.offsetX, e.offsetY, 12, 0, Math.PI * 2);
  ctx.fill();
});

function clearCanvas() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  predictionEl.innerText = "-";
}

async function predictDigit() {
  if (!isTrained) return alert("Train the model first!");

  const imgData = ctx.getImageData(0, 0, 280, 280);
  let pixels = [];

  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 28; x++) {
      let sum = 0;
      for (let yy = 0; yy < 10; yy++) {
        for (let xx = 0; xx < 10; xx++) {
          const px = ((y * 10 + yy) * 280 + (x * 10 + xx)) * 4;
          sum += imgData.data[px];
        }
      }
      pixels.push(sum / (10 * 10 * 255));
    }
  }

  const input = tf.tensor4d(pixels, [1, 28, 28, 1]);
  const pred = model.predict(input);
  const digit = pred.argMax(1).dataSync()[0];

  predictionEl.innerText = digit;
  log("Predicted Digit: " + digit);

  input.dispose();
  pred.dispose();
}