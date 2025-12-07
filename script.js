// ========= GLOBAL STATE =========

let voiceGuideEnabled = true;
let screenBlinking = false;
let screenBlinkInterval = null;

let torchStream = null;
let torchTrack = null;
let torchBlinking = false;
let torchInterval = null;

let sirenPlaying = false;

const statusText = document.getElementById("statusText");
const screenOverlay = document.getElementById("screenFlashOverlay");
const sirenAudio = document.getElementById("sirenAudio");


// ========= VOICE / STATUS SPEAK =========
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


// ========= CONTACT MANAGEMENT =========
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
    console.error("Load failed", e);
  }
}

function saveContacts() {
  const data = {
    c1Name: c1Name.value.trim(),
    c1Phone: c1Phone.value.trim(),
    c2Name: c2Name.value.trim(),
    c2Phone: c2Phone.value.trim(),
    c3Name: c3Name.value.trim(),
    c3Phone: c3Phone.value.trim()
  };

  localStorage.setItem("safeherContacts", JSON.stringify(data));
  setStatus("Contacts saved successfully.");
}


// ========= LOCATION HELPERS =========
function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000
    });
  });
}

function waLink(phone, msg) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}


// ========= SEND SOS =========
async function sendSOS() {
  const saved = JSON.parse(localStorage.getItem("safeherContacts") || "{}");
  const phone = saved.c1Phone;

  if (!phone) {
    alert("Save Contact 1 (Dad) first!");
    return;
  }

  setStatus("Preparing SOS with your live location…");

  let base = "🚨 EMERGENCY! I am in danger. Please help immediately.";

  try {
    const pos = await getPosition();
    const { latitude, longitude } = pos.coords;
    base += `\n\n📍 Location: https://maps.google.com/?q=${latitude},${longitude}`;
  } catch {
    base += "\n\n❗Could not attach GPS location.";
  }

  window.open(waLink(phone, base), "_blank");
  setStatus("SOS sent to your primary contact.");
}


// ========= SHARE LOCATION =========
async function shareLocationOnly() {
  const saved = JSON.parse(localStorage.getItem("safeherContacts") || "{}");
  const phone = saved.c1Phone;

  if (!phone) {
    alert("Save Contact 1 first!");
    return;
  }

  setStatus("Fetching your location…");

  try {
    const pos = await getPosition();
    const { latitude, longitude } = pos.coords;

    const msg = `📍 My location: https://maps.google.com/?q=${latitude},${longitude}`;
    window.open(waLink(phone, msg), "_blank");

    setStatus("Location sent.");
  } catch {
    alert("Unable to fetch location.");
    setStatus("Failed to fetch location.");
  }
}


// ========= VOICE SOS (help me) =========

let recognition = null;

function setupVoiceRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRec) {
    voiceSosBtn.textContent = "🎤 Voice SOS not supported";
    voiceSosBtn.disabled = true;
    return;
  }

  recognition = new SpeechRec();
  recognition.lang = "en-IN";

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript.toLowerCase();
    console.log("Heard:", text);

    if (text.includes("help me") || text.includes("help")) {
      setStatus('Voice command detected: "help me". Sending SOS.');
      sendSOS();
    } else {
      setStatus("Voice heard but not recognized as SOS.");
    }
  };

  recognition.onerror = () => setStatus("Voice SOS error.");
}

function startVoiceSOS() {
  if (!recognition) {
    alert("Voice recognition not supported.");
    return;
  }
  setStatus("Listening… say 'help me'.");
  recognition.start();
}

// ========= PHONE FLASH BLINK (REAL FLASHLIGHT) =========
async function togglePhoneFlash() {
  const btn = document.getElementById("cameraFlashBtn");

  // TURN OFF
  if (torchBlinking) {
    torchBlinking = false;
    clearInterval(torchInterval);

    try {
      await torchTrack.applyConstraints({ advanced: [{ torch: false }] });
    } catch {}

    if (torchStream) {
      torchStream.getTracks().forEach(t => t.stop());
    }

    torchStream = null;
    torchTrack = null;

    btn.textContent = "📸 Phone Flash Blink";
    setStatus("Phone flashlight stopped.");
    return;
  }

  // TURN ON
  try {
    torchStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });

    torchTrack = torchStream.getVideoTracks()[0];
    let on = false;

    torchBlinking = true;

    torchInterval = setInterval(async () => {
      on = !on;
      try {
        await torchTrack.applyConstraints({ advanced: [{ torch: on }] });
      } catch (e) {
        console.log("Torch toggle error", e);
      }
    }, 200);

    btn.textContent = "📸 Stop Flash Blink";
    setStatus("Phone flashlight blinking ON.");

  } catch (e) {
    alert("Torch not supported on this device.");
    setStatus("Flashlight not supported.");
  }
}


// ========= SIREN =========
function toggleSiren() {
  if (!sirenPlaying) {
    sirenAudio.currentTime = 0;
    sirenAudio.play();
    sirenPlaying = true;
    sirenBtn.textContent = "📢 Stop Siren Alarm";
    setStatus("Siren ON.");
  } else {
    sirenAudio.pause();
    sirenPlaying = false;
    sirenBtn.textContent = "📢 Siren Alarm";
    setStatus("Siren OFF.");
  }
}


// ========= POLICE CALL =========
function callPolice() {
  window.location.href = "tel:112";
  setStatus("Calling police emergency number.");
}


// ========= VOICE GUIDE =========
function toggleVoiceGuide() {
  voiceGuideEnabled = !voiceGuideEnabled;
  voiceToggleBtn.textContent =
    voiceGuideEnabled ? "🔊 Voice Guide: ON" : "🔇 Voice Guide: OFF";
  setStatus(
    voiceGuideEnabled ? "Voice guide ON." : "Voice guide OFF."
  );
}


// ========= READ TIPS =========
function readTips() {
  const items = document.querySelectorAll("#tipsList li");
  const text = Array.from(items)
    .map((li, i) => `Tip ${i + 1}. ${li.textContent}`)
    .join(" ");
  setStatus("Reading tips…");
  speak(text);
}


// ========= INIT =========
window.addEventListener("DOMContentLoaded", () => {
  loadContacts();
  setupVoiceRecognition();

  saveContactsBtn.onclick = saveContacts;
  sosBtn.onclick = sendSOS;
  voiceSosBtn.onclick = startVoiceSOS;
  cameraFlashBtn.onclick = togglePhoneFlash;
  sirenBtn.onclick = toggleSiren;
  locationBtn.onclick = shareLocationOnly;
  policeBtn.onclick = callPolice;
  voiceToggleBtn.onclick = toggleVoiceGuide;
  readTipsBtn.onclick = readTips;

  setStatus("Welcome to SafeHer. Save your contacts and stay safe.");
});
