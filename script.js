let voiceEnabled = true;
const speak = msg => {
    if (voiceEnabled) {
        const speech = new SpeechSynthesisUtterance(msg);
        window.speechSynthesis.speak(speech);
    }
};

// ----------------------- CONTACT SAVE -----------------------
document.getElementById("saveContactsBtn").onclick = () => {
    let contacts = {
        c1: { name: c1Name.value, phone: c1Phone.value },
        c2: { name: c2Name.value, phone: c2Phone.value },
        c3: { name: c3Name.value, phone: c3Phone.value }
    };
    localStorage.setItem("contacts", JSON.stringify(contacts));
    speak("Contacts saved successfully.");
    alert("Contacts Saved!");
};

// ----------------------- SEND SOS -----------------------
document.getElementById("sosBtn").onclick = () => {
    let contacts = JSON.parse(localStorage.getItem("contacts"));
    if (!contacts || !contacts.c1.phone) return alert("Save contacts first!");

    let msg = `EMERGENCY! I need help. Please contact me immediately.`;
    window.location.href =
        `https://wa.me/${contacts.c1.phone}?text=${encodeURIComponent(msg)}`;
    speak("Sending SOS to your primary contact.");
};

// ----------------------- LOCATION SHARE -----------------------
document.getElementById("locationBtn").onclick = () => {
    navigator.geolocation.getCurrentPosition(pos => {
        let lat = pos.coords.latitude;
        let lon = pos.coords.longitude;
        let link = `I am here: https://maps.google.com/?q=${lat},${lon}`;

        let contacts = JSON.parse(localStorage.getItem("contacts"));
        window.location.href =
            `https://wa.me/${contacts.c1.phone}?text=${encodeURIComponent(link)}`;
        speak("Sharing your live location.");
    });
};

// ----------------------- SCREEN BLINK -----------------------
let blinking = false;
document.getElementById("screenBlinkBtn").onclick = () => {
    blinking = !blinking;
    if (blinking) {
        speak("Screen blinking activated.");
        document.body.style.animation = "blink 0.2s infinite";
    } else {
        document.body.style.animation = "none";
    }
};

document.body.style.setProperty("--blink-color", "white");

document.head.insertAdjacentHTML("beforeend", `
<style>
@keyframes blink {
    0% { background:#fff; }
    50% { background:#000; }
    100% { background:#fff; }
}
</style>`);

//---------------------------------
// CAMERA FLASH (TORCH) ALERT
//---------------------------------
let torchStream;
let torchTrack;
let torchOn = false;

async function toggleTorchFlash() {
    try {
        if (!torchOn) {
            // Turn ON
            torchStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", torch: true }
            });

            torchTrack = torchStream.getVideoTracks()[0];

            // Blink effect
            blinkTorch();

            torchOn = true;
            speakEnabled("Camera flash alert activated.");

        } else {
            // Turn OFF
            torchOn = false;
            if (torchStream) {
                torchStream.getTracks().forEach(t => t.stop());
                torchStream = null;
                torchTrack = null;
            }

            speakEnabled("Camera flash alert stopped.");
        }
    } catch (err) {
        alert("Flashlight is not supported on your device or browser.");
        console.error(err);
    }
}

async function blinkTorch() {
    while (torchOn && torchTrack) {
        await torchTrack.applyConstraints({ advanced: [{ torch: true }] });
        await new Promise(r => setTimeout(r, 200));

        await torchTrack.applyConstraints({ advanced: [{ torch: false }] });
        await new Promise(r => setTimeout(r, 200));
    }
}

// ----------------------- SIREN -----------------------
const siren = document.getElementById("sirenAudio");
let sirenOn = false;
document.getElementById("sirenBtn").onclick = () => {
    sirenOn = !sirenOn;
    if (sirenOn) {
        siren.play();
        speak("Siren activated.");
    } else {
        siren.pause();
        siren.currentTime = 0;
        speak("Siren stopped.");
    }
};

// ----------------------- VOICE GUIDE TOGGLE -----------------------
document.getElementById("voiceToggleBtn").onclick = () => {
    voiceEnabled = !voiceEnabled;
    voiceToggleBtn.innerText = voiceEnabled ? "🔊 Voice Guide: ON" : "🔇 Voice Guide: OFF";
    speak("Voice guide is now on.");
};

// ----------------------- VOICE SOS “help me” -----------------------
if ("webkitSpeechRecognition" in window) {
    const rec = new webkitSpeechRecognition();
    rec.continuous = true;
    rec.lang = "en-US";

    rec.onresult = function(event) {
        let said = event.results[event.results.length - 1][0].transcript.toLowerCase();
        if (said.includes("help me")) {
            document.getElementById("sosBtn").click();
            speak("Voice SOS triggered.");
        }
    };
    rec.start();
}

// ----------------------- READ TIPS -----------------------
document.getElementById("readTipsBtn").onclick = () => {
    speak("Self defense tips. Stay aware of your surroundings. Trust your instincts. Keep emergency tools ready. Use your voice loudly. Target sensitive areas and escape immediately.");
};
