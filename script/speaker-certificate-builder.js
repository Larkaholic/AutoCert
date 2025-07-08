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
        console.log(`Using font "${selectedFont}" for initial speaker name text`);

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
        
        // Ensure the font change handler is set up
        if (window.setupFontChangeHandler) {
            window.setupFontChangeHandler();
        }
        
        // Center text
        speakerNameText.offsetX(speakerNameText.width() / 2);
        speakerNameText.offsetY(speakerNameText.height() / 2);
        
        speakerLayer.add(speakerNameText);
        speakerLayer.draw();
    };
    speakerBgImageObj.src = imageSrc;
}

function createSpeakerCertificatePreview(speakerName = "John Speaker") {
    if (!speakerNameText || !speakerBgImageObj) {
        alert("Please upload a template first.");
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
    console.log('speaker-certificate-builder.js loaded');
    const speakerTemplateUpload = document.getElementById('templateUpload');
    const speakerPreviewBtn = document.getElementById('previewCertBtn');
    const speakerDownloadBtn = document.getElementById('downloadCertBtn');
    
    // Set up font change handler function that we'll use multiple times
    function setupFontChangeHandler() {
        console.log('Setting up font change handler');
        const fontSelect = document.getElementById('speakerCertificateFontSelect');
        
        if (!fontSelect) {
            console.warn('Font select element not found!');
            // Try again in a moment if element not found
            setTimeout(setupFontChangeHandler, 500);
            return;
        }
        
        console.log('Font select element found:', fontSelect);
        
        // Remove any existing event listeners to prevent duplicates
        const newFontSelect = fontSelect.cloneNode(true);
        fontSelect.parentNode.replaceChild(newFontSelect, fontSelect);
        
        // Add the change event listener
        newFontSelect.addEventListener('change', function() {
            const selectedFont = this.value;
            console.log(`Font selection changed to: "${selectedFont}"`);
            
            // Update the main nameText from speaker-certificate.js
            if (window.nameText) {
                // Store the current text
                const currentText = window.nameText.text();
                
                // Update the font
                window.nameText.fontFamily(selectedFont);
                
                // Recenter the text since font change affects width
                window.nameText.offsetX(window.nameText.width() / 2);
                window.nameText.offsetY(window.nameText.height() / 2);
                
                // Draw the updated text
                window.layer.draw();
                console.log(`Font changed to "${selectedFont}" for main sample name: "${currentText}"`);
            } else {
                console.log('window.nameText not available');
            }
            
            // Also update the local speakerNameText if it exists
            if (speakerNameText) {
                speakerNameText.fontFamily(selectedFont);
                
                // Recenter the text
                speakerNameText.offsetX(speakerNameText.width() / 2);
                speakerNameText.offsetY(speakerNameText.height() / 2);
                
                speakerLayer.draw();
                console.log(`Font also updated in speakerNameText: "${speakerNameText.text()}"`);
            }
            
            // Debug fonts
            if (window.debugFonts) {
                window.debugFonts();
            }
        });
        
        // Add focus/blur events for better mobile experience
        newFontSelect.addEventListener('focus', function() {
            console.log('Font select focused');
        });
        
        newFontSelect.addEventListener('blur', function() {
            console.log('Font select blurred, value:', this.value);
            // Trigger change event if needed on mobile
            const event = new Event('change');
            this.dispatchEvent(event);
        });
        
        console.log('Font change handler set up successfully');
    }
    
    // Set up the font handler immediately
    setupFontChangeHandler();
    
    // Also set it up after a delay to ensure DOM is fully loaded
    setTimeout(setupFontChangeHandler, 1000);
    
    // And also attach it to the window for any template loading scenarios
    window.setupFontChangeHandler = setupFontChangeHandler;
    
    if (speakerPreviewBtn) {
        speakerPreviewBtn.addEventListener('click', function() {
            console.log("Preview button clicked");
            
            // Check if we have a template loaded
            if (!window.bgImageObj && !speakerBgImageObj) {
                alert("Please upload a template first.");
                return;
            }
            
            const previewModal = document.getElementById('previewModal');
            const previewContainer = document.getElementById('previewContainer');

            // Clear previous preview
            previewContainer.innerHTML = '';

            // Make the container wide and not too tall for a landscape certificate
            previewContainer.style.width = '90vw';      // Use 90% of viewport width
            previewContainer.style.height = '60vh';     // Use 60% of viewport height
            previewContainer.style.display = 'flex';
            previewContainer.style.alignItems = 'center';
            previewContainer.style.justifyContent = 'center';

            // Use window.createSpeakerCertificatePreview which has been enhanced to work with both systems
            const previewResult = window.createSpeakerCertificatePreview();
            
            // Only show modal if preview was successful
            if (previewResult) {
                previewModal.classList.remove('hidden');
            }
        });
    }
    
    if (speakerDownloadBtn) {
        speakerDownloadBtn.addEventListener('click', function() {
            console.log("Download button clicked");
            
            // Use the enhanced download function that handles both systems
            window.downloadSpeakerPreviewCertificate();
        });
    }
});

