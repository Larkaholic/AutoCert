let stage, layer, nameText, bgImageObj;
let actualImageWidth, actualImageHeight;
let expirationMinutes = 30; // default 30 minutes

function getResponsiveSize() {
    const container = document.getElementById('konvaContainer');
    return {
        width: container.offsetWidth,
        height: container.offsetHeight
    };
}

function initKonva(imageSrc) {
    const { width, height } = getResponsiveSize();
    stage = new Konva.Stage({
        container: 'konvaContainer',
        width: width,
        height: height,
    });
    
    layer = new Konva.Layer();
    stage.add(layer);

    bgImageObj = new Image();
    bgImageObj.onload = function() {
        actualImageWidth = bgImageObj.width;
        actualImageHeight = bgImageObj.height;
        
        const bg = new Konva.Image({
            image: bgImageObj,
            width: width,
            height: height,
            listening: false
        });
        layer.add(bg);

        nameText = new Konva.Text({
            text: 'SAMPLE NAME',
            x: width / 2,
            y: height / 2,
            fontSize: Math.max(18, Math.floor(height / 16)),
            fontFamily: 'Poppins',
            fill: 'black',
            draggable: true,
            fontStyle: 'bold',
            shadowColor: 'white',
            shadowBlur: 2,
            shadowOffset: { x: 1, y: 1 },
            shadowOpacity: 0.5,
        });
        // recalculate offset after setting text and font size
        nameText.offsetX(nameText.width() / 2);
        nameText.offsetY(nameText.height() / 2);

        nameText.on('wheel', (e) => {
            e.evt.preventDefault();
            let fontSize = nameText.fontSize();
            if (e.evt.deltaY < 0) fontSize = Math.min(100, fontSize + 2);
            else fontSize = Math.max(10, fontSize - 2);
            nameText.fontSize(fontSize);
            // recalculate offset after font size change
            nameText.offsetX(nameText.width() / 2);
            nameText.offsetY(nameText.height() / 2);
            layer.batchDraw();
        });

        layer.add(nameText);
        layer.draw();
    };
    bgImageObj.src = imageSrc;
}

window.addEventListener('resize', () => {
    if (!bgImageObj || !bgImageObj.src) return;
    if (stage) stage.destroy();
    initKonva(bgImageObj.src);
});

document.getElementById('templateUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        if (stage) stage.destroy();
        initKonva(evt.target.result);
    };
    reader.readAsDataURL(file);
});

function createCertificatePreview(sampleName = "John Doe") {
    if (!nameText || !bgImageObj) {
        alert("Please upload a template and position the name first.");
        return null;
    }

    const previewContainer = document.getElementById('previewContainer');
    // Use the actual rendered size of the preview container
    const containerWidth = previewContainer.offsetWidth;
    const containerHeight = previewContainer.offsetHeight;

    // Calculate scale to fit image into container while maintaining aspect ratio
    const scale = Math.min(
        containerWidth / actualImageWidth,
        containerHeight / actualImageHeight
    );
    const displayWidth = actualImageWidth * scale;
    const displayHeight = actualImageHeight * scale;

    // Center the image in the container
    previewContainer.style.display = 'flex';
    previewContainer.style.alignItems = 'center';
    previewContainer.style.justifyContent = 'center';

    // Create a container with the scaled image dimensions
    const previewStage = new Konva.Stage({
        container: 'previewContainer',
        width: displayWidth,
        height: displayHeight,
    });

    const previewLayer = new Konva.Layer();
    previewStage.add(previewLayer);

    // Draw the background image at the scaled size
    const previewBg = new Konva.Image({
        image: bgImageObj,
        width: displayWidth,
        height: displayHeight
    });
    previewLayer.add(previewBg);

    // Calculate the scale between editor and preview image size
    const { width: editorWidth, height: editorHeight } = getResponsiveSize();
    const scaleX = displayWidth / editorWidth;
    const scaleY = displayHeight / editorHeight;

    // Position and scale text properly
    const previewText = new Konva.Text({
        text: sampleName,
        x: nameText.x() * scaleX,
        y: nameText.y() * scaleY,
        fontSize: nameText.fontSize() * ((scaleX + scaleY) / 2),
        fontFamily: nameText.fontFamily(),
        fontStyle: nameText.fontStyle(),
        fill: nameText.fill(),
        shadowColor: nameText.shadowColor(),
        shadowBlur: nameText.shadowBlur(),
        shadowOffset: nameText.shadowOffset(),
        shadowOpacity: nameText.shadowOpacity(),
    });

    previewText.offsetX(previewText.width() / 2);
    previewText.offsetY(previewText.height() / 2);

    previewLayer.add(previewText);
    previewLayer.draw();

    return previewStage;
}

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

    // Make the container wide and not too tall for a landscape certificate
    previewContainer.style.width = '90vw';      // Use 90% of viewport width
    previewContainer.style.height = '60vh';     // Use 60% of viewport height
    previewContainer.style.maxWidth = '';
    previewContainer.style.maxHeight = '';
    previewContainer.style.objectFit = '';
    previewContainer.style.display = 'flex';
    previewContainer.style.alignItems = 'center';
    previewContainer.style.justifyContent = 'center';

    // Generate the preview (will fit to container)
    createCertificatePreview();

    // Show the modal
    previewModal.classList.remove('hidden');
});

