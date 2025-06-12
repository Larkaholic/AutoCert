document.addEventListener('DOMContentLoaded', function() {
    // Get the 'event' parameter from the current URL
    const params = new URLSearchParams(window.location.search);
    const event = params.get('event') || '';

    // Build the new URL (must use a public, routable domain for CleanURI to accept it)
    // CleanURI will not shorten private/local IPs like 192.168.x.x or localhost.
    // Use a public URL for demonstration or fallback to displaying the original.
    let qrUrl;
    if (location.hostname === "localhost" || location.hostname.startsWith("192.168.")) {
        qrUrl = `https://example.com/feedback-form-User.html?event=${encodeURIComponent(event)}`;
    } else {
        qrUrl = `https://${location.host}/feedback-form-User.html?event=${encodeURIComponent(event)}`;
    }

    const qrContainer = document.getElementById('qrcode');

    if (qrContainer) {
        // Remove any text and generate the QR code with the URL
        qrContainer.textContent = "";
        qrContainer.className = "w-full h-full mb-8 rounded-xl border-2 bg-gray-200 border-gray-300 flex items-center justify-center";
        // Optionally, use CleanURI to shorten the URL before generating the QR code
        fetch('https://cleanuri.com/api/v1/shorten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `url=${encodeURIComponent(qrUrl)}`
        })
        .then(response => response.json())
        .then(data => {
            let urlForQR = data.result_url || qrUrl;
            new QRCode(qrContainer, {
                text: urlForQR,
                width: 256,
                height: 256
            });
        })
        .catch(() => {
            new QRCode(qrContainer, {
                text: qrUrl,
                width: 256,
                height: 256
            });
        });
    }
});
