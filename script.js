function sendSOS() {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            let message = `SOS! I need help!\nMy location: https://www.google.com/maps?q=${lat},${lon}`;

            window.location.href =
                "https://wa.me/?text=" + encodeURIComponent(message);
        },
        function (error) {
            alert("Unable to get location. Please enable GPS.");
        }
    );
}

function trackLocation() {
    navigator.geolocation.watchPosition(
        function (position) {
            alert(
                "Your Live Location:\nLatitude: " +
                    position.coords.latitude +
                    "\nLongitude: " +
                    position.coords.longitude
            );
        },
        function (error) {
            alert("Unable to track location. Check GPS permissions.");
        }
    );
}