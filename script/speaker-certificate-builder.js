let speakerStage, speakerLayer, speakerNameText, speakerBgImageObj;
let speakerActualImageWidth, speakerActualImageHeight;

function getSpeakerResponsiveSize() {
    const container = document.getElementById('konvaContainer');
    return {
        width: container.offsetWidth,
        height: container.offsetHeight
    };
}

function initSpeakerKonva(imageSrc) {
    const { width, height } = getSpeakerResponsiveSize();
    speakerStage = new Konva.Stage({
        container: 'konvaContainer',
        width: width,
        height: height,
    });
    
    speakerLayer = new Konva.Layer();
    speakerStage.add(speakerLayer);

    speakerBgImageObj = new Image();
    speakerBgImageObj.onload = function() {
        speakerActualImageWidth = speakerBgImageObj.width;
        speakerActualImageHeight = speakerBgImageObj.height;
        
        const bg = new Konva.Image({
            image: speakerBgImageObj,
            width: width,
            height: height,
            listening: false
        });
        speakerLayer.add(bg);

        // Get the selected font
        const fontSelect = document.getElementById('speakerCertificateFontSelect');
        const selectedFont = fontSelect ? fontSelect.value : 'Poppins';

        speakerNameText = new Konva.Text({
            text: 'SPEAKER NAME',
            x: width / 2,
            y: height / 2,
            fontSize: Math.max(18, Math.floor(height / 16)),
            fontFamily: selectedFont,
            fill: 'black',
            draggable: true,
            fontStyle: 'bold',
            shadowColor: 'white',
            shadowBlur: 2,
            shadowOffset: { x: 1, y: 1 },
            shadowOpacity: 0.5,
        });
        
        speakerNameText.offsetX(speakerNameText.width() / 2);
        speakerNameText.offsetY(speakerNameText.height() / 2);

        speakerNameText.on('wheel', (e) => {
            e.evt.preventDefault();
            let fontSize = speakerNameText.fontSize();
            if (e.evt.deltaY < 0) fontSize = Math.min(100, fontSize + 2);
            else fontSize = Math.max(10, fontSize - 2);
            speakerNameText.fontSize(fontSize);
            speakerNameText.offsetX(speakerNameText.width() / 2);
            speakerNameText.offsetY(speakerNameText.height() / 2);
            speakerLayer.batchDraw();
        });

        speakerLayer.add(speakerNameText);
        speakerLayer.draw();
    };
    speakerBgImageObj.src = imageSrc;
}

function createSpeakerCertificatePreview(speakerName = "John Speaker") {
    if (!speakerNameText || !speakerBgImageObj) {
        alert("Please upload a template and position the name first.");
        return null;
    }

    const previewContainer = document.getElementById('previewContainer');
    const containerWidth = previewContainer.offsetWidth;
    const containerHeight = previewContainer.offsetHeight;

    const scale = Math.min(
        containerWidth / speakerActualImageWidth,
        containerHeight / speakerActualImageHeight
    );
    const displayWidth = speakerActualImageWidth * scale;
    const displayHeight = speakerActualImageHeight * scale;

    previewContainer.style.display = 'flex';
    previewContainer.style.alignItems = 'center';
    previewContainer.style.justifyContent = 'center';

    const previewStage = new Konva.Stage({
        container: 'previewContainer',
        width: displayWidth,
        height: displayHeight,
    });

    const previewLayer = new Konva.Layer();
    previewStage.add(previewLayer);

    const previewBg = new Konva.Image({
        image: speakerBgImageObj,
        width: displayWidth,
        height: displayHeight
    });
    previewLayer.add(previewBg);

    const { width: editorWidth, height: editorHeight } = getSpeakerResponsiveSize();
    const scaleX = displayWidth / editorWidth;
    const scaleY = displayHeight / editorHeight;

    // Get selected font
    const fontSelect = document.getElementById('speakerCertificateFontSelect');
    const selectedFont = fontSelect ? fontSelect.value : 'Poppins';

    const previewText = new Konva.Text({
        text: speakerName,
        x: speakerNameText.x() * scaleX,
        y: speakerNameText.y() * scaleY,
        fontSize: speakerNameText.fontSize() * ((scaleX + scaleY) / 2),
        fontFamily: selectedFont,
        fontStyle: speakerNameText.fontStyle(),
        fill: speakerNameText.fill(),
        shadowColor: speakerNameText.shadowColor(),
        shadowBlur: speakerNameText.shadowBlur(),
        shadowOffset: speakerNameText.shadowOffset(),
        shadowOpacity: speakerNameText.shadowOpacity(),
    });

    previewText.offsetX(previewText.width() / 2);
    previewText.offsetY(previewText.height() / 2);

    previewLayer.add(previewText);
    previewLayer.draw();

    return previewStage;
}

