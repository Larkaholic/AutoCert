let stage, layer, nameText, bgImageObj;
const containerWidth = 800;
const containerHeight = 600;

function getResponsiveSize() {
    const container = document.getElementById('konvaContainer');
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    return { width, height };
}

function initKonva(imageSrc) {
    const { width, height } = getResponsiveSize();
    stage = new Konva.Stage({
        container: 'konvaContainer',
        width,
        height,
    });
    layer = new Konva.Layer();
    stage.add(layer);

    // Add background image
    bgImageObj = new window.Image();
    bgImageObj.onload = function() {
        const bg = new Konva.Image({
            image: bgImageObj,
            width: width,
            height: height,
            listening: false
        });
        layer.add(bg);

        // Add draggable name placeholder
        nameText = new Konva.Text({
            text: '{{name}}',
            x: width / 2 - 100,
            y: height / 2 - 20,
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

        // Optional: allow resizing font size with mouse wheel
        nameText.on('wheel', (e) => {
            e.evt.preventDefault();
            let fontSize = nameText.fontSize();
            if (e.evt.deltaY < 0) fontSize += 2;
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
    // Re-initialize Konva with new size
    if (stage) stage.destroy();
    initKonva(bgImageObj.src);
});

document.getElementById('templateUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        // Clear previous stage if any
        if (stage) stage.destroy();
        initKonva(evt.target.result);
    };
    reader.readAsDataURL(file);
});

document.getElementById('savePlacementBtn').addEventListener('click', function() {
    if (!nameText || !bgImageObj) {
        document.getElementById('saveStatus').textContent = "Please upload a template and place the name.";
        return;
    }
    // Save placement data (could be sent to Firestore or downloaded)
    const placement = {
        x: nameText.x(),
        y: nameText.y(),
        fontSize: nameText.fontSize(),
        fontFamily: nameText.fontFamily(),
        fontStyle: nameText.fontStyle(),
        fill: nameText.fill(),
        width: nameText.width(),
        height: nameText.height(),
        templateImage: bgImageObj.src // base64 image
    };
    // For demo: save to localStorage
    localStorage.setItem('certificatePlacement', JSON.stringify(placement));
    document.getElementById('saveStatus').textContent = "Placement saved!";
    setTimeout(() => document.getElementById('saveStatus').textContent = "", 2000);
});
