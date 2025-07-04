(function() {
  console.log("Initializing Certificate Generator Utility");
    window.CertificateGenerator = class CertificateGenerator {
    /**
     * Generate a certificate with the participant's name
     * 
     * @param {Object} options - configuration options
     * @param {string} options.certificateUrl - URL to the certificate template image
     * @param {Object} options.namePlacement - name placement data from Firestore
     * @param {string} options.participantName - the participant's name to place on the certificate
     * @param {string} options.containerId - HTML element ID to render the certificate
     * @returns {Promise<string>} - data URL of the generated certificate
     */
    static async generate(options) {
      console.log("CertificateGenerator.generate called with:", options);
      
      if (!options || !options.certificateUrl || !options.namePlacement || !options.participantName) {
        console.error("Missing required parameters for certificate generation", options);
        throw new Error("Missing required parameters for certificate generation");
      }

      const {
        certificateUrl,
        namePlacement,
        participantName,
        containerId = null
      } = options;

      if (typeof Konva === 'undefined') {
        console.error("Konva library is not loaded. Cannot generate certificate.");
        throw new Error("Konva library is required for certificate generation");
      }

      const tempContainer = document.createElement('div');
      tempContainer.id = "temp-certificate-container";
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      document.body.appendChild(tempContainer);
      
      const container = containerId ? document.getElementById(containerId) : tempContainer;
      
      if (!container) {
        throw new Error(`Certificate container not found: ${containerId || "temporary container"}`);
      }
      
      // load certificate image
      return new Promise((resolve, reject) => {
        const certificateImg = new Image();
        certificateImg.crossOrigin = "Anonymous";
        
        certificateImg.onload = function() {
          console.log("Certificate image loaded successfully", {
            width: certificateImg.width,
            height: certificateImg.height
          });
          
          try {
            const stage = new Konva.Stage({
              container: container,
              width: certificateImg.width,
              height: certificateImg.height
            });
            
            const layer = new Konva.Layer();
            stage.add(layer);
            
            const background = new Konva.Image({
              image: certificateImg,
              width: certificateImg.width,
              height: certificateImg.height
            });
            layer.add(background);
            
            console.log("Certificate background added");
            
            // Calculate scaling factors between editor and final image
            const editorWidth = namePlacement.editorWidth || 800;
            const editorHeight = namePlacement.editorHeight || 600;
            const imageWidth = certificateImg.width;
            const imageHeight = certificateImg.height;
            
            const scaleX = imageWidth / editorWidth;
            const scaleY = imageHeight / editorHeight;
            
            console.log("Scaling factors:", { scaleX, scaleY, editorWidth, editorHeight, imageWidth, imageHeight });
            
            // add participant's name using placement data with accurate scaling
            let nameX, nameY, fontSize;
            
            // determine position from placement data
            if (namePlacement.certificateGeneration?.namePosition) {
              // use explicit position
              const pos = namePlacement.certificateGeneration.namePosition;
              nameX = pos.x;
              nameY = pos.y;
              fontSize = pos.fontSize;
              console.log("Using explicit namePosition from certificateGeneration", { nameX, nameY, fontSize });
            } else {
              // calculate from editor placement with proper scaling
              nameX = namePlacement.x * scaleX;
              nameY = namePlacement.y * scaleY;
              fontSize = namePlacement.fontSize * scaleY;
              console.log("Calculated position from editor placement", { nameX, nameY, fontSize });
            }
            
            const nameText = new Konva.Text({
              text: participantName,
              x: nameX,
              y: nameY,
              fontSize: fontSize,
              fontFamily: namePlacement.fontFamily || 'Arial',
              fontStyle: namePlacement.fontStyle || 'bold',
              fill: namePlacement.fill || 'black',
              shadowColor: namePlacement.shadowColor || 'white',
              shadowBlur: namePlacement.shadowBlur || 2,
              shadowOffset: namePlacement.shadowOffset || { x: 1, y: 1 },
              shadowOpacity: namePlacement.shadowOpacity || 0.5,
            });
            
            // center the text at the position (same as editor)
            nameText.offsetX(nameText.width() / 2);
            nameText.offsetY(nameText.height() / 2);
            
            console.log("Name text added", {
              text: participantName,
              position: { x: nameX, y: nameY },
              fontSize: fontSize,
              dimensions: { width: nameText.width(), height: nameText.height() }
            });
            
            layer.add(nameText);
            layer.draw();
            
            // generate data URL
            const dataURL = stage.toDataURL({
              mimeType: 'image/jpeg',
              quality: 0.9,
              pixelRatio: 2
            });
            
            console.log("Certificate generated successfully");
            
            // clean up if using temp container
            if (!containerId) {
              document.body.removeChild(tempContainer);
            }
            
            resolve(dataURL);
          } catch (error) {
            console.error("Error generating certificate:", error);
            
            // clean up if using temp container
            if (!containerId) {
              document.body.removeChild(tempContainer);
            }
            
            reject(error);
          }
        };
        
        certificateImg.onerror = function(e) {
          console.error("Failed to load certificate image:", certificateUrl, e);
          
          // clean up if using temp container
          if (!containerId) {
            document.body.removeChild(tempContainer);
          }
          
          reject(new Error("Failed to load certificate template image"));
        };
        
        // load the image
        console.log("Loading certificate image from URL:", certificateUrl);
        certificateImg.src = certificateUrl;
      });
    }
    
    /**
     * Download a certificate
     * 
     * @param {string} dataURL - data URL of the certificate to download
     * @param {string} filename - filename for the download
     */
    static download(dataURL, filename = 'certificate.jpg') {
      if (!dataURL) {
        console.error("Cannot download certificate: No data URL provided");
        return;
      }
      
      console.log("Downloading certificate as:", filename);
      
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    }
    
    /**
     * Generate a certificate with signature support and accurate placement
     * 
     * @param {Object} options - configuration options
     * @param {string} options.certificateUrl - URL to the certificate template image
     * @param {Object} options.namePlacement - name placement data from editor
     * @param {string} options.participantName - the participant's name to place on the certificate
     * @param {Image} options.signatureImage - signature image object
     * @param {string} options.containerId - HTML element ID to render the certificate
     * @returns {Promise<string>} - data URL of the generated certificate
     */
    static async generateWithSignature(options) {
      console.log("CertificateGenerator.generateWithSignature called with:", options);
      
      if (!options || !options.certificateUrl || !options.namePlacement || !options.participantName) {
        console.error("Missing required parameters for certificate generation", options);
        throw new Error("Missing required parameters for certificate generation");
      }

      const {
        certificateUrl,
        namePlacement,
        participantName,
        signatureImage = null,
        containerId = null
      } = options;

      if (typeof Konva === 'undefined') {
        console.error("Konva library is not loaded. Cannot generate certificate.");
        throw new Error("Konva library is required for certificate generation");
      }

      const tempContainer = document.createElement('div');
      tempContainer.id = "temp-certificate-container";
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      document.body.appendChild(tempContainer);
      
      const container = containerId ? document.getElementById(containerId) : tempContainer;
      
      if (!container) {
        throw new Error(`Certificate container not found: ${containerId || "temporary container"}`);
      }
      
      // load certificate image
      return new Promise((resolve, reject) => {
        const certificateImg = new Image();
        certificateImg.crossOrigin = "Anonymous";
        
        certificateImg.onload = function() {
          console.log("Certificate image loaded successfully", {
            width: certificateImg.width,
            height: certificateImg.height
          });
          
          try {
            const stage = new Konva.Stage({
              container: container,
              width: certificateImg.width,
              height: certificateImg.height
            });
            
            const layer = new Konva.Layer();
            stage.add(layer);
            
            const background = new Konva.Image({
              image: certificateImg,
              width: certificateImg.width,
              height: certificateImg.height
            });
            layer.add(background);
            
            console.log("Certificate background added");
            
            // Calculate scaling factors between editor and final image
            const editorWidth = namePlacement.editorWidth;
            const editorHeight = namePlacement.editorHeight;
            const imageWidth = certificateImg.width;
            const imageHeight = certificateImg.height;
            
            const scaleX = imageWidth / editorWidth;
            const scaleY = imageHeight / editorHeight;
            
            console.log("Scaling factors:", { scaleX, scaleY, editorWidth, editorHeight, imageWidth, imageHeight });
            
            // Add participant's name with accurate placement
            let nameX, nameY, fontSize;
            
            if (namePlacement.certificateGeneration?.namePosition) {
              // Use explicit position from certificateGeneration
              const pos = namePlacement.certificateGeneration.namePosition;
              nameX = pos.x;
              nameY = pos.y;
              fontSize = pos.fontSize;
              console.log("Using explicit namePosition from certificateGeneration", { nameX, nameY, fontSize });
            } else {
              // Calculate from editor placement with proper scaling
              nameX = namePlacement.x * scaleX;
              nameY = namePlacement.y * scaleY;
              fontSize = namePlacement.fontSize * scaleY;
              console.log("Calculated position from editor placement", { nameX, nameY, fontSize });
            }
            
            const nameText = new Konva.Text({
              text: participantName,
              x: nameX,
              y: nameY,
              fontSize: fontSize,
              fontFamily: namePlacement.fontFamily || 'Arial',
              fontStyle: namePlacement.fontStyle || 'bold',
              fill: namePlacement.fill || 'black',
              shadowColor: namePlacement.shadowColor || 'white',
              shadowBlur: namePlacement.shadowBlur || 2,
              shadowOffset: namePlacement.shadowOffset || { x: 1, y: 1 },
              shadowOpacity: namePlacement.shadowOpacity || 0.5,
            });
            
            // Center the text at the position (same as editor)
            nameText.offsetX(nameText.width() / 2);
            nameText.offsetY(nameText.height() / 2);
            
            console.log("Name text added", {
              text: participantName,
              position: { x: nameX, y: nameY },
              fontSize: fontSize,
              dimensions: { width: nameText.width(), height: nameText.height() }
            });
            
            layer.add(nameText);
            
            // Add signature if available with accurate placement
            if (signatureImage && namePlacement.signaturePlacement) {
              const signPlacement = namePlacement.signaturePlacement;
              let signX, signY, signWidth, signHeight, signatureKonva;
              
              if (namePlacement.certificateGeneration?.signaturePosition) {
                // Use explicit position from certificateGeneration
                const pos = namePlacement.certificateGeneration.signaturePosition;
                signX = pos.x;
                signY = pos.y;
                signWidth = pos.width;
                signHeight = pos.height;
                
                // Create the signature with the explicit position and apply offset
                signatureKonva = new Konva.Image({
                  image: signatureImage,
                  x: signX,
                  y: signY,
                  width: signWidth,
                  height: signHeight,
                  offsetX: pos.offsetX,
                  offsetY: pos.offsetY
                });
                
                console.log("Using explicit signaturePosition from certificateGeneration", { 
                  signX, signY, signWidth, signHeight,
                  offsetX: pos.offsetX, offsetY: pos.offsetY 
                });
              } else {
                // Calculate from editor placement with proper scaling (same as name)
                signX = signPlacement.x * scaleX;
                signY = signPlacement.y * scaleY;
                signWidth = signPlacement.width * scaleX;
                signHeight = signPlacement.height * scaleY;
                
                // Create the signature with calculated position and apply offset
                signatureKonva = new Konva.Image({
                  image: signatureImage,
                  x: signX,
                  y: signY,
                  width: signWidth,
                  height: signHeight,
                  offsetX: signWidth / 2,
                  offsetY: signHeight / 2
                });
                
                console.log("Calculated signature position from editor placement", { 
                  signX, signY, signWidth, signHeight,
                  originalX: signPlacement.x,
                  originalY: signPlacement.y,
                  originalWidth: signPlacement.width,
                  originalHeight: signPlacement.height
                });
              }
              
              layer.add(signatureKonva);
              
              console.log("Signature added with accurate placement", {
                position: { x: signX, y: signY },
                dimensions: { width: signWidth, height: signHeight },
                offset: { x: signatureKonva.offsetX(), y: signatureKonva.offsetY() }
              });
            }
            
            layer.draw();
            
            // Generate data URL
            const dataURL = stage.toDataURL({
              mimeType: 'image/jpeg',
              quality: 0.9,
              pixelRatio: 2
            });
            
            console.log("Certificate with signature generated successfully");
            
            // Clean up if using temp container
            if (!containerId) {
              document.body.removeChild(tempContainer);
            }
            
            resolve(dataURL);
          } catch (error) {
            console.error("Error generating certificate with signature:", error);
            
            // Clean up if using temp container
            if (!containerId) {
              document.body.removeChild(tempContainer);
            }
            
            reject(error);
          }
        };
        
        certificateImg.onerror = function(e) {
          console.error("Failed to load certificate image:", certificateUrl, e);
          
          // Clean up if using temp container
          if (!containerId) {
            document.body.removeChild(tempContainer);
          }
          
          reject(new Error("Failed to load certificate template image"));
        };
        
        // Load the image
        console.log("Loading certificate image from URL:", certificateUrl);
        certificateImg.src = certificateUrl;
      });
    }
  };
  
  console.log("Certificate Generator Utility loaded successfully");
  
  window.CertificateGenerator.isLoaded = function() {
    return true;
  };
})();
