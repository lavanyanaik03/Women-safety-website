// Helper: show a small status message
function setStatus(message) {
  const statusEl = document.getElementById("statusMessage");
  statusEl.textContent = message || "";
}

// Get elements
const sosBtn = document.getElementById("sosBtn");
const locationBtn = document.getElementById("locationBtn");
const sirenBtn = document.getElementById("sirenBtn");
const flashBtn = document.getElementById("flashBtn");
const flashOverlay = document.getElementById("flashOverlay");
const flashOffBtn = document.getElementById("flashOffBtn");
const voiceBtn = document.getElementById("voiceBtn");
const sirenAudio = document.getElementById("sirenAudio");

// Contacts elements
const saveContactsBtn = document.getElementById("saveContactsBtn");
const savedContactsContainer = document.getElementById("savedContacts");

// Voice guide state
let voiceEnabled = false;

// Load contacts from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
  loadContactsFromStorage();
});

// SOS button: get location and open WhatsApp with SOS text
sosBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setStatus("Location not supported on this device.");
    speakIfEnabled("Location is not supported on this device.");
    return;
  }

  setStatus("Getting your location for SOS...");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      const text =
        "EMERGENCY SOS - I need help. This is my current location: " +
        mapsLink;

      const url = "https://wa.me/?text=" + encodeURIComponent(text);
      window.open(url, "_blank");

      setStatus("Opening WhatsApp with your SOS message.");
      speakIfEnabled("SOS sent. Please choose your emergency contact in WhatsApp.");
    },
    (err) => {
      setStatus("Could not get location. Please try again.");
      speakIfEnabled("I could not get your location. Please try again.");
    }
  );
});

// Share location button: similar to SOS but text is calmer
locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setStatus("Location not supported on this device.");
    speakIfEnabled("Location is not supported on this device.");
    return;
  }

  setStatus("Getting your location to share...");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      const text =
        "Sharing my current location: " + mapsLink;

      const url = "https://wa.me/?text=" + encodeURIComponent(text);
      window.open(url, "_blank");

      setStatus("Opening WhatsApp to share your location.");
      speakIfEnabled("Location ready to share. Choose a contact in WhatsApp.");
    },
    (err) => {
      setStatus("Could not get location. Please try again.");
      speakIfEnabled("I could not get your location. Please try again.");
    }
  );
});

// Siren button: toggle play / pause
let sirenPlaying = false;
sirenBtn.addEventListener("click", () => {
  if (!sirenAudio) return;

  if (!sirenPlaying) {
    sirenAudio.currentTime = 0;
    sirenAudio.play().catch(() => {
      setStatus("Tap again to allow audio to play.");
    });
    sirenPlaying = true;
    sirenBtn.textContent = "Stop Siren";
    setStatus("Siren is ON. Hold your phone so people can hear it.");
    speakIfEnabled("Siren is on.");
  } else {
    sirenAudio.pause();
    sirenPlaying = false;
    sirenBtn.textContent = "Play Siren";
    setStatus("Siren stopped.");
    speakIfEnabled("Siren stopped.");
  }
});

// Flashlight: screen-based (not hardware torch)
flashBtn.addEventListener("click", () => {
  const body = document.body;
  const flashOn = body.classList.toggle("flash-on");

  if (flashOn) {
    flashOverlay.classList.add("active");
    speakIfEnabled("Flashlight is on. Tap the button to turn it off.");
  } else {
    flashOverlay.classList.remove("active");
    speakIfEnabled("Flashlight turned off.");
  }
});

flashOffBtn.addEventListener("click", () => {
  document.body.classList.remove("flash-on");
  flashOverlay.classList.remove("active");
  speakIfEnabled("Flashlight turned off.");
});

// Voice guide toggle
voiceBtn.addEventListener("click", () => {
  voiceEnabled = !voiceEnabled;
  if (voiceEnabled) {
    voiceBtn.textContent = "Voice Guide: ON";
    speakIfEnabled(
      "Voice guide is now on. I will read important status updates for you."
    );
  } else {
    voiceBtn.textContent = "Voice Guide";
    window.speechSynthesis.cancel();
    setStatus("Voice guide turned off.");
  }
});

// Speak helper
function speakIfEnabled(text) {
  if (!voiceEnabled || !("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

/* ----------------- Emergency Contacts Logic ----------------- */

function getContactInputs() {
  return [
    {
      name: document.getElementById("contact1Name").value.trim(),
      phone: document.getElementById("contact1Phone").value.trim(),
    },
    {
      name: document.getElementById("contact2Name").value.trim(),
      phone: document.getElementById("contact2Phone").value.trim(),
    },
    {
      name: document.getElementById("contact3Name").value.trim(),
      phone: document.getElementById("contact3Phone").value.trim(),
    },
  ].filter((c) => c.name !== "" && c.phone !== "");
}

saveContactsBtn.addEventListener("click", () => {
  const contacts = getContactInputs();

  if (contacts.length === 0) {
    setStatus("Add at least one name and phone number before saving.");
    speakIfEnabled("Please add at least one contact before saving.");
    return;
  }

  localStorage.setItem("safeHerContacts", JSON.stringify(contacts));
  setStatus("Emergency contacts saved.");
  speakIfEnabled("Emergency contacts saved.");
  renderSavedContacts(contacts);
});

function loadContactsFromStorage() {
  const stored = localStorage.getItem("safeHerContacts");
  if (!stored) return;

  try {
    const contacts = JSON.parse(stored);
    // Also fill input fields back
    const fields = [
      { nameId: "contact1Name", phoneId: "contact1Phone" },
      { nameId: "contact2Name", phoneId: "contact2Phone" },
      { nameId: "contact3Name", phoneId: "contact3Phone" },
    ];

    contacts.forEach((c, index) => {
      if (fields[index]) {
        document.getElementById(fields[index].nameId).value = c.name;
        document.getElementById(fields[index].phoneId).value = c.phone;
      }
    });

    renderSavedContacts(contacts);
  } catch (e) {
    console.error("Error parsing contacts", e);
  }
}

function renderSavedContacts(contacts) {
  savedContactsContainer.innerHTML = "";

  if (!contacts || contacts.length === 0) {
    savedContactsContainer.textContent = "No contacts saved yet.";
    return;
  }

  contacts.forEach((contact, index) => {
    const div = document.createElement("div");
    div.className = "saved-contact-item";

    const label = document.createElement("span");
    label.innerHTML = `<strong>${contact.name}</strong> (${contact.phone})`;

    // Call button
    const callBtn = document.createElement("button");
    callBtn.className = "btn btn-secondary small-btn";
    callBtn.textContent = "Call";
    callBtn.addEventListener("click", () => {
      window.location.href = `tel:${contact.phone}`;
    });

    // WhatsApp button
    const waBtn = document.createElement("button");
    waBtn.className = "btn btn-outline small-btn";
    waBtn.textContent = "WhatsApp";
    waBtn.addEventListener("click", () => {
      const text = "I have added you as my emergency contact in SafeHer.";
      const url =
        "https://wa.me/" +
        encodeURIComponent(contact.phone) +
        "?text=" +
        encodeURIComponent(text);
      window.open(url, "_blank");
    });

    div.appendChild(label);
    div.appendChild(callBtn);
    div.appendChild(waBtn);

    savedContactsContainer.appendChild(div);
  });
}
