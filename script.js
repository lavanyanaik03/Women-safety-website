let voiceOn = true;
let flashOn = false;
let stream = null;

// SPLASH → HOME
window.onload = () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
    document.getElementById("app").style.display = "block";
    speak("Welcome. Stay safe. Emergency features ready.");
  }, 2500);
};

// VOICE
function speak(text) {
  if (!voiceOn) return;
  speechSynthesis.cancel();
  let msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.9;
  msg.pitch = 1.2;
  speechSynthesis.speak(msg);
}

// SOS
function sendSOS() {
  speak("Emergency SOS sent");
  navigator.geolocation.getCurrentPosition(pos => {
    const link = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
    const msg = `HELP ME I'M IN DANGER 🚨\nI need help immediately.\nLocation: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  });
}

// LOCATION
function shareLocation() {
  speak("Sharing location");
  navigator.geolocation.getCurrentPosition(pos => {
    const link = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(link)}`);
  });
}

// SIREN
function playSiren() {
  speak("Siren activated");
  document.getElementById("siren").play();
}

// SCREEN BLINK
function screenBlink() {
  speak("Screen blinking");
  let count = 0;
  const blink = setInterval(() => {
    document.body.style.background = count % 2 ? "#ffd6e8" : "#ffffff";
    count++;
    if (count > 6) clearInterval(blink);
  }, 300);
}

// FLASH BLINK (mobile only)
async function flashBlink() {
  speak("Flash blinking");
  if (!stream) {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
  }
  const track = stream.getVideoTracks()[0];
  const imageCapture = new ImageCapture(track);
  let on = false;
  let i = 0;

  const blink = setInterval(() => {
    track.applyConstraints({ advanced: [{ torch: on }] });
    on = !on;
    i++;
    if (i > 6) clearInterval(blink);
  }, 300);
}

// DEFENCE TIPS
function readTips() {
  speak("Self defence tips. Trust your instincts. Target groin eyes nose. Shout loudly. Run to safe places.");
}
