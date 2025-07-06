document.addEventListener('DOMContentLoaded', function() {
    // grab the event name from the url
    const params = new URLSearchParams(window.location.search);
    const eventName = params.get('event') || '';

    // figure out where to point the qr code
    let feedbackUrl;
    if (location.hostname === "localhost" || location.hostname.startsWith("192.168.")) {
        feedbackUrl = `${window.location.origin}/feedback-form-user.html?event=${encodeURIComponent(eventName)}`;
    } else {
        feedbackUrl = `${location.protocol}//${location.host}/feedback-form-user.html?event=${encodeURIComponent(eventName)}`;
        
        // if we're on github pages, use a different url
        if (location.host.includes('github.io')) {
            feedbackUrl = `${location.protocol}//${location.host}/AutoCert/feedback-form-user.html?event=${encodeURIComponent(eventName)}`;
        }
    }

    const qrContainer = document.getElementById('qrcode');
    if (qrContainer) {
        qrContainer.textContent = '';
        new QRCode(qrContainer, {
            text: feedbackUrl,
            width: 256,
            height: 256
        });
    }

    // Add close button functionality
    const closeButton = document.querySelector('button');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            window.close();
        });
    }
});