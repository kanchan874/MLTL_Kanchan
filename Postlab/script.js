'use strict';

/* ═══════════════════════════════════════════════════════════════
   MOODTUNE AI — script.js
   Features:
   ✦ Camera mood detection (AI simulation with realistic bars)
   ✦ Voice command recognition (Web Speech API)
   ✦ Text-based keyword mood detection
   ✦ Dynamic background change per mood
   ✦ Mood History (saved to localStorage)
   ✦ Emoji display for detected mood
   ✦ Favourite songs + My Playlist tabs
   ✦ Full HTML5 audio player (play/pause/next/prev/shuffle/repeat)
   ✦ Loading animation overlay
   ═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   SONG DATABASE
   Files expected at: songs/<mood>/<filename>.mp3
   Folder names match actual directories: happy, Sad, Chill,
   Energetic, Angry  (Windows is case-insensitive so paths work)
   ───────────────────────────────────────────────────────────── */
const SONGS = {

  happy: [
    { name: "Ilahi",               artist: "Arijit Singh — Yeh Jawaani Hai Deewani",    file: "songs/happy/ilahi.mp3",           emoji: "🌟", dur: "4:25" },
    { name: "Badtameez Dil",       artist: "Benny Dayal — Yeh Jawaani Hai Deewani",     file: "songs/happy/badtameez_dil.mp3",   emoji: "🕺", dur: "3:38" },
    { name: "Kar Gayi Chull",      artist: "Badshah & Fazilpuria — Kapoor & Sons",      file: "songs/happy/kar_gayi_chull.mp3",  emoji: "😎", dur: "3:22" },
    { name: "Gallan Goodiyan",     artist: "Shankar Mahadevan — Dil Dhadakne Do",       file: "songs/happy/gallan_goodiyan.mp3", emoji: "🎉", dur: "5:12" },
    { name: "Kala Chashma",        artist: "Badshah & Neha Kakkar — Baar Baar Dekho",  file: "songs/happy/kala_chashma.mp3",    emoji: "🕶️", dur: "3:44" },
    { name: "London Thumakda",     artist: "Labh Janjua & Sonu Kakkar — Queen",         file: "songs/happy/london_thumakda.mp3", emoji: "💃", dur: "3:17" },
    { name: "Nashe Si Chadh Gayi", artist: "Arijit Singh — Befikre",                    file: "songs/happy/nashe_si.mp3",        emoji: "✨", dur: "3:54" },
    { name: "Senorita",            artist: "Shawn Mendes & Camila Cabello",             file: "songs/happy/senorita.mp3",        emoji: "🎶", dur: "3:11" },
  ],

  sad: [
    { name: "Channa Mereya",       artist: "Arijit Singh — Ae Dil Hai Mushkil",         file: "songs/Sad/channa_mereya.mp3",     emoji: "💙", dur: "4:49" },
    { name: "Agar Tum Saath Ho",   artist: "Arijit Singh & Alka Yagnik — Tamasha",      file: "songs/Sad/agar_tum.mp3",          emoji: "🌧️", dur: "5:27" },
    { name: "Tujhe Bhula Diya",    artist: "Mohit Chauhan & Shilpa Rao — Anjaana Anjaani", file: "songs/Sad/tujhe_bhula.mp3",   emoji: "🍂", dur: "4:03" },
    { name: "Phir Le Aaya Dil",    artist: "Rekha Bhardwaj — Barfi!",                   file: "songs/Sad/phir_le_aaya.mp3",     emoji: "🕊️", dur: "4:31" },
    { name: "Kabira (Encore)",     artist: "Tochi Raina & Rekha Bhardwaj — YJHD",       file: "songs/Sad/kabira.mp3",            emoji: "🫧", dur: "4:05" },
    { name: "Hamari Adhuri Kahani",artist: "Arijit Singh — Hamari Adhuri Kahani",        file: "songs/Sad/hamari_adhuri.mp3",    emoji: "💔", dur: "4:47" },
    { name: "Tum Hi Ho",           artist: "Arijit Singh — Aashiqui 2",                 file: "songs/Sad/tum_hi_ho.mp3",         emoji: "🌸", dur: "4:22" },
    { name: "Jeene Bhi De",        artist: "Arijit Singh — Dil Dhadakne Do",             file: "songs/Sad/jeene_bhi_de.mp3",     emoji: "🥀", dur: "4:37" },
  ],

  calm: [
    { name: "Iktara",              artist: "Kavita Seth & Lucky Ali — Wake Up Sid",     file: "songs/Chill/iktara.mp3",           emoji: "🌿", dur: "4:28" },
    { name: "Sham",                artist: "Mohit Chauhan — Aisha",                     file: "songs/Chill/sham.mp3",             emoji: "🌅", dur: "4:45" },
    { name: "Phir Se Ud Chala",    artist: "Mohit Chauhan — Rockstar",                  file: "songs/Chill/phir_se_ud_chala.mp3", emoji: "🕊️", dur: "4:06" },
    { name: "Saibo",               artist: "Shreya Ghoshal & Tochi Raina — Shor",       file: "songs/Chill/saibo.mp3",            emoji: "☁️", dur: "4:49" },
    { name: "Khairiyat",           artist: "Arijit Singh — Chhichhore",                 file: "songs/Chill/khairiyat.mp3",        emoji: "🍃", dur: "4:01" },
    { name: "Nazm Nazm",           artist: "Arko — Bareilly Ki Barfi",                  file: "songs/Chill/nazm_nazm.mp3",        emoji: "📖", dur: "4:44" },
    { name: "Hawayein",            artist: "Arijit Singh — Jab Harry Met Sejal",        file: "songs/Chill/hawayein.mp3",         emoji: "🌌", dur: "4:44" },
    { name: "Raabta",              artist: "Nikhil Paul George",                         file: "songs/Chill/raabta.mp3",           emoji: "🌸", dur: "4:28" },
  ],

  energetic: [
    { name: "Zinda",               artist: "Siddharth Mahadevan — Bhaag Milkha Bhaag", file: "songs/Energetic/zinda.mp3",        emoji: "🔥", dur: "3:19" },
    { name: "Kar Har Maidaan Fateh",artist:"Sukhwinder Singh — Sanju",                  file: "songs/Energetic/khmf.mp3",         emoji: "⚡", dur: "4:23" },
    { name: "Sultan (Title Track)",artist: "Sukhwinder Singh — Sultan",                 file: "songs/Energetic/sultan.mp3",       emoji: "🏋️", dur: "3:04" },
    { name: "Apna Time Aayega",    artist: "Divine — Gully Boy",                        file: "songs/Energetic/apna_time.mp3",    emoji: "💥", dur: "3:22" },
    { name: "Chak De! India",      artist: "Sukhwinder Singh — Chak De! India",         file: "songs/Energetic/chak_de.mp3",      emoji: "💪", dur: "5:14" },
    { name: "Lakshya (Title Track)",artist:"Shankar Mahadevan — Lakshya",               file: "songs/Energetic/lakshya.mp3",      emoji: "🎯", dur: "4:02" },
    { name: "Brothers Anthem",     artist: "Vishal Dadlani — Brothers",                 file: "songs/Energetic/brothers.mp3",     emoji: "🥊", dur: "4:11" },
    { name: "Dangal (Title Track)",artist: "Daler Mehndi — Dangal",                     file: "songs/Energetic/dangal.mp3",       emoji: "🚀", dur: "3:48" },
  ],

  angry: [
    { name: "Bhaag DK Bose",       artist: "Ram Sampath — Delhi Belly",                 file: "songs/Angry/bhaag_dk_bose.mp3",   emoji: "😤", dur: "3:31" },
    { name: "Sadda Haq",           artist: "Mohit Chauhan — Rockstar",                  file: "songs/Angry/sadda_haq.mp3",       emoji: "✊", dur: "4:38" },
    { name: "Jee Karda",           artist: "Harshdeep Kaur — Jab Tak Hai Jaan",         file: "songs/Angry/jee_karda.mp3",       emoji: "🔥", dur: "4:09" },
    { name: "Aarambh Hai Prachand",artist: "Piyush Mishra — Gulaal",                    file: "songs/Angry/aarambh.mp3",         emoji: "🗡️", dur: "4:25" },
    { name: "Bulleya",             artist: "Amit Mishra & Shilpa Rao — Sultan",         file: "songs/Angry/bulleya.mp3",         emoji: "💢", dur: "4:52" },
    { name: "Khoon Chala",         artist: "KK — Rang De Basanti",                      file: "songs/Angry/khoon_chala.mp3",     emoji: "⚡", dur: "4:15" },
    { name: "Zinda Hai Toh",       artist: "Sukhwinder Singh — Bhaag Milkha Bhaag",    file: "songs/Angry/zinda_hai_toh.mp3",   emoji: "🎸", dur: "3:58" },
    { name: "Raanjhanaa",          artist: "A.R. Rahman — Raanjhanaa",                  file: "songs/Angry/raanjhanaa.mp3",      emoji: "💣", dur: "4:11" },
  ],
};

