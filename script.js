// -----------------------
// SAFEHER – MAIN SCRIPT
// -----------------------

// STATUS TEXT (small helper text)
const statusBar = document.getElementById("statusText");
function setStatus(msg) {
  if (statusBar) statusBar.textContent = msg;
}

// -----------------------
// EMERGENCY CONTACTS
// -----------------------
const contactInputs = [
  { name: "contact1Name", phone: "contact1Phone" },
  { name: "contact2Name", phone: "contact2Phone" },
  { name: "contact3Name", phone: "contact3Phone" },
];

function loadContacts() {
  contactInputs.forEach((c, index) => {
    const nameInput = document.getElementById(c.name);
    const phoneInput = document.getElementById(c.phone);

    const savedName = localStorage.getItem(c.name);
    const savedPhone = localStorage.getItem(c.phone);

    if (nameInput && savedName) nameInput.value = savedName;
    if (phoneInput && savedPhone) phoneInput.value = savedPhone;
  });
  setStatus("Welcome to SafeHer. Save your emergency contacts below.");
}

function saveContacts() {
  let allGood = true;

  contactInputs.forEach((c) => {
    const nameInput = document.getElementById(c.name);
    const phoneInput = document.getElementById(c.phone);

    if (!nameInput || !phoneInput) return;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (name && phone) {
      localStorage.setItem(c.name, name);
      localStorage.setItem(c.phone, phone);
    } else {
      // allow empty, but warn user that missing fields won't be used
      allGood = false;
    }
  });

  if (allGood) {
    alert("Contacts saved successfully.");
    setStatus("All emergency contacts saved.");
  } else {
    alert("Saved what you entered. Remember: only contacts with both name and phone will receive SOS.");
    setStatus("Some contacts are incomplete. Fill name + phone for each.");
  }
}

// attach listener for Save button
const saveBtn = document.getElementById("saveContactsBtn");
if (saveBtn) {
  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    saveContacts();
  });
}

// -----------------------
// WHATSAPP SOS
// -----------------------
const sosBtn = document.getElementById("sosBtn");

function buildSOSMessage(locationText) {
  return (
    "🚨 *SAFEHER SOS ALERT* 🚨\n\n" +
    "I am in danger and need help *immediately*.\n" +
    (locationText ? `📍 My location: ${locationText}\n\n` : "") +
    "Please call me and reach me as soon as you can.\n\n" +
    "— Sent via SafeHer"
  );
}

function getContactPhones() {
  const phones = [];
  contactInputs.forEach((c) => {
    const phone = (localStorage.getItem(c.phone) || "").trim();
    if (phone) phones.push(phone);
  });
  return phones;
}

async function sendSOS() {
  try {
    const phones = getContactPhones();
    if (phones.length === 0) {
      alert("Please save at least one emergency contact first.");
      setStatus("Add at least one contact to use SOS.");
      return;
    }

    // try to get location
    setStatus("Trying to get your GPS location…");
    let locationText = "";

    if (navigator.geolocation) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            locationText = `https://maps.google.com/?q=${latitude},${longitude}`;
            resolve();
          },
          () => resolve(),
          { enableHighAccuracy: true, timeout: 7000 }
        );
      });
    }

    const message = encodeURIComponent(buildSOSMessage(locationText));

    // A) YOUR CHOICE: send to ALL contacts (C option earlier)
    phones.forEach((p) => {
      const phoneNoPlus = p.startsWith("+") ? p : `+${p}`;
      const url = `https://wa.me/${phoneNoPlus}?text=${message}`;
      window.open(url, "_blank");
    });

    alert("Opening WhatsApp with SOS message for your contacts.");
    setStatus("SOS sent via WhatsApp to your saved contacts.");
  } catch (err) {
    console.error(err);
    alert("Something went wrong while sending SOS.");
    setStatus("Error while sending SOS.");
  }
}

if (sosBtn) {
  sosBtn.addEventListener("click", () => {
    sendSOS();
  });
}

