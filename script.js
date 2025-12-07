// ============ GLOBAL STATE ============
let lastLatitude = null;
let lastLongitude = null;

// ============ TEXT-TO-SPEECH HELPER ============
function speak(text) {
    if (!("speechSynthesis" in window)) {
        console.warn("SpeechSynthesis not supported");
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // You can tweak language if needed
    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.cancel(); // stop old speech
    window.speechSynthesis.speak(utterance);
}

// Intro message when page loads
window.addEventListener("load", () => {
    const intro =
        "Welcome to SafeHer, designed and developed by Lavanya Naik. " +
        "Remember: stay aware of your surroundings, trust your instincts, " +
        "and use the SOS button if you feel unsafe.";
    speak(intro);
});

// ============ LOCATION HANDLING ============
function updateLocation() {
    const locationDisplay = document.getElementById("locationDisplay");

    if (!navigator.geolocation) {
        locationDisplay.textContent =
            "Geolocation is not supported on this device.";
        speak("Location is not available on this device.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            lastLatitude = pos.coords.latitude;
            lastLongitude = pos.coords.longitude;

            const mapsLink = `https://www.google.com/maps?q=${lastLatitude},${lastLongitude}`;
            locationDisplay.innerHTML =
                `Location updated.<br>Lat: ${lastLatitude.toFixed(
                    5
                )}, Lng: ${lastLongitude.toFixed(
                    5
                )}<br><a href="${mapsLink}" target="_blank">Open in Maps</a>`;

            speak("Location updated successfully.");
        },
        (err) => {
            console.error(err);
            locationDisplay.textContent =
                "Could not get your location. Please check GPS permissions.";
            speak(
                "I could not get your location. Please check your GPS settings and try again."
            );
        }
    );
}

// ============ SOS HANDLING (WHATSAPP) ============
function getContacts() {
    const c1 = document.getElementById("contact1").value.trim();
    const c2 = document.getElementById("contact2").value.trim();
    const c3 = document.getElementById("contact3").value.trim();
    return [c1, c2, c3].filter((c) => c !== "");
}

// Find first available contact (1, then 2, then 3)
function getPrimaryContact() {
    const contacts = getContacts();
    return contacts.length > 0 ? contacts[0] : null;
}

function createSOSMessage() {
    let msg =
        "SOS! I am in danger. Please help me immediately. This message is sent from the SafeHer app.";

    if (lastLatitude && lastLongitude) {
        msg += ` My approximate location: https://www.google.com/maps?q=${lastLatitude},${lastLongitude}`;
    }

    return msg;
}

function sendSOS() {
    const primaryContact = getPrimaryContact();

    if (!primaryContact) {
        alert("Please add at least one emergency contact first.");
        speak(
            "Please add at least one emergency contact before using the S O S button."
        );
        return;
    }

    speak("Sending S O S to your emergency contact now.");

    // Try to refresh location quickly for better accuracy,
    // but still send even if it fails.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                lastLatitude = pos.coords.latitude;
                lastLongitude = pos.coords.longitude;
                openWhatsApp(primaryContact);
            },
            () => {
                openWhatsApp(primaryContact);
            }
        );
    } else {
        openWhatsApp(primaryContact);
    }
}

function openWhatsApp(phoneNumber) {
    const msg = createSOSMessage();
    const encodedMsg = encodeURIComponent(msg);

    // Basic wa.me link
    const waLink = `https://wa.me/${phoneNumber}?text=${encodedMsg}`;

    // Open in same tab (mobile users prefer this)
    window.location.href = waLink;
}

// ============ SIREN + HELP ME VOICE ============
const sirenAudio = document.getElementById("sirenAudio");

function playSiren() {
    if (sirenAudio) {
        sirenAudio.currentTime = 0;
        sirenAudio.play().catch((err) => {
            console.error("Siren error:", err);
        });
        speak("Siren activated. People around you may notice the sound.");
    }
}

function stopSiren() {
    if (sirenAudio) {
        sirenAudio.pause();
        sirenAudio.currentTime = 0;
        speak("Siren stopped.");
    }
}

function playHelpMeVoice() {
    const text =
        "Help me. I am in danger. Please call the police, or help me right now.";
    speak(text);
}

// ============ SCREEN BLINK / FLASH MODES ============
let isBlinkModeOn = false;
let isFlashModeOn = false;

function toggleScreenBlink() {
    isBlinkModeOn = !isBlinkModeOn;
    if (isBlinkModeOn) {
        document.body.classList.add("blink-mode");
        // turn off flash if on
        isFlashModeOn = false;
        document.body.classList.remove("flash-mode");
        speak("Screen blink mode activated.");
    } else {
        document.body.classList.remove("blink-mode");
        speak("Screen blink mode turned off.");
    }
}

function toggleFlashScreen() {
    isFlashModeOn = !isFlashModeOn;
    if (isFlashModeOn) {
        document.body.classList.add("flash-mode");
        // turn off blink if on
        isBlinkModeOn = false;
        document.body.classList.remove("blink-mode");
        speak("Flash screen mode activated.");
    } else {
        document.body.classList.remove("flash-mode");
        speak("Flash screen mode turned off.");
    }
}

// ============ TIP CARD CLICK HANDLING ============
function setupTipCards() {
    const tipCards = document.querySelectorAll(".tip-card");
    tipCards.forEach((card) => {
        card.addEventListener("click", () => {
            const text = card.getAttribute("data-tip");
            if (text) {
                speak(text);
            }
        });
    });
}

// ============ BUTTON EVENTS ============
document.addEventListener("DOMContentLoaded", () => {
    // Buttons
    const btnSOS = document.getElementById("btnSOS");
    const btnLocation = document.getElementById("btnLocation");
    const btnSirenOn = document.getElementById("btnSirenOn");
    const btnSirenOff = document.getElementById("btnSirenOff");
    const btnHelpVoice = document.getElementById("btnHelpVoice");
    const btnScreenBlink = document.getElementById("btnScreenBlink");
    const btnFlashScreen = document.getElementById("btnFlashScreen");

    if (btnSOS) btnSOS.addEventListener("click", sendSOS);
    if (btnLocation) btnLocation.addEventListener("click", updateLocation);
    if (btnSirenOn) btnSirenOn.addEventListener("click", playSiren);
    if (btnSirenOff) btnSirenOff.addEventListener("click", stopSiren);
    if (btnHelpVoice) btnHelpVoice.addEventListener("click", playHelpMeVoice);
    if (btnScreenBlink)
        btnScreenBlink.addEventListener("click", toggleScreenBlink);
    if (btnFlashScreen)
        btnFlashScreen.addEventListener("click", toggleFlashScreen);

    setupTipCards();
});
