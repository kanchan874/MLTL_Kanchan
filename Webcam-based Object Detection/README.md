# Webcam-based Object Detection using MobileNet (TensorFlow.js)

**Student Name:** Kanchan Gaikwad  
**USN NO.:** CM23004  

## Overview
This is a complete, browser-based web application fulfilling the student practical guidelines for real-time object detection and classification.
It utilizes TensorFlow.js along with pre-trained image models based on the MobileNet classification architecture. The model processes webcam frames instantly inside the user's browser, accurately classifying and identifying multiple objects, and drawing colorful tracking bounding boxes around them.

## Implementation Details & Requirements Fulfilled
- ✅ **Live Webcam Stream**: Utilizes `navigator.mediaDevices.getUserMedia` to hook directly into the computer's webcam feed securely.
- ✅ **TensorFlow & MobileNet**: TensorFlow loaded natively over the unpkg/jsdelivr CDN as per requirements. Uses COCO-SSD object detection (which operates atop the MobileNet backbone framework) to reliably locate and box items.
- ✅ **Bounding Boxes & Overlay**: Detects multiple simultaneous objects and effectively renders strict rectangular outlines spanning their coordinates overlapping the feed via an HTML Canvas element.
- ✅ **Dynamic Colors**: System applies GREEN bounding box automatically on default, whilst sequentially allocating variable tracking colors (red, blue, yellow) for differing object classes.
- ✅ **Real-Time Accuracy Marker**: Places the explicitly formatted Object Class Name alongside its prediction probability explicitly formatted in percentages (%) directly over the bounding box.
- ✅ **Top 3 Display**: Tracks all elements present, filtering and summarizing the top 3 highest confidence predictions dynamically onto the app UI beneath the webcam window.
- ✅ **Active FPS Counter**: Assures smooth inference limits by checking and reporting exact software Frames Per Second mathematically calculating via a rendering loop counter.
- ✅ **Browser Only Sandbox**: Coded gracefully as 100% locally-executable Javascript logic inside `index.html`. No frameworks, no external node dependencies required, totally zero-installation architecture.

## How to Run the Project
This project does not require Python or Node.js server backgrounds. However, due to standard modern Web Sandbox Security constraints `(CORS & streaming video protocol rules)`, you should initialize an elemental web-server to allow Javascript to seamlessly map the real-time hardware without security interrupts.

1. **Option 1**: Use the 'Live Server' extension inside VS Code and simply right-click `index.html` -> "Open with Live Server".
2. **Option 2**: Execute a fundamental static python server using `python -m http.server 8000` inside your project directory, then navigate to `http://localhost:8000` via a web browser.
3. Once running, explicitly accept the browser's native "Allow Camera" capability prompt appearing usually near the URL bar.
4. Let the TensorFlow CDN scripts compile the model temporarily against your WebGL/WASM background (spinner displays gracefully).
5. Watch the real-time AI computer-vision tracking commence automatically as you present distinct objects in front of the lens!

## Important Notes:
All code contains fully-fleshed beginner-friendly explanatory comments throughout `script.js` to demonstrate procedural understanding for standard college evaluation submission.