// Event listeners for speaker certificate
document.addEventListener('DOMContentLoaded', function() {
    const speakerTemplateUpload = document.getElementById('templateUpload');
    const speakerPreviewBtn = document.getElementById('previewCertBtn');
    const speakerDownloadBtn = document.getElementById('downloadCertBtn');
    const fontSelect = document.getElementById('speakerCertificateFontSelect');
    
    // Font change handler
    if (fontSelect) {
        fontSelect.addEventListener('change', function() {
            const selectedFont = fontSelect.value;
            
            // Set the default font for new text objects
            window.speakerDefaultFont = selectedFont;
            
            // Only update the main sample name text from speaker-certificate.js
            if (window.nameText) {
                window.nameText.fontFamily(selectedFont);
                window.nameText.offsetX(window.nameText.width() / 2);
                window.nameText.offsetY(window.nameText.height() / 2);
                
                if (window.layer) {
                    window.layer.draw();
                }
            }
            
            // Do NOT update canvasNameTexts - let users manually change those if needed
            // This preserves the fonts of names that were added to canvas
        });
    }
    
    if (speakerTemplateUpload) {
        speakerTemplateUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                if (speakerStage) speakerStage.destroy();
                initSpeakerKonva(evt.target.result);
            };
            reader.readAsDataURL(file);
        });
    }
    
    if (speakerPreviewBtn) {
        speakerPreviewBtn.addEventListener('click', function() {
            if (!speakerNameText || !speakerBgImageObj) {
                alert("Please upload a template and position the name first.");
                return;
            }

            const previewModal = document.getElementById('previewModal');
            const previewContainer = document.getElementById('previewContainer');

            previewContainer.innerHTML = '';
            previewContainer.style.width = '90vw';
            previewContainer.style.height = '60vh';
            previewContainer.style.display = 'flex';
            previewContainer.style.alignItems = 'center';
            previewContainer.style.justifyContent = 'center';

            createSpeakerCertificatePreview();
            previewModal.classList.remove('hidden');
        });
    }
    
    if (speakerDownloadBtn) {
        speakerDownloadBtn.addEventListener('click', function() {
            const previewStage = window.createSpeakerCertificatePreview("John Speaker");
            if (!previewStage) return;
            
            const dataURL = previewStage.toDataURL({
                mimeType: "image/jpeg", 
                quality: 0.9,
                pixelRatio: 2
            });
            
            const downloadLink = document.createElement('a');
            downloadLink.href = dataURL;
            downloadLink.download = 'sample-speaker-certificate.jpg';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        });
    }
});

// Make functions globally available
window.createSpeakerCertificatePreview = createSpeakerCertificatePreview;
window.initSpeakerKonva = initSpeakerKonva;

