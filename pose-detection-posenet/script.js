// ====== Global Variables ======
let video;
let net;
let ctx;
let canvas;

// Settings
const minPoseConfidence = 0.15;
const minPartConfidence = 0.10;
let detectionMode = "single"; // "single" or "multi"

// Squat Counter Variables
let squatCount = 0;
let squatState = "up"; // "up" or "down"
let currentAngle = 0;

// ====== Utility Functions ======

// Calculate mathematical angle between three points
function calculateAngle(A, B, C) {
    if (!A || !B || !C) return 0;

    // B is the middle vertex (joint)
    let angle = Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
    // Convert radians to degrees
    angle = (angle * 180.0) / Math.PI;
    angle = Math.abs(angle);

    if (angle > 180.0) {
        angle = 360 - angle;
    }

    return angle;
}

// Draw a single line segment
function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = 4; // Thick visible lines
    ctx.strokeStyle = color;
    ctx.stroke();
}

// Draw entire connected Skeleton
function drawSkeleton(keypoints, minConfidence, ctx, color) {
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minConfidence);

    adjacentKeyPoints.forEach((keypoints) => {
        drawSegment(
            [keypoints[0].position.y, keypoints[0].position.x],
            [keypoints[1].position.y, keypoints[1].position.x],
            color,
            1,
            ctx
        );
    });
}

// Draw individual Keypoints and their confidence scores
function drawKeypoints(keypoints, minConfidence, ctx, color) {
    for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];

        if (keypoint.score < minConfidence) {
            continue;
        }

        const { y, x } = keypoint.position;
        // Draw the point circle
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Print confidence score as requested
        ctx.font = "12px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(keypoint.score.toFixed(2), x + 10, y + 5);
    }
}

// ====== Main Logic ======

// Initialize WebCam using getUserMedia
async function setupCamera() {
    video = document.getElementById('video');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            width: 640,
            height: 480,
            facingMode: 'user'
        },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

// Load PoseNet Model remotely
async function loadPoseNet() {
    document.getElementById('status').innerText = 'Loading PoseNet model...';
    net = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75
    });

    document.getElementById('status').innerText = 'Model Loaded. Running...';
    document.getElementById('status').style.color = '#16a34a'; // Green loaded text
}

// Evaluate Squat state and detect correct posture based on angles
function evaluateSquat(pose) {
    if (pose.score < minPoseConfidence) return true;

    const keypoints = pose.keypoints;

    // Find relevant geometric leg keypoints
    const leftHip = keypoints.find(k => k.part === 'leftHip');
    const leftKnee = keypoints.find(k => k.part === 'leftKnee');
    const leftAnkle = keypoints.find(k => k.part === 'leftAnkle');

    const rightHip = keypoints.find(k => k.part === 'rightHip');
    const rightKnee = keypoints.find(k => k.part === 'rightKnee');
    const rightAnkle = keypoints.find(k => k.part === 'rightAnkle');

    let hip, knee, ankle;
    let isVisible = false;

    // Prefer left side, fallback to right side visibility
    if (leftHip.score > minPartConfidence && leftKnee.score > minPartConfidence && leftAnkle.score > minPartConfidence) {
        hip = leftHip.position;
        knee = leftKnee.position;
        ankle = leftAnkle.position;
        isVisible = true;
    } else if (rightHip.score > minPartConfidence && rightKnee.score > minPartConfidence && rightAnkle.score > minPartConfidence) {
        hip = rightHip.position;
        knee = rightKnee.position;
        ankle = rightAnkle.position;
        isVisible = true;
    }

    let isCorrectPosture = true;

    if (isVisible) {
        currentAngle = calculateAngle(hip, knee, ankle);

        // Logical detection bounds:
        // Squatting down state (70-100 degrees)
        if (currentAngle < 100) {
            if (squatState === "up") {
                squatState = "down";
            }
            if (currentAngle < 70) {
                isCorrectPosture = false; // Going too low triggers red incorrect UI
            }
        }

        // Standing up state (160-180 degrees)
        if (currentAngle > 160) {
            if (squatState === "down") {
                squatState = "up";
                squatCount++;
            }
        }

        // Live DOM updating
        document.getElementById('angle-val').innerText = currentAngle.toFixed(1) + '°';
        document.getElementById('rep-val').innerText = squatCount;
        document.getElementById('state-val').innerText = squatState.toUpperCase();

        const stateCard = document.getElementById('state-card');
        if (isCorrectPosture) {
            stateCard.className = "card state-card posture-correct";
        } else {
            stateCard.className = "card state-card posture-incorrect";
            document.getElementById('state-val').innerText = "INCORRECT (Too deep)";
        }

        return isCorrectPosture;
    } else {
        document.getElementById('angle-val').innerText = 'N/A';
        return true;
    }
}

// Main Frame looping system using requestAnimationFrame
async function detectPoseInRealTime(video, net) {
    canvas = document.getElementById('output');
    ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    async function poseDetectionFrame() {
        const start = performance.now(); // Track initial time
        let poses = [];
        let avgScore = 0;

        // Perform mode-dependent detection
        if (detectionMode === 'single') {
            const pose = await net.estimateSinglePose(video, {
                flipHorizontal: true
            });
            poses.push(pose);
            avgScore = pose.score;
        } else {
            poses = await net.estimateMultiplePoses(video, {
                flipHorizontal: true,
                maxDetections: 5,
                scoreThreshold: minPartConfidence
            });
            if (poses.length > 0) {
                avgScore = poses.reduce((acc, p) => acc + p.score, 0) / poses.length;
            }
        }

        const end = performance.now(); // Track final time
        const fps = 1000 / (end - start); // Frame per second math calculation!

        // Update technical interface
        document.getElementById('fps-val').innerText = Math.round(fps);
        document.getElementById('conf-val').innerText = avgScore.toFixed(3);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw physical video to canvas element (mirrored)
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Calculate body logic to find what color to paint skeleton
        let isCorrectPosture = true;
        if (poses.length > 0) {
            isCorrectPosture = evaluateSquat(poses[0]);
        }

        // Colors logic: Keypoints are Orange/Yellow. Skeleton turns Green/Red.
        const skeletonColor = isCorrectPosture ? "#16a34a" : "#dc2626"; // Green / Red
        const keypointColor = "#eab308"; // Golden Yellow

        // Feed tracking lines onto canvas
        poses.forEach(({ score, keypoints }) => {
            if (score >= minPoseConfidence) {
                drawSkeleton(keypoints, minPartConfidence, ctx, skeletonColor);
                drawKeypoints(keypoints, minPartConfidence, ctx, keypointColor);
            }
        });

        // Loop continuous calling
        requestAnimationFrame(poseDetectionFrame);
    }

    poseDetectionFrame();
}

// App Entrypoint
async function main() {
    await loadPoseNet();

    try {
        video = await setupCamera();
        await video.play();
        detectPoseInRealTime(video, net);
    } catch (e) {
        document.getElementById('status').innerText = 'Webcam error: ' + e.message;
        console.error(e);
    }

    // Toggle Button Event Listener logic
    const modeBtn = document.getElementById('toggle-mode');
    modeBtn.addEventListener('click', () => {
        if (detectionMode === 'single') {
            detectionMode = 'multi';
            modeBtn.innerText = 'Switch to Single Pose';
            document.getElementById('current-mode').innerText = 'Multi Pose';
        } else {
            detectionMode = 'single';
            modeBtn.innerText = 'Switch to Multi Pose';
            document.getElementById('current-mode').innerText = 'Single Pose';
        }
    });
}

// Trigger script wrapper
window.onload = main;