/* ─── MOOD CONFIG ─────────────────────────────────────────────
   Each mood has: label, emoji icon, accent color, gradient,
   player stripe gradient, and dynamic background colors.
   ─────────────────────────────────────────────────────────── */
const MOOD_CFG = {
  happy: {
    label:"Happy",      icon:"😄",
    color:"#f59e0b",
    grad:"linear-gradient(135deg,#f59e0b,#d97706)",
    stripe:"linear-gradient(90deg,#f59e0b,#fde68a,#f59e0b)",
    bg:["rgba(251,191,36,0.25)","rgba(245,158,11,0.15)","rgba(253,230,138,0.12)"],
  },
  sad: {
    label:"Melancholic", icon:"😢",
    color:"#818cf8",
    grad:"linear-gradient(135deg,#818cf8,#4f46e5)",
    stripe:"linear-gradient(90deg,#818cf8,#c4b5fd,#818cf8)",
    bg:["rgba(99,102,241,0.30)","rgba(129,140,248,0.18)","rgba(196,181,253,0.12)"],
  },
  calm: {
    label:"Calm",        icon:"😌",
    color:"#34d399",
    grad:"linear-gradient(135deg,#34d399,#059669)",
    stripe:"linear-gradient(90deg,#34d399,#6ee7b7,#34d399)",
    bg:["rgba(16,185,129,0.25)","rgba(52,211,153,0.18)","rgba(110,231,183,0.12)"],
  },
  energetic: {
    label:"Energetic",   icon:"⚡",
    color:"#f87171",
    grad:"linear-gradient(135deg,#f87171,#dc2626)",
    stripe:"linear-gradient(90deg,#f87171,#fca5a5,#f87171)",
    bg:["rgba(239,68,68,0.28)","rgba(248,113,113,0.18)","rgba(252,165,165,0.12)"],
  },
  angry: {
    label:"Angry",       icon:"😡",
    color:"#dc2626",
    grad:"linear-gradient(135deg,#dc2626,#7f1d1d)",
    stripe:"linear-gradient(90deg,#dc2626,#ef4444,#dc2626)",
    bg:["rgba(220,38,38,0.30)","rgba(185,28,28,0.18)","rgba(254,202,202,0.10)"],
  },
};

/* ─── TEXT KEYWORD MAP ────────────────────────────────────────
   Used for text-mode detection.
   ─────────────────────────────────────────────────────────── */
const KEYWORDS = {
  happy: [
    "happy","khush","joy","joyful","excited","great","amazing","wonderful","fantastic",
    "cheerful","elated","ecstatic","thrilled","good","love","awesome","blessed",
    "celebrate","party","fun","laugh","smile","yay","glad","delight","mast","acha",
    "shukriya","thank","positive","khushi","anand","superb","excellent","lit","vibe",
  ],
  sad: [
    "sad","dukhi","unhappy","depressed","lonely","alone","miss","cry","crying","tears",
    "heartbroken","grief","sorrow","upset","hurt","broken","lost","empty","hopeless",
    "gloomy","blue","down","low","missing","pain","rona","bura","tanha","dard",
    "udaas","pareshan","akela","toota","melancholy","numb","hollow",
  ],
  energetic: [
    "energetic","energy","pumped","motivated","gym","workout","run","running",
    "exercise","sport","active","power","strong","ready","fight","champion","win",
    "goal","hustle","grind","focus","boost","charged","fired up","josh","tayyar",
    "maidaan","dangal","unstoppable","beast","fire","lets go",
  ],
  calm: [
    "calm","relax","relaxed","chill","chilling","peaceful","quiet","rest","tired","sleepy",
    "slow","ease","meditate","breathe","free","tranquil","serene","gentle","soothing",
    "mellow","laid back","shanti","sukoon","aram","thaka","neend","peace",
    "bored","lazy","cozy","cosy","zenzone","mindful",
  ],
  angry: [
    "angry","anger","furious","frustrated","mad","rage","hate","annoyed","irritated",
    "fed up","sick","disgusted","stressed","stressed out","anxious","tension","worry",
    "pressure","gussa","naraaz","jalaan","jhanjhat","stress","anxiety",
    "revolt","fight","fire","intense","fierce","ugh",
  ],
};

/* ─── APP STATE ───────────────────────────────────────────────*/
let currentMood   = null;   // active mood key
let currentList   = [];     // songs for active mood
let currentIndex  = -1;     // index of playing song
let isPlaying     = false;
let shuffle       = false;
let repeat        = false;
let activeTab     = 'all';     // 'all' | 'playlist' | 'favourites'
let activeMode    = 'camera';  // 'camera' | 'voice' | 'text'
let cameraStream  = null;      // MediaStream from webcam
let isDetecting   = false;     // guard against double-detect

