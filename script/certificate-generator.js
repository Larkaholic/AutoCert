/**
 * Certificate Generator Utility
 * 
 * This utility handles certificate generation with proper name placement
 * for both preview and actual certificate generation after form submission.
 */

// Make sure this script executes after Konva is loaded
if (typeof Konva === 'undefined') {
  console.error('Error: Konva library is required for CertificateGenerator');
}

class CertificateGenerator {
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
    const {
      certificateUrl,
      namePlacement,
      participantName,
      containerId = null
    } = options;

    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'none';
    document.body.appendChild(tempContainer);
    
    const container = containerId ? document.getElementById(containerId) : tempContainer;
    
    if (!container) {
      throw new Error(`Container ${containerId || 'temporary'} not found`);
    }
    
    const certificateImg = new Image();
    
    return new Promise((resolve, reject) => {
      certificateImg.onload = function() {
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
        
        let nameX, nameY, fontSize;
        
        if (namePlacement.certificateGeneration?.namePosition) {
          const pos = namePlacement.certificateGeneration.namePosition;
          nameX = pos.x;
          nameY = pos.y;
          fontSize = pos.fontSize;
        } else {
          nameX = namePlacement.xPercent * certificateImg.width;
          nameY = namePlacement.yPercent * certificateImg.height;
          fontSize = namePlacement.fontSizePercent 
            ? namePlacement.fontSizePercent * certificateImg.height
            : namePlacement.fontSize * (certificateImg.height / namePlacement.editorHeight);
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
        
        nameText.offsetX(nameText.width() / 2);
        nameText.offsetY(nameText.height() / 2);
        
        layer.add(nameText);
        layer.draw();
        
        const dataURL = stage.toDataURL({
          mimeType: 'image/jpeg',
          quality: 0.9,
          pixelRatio: 2
        });
        
        if (!containerId) {
          document.body.removeChild(tempContainer);
        }
        
        resolve(dataURL);
      };
      
      certificateImg.onerror = function(e) {
        reject(new Error('Failed to load certificate template image'));
        if (!containerId) {
          document.body.removeChild(tempContainer);
        }
      };
      
      certificateImg.crossOrigin = "Anonymous";
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
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  }
}

// Make available globally
window.CertificateGenerator = CertificateGenerator;

// Export for ESM modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CertificateGenerator;
}

console.log("CertificateGenerator initialized and made available globally");
   * @param {string} dataURL - Data URL of the certificate to download
   * @param {string} filename - Filename for the download
   */
  static download(dataURL, filename = 'certificate.jpg') {
    console.log("Downloading certificate as:", filename);
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  }
}

// Make available globally
window.CertificateGenerator = CertificateGenerator;

// Export for ESM modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CertificateGenerator;
}

console.log("CertificateGenerator initialized and made available globally");