document.getElementById('closePreviewBtn').addEventListener('click', function() {
    document.getElementById('previewModal').classList.add('hidden');
});

document.getElementById('downloadCertBtn').addEventListener('click', function() {
    const previewStage = createCertificatePreview("John Doe");
    if (!previewStage) return;
    
    const dataURL = previewStage.toDataURL({
        mimeType: "image/jpeg", 
        quality: 0.9,
        pixelRatio: 2
    });
    
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'sample-certificate.jpg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});

function updateExpirationDisplay() {
    const hours = Math.floor(expirationMinutes / 60);
    const mins = expirationMinutes % 60;
    const display = hours > 0 ? 
        `${hours}h ${mins}m` : 
        `${mins} mins`;
    document.getElementById('expirationDisplay').textContent = display;
}

function calculateExpirationTime() {
    return new Date(Date.now() + (expirationMinutes * 60 * 1000)).toISOString();
}

document.getElementById('savePlacementBtn').addEventListener('click', async function() {
    if (!nameText || !bgImageObj) {
        document.getElementById('saveStatus').textContent = "Please upload a template and position the name.";
        return;
    }
    
    const { width: containerWidth, height: containerHeight } = getResponsiveSize();
    
    const placement = {
        xPercent: nameText.x() / containerWidth,
        yPercent: nameText.y() / containerHeight,
        x: nameText.x(),
        y: nameText.y(),
        fontSize: nameText.fontSize(),
        fontSizePercent: nameText.fontSize() / containerHeight,
        fontFamily: nameText.fontFamily(),
        fontStyle: nameText.fontStyle(),
        fill: nameText.fill(),
        width: nameText.width(),
        height: nameText.height(),
        offsetX: 1,
        offsetY: 1,
        editorWidth: containerWidth,
        editorHeight: containerHeight,
        imageWidth: actualImageWidth,
        imageHeight: actualImageHeight,
        scaleX: actualImageWidth / containerWidth,
        scaleY: actualImageHeight / containerHeight
    };
    
    const params = new URLSearchParams(window.location.search);
    const eventName = params.get('event') || '';
    if (!eventName) {
        document.getElementById('saveStatus').textContent = "Event name missing in URL.";
        return;
    }
    
    try {
        const expiresAt = calculateExpirationTime();
        
        await firebase.firestore().collection("events").doc(eventName).set({
            namePlacement: placement,
            certificateGeneration: {
                namePosition: {
                    x: nameText.x() * (actualImageWidth / containerWidth),
                    y: nameText.y() * (actualImageHeight / containerHeight),
                    centered: true,
                    fontSize: nameText.fontSize() * (actualImageHeight / containerHeight),
                    fontFamily: nameText.fontFamily(),
                    fontStyle: nameText.fontStyle(),
                    fill: nameText.fill()
                }
            },
            expiresAt: expiresAt
        }, { merge: true });
        document.getElementById('saveStatus').textContent = "Placement saved successfully!";
        setTimeout(() => document.getElementById('saveStatus').textContent = "", 3000);
        
        const qrUrl = `qr.html?event=${encodeURIComponent(eventName)}`;
        window.open(qrUrl, '_blank', 'width=400,height=500');
        
    } catch (e) {
        document.getElementById('saveStatus').textContent = "Failed to save placement: " + e.message;
    }
});

async function loadExistingPlacement() {
    const params = new URLSearchParams(window.location.search);
    const eventName = params.get('event');
    if (!eventName) return;
    
    try {
        const doc = await firebase.firestore().collection("events").doc(eventName).get();
        if (doc.exists && doc.data().namePlacement && nameText) {
            const placement = doc.data().namePlacement;
            const { width, height } = getResponsiveSize();
            
            nameText.x(placement.xPercent * width);
            nameText.y(placement.yPercent * height);
            nameText.fontSize(placement.fontSize || Math.floor(height / 16));
            
            if (placement.fontFamily) nameText.fontFamily(placement.fontFamily);
            if (placement.fontStyle) nameText.fontStyle(placement.fontStyle);
            if (placement.fill) nameText.fill(placement.fill);
            
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

document.addEventListener('DOMContentLoaded', function() {
    const { width, height } = getResponsiveSize();
    stage = new Konva.Stage({
        container: 'konvaContainer',
        width: width,
        height: height,
    });
    layer = new Konva.Layer();
    stage.add(layer);
    
    const instructionText = new Konva.Text({
        text: 'Upload a certificate template\nto begin',
        x: width / 2,
        y: height / 2,
        fontSize: 18,
        fontFamily: 'Poppins',
        fill: 'white',
        align: 'center',
    });
    instructionText.offsetX(instructionText.width() / 2);
    instructionText.offsetY(instructionText.height() / 2);
    layer.add(instructionText);
    layer.draw();
    
    loadExistingPlacement();
});

document.addEventListener('DOMContentLoaded', function() {
    // initialize with a blank stage
    const { width, height } = getResponsiveSize();
    stage = new Konva.Stage({
        container: 'konvaContainer',
        width: width,
        height: height,
    });
    layer = new Konva.Layer();
    stage.add(layer);
    
    const instructionText = new Konva.Text({
        text: 'Upload a certificate template\nto begin',
        x: width / 2,
        y: height / 2,
        fontSize: 18,
        fontFamily: 'Poppins',
        fill: 'white',
        align: 'center',
    });
    instructionText.offsetX(instructionText.width() / 2);
    instructionText.offsetY(instructionText.height() / 2);
    layer.add(instructionText);
    layer.draw();
    
    loadExistingPlacement();
    
    document.getElementById('decreaseTime').addEventListener('click', () => {
        if (expirationMinutes > 30) {
            expirationMinutes -= 30;
            updateExpirationDisplay();
        }
    });

    document.getElementById('increaseTime').addEventListener('click', () => {
        expirationMinutes += 30;
        updateExpirationDisplay();
    });

    updateExpirationDisplay();
});

async function checkCertificateExclusion() {
    const params = new URLSearchParams(window.location.search);
    const eventName = params.get('event');
    if (!eventName) return;
    
    try {
        const doc = await firebase.firestore().collection("events").doc(eventName).get();
        if (doc.exists) {
            const data = doc.data();
            const excludeCertificate = data.excludeCertificate || false;
            
            window.selectedCertificateFont = data.certificateFont || 'Poppins';
            window.eventData = data;
            
            const certificateSection = document.getElementById('certificateSection');
            if (certificateSection) {
                if (excludeCertificate) {
                    certificateSection.style.display = 'none';
                } else {
                    certificateSection.style.display = 'block';
                }
            }
        }
    } catch (error) {
        console.error("Error checking certificate exclusion:", error);
    }
}