// Make functions globally available
window.createSpeakerCertificatePreview = createSpeakerCertificatePreview;
window.initSpeakerKonva = initSpeakerKonva;

// Override the preview function to work with existing system and use selected font
window.createSpeakerCertificatePreview = function(sampleName = "John Speaker") {
    // Check if we have the necessary components from either speaker-certificate.js or local variables
    console.log("Checking for template availability");
    console.log("window.stage:", !!window.stage, "window.bgImageObj:", !!window.bgImageObj);
    console.log("speakerBgImageObj:", !!speakerBgImageObj);
    
    // Use either global or local image object
    const hasTemplate = !!(window.bgImageObj || speakerBgImageObj);
    
    if (!hasTemplate) {
        alert("Please upload a template first.");
        return null;
    }

    const previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) {
        return null;
    }

    // Clear previous preview
    previewContainer.innerHTML = '';

    const containerWidth = previewContainer.offsetWidth;
    const containerHeight = previewContainer.offsetHeight;

    // Use either global or local image object and dimensions
    const templateImage = window.bgImageObj || speakerBgImageObj;
    if (!templateImage) {
        console.error("No template image found!");
        alert("Please upload a template first.");
        return null;
    }
    
    const imageWidth = window.actualImageWidth || speakerActualImageWidth || templateImage.width;
    const imageHeight = window.actualImageHeight || speakerActualImageHeight || templateImage.height;
    
    console.log("Template dimensions:", imageWidth, "x", imageHeight);
    console.log("Container dimensions:", containerWidth, "x", containerHeight);

    // Calculate scale to fit image into container while maintaining aspect ratio
    const scale = Math.min(containerWidth / imageWidth, containerHeight / imageHeight);
    const displayWidth = imageWidth * scale;
    const displayHeight = imageHeight * scale;
    
    console.log("Display dimensions:", displayWidth, "x", displayHeight, "Scale:", scale);

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
        image: templateImage,
        width: displayWidth,
        height: displayHeight
    });
    console.log("Added background image to preview");
    previewLayer.add(previewBg);

    // Get the current stage dimensions for scaling, accounting for both systems
    const stageWidth = window.stage ? window.stage.width() : (speakerStage ? speakerStage.width() : containerWidth);
    const stageHeight = window.stage ? window.stage.height() : (speakerStage ? speakerStage.height() : containerHeight);
    const scaleX = displayWidth / stageWidth;
    const scaleY = displayHeight / stageHeight;
    
    console.log("Stage dimensions:", stageWidth, "x", stageHeight);
    console.log("Scale factors:", scaleX, scaleY);

    // Get selected font for main text only
    const fontSelect = document.getElementById('speakerCertificateFontSelect');
    const selectedFont = fontSelect ? fontSelect.value : 'Poppins';

    // Clone main sample text with selected font - use either global or local nameText
    const textSource = window.nameText || speakerNameText;
    
    if (textSource) {
        // Get selected font for main text
        const fontSelect = document.getElementById('speakerCertificateFontSelect');
        const selectedFont = fontSelect ? fontSelect.value : textSource.fontFamily();
        console.log(`Using font "${selectedFont}" for preview text`);
        
        const previewText = new Konva.Text({
            text: sampleName,
            x: textSource.x() * scaleX,
            y: textSource.y() * scaleY,
            fontSize: textSource.fontSize() * scaleY,
            fontFamily: selectedFont,  // Use the selected font
            fontStyle: textSource.fontStyle(),
            fill: textSource.fill(),
            shadowColor: textSource.shadowColor(),
            shadowBlur: textSource.shadowBlur() * scaleY,
            shadowOffset: {
                x: textSource.shadowOffset().x * scaleX,
                y: textSource.shadowOffset().y * scaleY
            },
            shadowOpacity: textSource.shadowOpacity(),
        });

        previewText.offsetX(previewText.width() / 2);
        previewText.offsetY(previewText.height() / 2);
        previewLayer.add(previewText);
    }

    // Clone canvas names with their original fonts (preserve their individual fonts)
    if (window.canvasNameTexts) {
        console.log(`Adding ${window.canvasNameTexts.length} canvas names to preview`);
        window.canvasNameTexts.forEach((canvasName, i) => {
            // Always use the original font for additional names - do not apply the selected font
            const originalFont = canvasName.fontFamily();
            console.log(`Canvas name ${i}: "${canvasName.text()}" using font "${originalFont}"`);
            
            const previewName = new Konva.Text({
                text: canvasName.text(),
                x: canvasName.x() * scaleX,
                y: canvasName.y() * scaleY,
                fontSize: canvasName.fontSize() * scaleY,
                fontFamily: originalFont,  // Use original font
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

            previewName.offsetX(previewName.width() / 2);
            previewName.offsetY(previewName.height() / 2);
            previewLayer.add(previewName);
        });
    }

    // Clone all signature images from the main stage
    if (window.canvasSignatures) {
        window.canvasSignatures.forEach(sig => {
            const group = sig.group;
            const image = sig.image;
            
            if (image && group) {
                const sigImage = new Konva.Image({
                    image: image,
                    x: group.x() * scaleX,
                    y: group.y() * scaleY,
                    width: group.children[0].width() * scaleX,
                    height: group.children[0].height() * scaleY,
                    offsetX: group.children[0].offsetX(),
                    offsetY: group.children[0].offsetY()
                });
                
                previewLayer.add(sigImage);
            }
        });
    }

    previewLayer.draw();
    return previewStage;
};

// Override the download function to use selected font for main text only
window.downloadSpeakerPreviewCertificate = function() {
    console.log("Downloading preview certificate");
    
    // Check if we have a template loaded
    if (!window.bgImageObj && !speakerBgImageObj) {
        alert("Please upload a template first.");
        return;
    }
    
    const previewStage = window.createSpeakerCertificatePreview("Sample Speaker");
    if (!previewStage) {
        console.error("Failed to create preview stage");
        return;
    }
    
    try {
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
        console.log("Certificate download complete");
    } catch (error) {
        console.error("Error generating certificate:", error);
        alert("There was an error generating the certificate. Please try again.");
    }
};

// Initialize default font
window.speakerDefaultFont = 'Poppins';

// Add font debugging functions
window.debugFonts = function() {
    console.log('--- Font Debug Information ---');
    
    // Check the dropdown selection
    const fontSelect = document.getElementById('speakerCertificateFontSelect');
    console.log(`Font dropdown selected value: "${fontSelect ? fontSelect.value : 'not found'}"`);
    
    // Check main sample name font
    if (window.nameText) {
        console.log(`Main sample name font: "${window.nameText.fontFamily()}"`);
    } else {
        console.log('Main sample nameText not initialized');
    }
    
    // Check all canvas names
    if (window.canvasNameTexts && window.canvasNameTexts.length > 0) {
        console.log(`Canvas names count: ${window.canvasNameTexts.length}`);
        window.canvasNameTexts.forEach((nameText, i) => {
            console.log(`Canvas name ${i}: "${nameText.text()}", Font: "${nameText.fontFamily()}"`);
        });
    } else {
        console.log('No canvas names added yet');
    }
    
    console.log('---------------------------');
};

// Add button click event to run debug
document.addEventListener('DOMContentLoaded', function() {
    // Add debug button to the UI
    setTimeout(() => {
        const container = document.querySelector('.glass-buttons');
        if (container) {
            const debugBtn = document.createElement('button');
            debugBtn.textContent = 'Debug Fonts';
            debugBtn.className = 'text-xs text-white bg-blue-600 px-3 py-1 rounded absolute bottom-2 right-2';
            debugBtn.style.zIndex = '1000';
            debugBtn.onclick = window.debugFonts;
            document.body.appendChild(debugBtn);
        }
    }, 1000);
});

// Function to immediately apply the selected font
window.applySelectedFont = function() {
    const fontSelect = document.getElementById('speakerCertificateFontSelect');
    if (!fontSelect) {
        console.warn('Font select element not found!');
        return false;
    }
    
    const selectedFont = fontSelect.value;
    console.log(`Applying font "${selectedFont}" immediately`);
    
    // Update the main nameText from speaker-certificate.js
    if (window.nameText) {
        window.nameText.fontFamily(selectedFont);
        window.nameText.offsetX(window.nameText.width() / 2);
        window.nameText.offsetY(window.nameText.height() / 2);
        window.layer.draw();
        console.log(`Font applied to main sample name`);
        return true;
    }
    
    // Also update the local speakerNameText if it exists
    if (speakerNameText) {
        speakerNameText.fontFamily(selectedFont);
        speakerNameText.offsetX(speakerNameText.width() / 2);
        speakerNameText.offsetY(speakerNameText.height() / 2);
        speakerLayer.draw();
        console.log(`Font applied to speaker name text`);
        return true;
    }
    
    console.log('No text objects available to update font');
    return false;
};

// Add special handling for direct select changes
document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'speakerCertificateFontSelect') {
        console.log('Font select clicked, preparing for change');
        
        // Setup a one-time handler for immediate effect
        const handleImmediateChange = function() {
            console.log('Immediate change detected');
            window.applySelectedFont();
            
            // Remove the one-time handler
            event.target.removeEventListener('change', handleImmediateChange);
        };
        
        event.target.addEventListener('change', handleImmediateChange);
    }
});

// Add a MutationObserver to detect when the font select is added to DOM
document.addEventListener('DOMContentLoaded', function() {
    // Initialize MutationObserver
    const observer = new MutationObserver(function(mutations) {
        for(let mutation of mutations) {
            if (mutation.type === 'childList') {
                const fontSelect = document.getElementById('speakerCertificateFontSelect');
                if (fontSelect && !fontSelect.hasAttribute('data-handler-attached')) {
                    console.log('Font select detected in DOM via MutationObserver');
                    fontSelect.setAttribute('data-handler-attached', 'true');
                    
                    // Set up the font change handler
                    if (window.setupFontChangeHandler) {
                        window.setupFontChangeHandler();
                    }
                    
                    // Make sure the font select doesn't reset on blur (mobile fix)
                    fontSelect.addEventListener('touchend', function(e) {
                        console.log('Touch end on font select');
                        setTimeout(() => window.applySelectedFont(), 100);
                    });
                }
            }
        }
    });
    
    // Start observing the document body for DOM changes
    observer.observe(document.body, { 
        childList: true,
        subtree: true
    });
    
    console.log('MutationObserver set up for font select element');
});
