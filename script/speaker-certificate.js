let stage, layer, nameText, signImage, bgImageObj, signImageObj;
let actualImageWidth, actualImageHeight;
let expirationMinutes = 30; // default 30 minutes

// Array to store all signature groups on canvas
let canvasSignatures = [];

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
        
        // Remove the old signImage placeholder creation
        // signImage will be created when signatures are added
        
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
    
    // Store canvas names data before resize
    const canvasNamesData = canvasNameTexts.map(nameText => ({
        text: nameText.text(),
        xPercent: nameText.x() / getResponsiveSize().width,
        yPercent: nameText.y() / getResponsiveSize().height,
        fontSize: nameText.fontSize(),
        fontFamily: nameText.fontFamily(),
        fontStyle: nameText.fontStyle(),
        fill: nameText.fill(),
        shadowColor: nameText.shadowColor(),
        shadowBlur: nameText.shadowBlur(),
        shadowOffset: nameText.shadowOffset(),
        shadowOpacity: nameText.shadowOpacity(),
    }));
    
    // Store canvas signatures data before resize
    const canvasSignaturesData = canvasSignatures.map(sig => ({
        xPercent: sig.group.x() / getResponsiveSize().width,
        yPercent: sig.group.y() / getResponsiveSize().height,
        width: sig.group.children[0].width(),
        height: sig.group.children[0].height(),
        image: sig.image,
        data: sig.data
    }));
    
    if (stage) stage.destroy();
    initKonva(bgImageObj.src);
    
    // Restore canvas names after resize
    setTimeout(() => {
        if (canvasNamesData.length > 0) {
            const { width, height } = getResponsiveSize();
            canvasNameTexts = [];
            
            canvasNamesData.forEach(nameData => {
                const nameTextObj = new Konva.Text({
                    text: nameData.text,
                    x: nameData.xPercent * width,
                    y: nameData.yPercent * height,
                    fontSize: nameData.fontSize,
                    fontFamily: nameData.fontFamily,
                    fill: nameData.fill,
                    draggable: true,
                    fontStyle: nameData.fontStyle,
                    shadowColor: nameData.shadowColor,
                    shadowBlur: nameData.shadowBlur,
                    shadowOffset: nameData.shadowOffset,
                    shadowOpacity: nameData.shadowOpacity,
                });
                
                // Center the text
                nameTextObj.offsetX(nameTextObj.width() / 2);
                nameTextObj.offsetY(nameTextObj.height() / 2);
                
                // Add event handlers
                nameTextObj.on('wheel', (e) => {
                    e.evt.preventDefault();
                    let fontSize = nameTextObj.fontSize();
                    if (e.evt.deltaY < 0) {
                        fontSize += 2;
                    } else {
                        fontSize -= 2;
                    }
                    fontSize = Math.max(8, Math.min(fontSize, 100));
                    nameTextObj.fontSize(fontSize);
                    nameTextObj.offsetX(nameTextObj.width() / 2);
                    nameTextObj.offsetY(nameTextObj.height() / 2);
                    layer.batchDraw();
                });
                
                nameTextObj.on('mouseenter', function() {
                    document.body.style.cursor = 'move';
                    this.opacity(0.8);
                    layer.draw();
                });
                
                nameTextObj.on('mouseleave', function() {
                    document.body.style.cursor = 'default';
                    this.opacity(1);
                    layer.draw();
                });
                
                nameTextObj.on('dragstart', function() {
                    this.opacity(0.6);
                    layer.draw();
                });
                
                nameTextObj.on('dragend', function() {
                    this.opacity(1);
                    layer.draw();
                });
                
                nameTextObj.on('dblclick', function() {
                    const newName = prompt('Edit name:', this.text());
                    if (newName && newName.trim()) {
                        this.text(newName.trim());
                        this.offsetX(this.width() / 2);
                        this.offsetY(this.height() / 2);
                        layer.draw();
                    }
                });
                
                layer.add(nameTextObj);
                canvasNameTexts.push(nameTextObj);
            });
            
            layer.draw();
        }
    }, 100);
    
    // Restore canvas signatures after resize
    if (canvasSignaturesData.length > 0) {
        const { width, height } = getResponsiveSize();
        canvasSignatures = [];
        
        canvasSignaturesData.forEach(sigData => {
            const signatureGroup = new Konva.Group({
                x: sigData.xPercent * width,
                y: sigData.yPercent * height,
                draggable: true,
            });
            
            const konvaSignImage = new Konva.Image({
                image: sigData.image,
                width: sigData.width,
                height: sigData.height,
                offsetX: sigData.width / 2,
                offsetY: sigData.height / 2,
            });
            
            // Add all event handlers
            konvaSignImage.on('wheel', (e) => {
                e.evt.preventDefault();
                let currentWidth = konvaSignImage.width();
                let currentHeight = konvaSignImage.height();
                const scaleFactor = e.evt.deltaY < 0 ? 1.1 : 0.9;
                
                const newWidth = Math.min(300, Math.max(50, currentWidth * scaleFactor));
                const newHeight = (newWidth / currentWidth) * currentHeight;
                
                konvaSignImage.width(newWidth);
                konvaSignImage.height(newHeight);
                konvaSignImage.offsetX(newWidth / 2);
                konvaSignImage.offsetY(newHeight / 2);
                
                layer.batchDraw();
            });
            
            konvaSignImage.on('mouseenter', function() {
                document.body.style.cursor = 'move';
                signatureGroup.opacity(0.8);
                layer.draw();
            });
            
            konvaSignImage.on('mouseleave', function() {
                document.body.style.cursor = 'default';
                signatureGroup.opacity(1);
                layer.draw();
            });
            
            signatureGroup.on('dragstart', function() {
                this.opacity(0.6);
                layer.draw();
            });
            
            signatureGroup.on('dragend', function() {
                this.opacity(1);
                layer.draw();
            });
            
            signatureGroup.on('dblclick', function() {
                if (confirm('Remove this signature from canvas?')) {
                    const index = canvasSignatures.findIndex(sig => sig.group === signatureGroup);
                    if (index > -1) {
                        canvasSignatures.splice(index, 1);
                    }
                    signatureGroup.destroy();
                    layer.draw();
                }
            });
            
            signatureGroup.add(konvaSignImage);
            layer.add(signatureGroup);
            
            canvasSignatures.push({
                group: signatureGroup,
                image: sigData.image,
                data: sigData.data
            });
        });
        
        layer.draw();
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
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Process all selected files
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(evt) {
            const signatureImage = new Image();
            signatureImage.onload = function() {
                // Add to signatures array
                const signatureData = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    image: signatureImage,
                    src: evt.target.result
                };
                
                signatures.push(signatureData);
                updateSignatureList();
                
                // If this is the first signature, apply it automatically
                if (signatures.length === 1) {
                    applySignature(signatureData);
                }
            };
            signatureImage.src = evt.target.result;
        };
        reader.readAsDataURL(file);
    });
});

