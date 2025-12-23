const sosBtn = document.getElementById("sosBtn");
const sirenBtn = document.getElementById("sirenBtn");
const flashBtn = document.getElementById("flashBtn");
const locationBtn = document.getElementById("locationBtn");
const tipsBtn = document.getElementById("tipsBtn");
const sirenAudio = document.getElementById("sirenAudio");

let flashOn = false;
let stream = null;

// SOS
sosBtn.onclick = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const link = `https://wa.me/?text=EMERGENCY! I am in danger. My location: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
      window.open(link, "_blank");
    });
  }
};

// Siren
sirenBtn.onclick = () => {
  sirenAudio.loop = true;
  sirenAudio.play();
};

// Flash blink
flashBtn.onclick = async () => {
  try {
    if (!flashOn) {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      const track = stream.getVideoTracks()[0];
      flashOn = true;

      const blink = async () => {
        while (flashOn) {
          await track.applyConstraints({ advanced: [{ torch: true }] });
          await new Promise(r => setTimeout(r, 300));
          await track.applyConstraints({ advanced: [{ torch: false }] });
          await new Promise(r => setTimeout(r, 300));
        }
      };
      blink();
    } else {
      flashOn = false;
      stream.getTracks().forEach(t => t.stop());
    }
  } catch (e) {
    alert("Flash not supported on this phone");
  }
};

// Location
locationBtn.onclick = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const link = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
      window.open(link, "_blank");
    });
  }
};

// Tips
tipsBtn.onclick = () => {
  alert(
    "Self Defence Tips:\n\n" +
    "1. Stay aware of surroundings\n" +
    "2. Trust your instincts\n" +
    "3. Keep emergency tools ready\n" +
    "4. Use your voice loudly\n" +
    "5. Target eyes, nose, groin and escape"
  );
};
