// --------- Helper: status + voice ---------------------------------

const statusEl = document.getElementById("status");
const voiceToggleBtn = document.getElementById("voiceToggleBtn");
let voiceEnabled = true;

function setStatus(text) {
  statusEl.textContent = text;
  speakIfEnabled(text);
}

function speakIfEnabled(text) {
  if (!voiceEnabled) return;
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// Voice guide toggle
voiceToggleBtn.addEventListener("click", () => {
  voiceEnabled = !voiceEnabled;
  if (voiceEnabled) {
    voiceToggleBtn.textContent = "🔈 Voice Guide: ON";
    setStatus("Voice guide is now on. I will read buttons and tips aloud.");
  } else {
    voiceToggleBtn.textContent = "🔇 Voice Guide: OFF";
    setStatus("Voice guide turned off.");
  }
});

// --------- Emergency contacts storage -----------------------------

const c1Name = document.getElementById("c1Name");
const c1Phone = document.getElementById("c1Phone");
const c2Name = document.getElementById("c2Name");
const c2Phone = document.getElementById("c2Phone");
const c3Name = document.getElementById("c3Name");
const c3Phone = document.getElementById("c3Phone");
const saveContactsBtn = document.getElementById("saveContactsBtn");

function loadContacts() {
  try {
    const data = JSON.parse(localStorage.getItem("safeherContacts"));
    if (!data) return;
    c1Name.value = data.c1Name || "";
    c1Phone.value = data.c1Phone || "";
    c2Name.value = data.c2Name || "";
    c2Phone.value = data.c2Phone || "";
    c3Name.value = data.c3Name || "";
    c3Phone.value = data.c3Phone || "";
  } catch (e) {
    console.error(e);
  }
}

function getContacts() {
  return {
    c1Name: c1Name.value.trim(),
    c1Phone: c1Phone.value.trim(),
    c2Name: c2Name.value.trim(),
    c2Phone: c2Phone.value.trim(),
    c3Name: c3Name.value.trim(),
    c3Phone: c3Phone.value.trim(),
  };
}

saveContactsBtn.addEventListener("click", () => {
  const data = getContacts();
  localStorage.setItem("safeherContacts", JSON.stringify(data));
  setStatus("Contacts saved. Your SOS will use your primary contact first.");
});

loadContacts();

// --------- SOS via WhatsApp ---------------------------------------

const sosBtn = document.getElementById("sosBtn");

function openWhatsApp(phone, message) {
  if (!phone) {
    alert("Please add at least your primary contact phone number.");
    return;
  }
  const url =
    "https://wa.me/" +
    encodeURIComponent(phone) +
    "?text=" +
    encodeURIComponent(message);
  window.open(url, "_blank");
}

function buildSOSMessage(includeLocation, locationText) {
  let msg = "🚨 SOS! I need help.\n";
  if (includeLocation && locationText) {
    msg += "\nMy location:\n" + locationText + "\n";
  }
  msg += "\nSent from SafeHer – by Lavanya Naik.";
  return msg;
}

sosBtn.addEventListener("click", () => {
  const contacts = getContacts();
  if (!contacts.c1Phone) {
    alert("Please save your primary contact phone number first.");
    return;
  }
  const message = buildSOSMessage(false, "");
  openWhatsApp(contacts.c1Phone, message);
  setStatus("Opening WhatsApp with SOS message to your primary contact.");
});

// --------- Voice SOS (“help me”) ----------------------------------

const voiceSosBtn = document.getElementById("voiceSosBtn");
let recognition;

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const Rec =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new Rec();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    if (transcript.includes("help")) {
      setStatus('I heard "help me". Sending SOS now.');
      sosBtn.click();
    } else {
      setStatus('I heard "' + transcript + '". Say “help me” to send SOS.');
    }
  });

  recognition.addEventListener("error", (e) => {
    console.error(e);
    setStatus("Could not listen. Please try again or use the SOS button.");
  });
}

voiceSosBtn.addEventListener("click", () => {
  if (!recognition) {
    alert("Voice SOS is not supported on this browser.");
    return;
  }
  setStatus('Listening... say "help me" clearly.');
  recognition.start();
});

// --------- Siren --------------------------------------------------

const sirenBtn = document.getElementById("sirenBtn");
const sirenAudio = document.getElementById("sirenAudio");
let sirenPlaying = false;