// Array to store multiple signatures
let signatures = [];
let currentSignature = null;

// Function to update signature list display
function updateSignatureList() {
    const signatureList = document.getElementById('signatureList');
    if (!signatureList) return;
    
    if (signatures.length === 0) {
        signatureList.innerHTML = '<p class="text-gray-500 text-center py-4">No signatures uploaded</p>';
        return;
    }
    
    signatureList.innerHTML = signatures.map(sig => `
        <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg ${currentSignature?.id === sig.id ? 'bg-green-50 border-green-300' : 'bg-white'}">
            <div class="flex items-center gap-3">
                <img src="${sig.src}" alt="${sig.name}" class="w-12 h-8 object-contain border border-gray-300 rounded">
                <span class="font-medium text-sm">${sig.name}</span>
                ${currentSignature?.id === sig.id ? '<span class="text-green-600 text-xs">(Active)</span>' : ''}
            </div>
            <div class="flex gap-2">
                <button onclick="applySignature(${JSON.stringify(sig).replace(/"/g, '&quot;')})" 
                        class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                    Apply
                </button>
                <button onclick="removeSignature('${sig.id}')" 
                        class="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition">
                    Remove
                </button>
            </div>
        </div>
    `).join('');
}

// Function to apply a signature to the canvas
window.applySignature = function(signatureData) {
    if (!layer) return;
    
    // Parse signature data if it's a string (from HTML onclick)
    if (typeof signatureData === 'string') {
        signatureData = JSON.parse(signatureData.replace(/&quot;/g, '"'));
    }
    
    // Find the signature in our array (in case image object was lost in JSON parsing)
    const signature = signatures.find(s => s.id === signatureData.id);
    if (!signature) return;
    
    const { width, height } = getResponsiveSize();
    
    // Create a new signature group for this signature
    const signatureGroup = new Konva.Group({
        x: width / 2,
        y: height * 0.8,
        draggable: true,
    });
    
    // Calculate appropriate size for signature (max 150px width/height)
    const maxSize = Math.min(150, stage.width() / 6);
    const imageAspect = signature.image.width / signature.image.height;
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
        image: signature.image,
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
        signatureGroup.opacity(0.8);
        layer.draw();
    });
    
    konvaSignImage.on('mouseleave', function() {
        document.body.style.cursor = 'default';
        signatureGroup.opacity(1);
        layer.draw();
    });
    
    // Add drag feedback for signature group
    signatureGroup.on('dragstart', function() {
        this.opacity(0.6);
        layer.draw();
    });
    
    signatureGroup.on('dragend', function() {
        this.opacity(1);
        layer.draw();
    });
    
    // Add double-click to remove signature from canvas
    signatureGroup.on('dblclick', function() {
        if (confirm('Remove this signature from canvas?')) {
            const index = canvasSignatures.findIndex(sig => sig.group === signatureGroup);
            if (index > -1) {
                canvasSignatures.splice(index, 1);
            }
            signatureGroup.destroy();
            layer.draw();
        }
    });
    
    // Add to signature group
    signatureGroup.add(konvaSignImage);
    layer.add(signatureGroup);
    
    // Store signature data for later use
    canvasSignatures.push({
        group: signatureGroup,
        image: signature.image,
        data: signature
    });
    
    layer.draw();
    
    // Close the signature modal if open
    const signatureModal = document.getElementById('signatureModal');
    if (signatureModal) {
        signatureModal.classList.add('hidden');
    }
};