// Font change handler for speaker certificates - integrates with existing system
document.addEventListener('DOMContentLoaded', function() {
    const fontSelect = document.getElementById('speakerCertificateFontSelect');
    
    // Font change handler with null check
    if (fontSelect) {
        fontSelect.addEventListener('change', function() {
            const selectedFont = fontSelect.value;
            
            // Set the default font for new text objects
            window.speakerDefaultFont = selectedFont;
            
            // Only update the main sample name text from speaker-certificate.js
            if (window.nameText) {
                window.nameText.fontFamily(selectedFont);
                window.nameText.offsetX(window.nameText.width() / 2);
                window.nameText.offsetY(window.nameText.height() / 2);
                
                if (window.layer) {
                    window.layer.draw();
                }
            }
            
            // Do NOT update canvasNameTexts - let users manually change those if needed
            // This preserves the fonts of names that were added to canvas
        });
    }
});

// Override the preview function to work with existing system and use selected font
window.createSpeakerCertificatePreview = function(sampleName = "John Speaker") {
    // Check if we have the necessary components from speaker-certificate.js
    if (!window.stage || !window.bgImageObj) {
        alert("Please upload a template first.");
        return null;
    }

    const previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) {
        console.error('Preview container not found');
        return null;
    }

    // Clear previous preview
    previewContainer.innerHTML = '';

    const containerWidth = previewContainer.offsetWidth;
    const containerHeight = previewContainer.offsetHeight;

    // Get the actual image dimensions from speaker-certificate.js
    const imageWidth = window.actualImageWidth || window.bgImageObj.width;
    const imageHeight = window.actualImageHeight || window.bgImageObj.height;

    // Calculate scale to fit image into container while maintaining aspect ratio
    const scale = Math.min(containerWidth / imageWidth, containerHeight / imageHeight);
    const displayWidth = imageWidth * scale;
    const displayHeight = imageHeight * scale;

    // Create preview stage
    const previewStage = new Konva.Stage({
        container: 'previewContainer',
        width: displayWidth,
        height: displayHeight,
    });

    const previewLayer = new Konva.Layer();
    previewStage.add(previewLayer);

    // Add background image
    const previewBg = new Konva.Image({
        image: window.bgImageObj,
        width: displayWidth,
        height: displayHeight
    });
    previewLayer.add(previewBg);

    // Get the current stage dimensions for scaling
    const stageWidth = window.stage.width();
    const stageHeight = window.stage.height();
    const scaleX = displayWidth / stageWidth;
    const scaleY = displayHeight / stageHeight;

    // Get selected font for main text only
    const fontSelect = document.getElementById('speakerCertificateFontSelect');
    const selectedFont = fontSelect ? fontSelect.value : 'Poppins';

    // Clone main sample text with selected font
    if (window.nameText) {
        const clonedMainText = new Konva.Text({
            text: sampleName,
            x: window.nameText.x() * scaleX,
            y: window.nameText.y() * scaleY,
            fontSize: window.nameText.fontSize() * ((scaleX + scaleY) / 2),
            fontFamily: selectedFont, // Use selected font for main text only
            fontStyle: window.nameText.fontStyle(),
            fill: window.nameText.fill(),
            shadowColor: window.nameText.shadowColor(),
            shadowBlur: window.nameText.shadowBlur(),
            shadowOffset: window.nameText.shadowOffset(),
            shadowOpacity: window.nameText.shadowOpacity(),
        });
        
        clonedMainText.offsetX(clonedMainText.width() / 2);
        clonedMainText.offsetY(clonedMainText.height() / 2);
        previewLayer.add(clonedMainText);
    }

    // Clone canvas names with their original fonts (preserve their individual fonts)
    if (window.canvasNameTexts) {
        window.canvasNameTexts.forEach(textObj => {
            const clonedText = new Konva.Text({
                text: textObj.text(),
                x: textObj.x() * scaleX,
                y: textObj.y() * scaleY,
                fontSize: textObj.fontSize() * ((scaleX + scaleY) / 2),
                fontFamily: textObj.fontFamily(), // Keep original font for canvas names
                fontStyle: textObj.fontStyle(),
                fill: textObj.fill(),
                shadowColor: textObj.shadowColor(),
                shadowBlur: textObj.shadowBlur(),
                shadowOffset: textObj.shadowOffset(),
                shadowOpacity: textObj.shadowOpacity(),
            });
            
            clonedText.offsetX(clonedText.width() / 2);
            clonedText.offsetY(clonedText.height() / 2);
            previewLayer.add(clonedText);
        });
    }

    // Clone all signature images from the main stage
    if (window.canvasSignatures) {
        window.canvasSignatures.forEach(sig => {
            const signChild = sig.group.children[0];
            if (signChild && signChild.className === 'Image') {
                const clonedImage = new Konva.Image({
                    image: sig.image,
                    x: sig.group.x() * scaleX,
                    y: sig.group.y() * scaleY,
                    width: signChild.width() * scaleX,
                    height: signChild.height() * scaleY,
                    offsetX: signChild.offsetX() * scaleX,
                    offsetY: signChild.offsetY() * scaleY,
                });
                previewLayer.add(clonedImage);
            }
        });
    }

    previewLayer.draw();
    return previewStage;
};