sirenBtn.addEventListener("click", () => {
  if (!sirenPlaying) {
    sirenAudio.loop = true;
    sirenAudio.play().catch(() => {
      alert("Please tap again to allow audio.");
    });
    sirenPlaying = true;
    sirenBtn.textContent = "🔇 Stop Siren";
    setStatus("Siren is ON. Hold your phone up so people can hear it.");
  } else {
    sirenAudio.pause();
    sirenPlaying = false;
    sirenBtn.textContent = "🔊 Siren Alarm";
    setStatus("Siren stopped.");
  }
});

// --------- Screen blink (CSS) -------------------------------------

const screenFlashBtn = document.getElementById("screenFlashBtn");

screenFlashBtn.addEventListener("click", () => {
  const active = document.body.classList.toggle("blink-mode");
  if (active) {
    setStatus(
      "Screen blink alert is ON. Your screen will flash to draw attention."
    );
    screenFlashBtn.textContent = "✨ Stop Screen Blink";
  } else {
    setStatus("Screen blink alert is OFF.");
    screenFlashBtn.textContent = "✨ Screen Blink Alert";
  }
});

// --------- Camera torch blink ------------------------------------

const torchFlashBtn = document.getElementById("torchFlashBtn");
let blinkStream = null;
let blinkTrack = null;
let blinkingTorch = false;

async function toggleTorchBlink() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("MediaDevices not supported");
    }

    if (!blinkingTorch) {
      // Turn ON
      blinkingTorch = true;

      blinkStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", torch: true },
      });

      blinkTrack = blinkStream.getVideoTracks()[0];

      await blinkFlashTorch();
      setStatus(
        "Trying to blink your camera flash. If nothing happens your device may not support this."
      );
      torchFlashBtn.textContent = "🔦 Stop Camera Flash";
    } else {
      // Turn OFF
      blinkingTorch = false;
      if (blinkStream) {
        blinkStream.getTracks().forEach((t) => t.stop());
      }
      blinkStream = null;
      blinkTrack = null;
      torchFlashBtn.textContent = "🔦 Camera Flash Alert";
      setStatus("Camera flash alert stopped.");
    }
  } catch (err) {
    console.error(err);
    alert(
      "Blinking camera flash is not supported on this device or browser. Screen blink will still work."
    );
    blinkingTorch = false;
  }
}

async function blinkFlashTorch() {
  if (!blinkTrack) return;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  while (blinkingTorch) {
    await blinkTrack.applyConstraints({
      advanced: [{ torch: true }],
    });
    await delay(180);
    await blinkTrack.applyConstraints({
      advanced: [{ torch: false }],
    });
    await delay(180);
  }
}

torchFlashBtn.addEventListener("click", toggleTorchBlink);

// --------- Location sharing (WhatsApp) ----------------------------

const locationBtn = document.getElementById("locationBtn");

locationBtn.addEventListener("click", () => {
  const contacts = getContacts();
  if (!contacts.c1Phone) {
    alert("Please save your primary contact phone number first.");
    return;
  }

  if (!navigator.geolocation) {
    alert("Location is not supported on this device.");
    return;
  }

  setStatus("Getting your GPS location…");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const locText = `https://maps.google.com/?q=${latitude},${longitude}`;
      const msg = buildSOSMessage(true, locText);
      openWhatsApp(contacts.c1Phone, msg);
      setStatus("Opening WhatsApp with your live location.");
    },
    (err) => {
      console.error(err);
      alert("Could not get your location. Please check your GPS permissions.");
      setStatus("Location failed. Please try again.");
    }
  );
});

// --------- Call Police --------------------------------------------

const policeBtn = document.getElementById("policeBtn");

policeBtn.addEventListener("click", () => {
  setStatus("Calling police emergency number 112.");
  window.location.href = "tel:112";
});

// --------- Read Self-Defense Tips --------------------------------

const readTipsBtn = document.getElementById("readTipsBtn");

const tipsText =
  "Here are self defense tips. " +
  "One: Stay aware of your surroundings. Avoid walking with full volume earphones in lonely areas. " +
  "Two: Trust your instincts. If something feels wrong, move away quickly. " +
  "Three: Keep your emergency tools ready, and keep your phone accessible. " +
  "Four: Use your voice. Shout for help and move towards people or light. " +
  "Five: Basic physical defense. Target sensitive areas like eyes, nose, throat and groin, then get away and seek help immediately.";

readTipsBtn.addEventListener("click", () => {
  setStatus("Reading self defense tips aloud.");
  speakIfEnabled(tipsText);
});
