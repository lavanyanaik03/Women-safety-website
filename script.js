let voiceEnabled = true;
const speak = (msg) => {
    if (voiceEnabled) {
        const speech = new SpeechSynthesisUtterance(msg);
        window.speechSynthesis.speak(speech);
    }
};

// -------------------- SAVE CONTACTS --------------------
document.getElementById("saveContactsBtn").onclick = () => {
    let contacts = {
        c1: { name: c1Name.value, phone: c1Phone.value },
        c2: { name: c2Name.value, phone: c2Phone.value },
        c3: { name: c3Name.value, phone: c3Phone.value }
    };
    localStorage.setItem("safeContacts", JSON.stringify(contacts));
    alert("Contacts saved!");
    speak("Contacts saved successfully.");
};

// -------------------- SEND SOS --------------------
document.getElementById("sosBtn").onclick = () => {
    let saved = JSON.parse(localStorage.getItem("safeContacts"));
    if (!saved) return alert("Save contacts first!");

    let msg = `Emergency! I need help!`;
    let phone = saved.c1.phone;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
    speak("Sending SOS message.");
};

// -------------------- SIREN ALARM --------------------
let siren = document.getElementById("sirenAudio");
let sirenOn = false;

document.getElementById("sirenBtn").onclick = () => {
    if (!sirenOn) {
        siren.play();
        sirenOn = true;
        speak("Siren activated.");
    } else {
        siren.pause();
        siren.currentTime = 0;
        sirenOn = false;
        speak("Siren stopped.");
    }
};

// -------------------- SCREEN BLINK --------------------
let blinking = false;

document.getElementById("screenFlashBtn").onclick = () => {
    if (!blinking) {
        blinking = true;
        document.body.style.animation = "blink 0.2s infinite";
        speak("Screen flashing activated.");
    } else {
        blinking = false;
        document.body.style.animation = "none";
        speak("Screen flashing stopped.");
    }
};

document.body.style.setProperty('--blink', `
@keyframes blink {
    0%   { background: #ffffff; }
    50%  { background: #000000; }
    100% { background: #ffffff; }
}
`);

// -------------------- CAMERA FLASH --------------------
let stream = null;

document.getElementById("torchFlashBtn").onclick = async () => {
    try {
        if (!stream) {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", torch: true }
            });

            let track = stream.getVideoTracks()[0];
            await track.applyConstraints({ advanced: [{ torch: true }] });

            speak("Camera flashlight activated.");
        } else {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
            speak("Camera flashlight turned off.");
        }
    } catch (e) {
        alert("Flashlight not supported on this device.");
    }
};

// -------------------- SHARE LOCATION --------------------
document.getElementById("locationBtn").onclick = () => {
    navigator.geolocation.getCurrentPosition(pos => {
        let link = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
        window.open(link);
        speak("Sharing location.");
    });
};

// -------------------- CALL POLICE --------------------
document.getElementById("policeBtn").onclick = () => {
    window.location.href = "tel:112";
    speak("Calling police emergency number.");
};

// -------------------- VOICE GUIDE --------------------
document.getElementById("voiceToggleBtn").onclick = () => {
    voiceEnabled = !voiceEnabled;
    voiceToggleBtn.textContent = voiceEnabled ? "🔊 Voice Guide: ON" : "🔇 Voice Guide: OFF";
};

// -------------------- READ TIPS --------------------
document.getElementById("readTipsBtn").onclick = () => {
    speak("Self defense tips. Stay aware of your surroundings. Trust your instincts. Keep emergency tools ready. Use your voice loudly. Target eyes, nose, throat or groin and escape.");
};
