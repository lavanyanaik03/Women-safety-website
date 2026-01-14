let voiceOn = true;
let synth = window.speechSynthesis;

window.onload = () => {
  setTimeout(() => {
    document.getElementById("splash").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
  }, 2500);

  loadContacts();
};

function speak(text) {
  if (!voiceOn) return;
  let msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.95;
  msg.pitch = 1.2;
  synth.speak(msg);
}

/* CONTACTS */
function saveContacts() {
  localStorage.setItem("dad", dad.value);
  localStorage.setItem("mom", mom.value);
  localStorage.setItem("bro", bro.value);
  speak("Emergency contacts saved");
}

function loadContacts() {
  dad.value = localStorage.getItem("dad") || "";
  mom.value = localStorage.getItem("mom") || "";
  bro.value = localStorage.getItem("bro") || "";
}

/* SOS */
function sendSOS() {
  speak("Sending emergency SOS");
  navigator.geolocation.getCurrentPosition(pos => {
    let lat = pos.coords.latitude;
    let lon = pos.coords.longitude;
    let msg = `HELP ME I'M IN DANGER 🚨
Dad / Mom please help me immediately.
My location: https://maps.google.com/?q=${lat},${lon}`;

    let num = localStorage.getItem("dad");
    if (num) {
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`);
    }
  });
}

/* LOCATION */
function shareLocation() {
  speak("Sharing location");
  navigator.geolocation.getCurrentPosition(pos => {
    let link = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
    alert("Location: " + link);
  });
}

/* SIREN */
function playSiren() {
  speak("Siren activated");
  document.getElementById("siren").play();
}

/* SCREEN BLINK */
function screenBlink() {
  speak("Screen blink activated");
  let i = 0;
  let interval = setInterval(() => {
    document.body.style.background =
      i % 2 ? "#000" : "linear-gradient(135deg,#f9d5ec,#d6e6ff)";
    i++;
    if (i > 10) clearInterval(interval);
  }, 300);
}

/* FLASH (SIMULATED) */
function flashBlink() {
  speak("Flash blinking");
  alert("Flash blinking (browser demo mode)");
}

/* FAKE CALL */
function fakeCall() {
  speak("Incoming call");
  alert("Fake Call Incoming 📞");
}

/* VOICE GUIDE */
function toggleVoice() {
  voiceOn = !voiceOn;
  document.getElementById("voiceState").innerText = voiceOn ? "ON" : "OFF";
}

/* DEFENCE TIPS */
function readTips() {
  speak(document.getElementById("tips").innerText);
}