// -----------------------
// LOCATION SHARE BUTTON
// -----------------------
const locationBtn = document.getElementById("locationBtn");

async function shareLocationOnly() {
  const phones = getContactPhones();
  if (phones.length === 0) {
    alert("Please save at least one emergency contact first.");
    setStatus("Add at least one contact to share location.");
    return;
  }

  if (!navigator.geolocation) {
    alert("Geolocation not supported on this device.");
    return;
  }

  setStatus("Getting location…");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const link = `https://maps.google.com/?q=${latitude},${longitude}`;
      const text = encodeURIComponent(
        "📍 My live location (SafeHer): " + link
      );
      phones.forEach((p) => {
        const phoneNoPlus = p.startsWith("+") ? p : `+${p}`;
        const url = `https://wa.me/${phoneNoPlus}?text=${text}`;
        window.open(url, "_blank");
      });
      setStatus("Opened WhatsApp with your location.");
    },
    (err) => {
      console.error(err);
      alert("Could not get location.");
      setStatus("Could not get location.");
    },
    { enableHighAccuracy: true, timeout: 7000 }
  );
}

if (locationBtn) {
  locationBtn.addEventListener("click", () => {
    shareLocationOnly();
  });
}

// -----------------------
// POLICE CALL (112)
// -----------------------
const policeBtn = document.getElementById("policeBtn");
if (policeBtn) {
  policeBtn.addEventListener("click", () => {
    setStatus("Opening dialer for police emergency number 112.");
    window.location.href = "tel:112";
  });
}

// -----------------------
// SIREN ALARM
// -----------------------
const sirenBtn = document.getElementById("sirenBtn");
const sirenAudio = document.getElementById("sirenAudio");
let sirenPlaying = false;

function toggleSiren() {
  if (!sirenAudio) {
    alert("Siren audio file not found.");
    return;
  }
  if (!sirenPlaying) {
    sirenAudio.currentTime = 0;
    sirenAudio.play();
    sirenPlaying = true;
    if (sirenBtn) sirenBtn.textContent = "⛔ Stop Siren";
    setStatus("Siren ON. Hold your phone so people can hear it.");
    speak("Siren is now on.");
  } else {
    sirenAudio.pause();
    sirenPlaying = false;
    if (sirenBtn) sirenBtn.textContent = "🔊 Siren Alarm";
    setStatus("Siren stopped.");
    speak("Siren stopped.");
  }
}

if (sirenBtn) {
  sirenBtn.addEventListener("click", toggleSiren);
}

// -----------------------
// SCREEN BLINK
// -----------------------
const screenBlinkBtn = document.getElementById("screenBlinkBtn");
let screenBlinking = false;
let blinkInterval = null;

function startScreenBlink() {
  if (screenBlinking) return;
  screenBlinking = true;
  document.body.classList.add("blink-mode");
  blinkInterval = setInterval(() => {
    document.body.classList.toggle("blink-on");
  }, 400);
  if (screenBlinkBtn) screenBlinkBtn.textContent = "⏹ Stop Screen Blink";
  setStatus("Screen blink alert is ON.");
  speak("Screen blinking alert on.");
}

function stopScreenBlink() {
  screenBlinking = false;
  document.body.classList.remove("blink-mode", "blink-on");
  if (blinkInterval) clearInterval(blinkInterval);
  if (screenBlinkBtn) screenBlinkBtn.textContent = "🌌 Screen Blink";
  setStatus("Screen blink alert is OFF.");
  speak("Screen blinking alert off.");
}

function toggleScreenBlink() {
  if (!screenBlinking) startScreenBlink();
  else stopScreenBlink();
}

if (screenBlinkBtn) {
  screenBlinkBtn.addEventListener("click", toggleScreenBlink);
}

// -----------------------
// CAMERA FLASH BLINK
// -----------------------
const flashBtn = document.getElementById("flashBtn");
let flashStream = null;
let flashTrack = null;
let flashing = false;

