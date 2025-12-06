// SOS Button
document.getElementById("sosButton").addEventListener("click", function () {
    const siren = document.getElementById("sirenAudio");
    siren.play();

    alert("🚨 SOS Sent! Your emergency alert is activated.");
});

// Track My Location Button
document.getElementById("locationButton").addEventListener("click", function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported on this device.");
    }
});

// Show live location
function showPosition(position) {
    let link = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
    alert("📍 Your live location:\n" + link);
}

// Error handling
function showError(error) {
    alert("⚠ Unable to fetch your location.");
}
