document.addEventListener('DOMContentLoaded', function() {
    // Get the current URL
    const url = window.location.href;

    // Find the container where the QR code will be rendered
    const qrContainer = document.getElementById('qrcode');

    // Inject the QR code image using goqr.me API
    if (qrContainer) {
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=256x256" />`;
    }
});