async function toggleCameraFlash() {
  try {
    if (!flashing) {
      // TURN ON
      flashing = true;
      setStatus("Trying to use your camera flash…");

      flashStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", torch: true }
      });

      flashTrack = flashStream.getVideoTracks()[0];

      await blinkTorch();
      // after blinkTorch ends, flashing=false and stream closed
    } else {
      // TURN OFF
      flashing = false;
      if (flashStream) {
        flashStream.getTracks().forEach((t) => t.stop());
      }
      flashStream = null;
      flashTrack = null;
      setStatus("Camera flash alert off.");
    }
  } catch (err) {
    console.error(err);
    alert("Camera flash alert is not supported on this device or browser.");
    setStatus("Camera flash alert not supported.");
    flashing = false;
  }
}

async function blinkTorch() {
  if (!flashTrack) return;
  speak("Camera flash alert on.");
  while (flashing) {
    await flashTrack.applyConstraints({
      advanced: [{ torch: true }]
    });
    await new Promise((r) => setTimeout(r, 200));
    await flashTrack.applyConstraints({
      advanced: [{ torch: false }]
    });
    await new Promise((r) => setTimeout(r, 200));
  }
  if (flashStream) {
    flashStream.getTracks().forEach((t) => t.stop());
  }
  flashStream = null;
  flashTrack = null;
  speak("Camera flash alert off.");
}

if (flashBtn) {
  flashBtn.addEventListener("click", toggleCameraFlash);
}

// -----------------------
// VOICE GUIDE + VOICE SOS
// -----------------------
const voiceGuideBtn = document.getElementById("voiceBtn");
let voiceEnabled = true;

// generic speak function
function speak(text) {
  if (!voiceEnabled) return;
  if (!("speechSynthesis" in window)) return;

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-IN";
  utter.rate = 1.05;
  window.speechSynthesis.speak(utter);
}

// toggle voice guide button
if (voiceGuideBtn) {
  voiceGuideBtn.addEventListener("click", () => {
    voiceEnabled = !voiceEnabled;
    voiceGuideBtn.textContent = voiceEnabled
      ? "🔊 Voice Guide: ON"
      : "🔇 Voice Guide: OFF";
    setStatus(
      voiceEnabled
        ? "Voice guide is now ON."
        : "Voice guide is now OFF."
    );
  });
}

// speak on load
window.addEventListener("load", () => {
  loadContacts();
  speak(
    "Welcome to SafeHer. Use Send S O S, Voice S O S, screen blink, camera flash, and siren in emergencies. Scroll to read self defence tips."
  );
});

// Voice SOS – listens for “help me”
const voiceSOSBtn = document.getElementById("voiceSOSBtn");
let recognition = null;

function initSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const rec = new SpeechRecognition();
  rec.lang = "en-IN";
  rec.continuous = false;
  rec.interimResults = false;
  return rec;
}

if (voiceSOSBtn) {
  voiceSOSBtn.addEventListener("click", () => {
    recognition = initSpeechRecognition();
    if (!recognition) {
      alert("Voice SOS is not supported on this browser.");
      setStatus("Voice SOS not supported on this device.");
      return;
    }

    speak("Listening. Say, help me.");
    setStatus("Listening for 'help me'…");

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (transcript.includes("help me")) {
        speak("Help me detected. Sending S O S.");
        sendSOS();
      } else {
        speak("I heard something else. Try again.");
        setStatus("Did not detect 'help me'. Tap Voice SOS again.");
      }
    };

    recognition.onerror = () => {
      speak("Voice S O S error. Please try again.");
      setStatus("Voice SOS error.");
    };

    recognition.onend = () => {
      setStatus("Voice SOS stopped listening.");
    };
  });
}

// -----------------------
// READ SELF DEFENSE TIPS WHEN CLICKED
// -----------------------
const tips = document.querySelectorAll(".tip-item");
tips.forEach((tip) => {
  tip.addEventListener("click", () => {
    const text = tip.textContent.trim();
    speak(text);
  });
});
