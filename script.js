let voiceOn = true;
let night = false;

function speak(text) {
  if (!voiceOn) return;
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.9;
  speechSynthesis.speak(msg);
}

/* SPLASH */
setTimeout(() => {
  document.getElementById("splash").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
}, 2500);

/* SAVE CONTACTS */
function saveContacts() {
  localStorage.setItem("dad", dad.value);
  localStorage.setItem("mom", mom.value);
  localStorage.setItem("sib", sib.value);
  speak("Emergency contacts saved");
}

/* SOS */
function sendSOS() {
  const msg = `🚨 HELP ME! I'M IN DANGER 🚨

Dad or Mom, I need help immediately.

📍 My live location:
`;
  navigator.geolocation.getCurrentPosition(pos => {
    const link = msg +
      `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;

    [localStorage.getItem("dad"),
     localStorage.getItem("mom"),
     localStorage.getItem("sib")]
    .filter(Boolean)
    .forEach(p =>
      window.open(`https://wa.me/${p}?text=${encodeURIComponent(link)}`)
    );
  });
  speak("Emergency message and location sent");
}

/* SIREN */
function playSiren() {
  siren.play();
  speak("Siren activated");
}

/* SCREEN BLINK */
function screenBlink() {
  let i = 0;
  const blink = setInterval(() => {
    document.body.style.background = i % 2 ? "black" : "white";
    i++;
    if (i > 10) {
      clearInterval(blink);
      document.body.style.background = "";
    }
  }, 200);
  speak("Screen alert activated");
}

/* LOCATION */
function shareLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    window.open(`https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`);
  });
  speak("Location shared");
}

/* NIGHT MODE */
function toggleNight() {
  night = !night;
  document.body.classList.toggle("dark");
  speak(night ? "Night mode on" : "Night mode off");
}

/* VOICE TOGGLE */
function toggleVoice() {
  voiceOn = !voiceOn;
  alert("Voice guide " + (voiceOn ? "ON" : "OFF"));
}

/* READ TIPS */
function readTips() {
  speak("Stay alert. Trust your instincts. Use your voice loudly. Target eyes, nose, throat or groin and escape.");
}
