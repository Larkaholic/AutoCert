document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const eventName = params.get('event') || '';

    // Get the feedback form URL based on environment
    let feedbackUrl;
    if (location.hostname === "localhost" || location.hostname.startsWith("192.168.")) {
        feedbackUrl = `${window.location.origin}/feedback-form-User.html?event=${encodeURIComponent(eventName)}`;
    } else {
        feedbackUrl = `${location.protocol}//${location.host}/feedback-form-User.html?event=${encodeURIComponent(eventName)}`;
        
        // Special handling for GitHub Pages if needed
        if (location.host.includes('github.io')) {
            feedbackUrl = `${location.protocol}//${location.host}/AutoCert/feedback-form-User.html?event=${encodeURIComponent(eventName)}`;
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