# Student Pass/Fail Prediction Model in Browser using TensorFlow.js

## Student Information
- **Name:** Kanchan Gaikwad
- **USN NO.:** CM23004

## Project Objective
This project trains a Native browser machine learning Artificial Neural Network model that predicts whether a student will `PASS` or `FAIL` based linearly around their `Study Hours`. It trains from scratch securely using standard frontend techniques bypassing expensive Node.js backends. 

### Data Set Used
* **Study Hours (X)**: [1, 2, 3, 4, 5, 6, 7, 8]
* **Results (Y)**: [0, 0, 0, 0, 1, 1, 1, 1] — `(0 = Fail, 1 = Pass)`

## Project Features Executed
1. **Binary Classification Modeling:** Creates a sequential tensor mathematical model fitted explicitly with a dense layer mapping to a `Sigmoid Activation` to accurately cluster numerical values dynamically onto the range of limits between 0-to-1 probabilities resolving bounds seamlessly. Using advanced mapping properties like `Adam` alongside metric `binaryCrossentropy` errors.
2. **Predictive Analytics:** Converts mapped limits to discrete classes. Predict yields > 0.5 assert `PASS`, while inputs generating yields below denote `FAIL`. 
3. **Internal Session Storage System:** Natively encapsulates parameter data schemas committing topological states using browser storage hooks specifically bound to path rules structured cleanly as `model.save('localstorage://student-model')`. 
4. **Physical Export Engines:** Exfiltrates active states converting models directly utilizing DOM properties safely through browser APIs bound explicitly toward `model.save('downloads://student-model')` compiling independent parameters:
    * `student-model.json`
    * `student-model.weights.bin`
5. **Architectural Reverse Mapping Imports:** Accepts manual runtime reconstruction compiling OS level binary packages back into native mathematical DOM topologies completely eliminating needs for redundant machine-learning loop recalibrating `tf.io.browserFiles([...])`.

## Technology Used 
- Javascript via HTML5 structural documents cleanly.
- TensorFlow libraries securely rendered through web imports `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs`.

## Start 
1. Open up `index.html` within a modern web browser instance directly. 
2. Test inputs securely. Provide input bounds mapped securely matching data conditions like `2 hours = FAIL` or `7 hours = PASS` effectively tracking conditions dynamically globally!
