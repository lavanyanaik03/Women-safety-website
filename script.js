const siren = document.getElementById("sirenAudio");

function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 1;
  speechSynthesis.speak(msg);
}

// SOS
document.getElementById("sosBtn").onclick = () => {
  speak("Emergency SOS activated");
  navigator.geolocation.getCurrentPosition(pos => {
    const link = `https://wa.me/?text=EMERGENCY! I am in danger. My location: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
    window.open(link);
  });
};

// Siren
document.getElementById("sirenBtn").onclick = () => {
  siren.play();
  speak("Siren alarm activated");
};

// Screen Blink
document.getElementById("screenBlinkBtn").onclick = () => {
  speak("Screen blink activated");
  let i = 0;
  const blink = setInterval(() => {
    document.body.style.background = i % 2 ? "white" : "red";
    i++;
    if (i > 10) {
      clearInterval(blink);
      document.body.style.background = "";
    }
  }, 200);
};

// Share Location
document.getElementById("locationBtn").onclick = () => {
  speak("Sharing location");
  navigator.geolocation.getCurrentPosition(pos => {
    window.open(`https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`);
  });
};

// Tips
document.getElementById("tipsBtn").onclick = () => {
  const box = document.getElementById("tipsBox");
  box.classList.toggle("hidden");
  speak("Self defence tips displayed");
};
