const siren = document.getElementById("sirenAudio");

/* SPLASH → HOME */
setTimeout(() => {
  document.getElementById("splash").style.display = "none";
  document.getElementById("app").classList.remove("hidden");
}, 4000);

/* VOICE */
function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.95;
  speechSynthesis.speak(msg);
}

/* SOS */
document.getElementById("sosBtn").onclick = () => {
  speak("Emergency SOS activated");
  navigator.geolocation.getCurrentPosition(pos => {
    const text =
      "HELP ME I'M IN DANGER 🚨\n" +
      "PLEASE HELP ME.\n\n" +
      "My location:\n" +
      `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  });
};

/* SIREN */
document.getElementById("sirenBtn").onclick = () => {
  siren.play();
  speak("Siren alarm activated");
};

/* SCREEN BLINK */
document.getElementById("screenBlinkBtn").onclick = () => {
  speak("Screen blink activated");
  let i = 0;
  const blink = setInterval(() => {
    document.body.style.background = i % 2 ? "#ff1744" : "#ffffff";
    i++;
    if (i > 8) {
      clearInterval(blink);
      document.body.style.background = "";
    }
  }, 250);
};

/* LOCATION */
document.getElementById("locationBtn").onclick = () => {
  speak("Sharing location");
  navigator.geolocation.getCurrentPosition(pos => {
    window.open(
      `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`
    );
  });
};

/* TIPS */
document.getElementById("tipsBtn").onclick = () => {
  document.getElementById("tipsBox").classList.toggle("hidden");
  speak("Self defense tips displayed");
};