// Persistent sets (song keys: "mood-index")
let favourites = new Set(JSON.parse(localStorage.getItem('mt_favs')    || '[]'));
let myPlaylist = new Set(JSON.parse(localStorage.getItem('mt_playlist') || '[]'));

// Mood history array: [{mood, source, ts}]
let moodHistory = JSON.parse(localStorage.getItem('mt_history') || '[]');

/* ─── DOM SHORTHAND ──────────────────────────────────────────*/
const $ = id => document.getElementById(id);

/* ═══════════════════════════════════════════════════════════
   INPUT MODE SWITCHER
   ═══════════════════════════════════════════════════════════ */
/**
 * Switch between camera / voice / text input modes.
 * @param {string} mode - 'camera' | 'voice' | 'text'
 */
function switchMode(mode) {
  activeMode = mode;

  // Update tab button styles
  ['camera','voice','text'].forEach(m => {
    $(`mode${m.charAt(0).toUpperCase() + m.slice(1)}`)
      .classList.toggle('active', m === mode);
  });

  // Show correct panel
  ['panelCamera','panelVoice','panelText'].forEach(id => {
    $(id).classList.add('hidden');
  });
  $(`panel${mode.charAt(0).toUpperCase() + mode.slice(1)}`).classList.remove('hidden');
}

/* ═══════════════════════════════════════════════════════════
   📷 CAMERA MODE
   ═══════════════════════════════════════════════════════════ */

/**
 * Request webcam access and show live feed.
 */
function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showCamStatus('❌ Camera not supported in this browser.', true);
    return;
  }

  showCamStatus('⏳ Requesting camera permission…');

  navigator.mediaDevices.getUserMedia({ video: { width:640, height:400, facingMode:'user' }, audio: false })
    .then(stream => {
      cameraStream = stream;
      const vid = $('cameraFeed');
      vid.srcObject = stream;
      vid.play();

      // Hide the placeholder overlay
      $('cameraOverlay').classList.add('hidden');

      showCamStatus('✅ Camera ready — Loading AI Models...');
      $('detectCamBtn').disabled = false;
      $('startCamBtn').textContent = '🔄 Restart Camera';
      
      // Load deep learning models
      loadFaceApiModels();
    })
    .catch(err => {
      console.error('Camera error:', err);
      showCamStatus('❌ Cannot access camera. Check permissions.', true);
    });
}

/** Show status badge inside the camera feed */
function showCamStatus(text, isError = false) {
  const el = $('camStatus');
  if(!el) return;
  el.textContent = text;
  el.style.color = isError ? '#f87171' : 'var(--text-2)';
}

// Global scope tracker for AI load status
let faceApiLoaded = false;
let faceApiLoading = false;

async function loadFaceApiModels() {
  if (faceApiLoaded || faceApiLoading) return;
  faceApiLoading = true;
  try {
    const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
    
    // Defer check to ensure script parsed 
    while (typeof faceapi === 'undefined') {
      await new Promise(r => setTimeout(r, 100));
    }
    
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    faceApiLoaded = true;
    showCamStatus('✅ AI Real-Time Emotion Models Active!');
  } catch (err) {
    console.error('AI Init Error:', err);
    showCamStatus('❌ Cannot fetch AI models. Check connection.', true);
  } finally {
    faceApiLoading = false;
  }
}

/**
 * Detect mood from camera using Deep Learning (face-api.js).
 */
async function detectMoodFromCamera() {
  if (isDetecting) return;
  if (!cameraStream) { showCamStatus('⚠ Start the camera first!', true); return; }
  
  if (!faceApiLoaded) {
    showCamStatus('⏳ Wait, Neural Network is still warming up!', true);
    return;
  }

  isDetecting = true;
  showCamStatus('🤖 Neural Network analyzing facial expressions…');
  $('faceScanBox').style.display = 'block';

  try {
    const video = $('cameraFeed');
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

    if (!detections) {
      showCamStatus('⚠ No face detected. Please ensure you are centered.', true);
      isDetecting = false;
      $('faceScanBox').style.display = 'none';
      return;
    }

    // Map the 7 deep learning expressions to our 5 aesthetic moods
    const exp = detections.expressions;
    const mPcts = {
      happy: exp.happy * 100,
      sad: exp.sad * 100,
      calm: exp.neutral * 100,
      energetic: (exp.surprised + (exp.happy * 0.4)) * 75,
      angry: (exp.angry + exp.disgusted) * 100
    };

    let total = 0;
    for (const v of Object.values(mPcts)) total += v;
    if (total === 0) total = 1;

    const pcts = {};
    let dominant = 'calm';
    let max = -1;

    // Normalize distribution
    for (const [m, v] of Object.entries(mPcts)) {
      pcts[m] = Math.max(1, (v / total) * 100);
      if (pcts[m] > max) { max = pcts[m]; dominant = m; }
    }
    
    // Soft boost for UI progress bar visualization punch
    if (pcts[dominant] < 55) pcts[dominant] += 15;

    showLoadingOverlay('Running Deep Learning inference…', pcts, () => {
      $('faceScanBox').style.display = 'none';
      isDetecting = false;
      
      const confidence = Math.min(99, Math.round(pcts[dominant] || max));
      showMoodResult(dominant, confidence, 'camera');
      applyMood(dominant);

      $('tryAgainBtn').style.display = 'inline-flex';
      $('detectCamBtn').textContent  = '✓ Detected!';
      setTimeout(() => {
        $('detectCamBtn').textContent = '⚡ Detect Again';
      }, 2000);
    });

  } catch (e) {
    console.error('Detection Exception:', e);
    showCamStatus('❌ Real-time processing failed.', true);
    isDetecting = false;
    $('faceScanBox').style.display = 'none';
  }
}

/**
 * Reset camera detection so user can try again.
 */
function tryAgain() {
  $('tryAgainBtn').style.display  = 'none';
  $('moodResult').style.display   = 'none';
  $('detectCamBtn').disabled      = !cameraStream;
  $('detectCamBtn').textContent   = '⚡ Detect Mood';
  showCamStatus(faceApiLoaded ? '✅ AI Ready — look at the camera!' : 'Ready');
}

/* ═══════════════════════════════════════════════════════════
   🎤 VOICE MODE
   ═══════════════════════════════════════════════════════════ */
let voiceRecognition = null;

/**
 * Start speech recognition for voice command.
 * Uses Web Speech API (SpeechRecognition).
 */