// Function to remove a signature
window.removeSignature = function(signatureId) {
    signatures = signatures.filter(sig => sig.id !== signatureId);
    
    // If the removed signature was the current one, clear the canvas
    if (currentSignature && currentSignature.id === signatureId) {
        currentSignature = null;
        signImageObj = null;
        
        // Clear the signature group and add placeholder
        if (signImage) {
            signImage.removeChildren();
            const { width, height } = getResponsiveSize();
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
            layer.draw();
        }
    }
    
    updateSignatureList();
};

// Function to open signature management modal
window.openSignatureModal = function() {
    const signatureModal = document.getElementById('signatureModal');
    if (signatureModal) {
        updateSignatureList();
        signatureModal.classList.remove('hidden');
    }
};

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
    
    console.log("Preview scaling factors:", { scaleX, scaleY, editorWidth, editorHeight, displayWidth, displayHeight });

    // Position and scale text properly with accurate placement
    const previewText = new Konva.Text({
        text: sampleName,
        x: nameText.x() * scaleX,
        y: nameText.y() * scaleY,
        fontSize: nameText.fontSize() * scaleY,
        fontFamily: nameText.fontFamily(),
        fontStyle: nameText.fontStyle(),
        fill: nameText.fill(),
        shadowColor: nameText.shadowColor(),
        shadowBlur: nameText.shadowBlur() * scaleY,
        shadowOffset: {
            x: nameText.shadowOffset().x * scaleX,
            y: nameText.shadowOffset().y * scaleY
        },
        shadowOpacity: nameText.shadowOpacity(),
    });

    previewText.offsetX(previewText.width() / 2);
    previewText.offsetY(previewText.height() / 2);
    previewLayer.add(previewText);

    // Add all canvas names with proper scaling
    canvasNameTexts.forEach(canvasName => {
        const previewCanvasText = new Konva.Text({
            text: canvasName.text(),
            x: canvasName.x() * scaleX,
            y: canvasName.y() * scaleY,
            fontSize: canvasName.fontSize() * scaleY,
            fontFamily: canvasName.fontFamily(),
            fontStyle: canvasName.fontStyle(),
            fill: canvasName.fill(),
            shadowColor: canvasName.shadowColor(),
            shadowBlur: canvasName.shadowBlur() * scaleY,
            shadowOffset: {
                x: canvasName.shadowOffset().x * scaleX,
                y: canvasName.shadowOffset().y * scaleY
            },
            shadowOpacity: canvasName.shadowOpacity(),
        });
        previewCanvasText.offsetX(previewCanvasText.width() / 2);
        previewCanvasText.offsetY(previewCanvasText.height() / 2);
        previewLayer.add(previewCanvasText);
    });

    // Add signature image if available with proper scaling
    if (signImageObj && signImage.children.length > 0) {
        const signChild = signImage.children[0];
        if (signChild instanceof Konva.Image) {
            const previewSignImage = new Konva.Image({
                image: signImageObj,
                x: signImage.x() * scaleX,
                y: signImage.y() * scaleY,
                width: signChild.width() * scaleX,
                height: signChild.height() * scaleY,
                offsetX: signChild.offsetX() * scaleX,
                offsetY: signChild.offsetY() * scaleY,
            });
            previewLayer.add(previewSignImage);
        }
    }

    // Add all canvas signatures with proper scaling
    canvasSignatures.forEach(sig => {
        const signChild = sig.group.children[0];
        if (signChild instanceof Konva.Image) {
            const previewSignImage = new Konva.Image({
                image: sig.image,
                x: sig.group.x() * scaleX,
                y: sig.group.y() * scaleY,
                width: signChild.width() * scaleX,
                height: signChild.height() * scaleY,
                offsetX: signChild.offsetX() * scaleX,
                offsetY: signChild.offsetY() * scaleY,
            });
            previewLayer.add(previewSignImage);
        }
    });

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

