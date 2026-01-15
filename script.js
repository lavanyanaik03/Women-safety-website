// ========= GLOBAL STATE =========
let voiceGuideEnabled = true;
let screenBlinking = false;
let screenBlinkInterval = null;

let flashStream = null;
let flashTrack = null;
let flashBlinking = false;
let flashBlinkInterval = null;

let sirenPlaying = false;

const statusText = document.getElementById("statusText");
const screenOverlay = document.getElementById("screenFlashOverlay");
const sirenAudio = document.getElementById("sirenAudio");

// ========= VOICE / STATUS HELPERS =========
function setStatus(msg) {
  if (statusText) statusText.textContent = msg;
  speak(msg);
}

function speak(text) {
  if (!voiceGuideEnabled) return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-IN";
  utt.rate = 1;
  window.speechSynthesis.speak(utt);
}

// ========= CONTACTS STORAGE =========
function loadContacts() {
  try {
    const saved = JSON.parse(localStorage.getItem("safeherContacts"));
    if (saved) {
      document.getElementById("c1Name").value = saved.c1Name || "";
      document.getElementById("c1Phone").value = saved.c1Phone || "";
      document.getElementById("c2Name").value = saved.c2Name || "";
      document.getElementById("c2Phone").value = saved.c2Phone || "";
      document.getElementById("c3Name").value = saved.c3Name || "";
      document.getElementById("c3Phone").value = saved.c3Phone || "";
    }
  } catch (e) {
    console.error("Load contacts error", e);
  }
}

function saveContacts() {
  const contacts = {
    c1Name: document.getElementById("c1Name").value.trim(),
    c1Phone: document.getElementById("c1Phone").value.trim(),
    c2Name: document.getElementById("c2Name").value.trim(),
    c2Phone: document.getElementById("c2Phone").value.trim(),
    c3Name: document.getElementById("c3Name").value.trim(),
    c3Phone: document.getElementById("c3Phone").value.trim()
  };
  localStorage.setItem("safeherContacts", JSON.stringify(contacts));
  setStatus("Contacts saved. Your SOS will use Dad’s number first.");
}

// ========= GEOLOCATION HELPERS =========
function getCurrentPositionPromise() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve(pos),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

function buildWhatsAppURL(phone, message) {
  const cleanPhone = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// ========= SOS / LOCATION =========
async function sendSOS(baseText) {
  const contacts = JSON.parse(localStorage.getItem("safeherContacts") || "{}");
  const phone = contacts.c1Phone;
  if (!phone) {
    alert("Please save Contact 1 (Dad) phone number first.");
    setStatus("Cannot send SOS. Save Dad’s number as Contact 1.");
    return;
  }

  const msgText =
    baseText || "Emergency! I'm in danger. Please help me immediately.";

  setStatus("Preparing SOS message with your location…");

  try {
    const pos = await getCurrentPositionPromise();
    const { latitude, longitude } = pos.coords;
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const finalMessage = `${msgText}\n\nMy location: ${mapsLink}`;
    const waURL = buildWhatsAppURL(phone, finalMessage);
    window.open(waURL, "_blank");
    setStatus("Opening WhatsApp with SOS message to your primary contact.");
  } catch (err) {
    console.error(err);
    const finalMessage =
      msgText +
      "\n\nLocation could not be attached automatically. Please share manually.";
    const waURL = buildWhatsAppURL(phone, finalMessage);
    window.open(waURL, "_blank");
    setStatus(
      "Opening WhatsApp with SOS message (without automatic location)."
    );
  }
}

async function shareLocationOnly() {
  const contacts = JSON.parse(localStorage.getItem("safeherContacts") || "{}");
  const phone = contacts.c1Phone;
  if (!phone) {
    alert("Please save Contact 1 (Dad) phone number first.");
    setStatus("Cannot share location. Save Dad’s number as Contact 1.");
    return;
  }

  setStatus("Getting your location to share…");

  try {
    const pos = await getCurrentPositionPromise();
    const { latitude, longitude } = pos.coords;
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const msg = `This is my current location. Please check on me:\n${mapsLink}`;
    const waURL = buildWhatsAppURL(phone, msg);
    window.open(waURL, "_blank");
    setStatus("Opening WhatsApp with your location.");
  } catch (err) {
    console.error(err);
    alert("Could not get location. Please turn on GPS.");
    setStatus("Failed to get location. Please turn on GPS.");
  }
}

// ========= VOICE SOS (SpeechRecognition) =========
let recognition = null;

function setupVoiceRecognition() {
  const SpeechRec =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    const btn = document.getElementById("voiceSosBtn");
    btn.textContent = "🎙️ Voice SOS not supported on this device";
    btn.disabled = true;
    return;
  }

  recognition = new SpeechRec();
  recognition.lang = "en-IN";
  recognition.interimResults = false;

  recognition.onstart = () => {
    setStatus('Listening… please say "help me".');
  };

  recognition.onerror = () => {
    setStatus("Could not hear you clearly. Try Voice SOS again.");
  };

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log("Heard:", transcript);
    if (transcript.includes("help me")) {
      setStatus('Phrase "help me" detected. Sending SOS now.');
      sendSOS(
        'Emergency! I said "help me". Please respond immediately and check on me.'
      );
    } else {
      setStatus('I did not hear "help me". Voice SOS cancelled.');
    }
  };
}

