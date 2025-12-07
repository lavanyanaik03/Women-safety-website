//---------------------------------
// TEXT-TO-SPEECH
//---------------------------------
let voiceGuideOn = true;

function speakEnabled(text) {
    if (!voiceGuideOn) return;

    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1;
    msg.pitch = 1;
    msg.volume = 1;
    speechSynthesis.speak(msg);
}


//---------------------------------
// LOAD SAVED CONTACTS
//---------------------------------
function loadSavedContacts() {
    document.getElementById("c1Name").value = localStorage.getItem("c1Name") || "";
    document.getElementById("c1Phone").value = localStorage.getItem("c1Phone") || "";

    document.getElementById("c2Name").value = localStorage.getItem("c2Name") || "";
    document.getElementById("c2Phone").value = localStorage.getItem("c2Phone") || "";

    document.getElementById("c3Name").value = localStorage.getItem("c3Name") || "";
    document.getElementById("c3Phone").value = localStorage.getItem("c3Phone") || "";
}

loadSavedContacts();


//---------------------------------
// SAVE CONTACTS
//---------------------------------
document.getElementById("saveContactsBtn").addEventListener("click", () => {
    localStorage.setItem("c1Name", document.getElementById("c1Name").value);
    localStorage.setItem("c1Phone", document.getElementById("c1Phone").value);

    localStorage.setItem("c2Name", document.getElementById("c2Name").value);
    localStorage.setItem("c2Phone", document.getElementById("c2Phone").value);

    localStorage.setItem("c3Name", document.getElementById("c3Name").value);
    localStorage.setItem("c3Phone", document.getElementById("c3Phone").value);

    speakEnabled("Contacts saved successfully.");
    alert("Contacts saved!");
});


//---------------------------------
// SEND SOS (WHATSAPP)
//---------------------------------
function sendSOS() {
    let number = localStorage.getItem("c1Phone");
    if (!number) {
        alert("Please save your primary contact first.");
        return;
    }

    let msg = "⚠️ SOS! I need help! Please reach me immediately.";

    let url = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");

    speakEnabled("Sending SOS to your primary contact.");
}

document.getElementById("sosBtn").addEventListener("click", sendSOS);


//---------------------------------
// VOICE SOS ("help me")
//---------------------------------
let recognition;
let voiceActive = false;

function startVoiceRecognition() {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Voice recognition not supported on this browser.");
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;

    recognition.onresult = (event) => {
        let said = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        console.log("Heard:", said);

        if (said.includes("help me") || said.includes("help") || said.includes("save me")) {
            sendSOS();
            speakEnabled("SOS activated by voice command.");
        }
    };

    recognition.start();
    voiceActive = true;
}

document.getElementById("voiceSosBtn").addEventListener("click", () => {
    if (!voiceActive) {
        startVoiceRecognition();
        speakEnabled("Voice SOS activated. Say help me anytime.");
    } else {
        recognition.stop();
        voiceActive = false;
        speakEnabled("Voice SOS stopped.");
    }
});


//---------------------------------
// SCREEN BLINK ALERT
//---------------------------------
let blinking = false;

document.getElementById("screenFlashBtn").addEventListener("click", () => {
    blinking = !blinking;

    if (blinking) {
        speakEnabled("Screen blink alert activated.");
        blinkScreen();
    } else {
        document.body.style.backgroundColor = "";
        speakEnabled("Screen blink alert stopped.");
    }
});

function blinkScreen() {
    if (!blinking) return;

    document.body.style.backgroundColor = "white";
    setTimeout(() => {
        document.body.style.backgroundColor = "";
        if (blinking) setTimeout(blinkScreen, 200);
    }, 200);
}


//---------------------------------
// CAMERA FLASH (TORCH BLINK)
//---------------------------------
let torchStream;
let torchTrack;
let torchOn = false;

async function toggleTorchFlash() {
    try {
        if (!torchOn) {
            torchStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", torch: true }
            });

            torchTrack = torchStream.getVideoTracks()[0];
            blinkTorch();

            torchOn = true;
            speakEnabled("Camera flash alert activated.");
        } else {
            torchOn = false;

            if (torchStream) {
                torchStream.getTracks().forEach(t => t.stop());
                torchStream = null;
                torchTrack = null;
            }

            speakEnabled("Camera flash alert stopped.");
        }
    } catch (e) {
        alert("Flashlight not supported on this device or browser.");
        console.error(e);
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

document.getElementById("torchFlashBtn").addEventListener("click", toggleTorchFlash);


//---------------------------------
// SIREN ALARM
//---------------------------------
const siren = document.getElementById("sirenAudio");
let sirenOn = false;

document.getElementById("sirenBtn").addEventListener("click", () => {
    if (!sirenOn) {
        siren.play();
        sirenOn = true;
        speakEnabled("Siren activated.");
    } else {
        siren.pause();
        siren.currentTime = 0;
        sirenOn = false;
        speakEnabled("Siren stopped.");
    }
});


//---------------------------------
// SHARE LOCATION
//---------------------------------
document.getElementById("locationBtn").addEventListener("click", () => {
    speakEnabled("Fetching your live location.");

    if (!navigator.geolocation) {
        alert("Location not supported.");
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        let link = `https://www.google.com/maps?q=${lat},${lon}`;
        window.open(link, "_blank");

        speakEnabled("Location shared.");
    });
});


//---------------------------------
// CALL POLICE
//---------------------------------
document.getElementById("policeBtn").addEventListener("click", () => {
    speakEnabled("Calling police emergency number 112.");
    window.location.href = "tel:112";
});


//---------------------------------
// VOICE GUIDE TOGGLE
//---------------------------------
document.getElementById("voiceToggleBtn").addEventListener("click", () => {
    voiceGuideOn = !voiceGuideOn;
    speakEnabled("Voice guide toggled.");
});


//---------------------------------
// READ DEFENSIVE TIPS
//---------------------------------
document.getElementById("readTipsBtn").addEventListener("click", () => {
    let tips = `
    1. Stay aware of your surroundings.
    2. Trust your instincts.
    3. Keep your emergency tools ready.
    4. Use your voice loudly.
    5. Target eyes, nose, throat or groin and escape.
    `;

    speakEnabled("Reading defensive tips.");
    speakEnabled(tips);
});
