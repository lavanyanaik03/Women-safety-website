let flashStream = null;
let flashOn = false;

function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.9;
  msg.pitch = 1.2;
  window.speechSynthesis.speak(msg);
}

/* SAVE CONTACT */
function saveContact() {
  localStorage.setItem("name", contactName.value);
  localStorage.setItem("phone", contactPhone.value);
  speak("Emergency contact saved");
}

/* SEND SOS */
function sendSOS() {
  const phone = localStorage.getItem("phone");
  if (!phone) {
    alert("Save contact first");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const msg =
      "EMERGENCY! I am in danger.\n" +
      "My live location:\n" +
      "https://maps.google.com/?q=" +
      pos.coords.latitude + "," +
      pos.coords.longitude;

    window.open(
      "https://wa.me/" + phone + "?text=" + encodeURIComponent(msg)
    );
  });

  speak("Emergency message sent");
}

/* SIREN */
function playSiren() {
  const siren = document.getElementById("siren");
  siren.loop = true;
  siren.play();
  speak("Siren activated");
}

/* FLASH BLINK */
async function toggleFlash() {
  try {
    if (!flashOn) {
      flashStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", torch: true }
      });
      const track = flashStream.getVideoTracks()[0];
      flashOn = true;

      const blink = setInterval(() => {
        track.applyConstraints({ advanced: [{ torch: true }] });
        setTimeout(() => {
          track.applyConstraints({ advanced: [{ torch: false }] });
        }, 300);
      }, 600);

      track.onended = () => clearInterval(blink);
      speak("Flash blinking");

    } else {
      flashStream.getTracks().forEach(t => t.stop());
      flashOn = false;
      speak("Flash stopped");
    }
  } catch {
    alert("Flash not supported on this device");
  }
}

/* SCREEN BLINK */
function screenBlink() {
  const b = document.getElementById("blink");
  let i = 0;
  const interval = setInterval(() => {
    b.style.opacity = i % 2 === 0 ? "1" : "0";
    i++;
    if (i > 6) {
      clearInterval(interval);
      b.style.opacity = "0";
    }
  }, 300);
  speak("Screen blinking");
}

/* SHARE LOCATION */
function shareLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    const link = "https://maps.google.com/?q=" +
      pos.coords.latitude + "," +
      pos.coords.longitude;
    window.open(link);
  });
  speak("Sharing location");
}

/* DEFENCE TIPS */
function readTips() {
  speak(
    "Stay alert. Trust your instincts. Keep emergency tools ready. " +
    "Use your voice loudly. Target eyes, nose, throat or groin and escape."
  );
}
