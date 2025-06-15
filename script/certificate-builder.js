let stage, layer, nameText, bgImageObj;
let actualImageWidth, actualImageHeight;

function getResponsiveSize() {
    const container = document.getElementById('konvaContainer');
    return {
        width: container.offsetWidth,
        height: container.offsetHeight
    };
}

// Initialize the Konva stage for editing the certificate
function initKonva(imageSrc) {
    const { width, height } = getResponsiveSize();
    stage = new Konva.Stage({
        container: 'konvaContainer',
        width: width,
        height: height,
    });
    
    layer = new Konva.Layer();
    stage.add(layer);

    // Clear old image and load new one
    bgImageObj = new Image();
    bgImageObj.onload = function() {
        // Store actual image dimensions for proper placement calculations
        actualImageWidth = bgImageObj.width;
        actualImageHeight = bgImageObj.height;
        
        // Create background image on Konva
        const bg = new Konva.Image({
            image: bgImageObj,
            width: width,
            height: height,
            listening: false
        });
        layer.add(bg);

        // Add draggable name placeholder
        nameText = new Konva.Text({
            text: 'SAMPLE NAME',
            x: width / 2,
            y: height / 2,
            fontSize: Math.max(18, Math.floor(height / 16)),
            fontFamily: 'Arial',
            fill: 'black',
            draggable: true,
            fontStyle: 'bold',
            shadowColor: 'white',
            shadowBlur: 2,
            shadowOffset: { x: 1, y: 1 },
            shadowOpacity: 0.5,
        });
        
        // Center text at position
        nameText.offsetX(nameText.width() / 2);
        nameText.offsetY(nameText.height() / 2);

        // Allow resizing font size with mouse wheel
        nameText.on('wheel', (e) => {
            e.evt.preventDefault();
            let fontSize = nameText.fontSize();
            if (e.evt.deltaY < 0) fontSize = Math.min(100, fontSize + 2);
            else fontSize = Math.max(10, fontSize - 2);
            nameText.fontSize(fontSize);
            layer.batchDraw();
        });

        layer.add(nameText);
        layer.draw();
    };
    bgImageObj.src = imageSrc;
}

// Handle window resize
window.addEventListener('resize', () => {
    if (!bgImageObj || !bgImageObj.src) return;
    // Re-initialize Konva with new size
    if (stage) stage.destroy();
    initKonva(bgImageObj.src);
});

// File upload handler
document.getElementById('templateUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        // Clear previous stage if any
        if (stage) stage.destroy();
        initKonva(evt.target.result);
    };
    reader.readAsDataURL(file);
});

// Create a preview certificate with the current placement
function createCertificatePreview(sampleName = "John Doe") {
    if (!nameText || !bgImageObj) {
        alert("Please upload a template and position the name first.");
        return null;
    }
    
    // Create a new stage for the preview (at actual image size)
    const previewStage = new Konva.Stage({
        container: 'previewContainer',
        width: actualImageWidth,
        height: actualImageHeight,
    });
    
    const previewLayer = new Konva.Layer();
    previewStage.add(previewLayer);
    
    // Add the background image at its original size
    const previewBg = new Konva.Image({
        image: bgImageObj,
        width: actualImageWidth,
        height: actualImageHeight
    });
    previewLayer.add(previewBg);
    
    // Calculate the actual position and size based on percentages
    const { width: containerWidth, height: containerHeight } = getResponsiveSize();
    
    // Get the ratio of actual image size to editor container
    const scaleX = actualImageWidth / containerWidth;
    const scaleY = actualImageHeight / containerHeight;
    
    // Create name text for preview
    const previewText = new Konva.Text({
        text: sampleName,
        // Convert editor position to actual image position
        x: nameText.x() * scaleX,
        y: nameText.y() * scaleY,
        fontSize: nameText.fontSize() * scaleY, // Scale font size too
        fontFamily: nameText.fontFamily(),
        fontStyle: nameText.fontStyle(),
        fill: nameText.fill(),
        shadowColor: nameText.shadowColor(),
        shadowBlur: nameText.shadowBlur(),
        shadowOffset: nameText.shadowOffset(),
        shadowOpacity: nameText.shadowOpacity(),
    });
    
    // Apply the same centering offset as the editor text
    previewText.offsetX(previewText.width() / 2);
    previewText.offsetY(previewText.height() / 2);
    
    previewLayer.add(previewText);
    previewLayer.draw();
    
    return previewStage;
}

// Preview Certificate button handler
document.getElementById('previewCertBtn').addEventListener('click', function() {
    if (!nameText || !bgImageObj) {
        document.getElementById('saveStatus').textContent = "Please upload a template and position the name.";
        setTimeout(() => document.getElementById('saveStatus').textContent = "", 3000);
        return;
    }
    
    const previewModal = document.getElementById('previewModal');
    const previewContainer = document.getElementById('previewContainer');
    
    // Clear previous preview
    previewContainer.innerHTML = '';
    
    // Set container size to match the image (with max-width for UI)
    previewContainer.style.width = actualImageWidth + 'px';
    previewContainer.style.height = actualImageHeight + 'px';
    previewContainer.style.maxWidth = '100%';
    previewContainer.style.maxHeight = '60vh';
    
    // Create the preview
    createCertificatePreview();
    
    // Show the modal
    previewModal.classList.remove('hidden');
});