// Names modal functionality
let speakerNames = [];

function addName(name) {
    if (name.trim() && !speakerNames.includes(name.trim())) {
        speakerNames.push(name.trim());
        updateNamesDisplay();
        document.getElementById('nameInput').value = '';
    }
}

// Make removeName globally accessible
window.removeName = function(name) {
    const index = speakerNames.indexOf(name);
    if (index > -1) {
        speakerNames.splice(index, 1);
        updateNamesDisplay();
    }
}

function updateNamesDisplay() {
    const namesContainer = document.getElementById('namesContainer');
    const emptyMessage = document.getElementById('emptyNamesMessage');
    
    if (speakerNames.length === 0) {
        namesContainer.innerHTML = '';
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
        namesContainer.innerHTML = speakerNames.map(name => `
            <div class="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                <span class="font-medium">${name}</span>
                <button onclick="removeName('${name}')" class="text-red-500 hover:text-red-700 font-bold text-lg">×</button>
            </div>
        `).join('');
    }
}

async function createCertificateWithName(speakerName) {
    if (!nameText || !bgImageObj) {
        console.error("Missing required elements for certificate generation");
        return null;
    }

    console.log("Creating certificate with canvas names:", canvasNameTexts.length);
    
    const { width: containerWidth, height: containerHeight } = getResponsiveSize();
    
    // Create placement data structure similar to certificate-generator.js
    const namePlacement = {
        xPercent: nameText.x() / containerWidth,
        yPercent: nameText.y() / containerHeight,
        x: nameText.x(),
        y: nameText.y(),
        fontSize: nameText.fontSize(),
        fontSizePercent: nameText.fontSize() / containerHeight,
        fontFamily: nameText.fontFamily(),
        fontStyle: nameText.fontStyle(),
        fill: nameText.fill(),
        shadowColor: nameText.shadowColor(),
        shadowBlur: nameText.shadowBlur(),
        shadowOffset: nameText.shadowOffset(),
        shadowOpacity: nameText.shadowOpacity(),
        width: nameText.width(),
        height: nameText.height(),
        offsetX: 1,
        offsetY: 1,
        editorWidth: containerWidth,
        editorHeight: containerHeight,
        imageWidth: actualImageWidth,
        imageHeight: actualImageHeight,
        scaleX: actualImageWidth / containerWidth,
        scaleY: actualImageHeight / containerHeight,
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
    };

    // Add canvas names placement data
    if (canvasNameTexts.length > 0) {
        console.log("Adding canvas names to certificate generation:", canvasNameTexts.map(c => c.text()));
        namePlacement.canvasNames = canvasNameTexts.map(canvasName => ({
            text: canvasName.text(),
            x: canvasName.x() * (actualImageWidth / containerWidth),
            y: canvasName.y() * (actualImageHeight / containerHeight),
            fontSize: canvasName.fontSize() * (actualImageHeight / containerHeight),
            fontFamily: canvasName.fontFamily(),
            fontStyle: canvasName.fontStyle(),
            fill: canvasName.fill(),
            shadowColor: canvasName.shadowColor(),
            shadowBlur: canvasName.shadowBlur() * (actualImageHeight / containerHeight),
            shadowOffset: {
                x: canvasName.shadowOffset().x * (actualImageWidth / containerWidth),
                y: canvasName.shadowOffset().y * (actualImageHeight / containerHeight)
            },
            shadowOpacity: canvasName.shadowOpacity()
        }));
    }

    // Add signature placement if available
    if (signImageObj && signImage.children.length > 0) {
        const signChild = signImage.children[0];
        if (signChild instanceof Konva.Image) {
            namePlacement.signaturePlacement = {
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
            
            namePlacement.certificateGeneration.signaturePosition = {
                x: signImage.x() * (actualImageWidth / containerWidth),
                y: signImage.y() * (actualImageHeight / containerHeight),
                width: signChild.width() * (actualImageWidth / containerWidth),
                height: signChild.height() * (actualImageHeight / containerHeight),
                offsetX: signChild.offsetX() * (actualImageWidth / containerWidth),
                offsetY: signChild.offsetY() * (actualImageHeight / containerHeight)
            };
        }
    }

    // Always use manual generation to ensure canvas names are included
    console.log("Using manual certificate generation to ensure canvas names are included");
    
    const canvas = document.createElement('canvas');
    canvas.width = actualImageWidth;
    canvas.height = actualImageHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw the background image
    ctx.drawImage(bgImageObj, 0, 0, actualImageWidth, actualImageHeight);
    
    // Calculate proper scaling for text placement
    const scaleX = actualImageWidth / containerWidth;
    const scaleY = actualImageHeight / containerHeight;
    
    // Draw the speaker name (main name)
    ctx.save();
    ctx.font = `${nameText.fontStyle()} ${nameText.fontSize() * scaleY}px ${nameText.fontFamily()}`;
    ctx.fillStyle = nameText.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add shadow if present
    if (nameText.shadowColor()) {
        ctx.shadowColor = nameText.shadowColor();
        ctx.shadowBlur = nameText.shadowBlur() * scaleY;
        ctx.shadowOffsetX = nameText.shadowOffset().x * scaleX;
        ctx.shadowOffsetY = nameText.shadowOffset().y * scaleY;
    }
    
    ctx.fillText(speakerName, nameText.x() * scaleX, nameText.y() * scaleY);
    ctx.restore();
    
    // Draw all canvas names (admin added names) - THIS IS THE KEY PART
    console.log("Drawing canvas names:", canvasNameTexts.length);
    canvasNameTexts.forEach((canvasName, index) => {
        console.log(`Drawing canvas name ${index + 1}: "${canvasName.text()}" at (${canvasName.x() * scaleX}, ${canvasName.y() * scaleY})`);
        ctx.save();
        ctx.font = `${canvasName.fontStyle()} ${canvasName.fontSize() * scaleY}px ${canvasName.fontFamily()}`;
        ctx.fillStyle = canvasName.fill();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add shadow if present
        if (canvasName.shadowColor()) {
            ctx.shadowColor = canvasName.shadowColor();
            ctx.shadowBlur = canvasName.shadowBlur() * scaleY;
            ctx.shadowOffsetX = canvasName.shadowOffset().x * scaleX;
            ctx.shadowOffsetY = canvasName.shadowOffset().y * scaleY;
        }
        
        ctx.fillText(canvasName.text(), canvasName.x() * scaleX, canvasName.y() * scaleY);
        ctx.restore();
    });
    
    // Draw signature if available with proper scaling
    if (signImageObj && signImage.children.length > 0) {
        const signChild = signImage.children[0];
        if (signChild instanceof Konva.Image) {
            const signX = signImage.x() * scaleX - (signChild.offsetX() * scaleX);
            const signY = signImage.y() * scaleY - (signChild.offsetY() * scaleY);
            const signWidth = signChild.width() * scaleX;
            const signHeight = signChild.height() * scaleY;
            
            ctx.drawImage(
                signImageObj,
                signX,
                signY,
                signWidth,
                signHeight
            );
        }
    }
    
    // Draw all canvas signatures with proper scaling
    canvasSignatures.forEach(sig => {
        const signChild = sig.group.children[0];
        if (signChild instanceof Konva.Image) {
            const signX = sig.group.x() * scaleX - (signChild.offsetX() * scaleX);
            const signY = sig.group.y() * scaleY - (signChild.offsetY() * scaleY);
            const signWidth = signChild.width() * scaleX;
            const signHeight = signChild.height() * scaleY;
            
            ctx.drawImage(
                sig.image,
                signX,
                signY,
                signWidth,
                signHeight
            );
        }
    });
    
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    console.log("Certificate generation complete");
    return dataURL;
}

async function downloadAllCertificates() {
    if (speakerNames.length === 0) {
        alert('Please add at least one speaker name.');
        return;
    }
    
    if (!nameText || !bgImageObj) {
        alert('Please upload a certificate template and position the name first.');
        return;
    }
    
    // Create and download certificates for each speaker
    for (let i = 0; i < speakerNames.length; i++) {
        const name = speakerNames[i];
        try {
            const certificateDataURL = await createCertificateWithName(name);
            if (certificateDataURL) {
                const downloadLink = document.createElement('a');
                downloadLink.href = certificateDataURL;
                downloadLink.download = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_certificate.jpg`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                // Add a small delay between downloads
                if (i < speakerNames.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        } catch (error) {
            console.error(`Error generating certificate for ${name}:`, error);
            alert(`Error generating certificate for ${name}. Please try again.`);
        }
    }
    
    // Close the modal after completing all downloads
    document.getElementById('namesModal').classList.add('hidden');
}

// No longer needed - removed Firebase/event dependencies

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
    
    // Add event listeners for the names modal
    const nextBtn = document.getElementById('savePlacementBtn');
    const namesModal = document.getElementById('namesModal');
    const nameInput = document.getElementById('nameInput');
    const addNameBtn = document.getElementById('addNameBtn');
    const downloadAllCertBtn = document.getElementById('downloadAllCertBtn');
    const closeNamesModalBtn = document.getElementById('closeNamesModalBtn');
    
    // Next button opens the names modal
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (!nameText || !bgImageObj) {
                document.getElementById('saveStatus').textContent = "Please upload a certificate template and position the name first.";
                document.getElementById('saveStatus').style.color = "#ef4444";
                setTimeout(() => {
                    document.getElementById('saveStatus').textContent = "";
                    document.getElementById('saveStatus').style.color = "#10b981";
                }, 3000);
                return;
            }
            
            // Show the names modal
            namesModal.classList.remove('hidden');
            nameInput.focus();
        });
    }
    
    // Add name functionality
    if (addNameBtn && nameInput) {
        addNameBtn.addEventListener('click', function() {
            addName(nameInput.value);
        });
        
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addName(nameInput.value);
            }
        });
    }
    
    // Download all certificates
    if (downloadAllCertBtn) {
        downloadAllCertBtn.addEventListener('click', downloadAllCertificates);
    }
    
    // Close modal
    if (closeNamesModalBtn) {
        closeNamesModalBtn.addEventListener('click', function() {
            namesModal.classList.add('hidden');
        });
    }
    
    // Close modal when clicking outside
    if (namesModal) {
        namesModal.addEventListener('click', function(e) {
            if (e.target === namesModal) {
                namesModal.classList.add('hidden');
            }
        });
    }

});

// Array to store all name text objects on canvas
let canvasNameTexts = [];

// Function to add names to canvas
window.addNamesToCanvas = function(names) {
    if (!stage || !layer) {
        alert('Please upload a certificate template first.');
        return;
    }
    
    // Clear existing name texts (except the main sample name)
    canvasNameTexts.forEach(nameTextObj => {
        nameTextObj.destroy();
    });
    canvasNameTexts = [];
    
    const { width, height } = getResponsiveSize();
    
    // Calculate positions for multiple names
    const startY = height * 0.3; // Start from 30% of canvas height
    const nameSpacing = Math.max(50, height * 0.08); // Space between names
    
    names.forEach((name, index) => {
        const nameTextObj = new Konva.Text({
            text: name,
            x: width / 2,
            y: startY + (index * nameSpacing),
            fontSize: Math.max(16, Math.floor(height / 20)),
            fontFamily: 'Arial',
            fill: 'black',
            draggable: true,
            fontStyle: 'bold',
            shadowColor: 'white',
            shadowBlur: 2,
            shadowOffset: { x: 1, y: 1 },
            shadowOpacity: 0.5,
        });
        
        // Center the text
        nameTextObj.offsetX(nameTextObj.width() / 2);
        nameTextObj.offsetY(nameTextObj.height() / 2);
        
        // Add mouse wheel resize functionality
        nameTextObj.on('wheel', (e) => {
            e.evt.preventDefault();
            let fontSize = nameTextObj.fontSize();
            if (e.evt.deltaY < 0) {
                fontSize += 2;
            } else {
                fontSize -= 2;
            }
            fontSize = Math.max(8, Math.min(fontSize, 100)); // Limit font size
            nameTextObj.fontSize(fontSize);
            nameTextObj.offsetX(nameTextObj.width() / 2);
            nameTextObj.offsetY(nameTextObj.height() / 2);
            layer.batchDraw();
        });
        
        // Add hover effects
        nameTextObj.on('mouseenter', function() {
            document.body.style.cursor = 'move';
            this.opacity(0.8);
            layer.draw();
        });
        
        nameTextObj.on('mouseleave', function() {
            document.body.style.cursor = 'default';
            this.opacity(1);
            layer.draw();
        });
        
        // Add drag feedback
        nameTextObj.on('dragstart', function() {
            this.opacity(0.6);
            layer.draw();
        });
        
        nameTextObj.on('dragend', function() {
            this.opacity(1);
            layer.draw();
        });
        
        // Double-click to edit text
        nameTextObj.on('dblclick', function() {
            const newName = prompt('Edit name:', this.text());
            if (newName && newName.trim()) {
                this.text(newName.trim());
                this.offsetX(this.width() / 2);
                this.offsetY(this.height() / 2);
                layer.draw();
            }
        });
        
        layer.add(nameTextObj);
        canvasNameTexts.push(nameTextObj);
    });
    
    layer.draw();
    
    // Update save status
    const saveStatus = document.getElementById('saveStatus');
    if (saveStatus) {
        saveStatus.textContent = `Added ${names.length} name(s) to canvas`;
        saveStatus.style.color = "#10b981";
        setTimeout(() => {
            saveStatus.textContent = "";
        }, 3000);
    }
};

// Function to clear all canvas names
window.clearCanvasNames = function() {
    canvasNameTexts.forEach(nameTextObj => {
        nameTextObj.destroy();
    });
    canvasNameTexts = [];
    layer.draw();
};

// Enhanced preview function that includes all canvas names
window.showPreview = function() {
    if (!bgImageObj) {
        alert("Please upload a certificate template first.");
        return;
    }

    const previewModal = document.getElementById('previewModal');
    const previewContainer = document.getElementById('previewContainer');

    // Clear previous preview
    previewContainer.innerHTML = '';

    // Make the container responsive
    previewContainer.style.width = '90vw';
    previewContainer.style.height = '60vh';
    previewContainer.style.display = 'flex';
    previewContainer.style.alignItems = 'center';
    previewContainer.style.justifyContent = 'center';

    // Create preview stage with proper scaling
    const containerWidth = previewContainer.offsetWidth;
    const containerHeight = previewContainer.offsetHeight;
    
    const scale = Math.min(
        containerWidth / actualImageWidth,
        containerHeight / actualImageHeight
    );
    const displayWidth = actualImageWidth * scale;
    const displayHeight = actualImageHeight * scale;

    const previewStage = new Konva.Stage({
        container: 'previewContainer',
        width: displayWidth,
        height: displayHeight,
    });

    const previewLayer = new Konva.Layer();
    previewStage.add(previewLayer);

    // Add background image
    const previewBg = new Konva.Image({
        image: bgImageObj,
        width: displayWidth,
        height: displayHeight
    });
    previewLayer.add(previewBg);

    // Calculate scaling factors
    const { width: editorWidth, height: editorHeight } = getResponsiveSize();
    const scaleX = displayWidth / editorWidth;
    const scaleY = displayHeight / editorHeight;

    // Add the main sample name if it exists
    if (nameText) {
        const previewText = new Konva.Text({
            text: nameText.text(),
            x: nameText.x() * scaleX,
            y: nameText.y() * scaleY,
            fontSize: nameText.fontSize() * scaleY,
            fontFamily: nameText.fontFamily(),
            fontStyle: nameText.fontStyle(),
            fill: nameText.fill(),
            shadowColor: nameText.shadowColor(),
            shadowBlur: nameText.shadowBlur() * scaleY,
            shadowOffset: {
                x: nameText.shadowOffset().x * scaleX,
                y: nameText.shadowOffset().y * scaleY
            },
            shadowOpacity: nameText.shadowOpacity(),
        });
        previewText.offsetX(previewText.width() / 2);
        previewText.offsetY(previewText.height() / 2);
        previewLayer.add(previewText);
    }

    // Add all canvas names
    canvasNameTexts.forEach(canvasName => {
        const previewCanvasText = new Konva.Text({
            text: canvasName.text(),
            x: canvasName.x() * scaleX,
            y: canvasName.y() * scaleY,
            fontSize: canvasName.fontSize() * scaleY,
            fontFamily: canvasName.fontFamily(),
            fontStyle: canvasName.fontStyle(),
            fill: canvasName.fill(),
            shadowColor: canvasName.shadowColor(),
            shadowBlur: canvasName.shadowBlur() * scaleY,
            shadowOffset: {
                x: canvasName.shadowOffset().x * scaleX,
                y: canvasName.shadowOffset().y * scaleY
            },
            shadowOpacity: canvasName.shadowOpacity(),
        });
        previewCanvasText.offsetX(previewCanvasText.width() / 2);
        previewCanvasText.offsetY(previewCanvasText.height() / 2);
        previewLayer.add(previewCanvasText);
    });

    // Add signature image if available
    if (signImageObj && signImage.children.length > 0) {
        const signChild = signImage.children[0];
        if (signChild instanceof Konva.Image) {
            const previewSignImage = new Konva.Image({
                image: signImageObj,
                x: signImage.x() * scaleX,
                y: signImage.y() * scaleY,
                width: signChild.width() * scaleX,
                height: signChild.height() * scaleY,
                offsetX: signChild.offsetX() * scaleX,
                offsetY: signChild.offsetY() * scaleY,
            });
            previewLayer.add(previewSignImage);
        }
    }

    // Add all canvas signatures with proper scaling
    canvasSignatures.forEach(sig => {
        const signChild = sig.group.children[0];
        if (signChild instanceof Konva.Image) {
            const previewSignImage = new Konva.Image({
                image: sig.image,
                x: sig.group.x() * scaleX,
                y: sig.group.y() * scaleY,
                width: signChild.width() * scaleX,
                height: signChild.height() * scaleY,
                offsetX: signChild.offsetX() * scaleX,
                offsetY: signChild.offsetY() * scaleY,
            });
            previewLayer.add(previewSignImage);
        }
    });

    previewLayer.draw();

    // Store the preview stage globally for download
    window.currentPreviewStage = previewStage;

    // Show the modal
    previewModal.classList.remove('hidden');
};

// Enhanced download function that includes all canvas signatures
window.downloadPreviewCertificate = function() {
    // If preview stage exists, use it
    if (window.currentPreviewStage) {
        const dataURL = window.currentPreviewStage.toDataURL({
            mimeType: "image/jpeg", 
            quality: 0.9,
            pixelRatio: 2
        });
        
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = 'certificate-preview.jpg';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        return;
    }

    // If no preview stage, generate certificate directly
    if (!bgImageObj) {
        alert("Please upload a certificate template first.");
        return;
    }

    // Create a temporary canvas for download
    const canvas = document.createElement('canvas');
    canvas.width = actualImageWidth;
    canvas.height = actualImageHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw the background image
    ctx.drawImage(bgImageObj, 0, 0, actualImageWidth, actualImageHeight);
    
    // Calculate scaling factors
    const { width: editorWidth, height: editorHeight } = getResponsiveSize();
    const scaleX = actualImageWidth / editorWidth;
    const scaleY = actualImageHeight / editorHeight;
    
    // Draw the main sample name if it exists
    if (nameText) {
        ctx.save();
        ctx.font = `${nameText.fontStyle()} ${nameText.fontSize() * scaleY}px ${nameText.fontFamily()}`;
        ctx.fillStyle = nameText.fill();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add shadow if present
        if (nameText.shadowColor()) {
            ctx.shadowColor = nameText.shadowColor();
            ctx.shadowBlur = nameText.shadowBlur() * scaleY;
            ctx.shadowOffsetX = nameText.shadowOffset().x * scaleX;
            ctx.shadowOffsetY = nameText.shadowOffset().y * scaleY;
        }
        
        ctx.fillText(nameText.text(), nameText.x() * scaleX, nameText.y() * scaleY);
        ctx.restore();
    }
    
    // Draw all canvas names
    canvasNameTexts.forEach(canvasName => {
        ctx.save();
        ctx.font = `${canvasName.fontStyle()} ${canvasName.fontSize() * scaleY}px ${canvasName.fontFamily()}`;
        ctx.fillStyle = canvasName.fill();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add shadow if present
        if (canvasName.shadowColor()) {
            ctx.shadowColor = canvasName.shadowColor();
            ctx.shadowBlur = canvasName.shadowBlur() * scaleY;
            ctx.shadowOffsetX = canvasName.shadowOffset().x * scaleX;
            ctx.shadowOffsetY = canvasName.shadowOffset().y * scaleY;
        }
        
        ctx.fillText(canvasName.text(), canvasName.x() * scaleX, canvasName.y() * scaleY);
        ctx.restore();
    });
    
    // Draw signature if available
    if (signImageObj && signImage.children.length > 0) {
        const signChild = signImage.children[0];
        if (signChild instanceof Konva.Image) {
            const signX = signImage.x() * scaleX - (signChild.offsetX() * scaleX);
            const signY = signImage.y() * scaleY - (signChild.offsetY() * scaleY);
            const signWidth = signChild.width() * scaleX;
            const signHeight = signChild.height() * scaleY;
            
            ctx.drawImage(signImageObj, signX, signY, signWidth, signHeight);
        }
    }
    
    // Draw all canvas signatures
    canvasSignatures.forEach(sig => {
        const signChild = sig.group.children[0];
        if (signChild instanceof Konva.Image) {
            const signX = sig.group.x() * scaleX - (signChild.offsetX() * scaleX);
            const signY = sig.group.y() * scaleY - (signChild.offsetY() * scaleY);
            const signWidth = signChild.width() * scaleX;
            const signHeight = signChild.height() * scaleY;
            
            ctx.drawImage(sig.image, signX, signY, signWidth, signHeight);
        }
    });
    
    // Download the generated certificate
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'certificate-sample.jpg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};
