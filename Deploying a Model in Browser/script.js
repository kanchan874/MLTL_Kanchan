// ====== Global Model Memory Space ======
let model;

// ====== UI DOM Elements ======
const trainBtn = document.getElementById('train-btn');
const predictBtn = document.getElementById('predict-btn');
const saveLsBtn = document.getElementById('save-ls-btn');
const loadLsBtn = document.getElementById('load-ls-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');

const trainLossVal = document.getElementById('train-loss-val');
const predictInput = document.getElementById('predict-input');
const predictResult = document.getElementById('predict-result');

// Output status elements
const trainStatus = document.getElementById('train-status');
const lsStatus = document.getElementById('ls-status');
const exportStatus = document.getElementById('export-status');
const importStatus = document.getElementById('import-status');

// Helper function to show UI feedback messages cleanly
function showStatus(element, message, isSuccess = true) {
    element.style.display = 'block';
    element.innerText = message;
    if (isSuccess) {
        element.classList.add('success-msg');
    } else {
        element.classList.remove('success-msg');
    }
}

// System function to unlock interactive paths after model is ready
function activateModelButtons() {
    predictBtn.disabled = false;
    saveLsBtn.disabled = false;
    exportBtn.disabled = false;
}

// ====== PART 1: Model Training ======
async function trainModel() {
    trainBtn.disabled = true;
    showStatus(trainStatus, "Initializing classification dataset...", true);

    // 1. Defining dataset (Study Hours vs Output)
    // 0 = Fail, 1 = Pass. This creates a binary classification scenario
    const xs = tf.tensor2d([1, 2, 3, 4, 5, 6, 7, 8], [8, 1]); // Input: Study Hours
    const ys = tf.tensor2d([0, 0, 0, 0, 1, 1, 1, 1], [8, 1]); // Output: Results

    // 2. Sequential architecture definition
    model = tf.sequential();
    // Using sigmoid activation to map outputs securely between [0, 1] range representing probability
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid', inputShape: [1] }));

    // 3. Mathematical mapping compilers
    model.compile({
        optimizer: tf.train.adam(0.1), // Adam optimizer minimizes the loss effectively
        loss: 'binaryCrossentropy'      // Standard loss metric for binary Pass/Fail modeling
    });

    showStatus(trainStatus, "Training loops executing live...", true);

    // 4. Fitting algorithm
    await model.fit(xs, ys, {
        epochs: 150, // More than enough mapping passes
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                trainLossVal.innerText = logs.loss.toFixed(4); // Updates screen live with decaying loss
            }
        }
    });

    showStatus(trainStatus, "Model training accurately completed!", true);
    activateModelButtons();
    trainBtn.disabled = false;
}

trainBtn.addEventListener('click', trainModel);

// ====== PART 2: Predictions ======
function makePrediction() {
    if (!model) {
        alert("Warning: Model is not loaded into memory!");
        return;
    }

    // Input variable extracting
    const val = parseFloat(predictInput.value);
    if (isNaN(val)) return;

    // Execute strictly via tf.tidy for automated WebGL memory dumping
    tf.tidy(() => {
        // Formulate prediction
        const output = model.predict(tf.tensor2d([val], [1, 1]));
        const predictionValue = output.dataSync()[0]; // Extract sigmoid decimal

        // 0.5 Thresholding protocol defining Binary Classes (Fail vs. Pass)
        let resultText = "";
        let colorcode = "";

        if (predictionValue >= 0.5) {
            resultText = `PASS`;
            colorcode = "#16a34a"; // Green indicator
        } else {
            resultText = `FAIL`;
            colorcode = "#dc2626"; // Red indicator
        }

        // Push visuals to UI
        predictResult.innerText = resultText;
        predictResult.style.color = colorcode;
    });
}

predictBtn.addEventListener('click', makePrediction);

// ====== PART 3: Save Model to LocalStorage ======
async function saveToLocalStorage() {
    if (!model) return;
    try {
        // Instructs TF system to preserve algorithms securely mapped under student-model tag
        await model.save('localstorage://student-model');
        showStatus(lsStatus, "Model saved successfully", true); // Using explicit message requested by user
    } catch (err) {
        showStatus(lsStatus, "Failed to inject to LocalStorage: " + err.message, false);
    }
}

saveLsBtn.addEventListener('click', saveToLocalStorage);

// ====== PART 4: Load Model from LocalStorage ======
async function loadFromLocalStorage() {
    try {
        showStatus(lsStatus, "Loading model dependencies from LocalStorage...", true);

        // Reload parameters bypassing backends natively
        const loadedModel = await tf.loadLayersModel('localstorage://student-model');

        model = loadedModel;
        activateModelButtons();

        showStatus(lsStatus, "Success! 'student-model' parameters retrieved properly from LocalStorage! Compare predictions now.", true);

        predictResult.innerText = "--";
        predictResult.style.color = "#475569";
    } catch (err) {
        showStatus(lsStatus, "Error: No previously saved 'student-model' structure found in LocalStorage space.", false);
    }
}

loadLsBtn.addEventListener('click', loadFromLocalStorage);

// ====== PART 5: Export Model Files ======
async function exportModel() {
    if (!model) return;
    try {
        showStatus(exportStatus, "Downloading generated files...", true);

        // Physical downloads API mapping
        await model.save('downloads://student-model');

        showStatus(exportStatus, "Success! Files 'student-model.json' and 'student-model.weights.bin' exported.", true);
    } catch (err) {
        showStatus(exportStatus, "Error handling export API request: " + err.message, false);
    }
}

exportBtn.addEventListener('click', exportModel);

// ====== PART 6: Import Model from Files ======
async function importModel() {
    const jsonFile = document.getElementById('json-upload').files[0];
    const weightsFile = document.getElementById('weights-upload').files[0];

    if (!jsonFile || !weightsFile) {
        showStatus(importStatus, "Please select both the .json AND .bin weights files uploaded previously.", false);
        return;
    }

    try {
        showStatus(importStatus, "Importing framework buffers...", true);

        // Compiles independent structural binaries back into standard tensor logics runtime memory
        const importedModel = await tf.loadLayersModel(tf.io.browserFiles([jsonFile, weightsFile]));

        model = importedModel;
        activateModelButtons();

        showStatus(importStatus, "Success! File weights compiled properly. Verify logic predictions.", true);
        predictResult.innerText = "--";
        predictResult.style.color = "#475569";
    } catch (err) {
        showStatus(importStatus, "Failed to compute buffer layers from given inputs: " + err.message, false);
    }
}

importBtn.addEventListener('click', importModel);