// Close preview modal
document.getElementById('closePreviewBtn').addEventListener('click', function() {
    document.getElementById('previewModal').classList.add('hidden');
});

// Download sample certificate
document.getElementById('downloadCertBtn').addEventListener('click', function() {
    const previewStage = createCertificatePreview("John Doe");
    if (!previewStage) return;
    
    // Convert the stage to a data URL and trigger download
    const dataURL = previewStage.toDataURL({
        mimeType: "image/jpeg", 
        quality: 0.9,
        pixelRatio: 2 // Higher quality
    });
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'sample-certificate.jpg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});

// Save placement button handler
document.getElementById('savePlacementBtn').addEventListener('click', async function() {
    if (!nameText || !bgImageObj) {
        document.getElementById('saveStatus').textContent = "Please upload a template and position the name.";
        return;
    }
    
    // Get editor container dimensions
    const { width: containerWidth, height: containerHeight } = getResponsiveSize();
    
    // Calculate placement as percentages of container size
    const placement = {
        // Store position as percentages
        xPercent: nameText.x() / containerWidth,
        yPercent: nameText.y() / containerHeight,
        // Store actual coordinates too for reference
        x: nameText.x(),
        y: nameText.y(),
        // Font properties
        fontSize: nameText.fontSize(),
        fontSizePercent: nameText.fontSize() / containerHeight,
        fontFamily: nameText.fontFamily(),
        fontStyle: nameText.fontStyle(),
        fill: nameText.fill(),
        // Size and offset for centering
        width: nameText.width(),
        height: nameText.height(),
        offsetX: 1, // Always center text (this is the critical fix)
        offsetY: 1, // Always center text (this is the critical fix)
        // Container info for reference
        editorWidth: containerWidth,
        editorHeight: containerHeight,
        // Actual image dimensions
        imageWidth: actualImageWidth,
        imageHeight: actualImageHeight,
        // Scale factors from editor to actual image
        scaleX: actualImageWidth / containerWidth,
        scaleY: actualImageHeight / containerHeight
    };
    
    // Debug placement data
    console.log("Saved placement data:", placement);
    
    // Save to Firestore under the event
    const params = new URLSearchParams(window.location.search);
    const eventName = params.get('event') || '';
    if (!eventName) {
        document.getElementById('saveStatus').textContent = "Event name missing in URL.";
        return;
    }
    
    try {
        await firebase.firestore().collection("events").doc(eventName).set({
            namePlacement: placement,
            certificateGeneration: {
                // Add explicit certificate generation instructions for other parts of the app
                namePosition: {
                    x: nameText.x() * (actualImageWidth / containerWidth),
                    y: nameText.y() * (actualImageHeight / containerHeight),
                    centered: true,
                    fontSize: nameText.fontSize() * (actualImageHeight / containerHeight),
                    fontFamily: nameText.fontFamily(),
                    fontStyle: nameText.fontStyle(),
                    fill: nameText.fill()
                }
            }
        }, { merge: true });
        document.getElementById('saveStatus').textContent = "Placement saved successfully!";
        setTimeout(() => document.getElementById('saveStatus').textContent = "", 3000);
    } catch (e) {
        console.error("Error saving placement:", e);
        document.getElementById('saveStatus').textContent = "Failed to save placement: " + e.message;
    }
});

// Load existing placement when available
async function loadExistingPlacement() {
    const params = new URLSearchParams(window.location.search);
    const eventName = params.get('event');
    if (!eventName) return;
    
    try {
        const doc = await firebase.firestore().collection("events").doc(eventName).get();
        if (doc.exists && doc.data().namePlacement && nameText) {
            const placement = doc.data().namePlacement;
            const { width, height } = getResponsiveSize();
            
            // Apply the saved placement to the editor
            nameText.x(placement.xPercent * width);
            nameText.y(placement.yPercent * height);
            nameText.fontSize(placement.fontSize || Math.floor(height / 16));
            
            if (placement.fontFamily) nameText.fontFamily(placement.fontFamily);
            if (placement.fontStyle) nameText.fontStyle(placement.fontStyle);
            if (placement.fill) nameText.fill(placement.fill);
            
            // If we have offset data, apply it
            if (placement.offsetX) {
                nameText.offsetX(nameText.width() * placement.offsetX);
                nameText.offsetY(nameText.height() * placement.offsetY);
            }
            
            layer.draw();
        }
    } catch (error) {
        console.error("Error loading placement:", error);
    }
}

// Initialize event handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with a blank stage
    const { width, height } = getResponsiveSize();
    stage = new Konva.Stage({
        container: 'konvaContainer',
        width: width,
        height: height,
    });
    layer = new Konva.Layer();
    stage.add(layer);
    
    // Draw text indicating to upload an image
    const instructionText = new Konva.Text({
        text: 'Upload a certificate template\nto begin',
        x: width / 2,
        y: height / 2,
        fontSize: 18,
        fontFamily: 'Arial',
        fill: 'white',
        align: 'center',
    });
    instructionText.offsetX(instructionText.width() / 2);
    instructionText.offsetY(instructionText.height() / 2);
    layer.add(instructionText);
    layer.draw();
    
    // Load existing placement if available
    loadExistingPlacement();
});
