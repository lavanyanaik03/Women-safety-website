const siren = document.getElementById("sirenAudio");

// Female voice if available
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  const female = voices.find(v => v.name.toLowerCase().includes("female"));
  if (female) utter.voice = female;
  utter.rate = 1;
  speechSynthesis.speak(utter);
}

// SOS
document.getElementById("sosBtn").onclick = () => {
  speak("Emergency S O S activated");

  if (!navigator.geolocation) {
    alert("Location not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const message =
      "🚨 HELP ME I'M IN DANGER 🚨\n" +
      "I need immediate help.\n" +
      "My live location is below:\n" +
      `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;

    const link = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(link, "_blank");
  });
};

// Siren
document.getElementById("sirenBtn").onclick = () => {
  siren.currentTime = 0;
  siren.play();
  speak("Siren alarm activated");
};

// Screen Blink (FIXED)
document.getElementById("screenBlinkBtn").onclick = () => {
  speak("Screen blinking");
  let count = 0;
  const original = document.body.style.background;

  const blink = setInterval(() => {
    document.body.style.background = count % 2 === 0 ? "#ff1744" : "#ffffff";
    count++;
    if (count > 10) {
      clearInterval(blink);
      document.body.style.background = original;
    }
  }, 200);
};

// Share Location
document.getElementById("locationBtn").onclick = () => {
  speak("Sharing your location");
  navigator.geolocation.getCurrentPosition(pos => {
    window.open(
      `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`,
      "_blank"
    );
  });
};

// Tips
document.getElementById("tipsBtn").onclick = () => {
  const box = document.getElementById("tipsBox");
  box.classList.toggle("hidden");
  speak("Self defence tips displayed");
};