// Override the download function to use selected font for main text only
window.downloadSpeakerPreviewCertificate = function() {
    const previewStage = window.createSpeakerCertificatePreview("Sample Speaker");
    if (!previewStage) return;
    
    const dataURL = previewStage.toDataURL({
        mimeType: "image/jpeg", 
        quality: 0.9,
        pixelRatio: 2
    });
    
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'sample-speaker-certificate.jpg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};

// Hook into the existing addNamesToCanvas function to apply font to new names only
setTimeout(() => {
    if (window.addNamesToCanvas) {
        const originalAddNamesToCanvas = window.addNamesToCanvas;
        window.addNamesToCanvas = function(names) {
            // Set the default font for new names
            const fontSelect = document.getElementById('speakerCertificateFontSelect');
            if (fontSelect) {
                window.speakerDefaultFont = fontSelect.value;
            }
            
            // Call the original function
            originalAddNamesToCanvas(names);
            
            // Update font of newly added text objects only
            setTimeout(() => {
                if (window.canvasNameTexts && window.canvasNameTexts.length > 0) {
                    // Only update the font of newly added names (last few in the array)
                    const newNamesCount = names.length;
                    const startIndex = Math.max(0, window.canvasNameTexts.length - newNamesCount);
                    
                    for (let i = startIndex; i < window.canvasNameTexts.length; i++) {
                        const textObj = window.canvasNameTexts[i];
                        if (textObj && window.speakerDefaultFont) {
                            textObj.fontFamily(window.speakerDefaultFont);
                            textObj.offsetX(textObj.width() / 2);
                            textObj.offsetY(textObj.height() / 2);
                        }
                    }
                    
                    if (window.layer) {
                        window.layer.draw();
                    }
                }
            }, 100);
        };
    }
}, 1000);

// Initialize default font
window.speakerDefaultFont = 'Poppins';

window.addNamesToCanvas = function(names) {
            // Set the default font before adding names
            const fontSelect = document.getElementById('speakerCertificateFontSelect');
            if (fontSelect) {
                window.speakerDefaultFont = fontSelect.value;
            }
            
            // Call the original function
            currentAddNamesToCanvas(names);
            
            // Update font of newly added text objects
            setTimeout(() => {
                if (window.speaker_stage) {
                    const textObjects = window.speaker_stage.find('Text');
                    textObjects.forEach(textObj => {
                        if (textObj.name() !== 'instruction') {
                            textObj.fontFamily(window.speakerDefaultFont || 'Poppins');
                            textObj.offsetX(textObj.width() / 2);
                            textObj.offsetY(textObj.height() / 2);
                        }
                    });
                    
                    if (window.speaker_layer) {
                        window.speaker_layer.draw();
                    }
                }
            }, 100);
        };

// Initialize default font
window.speakerDefaultFont = 'Poppins';
