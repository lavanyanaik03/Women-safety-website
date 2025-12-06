// SOS SIREN
document.getElementById("sosBtn").addEventListener("click", function () {
    const siren = document.getElementById("sirenSound");
    siren.play();
    alert("⚠ SOS Activated!\nYour emergency message will be sent.");
});

// TRACK LOCATION
document.getElementById("trackBtn").addEventListener("click", function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            let lat = pos.coords.latitude;
            let lon = pos.coords.longitude;

            let mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
            alert("📍 Location Copied!\n" + mapsLink);
            navigator.clipboard.writeText(mapsLink);
        });
    }
});

// SELF DEFENSE TIPS
document.getElementById("tipsLink").addEventListener("click", function () {
    alert("💪 Self Defense Tips:\n• Stay aware of surroundings\n• Use your voice loudly\n• Hit vulnerable areas\n• Keep distance and run");
});

// VOICE ASSISTANT
document.getElementById("voiceBtn").addEventListener("click", function () {
    let msg = new SpeechSynthesisUtterance();
    msg.text = "Hello Lavanya. I am your safety assistant. Speak your command.";
    speechSynthesis.speak(msg);
});

// EMERGENCY CONTACTS
document.getElementById("contactsBtn").addEventListener("click", function () {
    alert("📞 Emergency Contacts:\n• Police: 100\n• Women Helpline: 1091\n• Ambulance: 108\n• Family: Add numbers soon");
});
