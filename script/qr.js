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

    // Find the container where the URL will be rendered
    const qrContainer = document.getElementById('qrcode');

    if (qrContainer) {
        qrContainer.textContent = "Loading shortened URL...";
        qrContainer.className = "text-3xl font-bold";

        fetch('https://cleanuri.com/api/v1/shorten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `url=${encodeURIComponent(qrUrl)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.result_url) {
                qrContainer.textContent = data.result_url;
            } else if (data.error) {
                qrContainer.textContent = `Shortening failed: ${data.error}`;
            } else {
                qrContainer.textContent = qrUrl;
            }
        })
        .catch(() => {
            qrContainer.textContent = qrUrl;
        });
    }
});
