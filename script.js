let voiceGuide = true;
let screenBlinking = false;
let blinkInterval;

/* Voice function */
function speak(text) {
  if (!voiceGuide) return;
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";
  msg.rate = 0.9;
  speechSynthesis.speak(msg);
}

/* SOS */
function sendSOS() {
  speak("Emergency SOS activated");

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const message =
`🚨 EMERGENCY 🚨
I am in danger. Please help me immediately.
My live location:
https://maps.google.com/?q=${lat},${lon}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  });
}

/* Voice SOS */
function voiceSOS() {
  speak("Voice SOS activated. Say help me loudly to get attention.");
  alert("Shout HELP ME loudly to alert people nearby.");
}

/* Screen Blink */
function toggleScreenBlink() {
  if (!screenBlinking) {
    speak("Screen blinking activated");
    screenBlinking = true;
    blinkInterval = setInterval(() => {
      document.body.style.background =
        document.body.style.background === "black" ? "white" : "black";
    }, 300);
  } else {
    speak("Screen blinking stopped");
    clearInterval(blinkInterval);
    screenBlinking = false;
    document.body.style.background =
      "linear-gradient(135deg, #f6c1e8, #c9c9ff)";
  }
}

/* Camera Flash (browser limitation explained) */
function cameraFlash() {
  speak("Camera flash cannot be controlled by browser due to security restrictions");
  alert("⚠️ Phone flashlight control is not allowed in browsers.\nUse Screen Blink or Siren for attention.");
}

/* Siren */
function playSiren() {
  speak("Siren alarm activated");
  const siren = document.getElementById("sirenAudio");
  siren.loop = true;
  siren.play();
}

/* Location only */
function shareLocation() {
  speak("Sharing location");
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    window.open(`https://maps.google.com/?q=${lat},${lon}`, "_blank");
  });
}

/* Tips */
function readTips() {
  const tips =
`Stay aware of your surroundings.
Trust your instincts.
Keep emergency tools ready.
Use your voice loudly.
Target eyes, nose, throat or groin and escape.`;
  speak(tips);
}

/* Voice Guide Toggle */
function toggleVoiceGuide() {
  voiceGuide = !voiceGuide;
  alert("Voice Guide " + (voiceGuide ? "ON" : "OFF"));
}
