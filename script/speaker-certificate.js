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

    try {
        // Reset opacity to ensure proper generation
        if (nameText.opacity() !== 1) nameText.opacity(1);
        if (signImage.opacity() !== 1) signImage.opacity(1);
        
        // Use the CertificateGenerator for consistent generation
        const certificateUrl = bgImageObj.src;
        return await CertificateGenerator.generateWithSignature({
            certificateUrl: certificateUrl,
            namePlacement: namePlacement,
            participantName: speakerName,
            signatureImage: signImageObj
        });
    } catch (error) {
        console.error("Error using CertificateGenerator, falling back to manual generation:", error);
        
        // Fallback to manual generation
        const canvas = document.createElement('canvas');
        canvas.width = actualImageWidth;
        canvas.height = actualImageHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw the background image
        ctx.drawImage(bgImageObj, 0, 0, actualImageWidth, actualImageHeight);
        
        // Calculate proper scaling for text placement
        const scaleX = actualImageWidth / containerWidth;
        const scaleY = actualImageHeight / containerHeight;
        
        // Draw the speaker name
        ctx.save();
        ctx.font = `${nameText.fontStyle()} ${nameText.fontSize() * scaleY}px ${nameText.fontFamily()}`;
        ctx.fillStyle = nameText.fill();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add shadow if present
        if (nameText.shadowColor()) {
            ctx.shadowColor = nameText.shadowColor();
            ctx.shadowBlur = nameText.shadowBlur();
            ctx.shadowOffsetX = nameText.shadowOffset().x;
            ctx.shadowOffsetY = nameText.shadowOffset().y;
        }
        
        ctx.fillText(speakerName, nameText.x() * scaleX, nameText.y() * scaleY);
        ctx.restore();
        
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
        
        return canvas.toDataURL('image/jpeg', 0.9);
    }
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
