/* ---------------- STATUS + VOICE GUIDE ------------------ */

const statusEl = document.getElementById("status");
const voiceToggleBtn = document.getElementById("voiceToggleBtn");
let voiceEnabled = true;

function setStatus(text) {
  statusEl.textContent = text;
  if (voiceEnabled) speak(text);
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 1;
  window.speechSynthesis.speak(msg);
}

voiceToggleBtn.addEventListener("click", () => {
  voiceEnabled = !voiceEnabled;
  voiceToggleBtn.textContent = voiceEnabled ? "🔈 Voice Guide: ON" : "🔇 Voice Guide: OFF";
  setStatus(voiceEnabled ? "Voice guide enabled." : "Voice guide disabled.");
});

/* ---------------- CONTACTS SAVE ------------------ */

const c1Name = document.getElementById("c1Name");
const c1Phone = document.getElementById("c1Phone");
const c2Name = document.getElementById("c2Name");
const c2Phone = document.getElementById("c2Phone");
const c3Name = document.getElementById("c3Name");
const c3Phone = document.getElementById("c3Phone");

document.getElementById("saveContactsBtn").addEventListener("click", () => {
  const data = {
    c1Name: c1Name.value,
    c1Phone: c1Phone.value,
    c2Name: c2Name.value,
    c2Phone: c2Phone.value,
    c3Name: c3Name.value,
    c3Phone: c3Phone.value,
  };
  localStorage.setItem("safeherContacts", JSON.stringify(data));
  setStatus("Contacts saved successfully.");
});

/* Load contacts */
(() => {
  const saved = localStorage.getItem("safeherContacts");
  if (saved) {
    const d = JSON.parse(saved);
    c1Name.value = d.c1Name || "";
    c1Phone.value = d.c1Phone || "";
    c2Name.value = d.c2Name || "";
    c2Phone.value = d.c2Phone || "";
    c3Name.value = d.c3Name || "";
    c3Phone.value = d.c3Phone || "";
  }
})();

/* ---------------- SOS WHATSAPP ------------------ */

document.getElementById("sosBtn").addEventListener("click", () => {
  const phone = c1Phone.value.trim();
  if (!phone) return alert("Please save your primary contact.");

  const message = "🚨 SOS ALERT 🚨\nI am in danger. Please help me immediately.";
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

  setStatus("Sending SOS to your primary contact.");
});

/* ---------------- VOICE SOS ------------------ */

let recognition;

if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";

  recognition.onresult = function (e) {
    const text = e.results[0][0].transcript.toLowerCase();
    if (text.includes("help")) {
      setStatus('Detected "help me" – sending SOS.');
      document.getElementById("sosBtn").click();
    } else {
      setStatus("Heard: " + text);
    }
  };
}

document.getElementById("voiceSosBtn").addEventListener("click", () => {
  if (!recognition) return alert("Voice SOS not supported.");
  recognition.start();
  setStatus("Listening… say 'help me'.");
});

/* ---------------- SCREEN BLINK ------------------ */

document.getElementById("screenFlashBtn").addEventListener("click", () => {
  document.body.classList.toggle("blink-active");
  if (document.body.classList.contains("blink-active")) {
    setStatus("Screen blink ON.");
    document.getElementById("screenFlashBtn").textContent = "✨ Stop Blink";
  } else {
    setStatus("Screen blink OFF.");
    document.getElementById("screenFlashBtn").textContent = "✨ Screen Blink";
  }
});

/* ---------------- CAMERA FLASH ------------------ */

let flashStream, flashTrack, flashing = false;

document.getElementById("torchFlashBtn").addEventListener("click", async () => {
  try {
    if (!flashing) {
      flashing = true;
      flashStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", torch: true }
      });
      flashTrack = flashStream.getVideoTracks()[0];

      blinkTorch();
      document.getElementById("torchFlashBtn").textContent = "🔦 Stop Flash";
      setStatus("Trying to blink your camera flash…");
    } else {
      flashing = false;
      if (flashTrack) flashTrack.stop();
      document.getElementById("torchFlashBtn").textContent = "🔦 Camera Flash";
      setStatus("Flash stopped.");
    }
  } catch {
    alert("Camera flash not supported on this device.");
  }
});

async function blinkTorch() {
  const delay = (ms) => new Promise(res => setTimeout(res, ms));
  while (flashing && flashTrack) {
    await flashTrack.applyConstraints({ advanced: [{ torch: true }] });
    await delay(150);
    await flashTrack.applyConstraints({ advanced: [{ torch: false }] });
    await delay(150);
  }
}

/* ---------------- SIREN ------------------ */

const siren = document.getElementById("sirenAudio");
let sirenOn = false;

document.getElementById("sirenBtn").addEventListener("click", () => {
  if (!sirenOn) {
    siren.loop = true;
    siren.play();
    sirenOn = true;
    setStatus("Siren ON.");
    document.getElementById("sirenBtn").textContent = "🔇 Stop Siren";
  } else {
    siren.pause();
    sirenOn = false;
    setStatus("Siren OFF.");
    document.getElementById("sirenBtn").textContent = "🔊 Siren Alarm";
  }
});

/* ---------------- LOCATION SHARE ------------------ */

document.getElementById("locationBtn").addEventListener("click", () => {
  if (!navigator.geolocation) return alert("Location not supported.");

  setStatus("Fetching location…");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const link = `https://maps.google.com/?q=${lat},${lon}`;
      const phone = c1Phone.value.trim();
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent("My Location:\n" + link)}`);
      setStatus("Sending location to contact.");
    },
    () => alert("Unable to get location.")
  );
});

/* ---------------- POLICE CALL ------------------ */

document.getElementById("policeBtn").addEventListener("click", () => {
  window.location.href = "tel:112";
});

/* ---------------- READ TIPS ------------------ */

document.getElementById("readTipsBtn").addEventListener("click", () => {
  speak(
    "Stay aware of your surroundings. Trust your instincts. Keep your tools ready. " +
    "Use your voice loudly. Aim for sensitive areas and escape immediately."
  );
});
