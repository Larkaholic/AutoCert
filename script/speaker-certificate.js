let stage, layer, nameText, signImage, bgImageObj, signImageObj;
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
            fontFamily: 'Arial',
            fill: 'black',
            draggable: true,
            fontStyle: 'bold',
            shadowColor: 'white',
            shadowBlur: 2,
            shadowOffset: { x: 1, y: 1 },
            shadowOpacity: 0.5,
        });
        
        // Create placeholder for signature image
        signImage = new Konva.Group({
            x: width / 2,
            y: height * 0.8,
            draggable: true,
        });
        
        // Add hover effects for signature group
        signImage.on('mouseenter', function() {
            document.body.style.cursor = 'move';
            this.opacity(0.8);
            layer.draw();
        });
        
        signImage.on('mouseleave', function() {
            document.body.style.cursor = 'default';
            this.opacity(1);
            layer.draw();
        });
        
        // Add drag feedback for signature group
        signImage.on('dragstart', function() {
            this.opacity(0.6);
            layer.draw();
        });
        
        signImage.on('dragend', function() {
            this.opacity(1);
            layer.draw();
        });
        
        // Add placeholder text for signature
        const signPlaceholder = new Konva.Text({
            text: 'Upload signature image',
            x: 0,
            y: 0,
            fontSize: Math.max(16, Math.floor(height / 20)),
            fontFamily: 'Arial',
            fill: 'gray',
            fontStyle: 'italic',
        });
        signPlaceholder.offsetX(signPlaceholder.width() / 2);
        signPlaceholder.offsetY(signPlaceholder.height() / 2);
        signImage.add(signPlaceholder);
        
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

        // Add hover effects for name text
        nameText.on('mouseenter', function() {
            document.body.style.cursor = 'move';
            this.opacity(0.8);
            layer.draw();
        });
        
        nameText.on('mouseleave', function() {
            document.body.style.cursor = 'default';
            this.opacity(1);
            layer.draw();
        });
        
        // Add drag feedback for name text
        nameText.on('dragstart', function() {
            this.opacity(0.6);
            layer.draw();
        });
        
        nameText.on('dragend', function() {
            this.opacity(1);
            layer.draw();
        });

        layer.add(nameText);
        layer.add(signImage);
        layer.draw();
        
    };
    bgImageObj.src = imageSrc;
}

