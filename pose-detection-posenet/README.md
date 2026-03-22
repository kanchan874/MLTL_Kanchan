# Pose Detection and Exercise Repetition Counter using PoseNet (TensorFlow.js)

## Student Information
- **Name:** Kanchan Gaikwad
- **USN NO.:** CM23004

## Project Overview
This practical project demonstrates a native browser implementation of **PoseNet via TensorFlow.js**. It accesses the device webcam to detect, map, and output coordinate skeletons across a subject's body. By translating these points mathematically, it functions as an intelligent gym motion counter to track squat repetitions safely in real-time.

## System Features and Technical Bounds
1. **Geometric Calculations**: Finds intersecting angles derived natively via the `Math.atan2` inverse tangent system traversing the mapped points connecting the Hips, Knees, and Ankles. 
2. **Conditional Exercise Logic**: Registers **DOWN** repetitions effectively when angle drops between `70-100` degrees. Transitions intelligently tracking complete **UP** repetitions returning safely back toward ranges between `160-180` degrees. 
3. **Safety Monitoring (Color Detection)**: Calculates depth positioning. Dipping below safe `70°` bounding limits issues structural warnings switching interface displays and skeleton mappings visually to `<red> / INCORRECT`. Retaining healthy angles preserves logic states natively displayed in positive `<green>`. 
4. **Hardware Analytical Modeling**: Includes live functional toggling swapping model implementations allowing analytical testing comparing execution load against **Single Pose Algorithms** vs complex decoded **Multiple Pose algorithms**. Generates outputting data variables indicating `FPS (using performance.now() metrics)` and exact percentage `Confidence Level Scores`. 
5. **Node Visibility Engine**: Uniquely colors independent connecting nodes (`Keypoints`) from their bridge vectors (`Skeletons`) and dynamically prints live identification confidence probability scores strictly attached along each identified joint. 

## Project Execution Map 
*Strictly adheres to utilizing lightweight web primitives explicitly.*

### Pre-requisites 
No CLI dependencies nor package downloads mandated. Fully functional operating strictly via `index.html`. 

### Stack 
- `index.html`
- `style.css` 
- `script.js` 
- CDNs used:
  - `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs`
  - `https://cdn.jsdelivr.net/npm/@tensorflow-models/posenet`

### Start
To preview, run by opening `index.html` using a modern HTML5/WebCam supportive browser standard instance explicitly granting video access when requested.
