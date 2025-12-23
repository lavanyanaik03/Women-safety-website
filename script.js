// SOS MESSAGE
function sendSOS() {
  if (!navigator.geolocation) {
    alert("Location not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const message = `🚨 EMERGENCY 🚨
I am in danger. Please help me immediately.
My location: https://maps.google.com/?q=${lat},${lon}`;

    const phone = "91XXXXXXXXXX"; // replace with emergency number
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  });
}

// SIREN
function playSiren() {
  const siren = document.getElementById("sirenAudio");
  siren.play();
}

// FLASH BLINK (screen-based – works on all phones)
function blinkFlash() {
  let count = 0;
  const interval = setInterval(() => {
    document.body.style.background = 
      document.body.style.background === "white" ? "black" : "white";
    count++;
    if (count > 10) {
      clearInterval(interval);
      document.body.style.background = "";
    }
  }, 200);
}

// SHARE LOCATION
function shareLocation() {
  navigator.geolocation.getCurrentPosition(position => {
    const link = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
    alert("Your location:\n" + link);
  });
}

// DEFENCE TIPS WITH VOICE
function readDefenceTips() {
  const text = `
Stay alert.
Trust your instincts.
Target weak areas like eyes, nose and groin.
Scream loudly.
Run to a safe place.
`;

  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.9;
  speech.pitch = 1.2;
  window.speechSynthesis.speak(speech);
}