function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    $('voiceLabel').textContent = '❌ Voice not supported in this browser. Try Chrome.';
    return;
  }

  const btn = $('micBtn');

  // If already listening, stop
  if (voiceRecognition) {
    voiceRecognition.stop();
    voiceRecognition = null;
    btn.textContent = '🎤 Start Listening';
    btn.classList.remove('listening');
    $('voiceVisual').classList.remove('listening');
    $('voiceLabel').textContent = 'Click mic to start speaking';
    return;
  }

  voiceRecognition = new SpeechRecognition();
  voiceRecognition.continuous    = false;
  voiceRecognition.interimResults = true;
  voiceRecognition.lang          = 'en-IN'; // supports Hinglish words

  voiceRecognition.onstart = () => {
    btn.textContent = '⏹ Stop Listening';
    btn.classList.add('listening');
    $('voiceVisual').classList.add('listening');
    $('voiceLabel').textContent = '🎙 Listening… speak now!';
    $('voiceTranscript').textContent = '';
  };

  voiceRecognition.onresult = (event) => {
    let interim = '';
    let final   = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) final += t;
      else interim += t;
    }
    $('voiceTranscript').textContent = final || interim;
  };

  voiceRecognition.onend = () => {
    btn.textContent = '🎤 Start Listening';
    btn.classList.remove('listening');
    $('voiceVisual').classList.remove('listening');
    voiceRecognition = null;

    const transcript = $('voiceTranscript').textContent.trim().toLowerCase();
    if (!transcript) {
      $('voiceLabel').textContent = '⚠ No speech detected. Try again!';
      return;
    }

    // Detect mood from transcript using keyword matching
    const detected = detectMoodFromKeywords(transcript) || 'calm';
    const cfg = MOOD_CFG[detected];
    $('voiceLabel').textContent = `${cfg.icon} Heard: "${transcript}"`;
    showMoodResult(detected, null, 'voice');
    applyMood(detected);
  };

  voiceRecognition.onerror = (event) => {
    $('voiceLabel').textContent = `❌ Error: ${event.error}. Try again.`;
    btn.textContent = '🎤 Start Listening';
    btn.classList.remove('listening');
    $('voiceVisual').classList.remove('listening');
    voiceRecognition = null;
  };

  voiceRecognition.start();
}

/* ═══════════════════════════════════════════════════════════
   ✏️ TEXT MODE
   ═══════════════════════════════════════════════════════════ */
/**
 * Detect mood from the text input field using keyword scoring.
 */
function detectMoodFromText() {
  const raw   = $('moodInput').value.trim();
  const hint  = $('inputHint');

  if (!raw) {
    hint.textContent = '⚠ Please type how you feel before detecting.';
    hint.className   = 'input-hint error';
    $('moodInput').focus();
    return;
  }
  if (raw.length < 3) {
    hint.textContent = '⚠ Please write a little more so we can understand.';
    hint.className   = 'input-hint error';
    return;
  }

  const detected  = detectMoodFromKeywords(raw.toLowerCase()) || 'calm';
  const isDefault = !detectMoodFromKeywords(raw.toLowerCase());
  const cfg       = MOOD_CFG[detected];

  hint.textContent = isDefault
    ? `😐 Couldn't read the vibe clearly — Calm playlist for you.`
    : `${cfg.icon} Detected: "${cfg.label}" — playlist is ready!`;
  hint.className   = 'input-hint success';

  showMoodResult(detected, null, 'text');
  applyMood(detected);
}

/**
 * Quick manual mood selector from sidebar buttons or chips.
 * @param {string} mood
 */
function manualMood(mood) {
  if ($('moodInput')) $('moodInput').value = '';
  if ($('inputHint')) {
    $('inputHint').textContent = `${MOOD_CFG[mood].icon} Mood set to "${MOOD_CFG[mood].label}".`;
    $('inputHint').className   = 'input-hint success';
  }
  showMoodResult(mood, null, 'manual');
  applyMood(mood);
}

/**
 * Fill text input with an example phrase.
 * @param {string} text
 */
function fillExample(text) {
  switchMode('text');
  $('moodInput').value = text;
  $('inputHint').textContent = 'Click "Detect Mood" or press Enter!';
  $('inputHint').className   = 'input-hint';
  $('moodInput').focus();
}

/* ═══════════════════════════════════════════════════════════
   🧠 KEYWORD MOOD DETECTION (shared by text + voice)
   ═══════════════════════════════════════════════════════════ */
/**
 * Score each mood by counting keyword matches.
 * Returns best-match mood or null if nothing matched.
 * @param {string} input - lowercase string
 * @returns {string|null}
 */
function detectMoodFromKeywords(input) {
  const scores = {};
  for (const [mood, words] of Object.entries(KEYWORDS)) {
    scores[mood] = words.filter(w => input.includes(w)).length;
  }
  const best = Object.keys(scores).reduce((a, b) => scores[a] >= scores[b] ? a : b);
  return scores[best] > 0 ? best : null;
}

/* ═══════════════════════════════════════════════════════════
   🎨 DYNAMIC BACKGROUND CHANGE
   ═══════════════════════════════════════════════════════════ */
/**
 * Change the ambient orb colors based on detected mood.
 * Creates an impressive background glow effect.
 * @param {string} mood
 */
function changeDynamicBg(mood) {
  const cfg = MOOD_CFG[mood];
  if (!cfg) return;
  const [c1, c2, c3] = cfg.bg;
  document.documentElement.style.setProperty('--mood-c1', c1);
  document.documentElement.style.setProperty('--mood-c2', c2);
  document.documentElement.style.setProperty('--mood-c3', c3);
}

/* ═══════════════════════════════════════════════════════════
   😊 MOOD RESULT BADGE
   ═══════════════════════════════════════════════════════════ */
/**
 * Show the detected mood result badge below the input panel.
 * @param {string} mood
 * @param {number|null} confidence
 * @param {string} source - 'camera' | 'voice' | 'text' | 'manual'
 */
function showMoodResult(mood, confidence, source) {
  const cfg = MOOD_CFG[mood];
  $('mrEmoji').textContent = cfg.icon;
  $('mrMood').textContent  = cfg.label;
  $('mrConf').textContent  = confidence ? `${confidence}% confidence` : '';
  $('mrSource').textContent = `via ${source}`;
  $('moodResult').style.display = 'flex';
}

/**
 * Fetch live MP3 streams based on mood context mapping.
 */
async function fetchLiveMusic(mood) {
  try {
    // Dynamically tailor the search term to yield better streams
    const searchTerms = {
      happy: 'happy upbeat party top hits',
      sad: 'sad emotional heartbreak acoustic',
      calm: 'calm relaxing lofi chill',
      energetic: 'energetic gym workout pump',
      angry: 'angry rock intense heavy'
    };
    
    const term = searchTerms[mood] || `${mood} music top tracks`;
    const query = encodeURIComponent(term);
    const res = await fetch(`https://saavn.dev/api/search/songs?limit=12&query=${query}`);
    const json = await res.json();
    if (json && json.success && json.data && json.data.results) {
      return json.data.results.map(item => {
        let streamUrl = '';
        if (item.downloadUrl && item.downloadUrl.length) {
          streamUrl = item.downloadUrl[item.downloadUrl.length - 1].url;
        }
        return {
          id: item.id || `dyn_${Math.random().toString(36).substr(2, 9)}`,
          name: escapeHtml(unescapeHtml(item.name || 'Unknown Track')),
          artist: escapeHtml(unescapeHtml(item.primaryArtists || 'Unknown Artist')),
          file: streamUrl,
          emoji: MOOD_CFG[mood].icon,
          dur: formatSeconds(item.duration || 0),
          mood: mood 
        };
      }).filter(s => s.file);
    }
  } catch(e) { console.warn('Live AI Audio Stream failed, falling back to local dataset.', e); }
  return null;
}