function startVoiceSOS() {
  if (!recognition) {
    setStatus("Voice SOS is not supported on this browser.");
    return;
  }
  recognition.start();
}

// ========= SCREEN BLINK =========
function toggleScreenBlink() {
  const btn = document.getElementById("screenBlinkBtn");
  if (!screenBlinking) {
    screenBlinking = true;
    screenOverlay.classList.add("active");
    let on = false;
    screenBlinkInterval = setInterval(() => {
      on = !on;
      screenOverlay.style.backgroundColor = on
        ? "rgba(255,255,255,0.9)"
        : "rgba(255,105,180,0.5)";
    }, 180);
    btn.textContent = "💻 Stop Screen Blink";
    setStatus("Screen blink alert is ON.");
  } else {
    screenBlinking = false;
    clearInterval(screenBlinkInterval);
    screenOverlay.classList.remove("active");
    btn.textContent = "💻 Screen Blink Alert";
    setStatus("Screen blink alert is OFF.");
  }
}

// ========= CAMERA FLASH BLINK =========
async function toggleCameraFlash() {
  const btn = document.getElementById("cameraFlashBtn");

  if (flashBlinking) {
    // turn OFF
    flashBlinking = false;
    clearInterval(flashBlinkInterval);
    try {
      if (flashTrack) {
        await flashTrack.applyConstraints({ advanced: [{ torch: false }] });
      }
    } catch (e) {
      console.warn("Error disabling torch", e);
    }
    if (flashStream) {
      flashStream.getTracks().forEach(t => t.stop());
    }
    flashStream = null;
    flashTrack = null;
    btn.textContent = "📸 Camera Flash Alert";
    setStatus("Camera flash alert is OFF.");
    return;
  }

  // turn ON
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Camera flash not supported on this device.");
    setStatus("Camera flash not supported on this device.");
    return;
  }

  try {
    flashStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
    flashTrack = flashStream.getVideoTracks()[0];
    let torchOn = false;

    flashBlinking = true;
    flashBlinkInterval = setInterval(async () => {
      if (!flashTrack) return;
      torchOn = !torchOn;
      try {
        await flashTrack.applyConstraints({
          advanced: [{ torch: torchOn }]
        });
      } catch (e) {
        console.warn("Torch toggle error", e);
      }
    }, 200);

    btn.textContent = "📸 Stop Camera Flash";
    setStatus("Camera flash alert is ON (if supported by your phone).");
  } catch (e) {
    console.error(e);
    alert("Could not access camera flash. Permission or support issue.");
    setStatus("Could not access camera flash.");
  }
}

// ========= SIREN =========
function toggleSiren() {
  const btn = document.getElementById("sirenBtn");
  if (!sirenPlaying) {
    sirenAudio.currentTime = 0;
    sirenAudio.play().catch(err => console.error(err));
    sirenPlaying = true;
    btn.textContent = "📢 Stop Siren Alarm";
    setStatus("Siren is ON. Hold your phone so people can hear it.");
  } else {
    sirenAudio.pause();
    sirenPlaying = false;
    btn.textContent = "📢 Siren Alarm";
    setStatus("Siren stopped.");
  }
}

// ========= POLICE CALL =========
function callPolice() {
  setStatus("Calling police emergency number 112.");
  window.location.href = "tel:112";
}

// ========= VOICE GUIDE TOGGLE =========
function toggleVoiceGuide() {
  voiceGuideEnabled = !voiceGuideEnabled;
  const btn = document.getElementById("voiceToggleBtn");
  btn.textContent = voiceGuideEnabled ? "🔊 Voice Guide: ON" : "🔇 Voice Guide: OFF";
  if (voiceGuideEnabled) {
    setStatus("Voice guide is now ON. I will read important status updates for you.");
  } else {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    statusText.textContent =
      "Voice guide is OFF. Turn it on again anytime using the button above.";
  }
}

// ========= READ TIPS =========
function readTips() {
  const list = document.querySelectorAll("#tipsList li");
  if (!list.length) return;
  const text = Array.from(list)
    .map((li, i) => `Tip ${i + 1}. ${li.textContent}`)
    .join(" ");
  setStatus("Reading self-defense tips.");
  speak(text);
}

// ========= INIT =========
window.addEventListener("DOMContentLoaded", () => {
  loadContacts();
  setupVoiceRecognition();

  // Buttons
  document.getElementById("saveContactsBtn").addEventListener("click", saveContacts);
  document.getElementById("sosBtn").addEventListener("click", () => sendSOS());
  document.getElementById("voiceSosBtn").addEventListener("click", startVoiceSOS);
  document
    .getElementById("screenBlinkBtn")
    .addEventListener("click", toggleScreenBlink);
  document
    .getElementById("cameraFlashBtn")
    .addEventListener("click", toggleCameraFlash);
  document.getElementById("sirenBtn").addEventListener("click", toggleSiren);
  document
    .getElementById("locationBtn")
    .addEventListener("click", shareLocationOnly);
  document.getElementById("policeBtn").addEventListener("click", callPolice);
  document
    .getElementById("voiceToggleBtn")
    .addEventListener("click", toggleVoiceGuide);
  document.getElementById("readTipsBtn").addEventListener("click", readTips);

  // Friendly welcome
  setStatus(
    "Welcome to SafeHer, Lavanya. Save Dad, Mom and Brother or Sister as your emergency contacts."
  );
});
