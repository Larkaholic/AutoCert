let stage, layer, nameText, bgImageObj;
let actualImageWidth, actualImageHeight;

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
            fontFamily: 'Arial',
            fill: 'black',
            draggable: true,
            fontStyle: 'bold',
            shadowColor: 'white',
            shadowBlur: 2,
            shadowOffset: { x: 1, y: 1 },
            shadowOpacity: 0.5,
        });
        
        nameText.offsetX(nameText.width() / 2);
        nameText.offsetY(nameText.height() / 2);

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
    
    const previewStage = new Konva.Stage({
        container: 'previewContainer',
        width: actualImageWidth,
        height: actualImageHeight,
    });
    
    const previewLayer = new Konva.Layer();
    previewStage.add(previewLayer);
    
    const previewBg = new Konva.Image({
        image: bgImageObj,
        width: actualImageWidth,
        height: actualImageHeight
    });
    previewLayer.add(previewBg);
    
    const { width: containerWidth, height: containerHeight } = getResponsiveSize();
    const scaleX = actualImageWidth / containerWidth;
    const scaleY = actualImageHeight / containerHeight;
    
    const previewText = new Konva.Text({
        text: sampleName,
        x: nameText.x() * scaleX,
        y: nameText.y() * scaleY,
        fontSize: nameText.fontSize() * scaleY,
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
    
    previewContainer.innerHTML = '';
    
    previewContainer.style.width = actualImageWidth + 'px';
    previewContainer.style.height = actualImageHeight + 'px';
    previewContainer.style.maxWidth = '100%';
    previewContainer.style.maxHeight = '60vh';
    
    createCertificatePreview();
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
            }
        }, { merge: true });
        document.getElementById('saveStatus').textContent = "Placement saved successfully!";
        setTimeout(() => document.getElementById('saveStatus').textContent = "", 3000);
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
        fontFamily: 'Arial',
        fill: 'white',
        align: 'center',
    });
    instructionText.offsetX(instructionText.width() / 2);
    instructionText.offsetY(instructionText.height() / 2);
    layer.add(instructionText);
    layer.draw();
    
    loadExistingPlacement();
});

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