window.addEventListener('resize', () => {
    if (!bgImageObj || !bgImageObj.src) return;
    if (stage) stage.destroy();
    initKonva(bgImageObj.src);
    
    // Re-initialize signature group after resize
    const { width, height } = getResponsiveSize();
    if (!signImage) {
        signImage = new Konva.Group({
            x: width / 2,
            y: height * 0.8,
            draggable: true,
        });
        
        const signPlaceholder = new Konva.Text({
            text: 'Upload signature image',
            x: 0,
            y: 0,
            fontSize: Math.max(16, Math.floor(height / 20)),
            fontFamily: 'Arial',
            fill: 'gray',
            fontStyle: 'italic',
        });
        signPlaceholder.offsetX(signPlaceholder.width() / 2);
        signPlaceholder.offsetY(signPlaceholder.height() / 2);
        signImage.add(signPlaceholder);
    }
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

// Add signature upload functionality
document.getElementById('signatureUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(evt) {
        signImageObj = new Image();
        signImageObj.onload = function() {
            // Clear the signature group
            signImage.removeChildren();
            
            // Calculate appropriate size for signature (max 150px width/height)
            const maxSize = Math.min(150, stage.width() / 6);
            const imageAspect = signImageObj.width / signImageObj.height;
            let signWidth, signHeight;
            
            if (imageAspect > 1) {
                signWidth = maxSize;
                signHeight = maxSize / imageAspect;
            } else {
                signHeight = maxSize;
                signWidth = maxSize * imageAspect;
            }
            
            // Create Konva image
            const konvaSignImage = new Konva.Image({
                image: signImageObj,
                width: signWidth,
                height: signHeight,
                offsetX: signWidth / 2,
                offsetY: signHeight / 2,
            });
            
            // Add mouse wheel resize functionality to signature
            konvaSignImage.on('wheel', (e) => {
                e.evt.preventDefault();
                let currentWidth = konvaSignImage.width();
                let currentHeight = konvaSignImage.height();
                const scaleFactor = e.evt.deltaY < 0 ? 1.1 : 0.9;
                
                // Limit size between 50px and 300px width
                const newWidth = Math.min(300, Math.max(50, currentWidth * scaleFactor));
                const newHeight = (newWidth / currentWidth) * currentHeight;
                
                konvaSignImage.width(newWidth);
                konvaSignImage.height(newHeight);
                konvaSignImage.offsetX(newWidth / 2);
                konvaSignImage.offsetY(newHeight / 2);
                
                layer.batchDraw();
            });
            
            // Add hover effects for signature image
            konvaSignImage.on('mouseenter', function() {
                document.body.style.cursor = 'move';
                signImage.opacity(0.8);
                layer.draw();
            });
            
            konvaSignImage.on('mouseleave', function() {
                document.body.style.cursor = 'default';
                signImage.opacity(1);
                layer.draw();
            });
            
            // Add to signature group
            signImage.add(konvaSignImage);
            layer.draw();
        };
        signImageObj.src = evt.target.result;
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

    // Add signature image if available
    if (signImageObj && signImage.children.length > 0) {
        const signChild = signImage.children[0];
        if (signChild instanceof Konva.Image) {
            const previewSignImage = new Konva.Image({
                image: signImageObj,
                x: signImage.x() * scaleX,
                y: signImage.y() * scaleY,
                width: signChild.width() * ((scaleX + scaleY) / 2),
                height: signChild.height() * ((scaleX + scaleY) / 2),
                offsetX: signChild.offsetX() * ((scaleX + scaleY) / 2),
                offsetY: signChild.offsetY() * ((scaleX + scaleY) / 2),
            });
            previewLayer.add(previewSignImage);
        }
    }

    previewLayer.draw();

    return previewStage;
}

document.getElementById('previewCertBtn').addEventListener('click', function() {
    if (!nameText || !bgImageObj) {
        document.getElementById('saveStatus').textContent = "Please upload a certificate template first.";
        document.getElementById('saveStatus').style.color = "#ef4444";
        setTimeout(() => {
            document.getElementById('saveStatus').textContent = "";
            document.getElementById('saveStatus').style.color = "#10b981";
        }, 3000);
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
        document.getElementById('saveStatus').textContent = "Please upload a certificate template and position the name.";
        document.getElementById('saveStatus').style.color = "#ef4444"; // red color
        setTimeout(() => {
            document.getElementById('saveStatus').textContent = "";
            document.getElementById('saveStatus').style.color = "#10b981"; // reset to green
        }, 5000);
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
    
    // Add signature placement data if signature exists
    let signaturePlacement = null;
    if (signImageObj && signImage.children.length > 0) {
        const signChild = signImage.children[0];
        if (signChild instanceof Konva.Image) {
            signaturePlacement = {
                xPercent: signImage.x() / containerWidth,
                yPercent: signImage.y() / containerHeight,
                x: signImage.x(),
                y: signImage.y(),
                width: signChild.width(),
                height: signChild.height(),
                offsetX: signChild.offsetX(),
                offsetY: signChild.offsetY(),
                editorWidth: containerWidth,
                editorHeight: containerHeight,
                imageWidth: actualImageWidth,
                imageHeight: actualImageHeight,
                scaleX: actualImageWidth / containerWidth,
                scaleY: actualImageHeight / containerHeight
            };
        }
    }
    
    const params = new URLSearchParams(window.location.search);
    const eventName = params.get('event') || '';
    if (!eventName) {
        document.getElementById('saveStatus').textContent = "Event name missing in URL.";
        document.getElementById('saveStatus').style.color = "#ef4444";
        setTimeout(() => {
            document.getElementById('saveStatus').textContent = "";
            document.getElementById('saveStatus').style.color = "#10b981";
        }, 5000);
        return;
    }
    
    // Show loading state
    document.getElementById('saveStatus').textContent = "Saving placement...";
    document.getElementById('saveStatus').style.color = "#3b82f6"; // blue color
    
    try {
        const expiresAt = calculateExpirationTime();
        
        const eventData = {
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
        };
        
        // Add signature data if it exists
        if (signaturePlacement) {
            eventData.signaturePlacement = signaturePlacement;
            eventData.certificateGeneration.signaturePosition = {
                x: signImage.x() * (actualImageWidth / containerWidth),
                y: signImage.y() * (actualImageHeight / containerHeight),
                width: signaturePlacement.width * (actualImageWidth / containerWidth),
                height: signaturePlacement.height * (actualImageHeight / containerHeight),
                offsetX: signaturePlacement.offsetX,
                offsetY: signaturePlacement.offsetY
            };
        }
        
        await firebase.firestore().collection("events").doc(eventName).set(eventData, { merge: true });
        document.getElementById('saveStatus').textContent = "Placement saved successfully! Opening QR code...";
        document.getElementById('saveStatus').style.color = "#10b981"; // green color
        
        setTimeout(() => {
            document.getElementById('saveStatus').textContent = "";
            const qrUrl = `qr.html?event=${encodeURIComponent(eventName)}`;
            window.open(qrUrl, '_blank', 'width=400,height=500');
        }, 2000);
        
    } catch (e) {
        document.getElementById('saveStatus').textContent = "Failed to save placement: " + e.message;
        document.getElementById('saveStatus').style.color = "#ef4444";
        setTimeout(() => {
            document.getElementById('saveStatus').textContent = "";
            document.getElementById('saveStatus').style.color = "#10b981";
        }, 5000);
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
            
            // Load signature placement if it exists
            const signaturePlacement = doc.data().signaturePlacement;
            if (signaturePlacement && signImage) {
                signImage.x(signaturePlacement.xPercent * width);
                signImage.y(signaturePlacement.yPercent * height);
            }
            
            layer.draw();
        }
    } catch (error) {
        console.error("Error loading placement:", error);
    }
}

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
    
    // Create initial signature group
    signImage = new Konva.Group({
        x: width / 2,
        y: height * 0.8,
        draggable: true,
    });
    
    // Add placeholder text for signature
    const signPlaceholder = new Konva.Text({
        text: 'Upload signature image',
        x: 0,
        y: 0,
        fontSize: Math.max(16, Math.floor(height / 20)),
        fontFamily: 'Arial',
        fill: 'gray',
        fontStyle: 'italic',
    });
    signPlaceholder.offsetX(signPlaceholder.width() / 2);
    signPlaceholder.offsetY(signPlaceholder.height() / 2);
    signImage.add(signPlaceholder);
    
    // draw text indicating to upload an image
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
    layer.add(signImage);
    layer.draw();
    
    loadExistingPlacement();
    
    // Add event listeners with proper checks
    const decreaseTimeBtn = document.getElementById('decreaseTime');
    const increaseTimeBtn = document.getElementById('increaseTime');
    const signatureUploadBtn = document.getElementById('signatureUploadBtn');
    const signatureUpload = document.getElementById('signatureUpload');
    const signatureFileName = document.getElementById('signatureFileName');
    
    if (decreaseTimeBtn) {
        decreaseTimeBtn.addEventListener('click', () => {
            if (expirationMinutes > 30) {
                expirationMinutes -= 30;
                updateExpirationDisplay();
            }
        });
    }

    if (increaseTimeBtn) {
        increaseTimeBtn.addEventListener('click', () => {
            expirationMinutes += 30;
            updateExpirationDisplay();
        });
    }

    // Signature upload functionality
    if (signatureUploadBtn && signatureUpload && signatureFileName) {
        signatureUploadBtn.addEventListener('click', () => {
            signatureUpload.click();
        });
        
        signatureUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                signatureFileName.textContent = file.name;
            } else {
                signatureFileName.textContent = 'No File Chosen';
            }
        });
    }

    updateExpirationDisplay();
});