function unescapeHtml(s) {
  return s.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function escapeHtml(s) {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function formatSeconds(sec) {
  let m = Math.floor(sec/60), s = Math.floor(sec%60);
  return `${m}:${s.toString().padStart(2,'0')}`;
}

/**
 * Apply a detected mood: fetch dynamic deep streaming data, 
 * update UI, render songs, update sidebar, save history.
 * @param {string} mood
 */
async function applyMood(mood) {
  if (!SONGS[mood]) return;
  const cfg = MOOD_CFG[mood];
  
  // Show fetching state
  $('heroTitle').innerHTML = `${cfg.icon} ${cfg.label}<br/><em>Generating Live Playlist...</em>`;
  $('heroSub').textContent = 'AI is curating high-quality MP3 streams for your vibe.';

  // Attempt real API fetch
  const dynamicList = await fetchLiveMusic(mood);
  
  currentMood  = mood;
  // Use dynamic list if available and has items, else static fallback
  currentList  = (dynamicList && dynamicList.length > 0) ? dynamicList : SONGS[mood];
  currentIndex = -1;
  activeTab    = 'all';

  // Overwrite global SONGS catalog so favourites/playlist logic knows about the newest dynamic tracks for this session
  if (dynamicList && dynamicList.length > 0) {
    SONGS[mood] = currentList;
  }

  // 1. Save to history
  saveHistory(mood, activeMode);

  // 2. Dynamic background
  changeDynamicBg(mood);

  // 3. Sidebar mood pill
  $('sidebarMoodIcon').textContent  = cfg.icon;
  $('sidebarMoodText').textContent  = cfg.label;
  $('sidebarMood').style.borderColor = cfg.color;
  $('sidebarMood').style.color       = cfg.color;

  // 4. Hero text
  $('heroTitle').innerHTML = `${cfg.icon} ${cfg.label}<br/><em>Playlist Ready</em>`;
  $('heroSub').textContent = `AI successfully generated streams. Enjoy the ${cfg.label.toLowerCase()} vibe!`;

  // 5. Mood banner
  $('mbIcon').textContent        = cfg.icon;
  $('mbIcon').style.background   = cfg.grad;
  $('mbMood').textContent        = cfg.label;
  $('mbDesc').textContent        = `${currentList.length} live tracks curated for your ${cfg.label.toLowerCase()} mood`;
  $('moodBanner').style.background = `linear-gradient(135deg, rgba(${hexToRgb(cfg.color)},0.12), rgba(138,43,226,0.06))`;

  // 6. Player stripe
  $('playerStripe').style.background = cfg.stripe;

  // 7. Tabs & badges
  setTabActive('all');
  updateBadges();

  // 8. Render
  renderSongs('all');

  // 9. Show songs section with smooth scroll
  const section = $('songsSection');
  section.style.display = 'block';
  setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

/* ═══════════════════════════════════════════════════════════
   📊 MOOD HISTORY
   ═══════════════════════════════════════════════════════════ */
/**
 * Save detected mood to history (max 10) in localStorage.
 * @param {string} mood
 * @param {string} source
 */
function saveHistory(mood, source) {
  const entry = { mood, source, ts: Date.now() };
  moodHistory.unshift(entry);
  if (moodHistory.length > 10) moodHistory.pop();
  localStorage.setItem('mt_history', JSON.stringify(moodHistory));
  localStorage.setItem('mt_lastMood', mood);
  renderHistory();
}

/**
 * Render the mood history list in the sidebar.
 */
function renderHistory() {
  const list = $('histList');
  if (!moodHistory.length) {
    list.innerHTML = '<div class="hist-empty">No history yet</div>';
    return;
  }
  list.innerHTML = moodHistory.slice(0, 6).map(entry => {
    const cfg  = MOOD_CFG[entry.mood];
    const time = formatTimeAgo(entry.ts);
    return `
      <div class="hist-item" onclick="applyMood('${entry.mood}')" title="Apply ${cfg.label} mood">
        <span class="hist-item-emoji">${cfg.icon}</span>
        <span class="hist-item-mood">${cfg.label}</span>
        <span class="hist-item-src">${time}</span>
        <span class="hist-arrow">›</span>
      </div>`;
  }).join('');
}

/** Format timestamp as relative time (e.g. "2m ago") */
function formatTimeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

/* ═══════════════════════════════════════════════════════════
   🎬 AI LOADING OVERLAY
   ═══════════════════════════════════════════════════════════ */
const DETECT_STEPS = [
  "Initializing face detection AI…",
  "Analyzing facial landmarks…",
  "Reading micro-expressions…",
  "Calculating emotion scores…",
  "Generating playlist…",
  "Done! 🎉",
];

/**
 * Show loading overlay, animate emotion bars, then call callback.
 * @param {string} title
 * @param {Object} pcts - {mood: percentage}
 * @param {Function} onDone
 */
function showLoadingOverlay(title, pcts, onDone) {
  const overlay = $('loadingOverlay');
  $('loadingTitle').textContent = title;
  overlay.classList.add('active');

  // Reset all bars
  Object.keys(MOOD_CFG).forEach(m => {
    $(`lbf-${m}`).style.width = '0%';
    $(`lbp-${m}`).textContent = '0%';
  });

  let step = 0;
  const stepInterval = setInterval(() => {
    if (step < DETECT_STEPS.length) {
      $('loadingStatus').textContent = DETECT_STEPS[step++];
    }
  }, 600);

  // Animate bars from 0 to target over 2.5s
  const duration = 2500;
  const startTime= performance.now();

  function animateBars(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic

    Object.entries(pcts).forEach(([mood, target]) => {
      const current = Math.round(ease * target);
      $(`lbf-${mood}`).style.width = current + '%';
      $(`lbp-${mood}`).textContent  = current + '%';
    });

    if (progress < 1) {
      requestAnimationFrame(animateBars);
    } else {
      // Set final values
      Object.entries(pcts).forEach(([mood, target]) => {
        $(`lbf-${mood}`).style.width  = Math.round(target) + '%';
        $(`lbp-${mood}`).textContent   = Math.round(target) + '%';
      });
    }
  }
  requestAnimationFrame(animateBars);

  // Hide after 3.2s and call the callback
  setTimeout(() => {
    clearInterval(stepInterval);
    overlay.classList.remove('active');
    onDone();
  }, 3200);
}

/* ═══════════════════════════════════════════════════════════
   🎵 RENDER SONGS
   ═══════════════════════════════════════════════════════════ */
function renderSongs(tab) {
  const grid = $('songsGrid');
  const cfg  = MOOD_CFG[currentMood];

  let list;
  if (tab === 'playlist') {
    list = currentList.map((s,i) => ({...s, idx:i})).filter(s => myPlaylist.has(songKey(s.idx)));
  } else if (tab === 'favourites') {
    list = currentList.map((s,i) => ({...s, idx:i})).filter(s => favourites.has(songKey(s.idx)));
  } else {
    list = currentList.map((s,i) => ({...s, idx:i}));
  }

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">${tab === 'playlist' ? '♪' : '♡'}</div>
        <div class="es-title">Nothing here yet</div>
        <div class="es-sub">
          Go to All Songs and click ${tab === 'playlist' ? '＋ to add to playlist' : '♡ to add favourites'}.
        </div>
      </div>`;
    return;
  }

  grid.innerHTML = list.map((song, i) => {
    const idx   = song.idx;
    const key   = songKey(idx);
    const isFav = favourites.has(key);
    const inPl  = myPlaylist.has(key);
    const playing = (currentIndex === idx);

    return `
      <div class="song-row ${playing ? 'playing' : ''}" id="row-${idx}" onclick="playSongAt(${idx})">
        <span class="song-num">${i + 1}</span>
        <div class="song-art" style="background:${cfg.grad}">${song.emoji}</div>
        <div class="song-info">
          <div class="song-name">${esc(song.name)}</div>
          <div class="song-artist">${esc(song.artist)}</div>
        </div>
        <div class="song-actions" onclick="event.stopPropagation()">
          <button class="song-action-btn ${isFav ? 'fav-active' : ''}"
                  title="${isFav ? 'Remove favourite' : 'Add to favourites'}"
                  onclick="event.stopPropagation(); toggleFav(${idx})">
            ${isFav ? '♥' : '♡'}
          </button>
          <button class="song-action-btn ${inPl ? 'pl-active' : ''}"
                  title="${inPl ? 'Remove from playlist' : 'Add to playlist'}"
                  onclick="event.stopPropagation(); togglePlaylist(${idx})">
            ${inPl ? '✔' : '＋'}
          </button>
        </div>
        <span class="song-dur">${song.dur}</span>
      </div>`;
  }).join('');
}

/* ─── TAB SWITCHING ──────────────────────────────────────── */
function switchTab(tab) {
  activeTab = tab;
  setTabActive(tab);
  renderSongs(tab);
}

function setTabActive(tab) {
  $('tabAll').classList.toggle('active', tab === 'all');
  $('tabPl' ).classList.toggle('active', tab === 'playlist');
  $('tabFav').classList.toggle('active', tab === 'favourites');
}

function updateBadges() {
  if (!currentMood) return;
  const favCnt = currentList.map((_,i) => i).filter(i => favourites.has(songKey(i))).length;
  const plCnt  = currentList.map((_,i) => i).filter(i => myPlaylist.has(songKey(i))).length;
  $('favBadge').textContent = favCnt;
  $('plBadge').textContent  = plCnt;
}

/* ─── SONG KEY ───────────────────────────────────────────── */
function songKey(idx) { return `${currentMood}-${idx}`; }

/* ─── FAVOURITES / PLAYLIST ──────────────────────────────── */
function toggleFav(idx) {
  const key = songKey(idx);
  favourites.has(key) ? favourites.delete(key) : favourites.add(key);
  localStorage.setItem('mt_favs', JSON.stringify([...favourites]));
  updateBadges();
  renderSongs(activeTab);
  if (idx === currentIndex) {
    $('likeBtn').textContent = favourites.has(key) ? '♥' : '♡';
    $('likeBtn').className   = 'p-icon-btn' + (favourites.has(key) ? ' liked' : '');
  }
}

function togglePlaylist(idx) {
  const key = songKey(idx);
  myPlaylist.has(key) ? myPlaylist.delete(key) : myPlaylist.add(key);
  localStorage.setItem('mt_playlist', JSON.stringify([...myPlaylist]));
  updateBadges();
  renderSongs(activeTab);
}

function addToPlaylist() {
  if (currentIndex < 0) return;
  togglePlaylist(currentIndex);
  const key = songKey(currentIndex);
  $('plBtn').className = 'p-icon-btn' + (myPlaylist.has(key) ? ' in-pl' : '');
}

function toggleLike() {
  if (currentIndex < 0) return;
  toggleFav(currentIndex);
}

/* ═══════════════════════════════════════════════════════════
   🎵 PLAY SONG
   ═══════════════════════════════════════════════════════════ */
/**
 * Start playing the song at `idx` in currentList.
 * @param {number} idx
 */
function playSongAt(idx) {
  if (idx < 0 || idx >= currentList.length) return;

  const song  = currentList[idx];
  const audio = $('audioPlayer');
  const cfg   = MOOD_CFG[currentMood] || MOOD_CFG.calm;

  currentIndex = idx;

  // Highlight active song row
  document.querySelectorAll('.song-row').forEach(r => r.classList.remove('playing'));
  const row = $(`row-${idx}`);
  if (row) row.classList.add('playing');

  // Update player bar info
  $('playerArt').textContent       = song.emoji;
  $('playerArt').style.background  = cfg.grad;
  $('playerTitle').textContent     = song.name;
  $('playerArtist').textContent    = song.artist;
  $('timeTot').textContent         = song.dur;

  // Like button state
  const key = songKey(idx);
  $('likeBtn').textContent = favourites.has(key) ? '♥' : '♡';
  $('likeBtn').className   = 'p-icon-btn' + (favourites.has(key) ? ' liked' : '');
  $('plBtn').className     = 'p-icon-btn' + (myPlaylist.has(key) ? ' in-pl' : '');

  // Reset progress bar
  $('progFill').style.width = '0%';
  $('progThumb').style.left = '0%';
  $('timeCur').textContent  = '0:00';

  // Show player bar with spring animation
  $('playerBar').classList.add('visible');

  // Sidebar now-playing mini card
  $('sidebarNP').style.display  = 'block';
  $('snpArt').textContent       = song.emoji;
  $('snpArt').style.background  = cfg.grad;
  $('snpName').textContent      = song.name;
  $('snpArtist').textContent    = song.artist;

  // Load and play the audio file
  audio.src    = song.file;
  audio.volume = parseInt($('volRange').value) / 100;
  audio.play()
    .then(() => {
      isPlaying = true;
      $('ppBtn').textContent = '⏸';
    })
    .catch(err => {
      console.warn('Audio play error:', err);
      if ($('inputHint')) {
        $('inputHint').textContent =
          `⚠ File not found: "${song.file}" — add your MP3s to the songs/ folder.`;
        $('inputHint').className = 'input-hint error';
      }
      isPlaying = false;
      $('ppBtn').textContent = '▶';
    });
}

/* ─── PLAYBACK CONTROLS ──────────────────────────────────── */
function togglePlay() {
  const audio = $('audioPlayer');
  if (currentIndex < 0) return;
  if (isPlaying) { audio.pause(); } else { audio.play(); }
}

function nextSong() {
  if (!currentList.length) return;
  if (shuffle) {
    let next;
    do { next = Math.floor(Math.random() * currentList.length); }
    while (next === currentIndex && currentList.length > 1);
    playSongAt(next);
  } else {
    playSongAt((currentIndex + 1) % currentList.length);
  }
}

function prevSong() {
  const audio = $('audioPlayer');
  if (!currentList.length) return;
  if (audio.currentTime > 3) audio.currentTime = 0;
  else playSongAt((currentIndex - 1 + currentList.length) % currentList.length);
}

function toggleShuffle() {
  shuffle = !shuffle;
  $('shuffleBtn').classList.toggle('active', shuffle);
}

function toggleRepeat() {
  repeat = !repeat;
  $('repeatBtn').classList.toggle('active', repeat);
}

function setVolume(val) {
  $('audioPlayer').volume = parseInt(val) / 100;
}

function seekTo(evt) {
  const audio = $('audioPlayer');
  if (!audio.duration) return;
  const rect = $('progTrack').getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (evt.clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
}

/* ─── AUDIO EVENTS ───────────────────────────────────────── */
function setupAudio() {
  const audio = $('audioPlayer');

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    $('progFill').style.width = pct + '%';
    $('progThumb').style.left = pct + '%';
    $('timeCur').textContent  = fmtTime(audio.currentTime);
  });

  audio.addEventListener('ended', () => {
    isPlaying = false;
    $('ppBtn').textContent = '▶';
    if (repeat) playSongAt(currentIndex);
    else nextSong();
  });

  audio.addEventListener('play',  () => { isPlaying = true;  $('ppBtn').textContent = '⏸'; });
  audio.addEventListener('pause', () => { isPlaying = false; $('ppBtn').textContent = '▶'; });
  audio.addEventListener('loadedmetadata', () => {
    $('timeTot').textContent = fmtTime(audio.duration);
  });
}

/* ─── RESET MOOD ─────────────────────────────────────────── */
function resetMood() {
  // Stop camera if active
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
    $('cameraFeed').srcObject = null;
    $('cameraOverlay').classList.remove('hidden');
    $('detectCamBtn').disabled = true;
    $('startCamBtn').textContent = '📷 Start Camera';
  }

  currentMood = null; currentList = []; currentIndex = -1;
  $('songsSection').style.display = 'none';
  $('moodResult').style.display   = 'none';
  $('heroTitle').innerHTML = 'How are you<br/><em>feeling today?</em>';
  $('heroSub').textContent = 'Use your camera, voice, or text — we\'ll detect your mood and build the perfect playlist.';
  if ($('inputHint')) {
    $('inputHint').textContent = 'Press Enter or click Detect Mood to find your playlist.';
    $('inputHint').className   = 'input-hint';
  }
  $('sidebarMoodIcon').textContent  = '✦';
  $('sidebarMoodText').textContent  = 'Not detected yet';
  $('sidebarMood').style.borderColor = '';
  $('sidebarMood').style.color       = '';
  $('sidebarNP').style.display       = 'none';
  $('tryAgainBtn').style.display     = 'none';

  // Reset dynamic background
  document.documentElement.style.setProperty('--mood-c1', 'rgba(138,43,226,0.35)');
  document.documentElement.style.setProperty('--mood-c2', 'rgba(212,175,55,0.20)');
  document.documentElement.style.setProperty('--mood-c3', 'rgba(232,164,184,0.18)');
}

/* ─── UTILITIES ──────────────────────────────────────────── */
function fmtTime(sec) {
  sec = Math.floor(sec || 0);
  return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
}

function esc(str) {
  const m = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
  return str.replace(/[&<>"']/g, c => m[c]);
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}

/* ═══════════════════════════════════════════════════════════
   🔐 LOGIN SYSTEM
   ═══════════════════════════════════════════════════════════ */

/**
 * Simple credential validation.
 * Accepts: admin/1234 OR any non-empty username + any password ≥ 4 chars.
 */
function doLogin() {
  const user = ($('loginUsername').value || '').trim();
  const pass = ($('loginPassword').value || '').trim();
  const errEl = $('loginError');

  if (!user || !pass) {
    errEl.style.display = 'block';
    errEl.textContent = '⚠ Please enter both username and password.';
    return;
  }

  // Accept admin/1234 OR any username with password >= 4 chars
  const valid = (user === 'admin' && pass === '1234') ||
                (user.length >= 2 && pass.length >= 4);

  if (!valid) {
    errEl.style.display = 'block';
    errEl.textContent = '❌ Password must be at least 4 characters.';
    $('loginPassword').focus();
    return;
  }

  // Save session
  localStorage.setItem('mt_loggedIn', '1');
  localStorage.setItem('mt_username', user);
  dismissLogin(user);
}

/**
 * Login as guest — no credentials needed.
 */
function loginAsGuest() {
  localStorage.setItem('mt_loggedIn', '1');
  localStorage.setItem('mt_username', 'Guest');
  dismissLogin('Guest');
}

/**
 * Animate login overlay out and reveal the app.
 * @param {string} username
 */
function dismissLogin(username) {
  const overlay = $('loginOverlay');
  overlay.classList.add('fade-out');
  setTimeout(() => {
    overlay.style.display = 'none';

    // Personalise hero subtitle
    const heroSub = $('heroSub');
    if (heroSub) {
      heroSub.textContent =
        `Hey ${username}! Point your camera, speak, or type — AI detects your mood & builds the perfect playlist.`;
    }

    // Update sidebar user card
    setSidebarUser(username);
  }, 500);
}

/* ═══════════════════════════════════════════════════════════
   ♡ GO TO FAVOURITES (sidebar nav fix)
   Works whether or not a mood has been detected yet.
   ═══════════════════════════════════════════════════════════ */
function goToFavourites() {
  if (currentMood) {
    // Mood is active — just switch tab & scroll
    const section = $('songsSection');
    section.style.display = 'block';
    switchTab('favourites');
    setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  } else {
    // No mood yet — show cross-mood favourites
    showAllFavourites();
  }

  // Highlight nav item
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navFav = $('navFavourites');
  if (navFav) navFav.classList.add('active');
}

/**
 * Render a special "All Favourites" view across all moods
 * when no mood has been detected yet.
 */
function showAllFavourites() {
  // Build a combined list of all favourited songs across moods
  const allFavSongs = [];
  for (const [mood, songs] of Object.entries(SONGS)) {
    songs.forEach((song, idx) => {
      const key = `${mood}-${idx}`;
      if (favourites.has(key)) {
        allFavSongs.push({ ...song, mood, idx, key });
      }
    });
  }

  // Set currentMood to a temp display list (reuse happy as fallback for gradient)
  const section = $('songsSection');
  section.style.display = 'block';

  // Update banner to show "All Favourites"
  $('mbIcon').textContent       = '♥';
  $('mbIcon').style.background  = 'linear-gradient(135deg,#e8a4b8,#be185d)';
  $('mbMood').textContent       = 'All Favourites';
  $('mbDesc').textContent       = `${allFavSongs.length} song${allFavSongs.length !== 1 ? 's' : ''} you loved`;
  $('moodBanner').style.background = 'linear-gradient(135deg,rgba(232,164,184,0.12),rgba(138,43,226,0.06))';

  // Hide normal tabs, just show the grid
  const grid = $('songsGrid');
  if (allFavSongs.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">♡</div>
        <div class="es-title">No favourites yet</div>
        <div class="es-sub">Detect a mood, then click ♡ on any song to save it here.</div>
      </div>`;
  } else {
    grid.innerHTML = allFavSongs.map((song, i) => {
      const cfg = MOOD_CFG[song.mood];
      return `
        <div class="song-row" id="row-fav-${i}"
             onclick="playFavSong('${song.mood}', ${song.idx})">
          <span class="song-num">${i + 1}</span>
          <div class="song-art" style="background:${cfg.grad}">${song.emoji}</div>
          <div class="song-info">
            <div class="song-name">${esc(song.name)}</div>
            <div class="song-artist">${esc(song.artist)} <span style="color:var(--gold);font-size:10px;margin-left:4px">${cfg.icon} ${cfg.label}</span></div>
          </div>
          <div class="song-actions" onclick="event.stopPropagation()">
            <button class="song-action-btn fav-active"
                    title="Remove from favourites"
                    onclick="removeFavGlobal('${song.mood}', ${song.idx}, ${i})">♥</button>
          </div>
          <span class="song-dur">${song.dur}</span>
        </div>`;
    }).join('');
  }

  setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
}

/**
 * Play a song from the All Favourites view.
 * Switches context to that mood first.
 * @param {string} mood
 * @param {number} idx
 */
function playFavSong(mood, idx) {
  if (!SONGS[mood]) return;
  currentMood  = mood;
  currentList  = SONGS[mood];
  activeTab    = 'favourites';
  changeDynamicBg(mood);
  const cfg = MOOD_CFG[mood];
  $('playerStripe').style.background = cfg.stripe;
  playSongAt(idx);
}

/**
 * Remove a song from favourites in the All Favourites view.
 */
function removeFavGlobal(mood, idx, rowNum) {
  const key = `${mood}-${idx}`;
  favourites.delete(key);
  localStorage.setItem('mt_favs', JSON.stringify([...favourites]));
  // Re-render the all-favourites view
  showAllFavourites();
}

/* ═══════════════════════════════════════════════════════════
   🔐 LOGOUT + NAV HELPERS
   ═══════════════════════════════════════════════════════════ */

/**
 * Log out: clear session, stop audio + camera, show login screen.
 */
function logoutUser() {
  // Stop audio
  const audio = $('audioPlayer');
  if (audio) { audio.pause(); audio.src = ''; }
  isPlaying = false;

  // Stop camera
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }

  // Clear login session
  localStorage.removeItem('mt_loggedIn');
  localStorage.removeItem('mt_username');

  // Show login overlay with animation
  const overlay = $('loginOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.classList.remove('fade-out');
    // Clear fields
    const u = $('loginUsername'), p = $('loginPassword');
    if (u) u.value = '';
    if (p) p.value = '';
    $('loginError').style.display = 'none';
    setTimeout(() => { if (u) u.focus(); }, 300);
  }
}

/**
 * Populate the sidebar user card with username + first-letter avatar.
 * @param {string} username
 */
function setSidebarUser(username) {
  const nameEl   = $('suName');
  const avatarEl = $('suAvatar');
  if (nameEl)   nameEl.textContent   = username;
  if (avatarEl) {
    const letter = username.charAt(0).toUpperCase();
    avatarEl.textContent = letter;
    avatarEl.style.fontSize = '15px';
    avatarEl.style.fontWeight = '700';
    avatarEl.style.color = '#d4af37';
  }
}

/**
 * Set a sidebar nav item as active.
 * @param {string} id - element id of the nav item
 */
function setNavActive(id) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = $(id);
  if (el) el.classList.add('active');
}

