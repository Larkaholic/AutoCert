document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const event = params.get('event') || '';

    let qrUrl;
    if (location.hostname === "localhost" || location.hostname.startsWith("192.168.")) {
        qrUrl = `https://example.com/feedback-form-User.html?event=${encodeURIComponent(event)}`;
    } else {
        qrUrl = `https://${location.host}/feedback-form-User.html?event=${encodeURIComponent(event)}`;
    }

    const qrContainer = document.getElementById('qrcode');

    if (qrContainer) {
        qrContainer.textContent = "";
        qrContainer.className = "w-full h-full mb-8 rounded-xl border-2 bg-gray-200 border-gray-300 flex items-center justify-center";
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
