// Grab DOM elements
const video = document.getElementById('webcam');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const predictionsContainer = document.getElementById('predictions');
const fpsCounter = document.getElementById('fps-counter');
const loadingOverlay = document.getElementById('loading-overlay');

// Application variables
let model;
let isVideoReady = false;

// Variables for FPS calculation
let frameCount = 0;
let lastFpsTime = performance.now();
let currentFps = 0;

// Color palette for drawing bounding boxes: GREEN by default, tracking different objects dynamically
const colorPalette = ['#00FF00', '#FF0000', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];
const classColors = {};

/**
 * Assigns a persistent color to a given object class name.
 * Default assigned color is green based on the initial index.
 */
function getColor(className) {
    if (!classColors[className]) {
        // Find next available color in palette
        const colorIndex = Object.keys(classColors).length % colorPalette.length;
        classColors[className] = colorPalette[colorIndex];
    }
    return classColors[className];
}

/**
 * Initializes the model and webcam
 */
async function init() {
    try {
        console.log("Loading TensorFlow.js MobileNet Object Detection model...");
        
        // Load the COCO-SSD model (which internally uses MobileNet as its base architecture)
        // This is necessary because pure MobileNet only classifies images, 
        // while COCO-SSD provides the bounding boxes we need.
        model = await cocoSsd.load();
        console.log("Model loaded successfully.");
        
        // Hide the loading spinner
        loadingOverlay.style.display = 'none';

        // Initialize the user's webcam and wait for video stream
        await setupWebcam();
        
        isVideoReady = true;
        
        // Begin the real-time classification loop
        predictFrame();
        
    } catch (error) {
        console.error("Initialization error:", error);
        loadingOverlay.innerHTML = `<p style="color: #ef4444;">Error: ${error.message}. <br>Please allow webcam access.</p>`;
    }
}

/**
 * Requests webcam access and wires the stream to the HTML video element
 */
async function setupWebcam() {
    return new Promise((resolve, reject) => {
        // Check if browser API is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            reject(new Error("Your browser does not support webcam access."));
            return;
        }

        navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }, 
            audio: false 
        })
        .then(stream => {
            video.srcObject = stream;
            
            // Once the video stream starts playing, match the canvas size to the video resolution
            video.addEventListener('loadeddata', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                resolve();
            });
        })
        .catch(err => reject(err));
    });
}

/**
 * The main render loop: captures a frame, runs inference, draws boxes, handles UI updates
 */
async function predictFrame() {
    if (!isVideoReady) return;

    // Track frame start time
    const startFrameTime = performance.now();

    // 1. Run object detection on the current video frame
    const predictions = await model.detect(video);

    // 2. Clear previous bounding box drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3. Sort predictions by confidence so we can display the top 3
    const sortedPredictions = [...predictions].sort((a, b) => b.score - a.score);
    
    // Update the UI panel with top 3
    updatePredictionsUI(sortedPredictions.slice(0, 3));

    // 4. Draw bounding box and label for every detected object
    predictions.forEach(prediction => {
        drawBoundingBox(prediction);
    });

    // 5. Update FPS metric
    updateFPS(startFrameTime);

    // 6. Request the next frame continuously
    requestAnimationFrame(predictFrame);
}

/**
 * Updates the HTML UI list with the top detected objects
 */
function updatePredictionsUI(predictions) {
    predictionsContainer.innerHTML = ''; // clear current items
    
    if (predictions.length === 0) {
        predictionsContainer.innerHTML = '<p class="waiting-text">No objects currently detected.</p>';
        return;
    }

    predictions.forEach((prediction, index) => {
        // Format confidence to percentage string
        const confidencePct = (prediction.score * 100).toFixed(1);
        const className = prediction.class;
        const color = getColor(className);
        
        predictionsContainer.innerHTML += `
            <div class="prediction-item" style="border-left: 6px solid ${color}">
                <span><strong>${index + 1}. <span style="text-transform: capitalize;">${className}</span></strong></span>
                <span style="color: ${color}; font-weight: bold;">${confidencePct}%</span>
            </div>
        `;
    });
}

/**
 * Draws a colored bounding box with a label directly onto the Canvas overlay
 */
function drawBoundingBox(prediction) {
    // bbox is an array containing [x, y, width, height]
    const [x, y, width, height] = prediction.bbox;
    const className = prediction.class;
    
    // Convert math probability to percentage
    const confidencePct = (prediction.score * 100).toFixed(1);
    
    // Get unique color for this object type
    const color = getColor(className);
    
    // 1. Draw Bounding Box Rectangle
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.rect(x, y, width, height);
    ctx.stroke();

    // 2. Prepare the Label text (Label + Confidence percentage)
    const text = `${className} (${confidencePct}%)`;
    ctx.font = '16px Roboto, Arial, sans-serif';
    ctx.textBaseline = 'top';
    const textWidth = ctx.measureText(text).width;
    const textHeight = parseInt(ctx.font, 10);
    
    // Keep tag inside screen bounds if the box is near the top edge
    const drawY = (y > textHeight + 8) ? y - textHeight - 8 : y;

    // 3. Draw solid background block for text over the box
    ctx.fillStyle = color;
    ctx.fillRect(x - 2, drawY - 2, textWidth + 10, textHeight + 8);

    // 4. Draw the label text itself in white for contrast
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, x + 3, drawY + 2);
}

/**
 * Utility function to calculate and display Frames Per Second (FPS)
 */
function updateFPS() {
    frameCount++;
    const now = performance.now();
    
    // Every 1000ms (1 second), update the FPS counter
    if (now - lastFpsTime >= 1000) {
        currentFps = Math.round((frameCount * 1000) / (now - lastFpsTime));
        fpsCounter.innerText = `FPS: ${currentFps}`;
        
        // Reset counters for the next second
        frameCount = 0;
        lastFpsTime = now;
    }
}

// Start application hook
window.addEventListener('load', init);