/**
 * Navigate back to the Discover / hero section.
 */
function resetToDiscover() {
  setNavActive('navDiscover');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Scroll to the songs section if a mood is already active.
 */
function scrollToSongs() {
  setNavActive('navMyMusic');
  const section = $('songsSection');
  if (section && section.style.display !== 'none') {
    if (activeTab !== 'all') switchTab('all');
    setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  } else {
    // No mood yet — scroll to hero detection area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* ═══════════════════════════════════════════════════════════
   🚀 INIT
   ═══════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  setupAudio();

  // ── Login check ─────────────────────────────────────────
  const isLoggedIn = localStorage.getItem('mt_loggedIn') === '1';
  const savedUser  = localStorage.getItem('mt_username') || 'Guest';

  if (isLoggedIn) {
    // Already logged in — skip login screen instantly
    const overlay = $('loginOverlay');
    if (overlay) overlay.style.display = 'none';

    // Personalise hero subtitle
    const heroSub = $('heroSub');
    if (heroSub) {
      heroSub.textContent =
        `Hey ${savedUser}! Point your camera, speak, or type — AI detects your mood & builds the perfect playlist.`;
    }

    // Populate sidebar user card
    setSidebarUser(savedUser);
  } else {
    // Show login overlay — focus username field after animation
    setTimeout(() => {
      const u = $('loginUsername');
      if (u) u.focus();
    }, 400);
  }

  // ── Enter key in login fields ───────────────────────────
  ['loginUsername', 'loginPassword'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  });

  // ── Enter key → detect text mood ───────────────────────
  const moodInput = $('moodInput');
  if (moodInput) {
    moodInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') detectMoodFromText();
    });
  }

  // ── Render saved history ────────────────────────────────
  renderHistory();

  // ── Show last session mood hint ─────────────────────────
  const savedMood = localStorage.getItem('mt_lastMood');
  if (savedMood && MOOD_CFG[savedMood] && $('inputHint')) {
    $('inputHint').textContent =
      `🕐 Last session: "${MOOD_CFG[savedMood].label}" — detect a new mood or click Quick Mood.`;
  }

  // ── Default input mode ──────────────────────────────────
  switchMode('camera');

  console.log('🎵 MoodTune AI ready! Login ✦ Modes: camera | voice | text');
});

