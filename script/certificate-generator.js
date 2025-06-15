/**
 * Certificate Generator Utility
 * 
 * This utility handles certificate generation with proper name placement
 * for both preview and actual certificate generation after form submission.
 */

// Initialize the certificate generator class when the script loads
(function() {
  console.log("Initializing Certificate Generator Utility");

  // Create the global class
  window.CertificateGenerator = class CertificateGenerator {
    /**
     * Generate a certificate with the participant's name
     * 
     * @param {Object} options - Configuration options
     * @param {string} options.certificateUrl - URL to the certificate template image
     * @param {Object} options.namePlacement - Name placement data from Firestore
     * @param {string} options.participantName - The participant's name to place on the certificate
     * @param {string} options.containerId - HTML element ID to render the certificate (optional)
     * @returns {Promise<string>} - Data URL of the generated certificate
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

      // Check if Konva is available
      if (typeof Konva === 'undefined') {
        console.error("Konva library is not loaded. Cannot generate certificate.");
        throw new Error("Konva library is required for certificate generation");
      }

      // Create a hidden container if none provided
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
      
      // Load the certificate image
      return new Promise((resolve, reject) => {
        const certificateImg = new Image();
        certificateImg.crossOrigin = "Anonymous"; // Enable CORS support
        
        certificateImg.onload = function() {
          console.log("Certificate image loaded successfully", {
            width: certificateImg.width,
            height: certificateImg.height
          });
          
          try {
            // Create Konva stage
            const stage = new Konva.Stage({
              container: container,
              width: certificateImg.width,
              height: certificateImg.height
            });
            
            const layer = new Konva.Layer();
            stage.add(layer);
            
            // Add certificate background
            const background = new Konva.Image({
              image: certificateImg,
              width: certificateImg.width,
              height: certificateImg.height
            });
            layer.add(background);
            
            console.log("Certificate background added");
            
            // Add participant's name using placement data
            let nameX, nameY, fontSize;
            
            // Determine position from placement data
            if (namePlacement.certificateGeneration?.namePosition) {
              // Use explicit position if available
              const pos = namePlacement.certificateGeneration.namePosition;
              nameX = pos.x;
              nameY = pos.y;
              fontSize = pos.fontSize;
              console.log("Using explicit namePosition from certificateGeneration", { nameX, nameY, fontSize });
            } else {
              // Calculate from percentage values
              nameX = namePlacement.xPercent * certificateImg.width;
              nameY = namePlacement.yPercent * certificateImg.height;
              
              // Calculate font size using either percentage or scaling factor
              if (namePlacement.fontSizePercent) {
                fontSize = namePlacement.fontSizePercent * certificateImg.height;
              } else if (namePlacement.fontSize && namePlacement.editorHeight) {
                fontSize = namePlacement.fontSize * (certificateImg.height / namePlacement.editorHeight);
              } else {
                // Default font size if all else fails
                fontSize = 30;
              }
              
              console.log("Calculated position from percentages", { nameX, nameY, fontSize });
            }
            
            const nameText = new Konva.Text({
              text: participantName,
              x: nameX,
              y: nameY,
              fontSize: fontSize,
              fontFamily: namePlacement.fontFamily || 'Arial',
              fontStyle: namePlacement.fontStyle || 'bold',
              fill: namePlacement.fill || 'black',
              align: 'center'
            });
            
            // Center the text at the position
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
            
            // Generate data URL
            const dataURL = stage.toDataURL({
              mimeType: 'image/jpeg',
              quality: 0.9,
              pixelRatio: 2
            });
            
            console.log("Certificate generated successfully");
            
            // Clean up if using temp container
            if (!containerId) {
              document.body.removeChild(tempContainer);
            }
            
            resolve(dataURL);
          } catch (error) {
            console.error("Error generating certificate:", error);
            
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
        
        // Start loading the image
        console.log("Loading certificate image from URL:", certificateUrl);
        certificateImg.src = certificateUrl;
      });
    }
    
    /**
     * Download a certificate
     * 
     * @param {string} dataURL - Data URL of the certificate to download
     * @param {string} filename - Filename for the download
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
  };
  
  // Log success when loaded
  console.log("Certificate Generator Utility loaded successfully");
  
  // Expose a simple check method
  window.CertificateGenerator.isLoaded = function() {
    return true;
  };
})();
