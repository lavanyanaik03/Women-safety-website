// ======= Simple helper for status + voice guide =======
const statusText = document.getElementById("statusText");

function setStatus(message) {
  statusText.textContent = message;
  speak(message);
}

function speak(message) {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(message);
  utter.lang = "en-IN";
  utter.rate = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// ======= Contacts: load & save to localStorage =======
const CONTACTS_KEY = "safeher_contacts";

function loadContacts() {
  const stored = localStorage.getItem(CONTACTS_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function saveContacts(data) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(data));
}

function fillContactForm(contacts) {
  if (!contacts) return;
  document.getElementById("c1Name").value = contacts.c1Name || "";
  document.getElementById("c1Phone").value = contacts.c1Phone || "";
  document.getElementById("c2Name").value = contacts.c2Name || "";
  document.getElementById("c2Phone").value = contacts.c2Phone || "";
  document.getElementById("c3Name").value = contacts.c3Name || "";
  document.getElementById("c3Phone").value = contacts.c3Phone || "";
}

// On load, pre-fill form
document.addEventListener("DOMContentLoaded", () => {
  const contacts = loadContacts();
  if (contacts) {
    fillContactForm(contacts);
    setStatus("Contacts loaded. Tap Send SOS or Voice SOS when needed.");
  } else {
    setStatus("Welcome to SafeHer. Save your emergency contacts below.");
  }
});

// Save button
document.getElementById("saveContactsBtn").addEventListener("click", () => {
  const contacts = {
    c1Name: document.getElementById("c1Name").value.trim(),
    c1Phone: document.getElementById("c1Phone").value.trim(),
    c2Name: document.getElementById("c2Name").value.trim(),
    c2Phone: document.getElementById("c2Phone").value.trim(),
    c3Name: document.getElementById("c3Name").value.trim(),
    c3Phone: document.getElementById("c3Phone").value.trim(),
  };

  if (!contacts.c1Phone) {
    alert("Please enter at least the phone number for Contact 1.");
    return;
  }

  saveContacts(contacts);
  setStatus("Contacts saved. SOS will use Contact 1 first.");
});

// ======= SOS via WhatsApp (uses Contact 1) =======
const sosBtn = document.getElementById("sosBtn");

sosBtn.addEventListener("click", async () => {
  const contacts = loadContacts();
  if (!contacts || !contacts.c1Phone) {
    alert("Please save Contact 1 phone number first.");
    return;
  }

  const phone = contacts.c1Phone.replace(/\s+/g, "");
  let message = `🚨 SOS from SafeHer!\nIt's ${contacts.c1Name || "me"}. I need help.`;

  // Try to attach current location
  setStatus("Getting your location for SOS...");
  try {
    const position = await getCurrentPosition();
    const lat = position.coords.latitude.toFixed(5);
    const lon = position.coords.longitude.toFixed(5);
    const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;
    message += `\nMy location: ${mapsLink}`;
  } catch (e) {
    message += `\nLocation: (could not access automatically).`;
  }

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  setStatus("Opening WhatsApp with your SOS message. Tap send.");
  window.open(url, "_blank");
});

// Helper: Promise wrapper for geolocation
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 8000,
    });
  });
}

// ======= Share My Location (also uses Contact 1) =======
const locationBtn = document.getElementById("locationBtn");

locationBtn.addEventListener("click", async () => {
  const contacts = loadContacts();
  if (!contacts || !contacts.c1Phone) {
    alert("Please save Contact 1 phone number first.");
    return;
  }
  const phone = contacts.c1Phone.replace(/\s+/g, "");

  setStatus("Getting your live location...");
  try {
    const position = await getCurrentPosition();
    const lat = position.coords.latitude.toFixed(5);
    const lon = position.coords.longitude.toFixed(5);
    const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;
    const message = `📍 Live location from SafeHer:\n${mapsLink}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    setStatus("Opening WhatsApp with your location. Tap send.");
    window.open(url, "_blank");
  } catch (e) {
    alert("Could not access GPS location. Please enable location and try again.");
    setStatus("Location access failed. Check GPS permissions.");
  }
});

// ======= Call Police (112) =======
const policeBtn = document.getElementById("policeBtn");

policeBtn.addEventListener("click", () => {
  setStatus("Calling emergency number 112...");
  // On mobile this will open the dialer with 112
  window.location.href = "tel:112";
});

// ======= Flash Alert + Siren (screen blink only) =======
const flashBtn = document.getElementById("flashBtn");
const flashOverlay = document.getElementById("flashOverlay");
const sirenAudio = document.getElementById("sirenAudio");
let flashing = false;

flashBtn.addEventListener("click", () => {
  flashing = !flashing;

  if (flashing) {
    flashOverlay.classList.add("flashing");
    sirenAudio.currentTime = 0;
    sirenAudio.loop = true;
    sirenAudio.play().catch(() => {});
    setStatus("Flash alert ON. Screen will blink and siren is playing.");
    flashBtn.textContent = "✨ Stop Flash Alert + Siren";
  } else {
    flashOverlay.classList.remove("flashing");
    sirenAudio.pause();
    setStatus("Flash alert turned off.");
    flashBtn.textContent = "✨ Flash Alert + Siren";
  }
});

// ======= Voice SOS: say "help me" =======
const voiceSosBtn = document.getElementById("voiceSosBtn");
let recognition;
let listening = false;

// Check browser support
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    listening = true;
    setStatus('Listening... please say "help me" clearly.');
  };

  recognition.onerror = () => {
    listening = false;
    setStatus("Voice recognition error. Try again or use normal SOS.");
  };

  recognition.onend = () => {
    listening = false;
    setStatus("Voice listening stopped.");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log("Voice heard:", transcript);
    if (transcript.includes("help me") || transcript.includes("save me")) {
      setStatus('Detected "help me". Sending SOS...');
      // Trigger the normal SOS button click
      sosBtn.click();
    } else {
      setStatus(`Heard: "${transcript}". Say "help me" to send SOS.`);
    }
  };
} else {
  voiceSosBtn.disabled = true;
  voiceSosBtn.textContent = "🎙️ Voice SOS not supported on this device";
  setStatus("Voice SOS is not supported in this browser.");
}

voiceSosBtn.addEventListener("click", () => {
  if (!recognition) return;
  if (!listening) {
    try {
      recognition.start();
    } catch {
      // ignore repeated start errors
    }
  } else {
    recognition.stop();
  }
});
