// Get the current URL
const url = window.location.href;

// Find the container where the QR code will be rendered
const qrContainer = document.getElementById('qrcode');

// Inject the QR code image using qrickit.com API
if (qrContainer) {
    qrContainer.innerHTML = `<img src="https://qrickit.com/api/qr.php?d=${encodeURIComponent(url)}" />`;
}
