// --------------- CONFIG (EDIT THESE NUMBERS) ---------------
const CONFIG = {
    primaryWhatsAppNumber: "91XXXXXXXXXX", // <- replace with main emergency WhatsApp number
    contact1Phone: "91XXXXXXXXXX",        // <- tel number for Contact 1
    contact2Phone: "91YYYYYYYYYY"         // <- tel number for Contact 2
};
// Example: "91" + "phone number" (no + sign)

// --------------- HELPER: TEXT TO SPEECH ---------------
function speak(text) {
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN";
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
}

// --------------- ON PAGE LOAD ---------------
document.addEventListener("DOMContentLoaded", () => {
    const siren = document.getElementById("sirenAudio");
    const sosBtn = document.getElementById("sosBtn");
    const voiceSosBtn = document.getElementById("voiceSosBtn");
    const flashBtn = document.getElementById("flashBtn");
    const shareLocationBtn = document.getElementById("shareLocationBtn");
    const locationStatus = document.getElementById("locationStatus");
    const tipsBtn = document.getElementById("tipsBtn");
    const tipsList = document.getElementById("tipsList");
    const callContact1 = document.getElementById("callContact1");
    const callContact2 = document.getElementById("callContact2");

    // Set emergency contact numbers in links
    if (CONFIG.contact1Phone) {
        callContact1.href = `tel:${CONFIG.contact1Phone}`;
    }
    if (CONFIG.contact2Phone) {
        callContact2.href = `tel:${CONFIG.contact2Phone}`;
    }

    // Welcome voice + quick safety reminder
    setTimeout(() => {
        speak(
            "Welcome to SafeHer. In an emergency, press Send S O S or use Voice S O S and say, help me. " +
            "You can also share your location and call your emergency contacts quickly."
        );
    }, 800);

    // --------- SOS HANDLER (used by button & voice) ----------
    function triggerSOS(source = "button") {
        try {
            siren.currentTime = 0;
            siren.play().catch(() => {
                // ignore if autoplay blocked
            });
        } catch (e) {}

        speak(
            "S O S activated. I am opening WhatsApp to send an emergency message."
        );

        if (!CONFIG.primaryWhatsAppNumber || CONFIG.primaryWhatsAppNumber.includes("X")) {
            alert(
                "Please set your primaryWhatsAppNumber in script.js so I know which contact to open in WhatsApp."
            );
            return;
        }

        const msg = encodeURIComponent(
            "HELP! I am in danger and I need help immediately. Please call me and check my location."
        );
        const url = `https://wa.me/${CONFIG.primaryWhatsAppNumber}?text=${msg}`;
        window.open(url, "_blank");
    }

    // --------- SOS BUTTON ---------
    sosBtn.addEventListener("click", () => {
        triggerSOS("button");
    });

    // --------- FLASH ALERT ----------
    let flashOn = false;
    flashBtn.addEventListener("click", () => {
        flashOn = !flashOn;
        if (flashOn) {
            document.body.classList.add("flash-mode");
            speak("Flash alert on. Your screen is blinking to draw attention.");
        } else {
            document.body.classList.remove("flash-mode");
            speak("Flash alert off.");
        }
    });

    // --------- SHARE LOCATION ----------
    shareLocationBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
            locationStatus.textContent =
                "Location not supported on this device or browser.";
            speak("Sorry, location is not supported on this device.");
            return;
        }

        locationStatus.textContent = "Getting your location...";
        speak("Getting your location. Please wait a moment.");

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                const text = encodeURIComponent(
                    `I need help. This is my current location: ${mapsLink}`
                );

                if (!CONFIG.primaryWhatsAppNumber || CONFIG.primaryWhatsAppNumber.includes("X")) {
                    alert(
                        "Location ready. Please set primaryWhatsAppNumber in script.js to open WhatsApp automatically."
                    );
                    locationStatus.textContent =
                        "Location ready. Copy this link and send to someone you trust:\n" + mapsLink;
                    return;
                }

                const url = `https://wa.me/${CONFIG.primaryWhatsAppNumber}?text=${text}`;
                window.open(url, "_blank");

                locationStatus.textContent = "Location opened in WhatsApp.";
                speak(
                    "Your location is ready and WhatsApp is open. Please send the message to your contact."
                );
            },
            (err) => {
                console.error(err);
                locationStatus.textContent =
                    "Unable to get location. Please check GPS permissions.";
                speak(
                    "I could not get your location. Please turn on GPS and allow location access."
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });

    // --------- SELF DEFENCE TIPS ----------
    tipsBtn.addEventListener("click", () => {
        const isHidden = tipsList.classList.contains("hidden");
        if (isHidden) {
            tipsList.classList.remove("hidden");
            speak(
                "Here are some quick self defence and safety tips. Stay aware, trust your instincts, " +
                "keep your phone charged, and share your location with someone you trust."
            );
            tipsBtn.textContent = "🛡️ Hide Tips";
        } else {
            tipsList.classList.add("hidden");
            tipsBtn.textContent = "🛡️ Show Tips";
        }
    });

    // --------- VOICE SOS (say "help me") ----------
    let recognition = null;

    function setupSpeechRecognition() {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert(
                "Voice S O S is not supported in this browser. Try using Chrome on Android."
            );
            return null;
        }
        const rec = new SpeechRecognition();
        rec.lang = "en-IN";
        rec.continuous = false;
        rec.interimResults = false;
        return rec;
    }

    voiceSosBtn.addEventListener("click", () => {
        if (!recognition) {
            recognition = setupSpeechRecognition();
            if (!recognition) return;
        }

        speak("Listening. Please say, help me.");

        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log("Heard:", transcript);

            if (transcript.includes("help me")) {
                speak("I heard help me. Triggering S O S now.");
                triggerSOS("voice");
            } else {
                speak(
                    `I heard ${transcript}. Please say exactly: help me, to trigger S O S.`
                );
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech error:", event.error);
            speak("I could not hear you clearly. Please try again.");
        };

        recognition.onend = () => {
            // no-op
        };
    });
});
