const siren = document.getElementById("sirenAudio");

/* SPLASH → HOME */
setTimeout(() => {
  document.getElementById("splash").style.display = "none";
  document.getElementById("home").classList.remove("hidden");
}, 4000);

/* SPEAK (female if possible) */
function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  const female = voices.find(v => v.name.toLowerCase().includes("female"));
  if (female) u.voice = female;
  speechSynthesis.speak(u);
}

/* SAVE CONTACTS */
document.getElementById("saveContacts").onclick = () => {
  localStorage.setItem("c1", c1.value);
  localStorage.setItem("c2", c2.value);
  localStorage.setItem("c3", c3.value);
  speak("Emergency contacts saved");
};

/* SOS */
document.getElementById("sosBtn").onclick = () => {
  speak("Emergency S O S activated");

  navigator.geolocation.getCurrentPosition(pos => {
    const msg =
      "🚨 HELP ME I'M IN DANGER 🚨\n" +
      "I need immediate help.\n" +
      "My location:\n" +
      `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  });
};

/* VOICE SOS */
document.getElementById("voiceSosBtn").onclick = () => {
  speak("Say help me to activate SOS");
};

/* SCREEN BLINK */
document.getElementById("screenBlinkBtn").onclick = () => {
  let count = 0;
  const bg = document.body.style.background;
  const blink = setInterval(() => {
    document.body.style.background = count % 2 ? "red" : "white";
    count++;
    if (count > 8) {
      clearInterval(blink);
      document.body.style.background = bg;
    }
  }, 200);
};

/* FLASH (LIMITATION NOTICE) */
document.getElementById("flashBtn").onclick = () => {
  speak("Phone flash works only in mobile apps");
};

/* SIREN */
document.getElementById("sirenBtn").onclick = () => {
  siren.currentTime = 0;
  siren.play();
  speak("Siren activated");
};

/* LOCATION */
document.getElementById("locationBtn").onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    window.open(`https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`);
  });
};

/* READ TIPS */
document.getElementById("readTips").onclick = () => {
  speak(document.getElementById("tips").innerText);
};
