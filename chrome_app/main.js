var width = screen.width;
var height = screen.height;

var appWin = chrome.app.window.current();
var isFullscreen = false;

appWin.onFullscreened.addListener(function () { 
    console.log(appWin.isFullscreen());
    isFullscreen = appWin.isFullscreen();
});

appWin.onBoundsChanged.addListener(function () {
    var bounds = appWin.getBounds();
    
    // for some reason appWin.isFullScreen() returns true when exiting
    // fullscreen mode
    if (bounds.top !== 0) {
        isFullscreen = false;
    }
});


function createCanvas(opacity) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.top = 0;
    if (opacity) {
        canvas.style.opacity = opacity;
    }
    document.body.appendChild(canvas);
    return canvas;
}

var layer_opacity = 1.0;

var canvas1 = createCanvas();
var canvas2 = createCanvas(layer_opacity);

var ctx1 = canvas1.getContext('2d');

ctx1.globalAlpha = layer_opacity;
ctx1.fillStyle = 'cyan';
ctx1.fillRect(0,0,width,height);

var ctx2 = canvas2.getContext('2d');
ctx2.globalAlpha = 0.25;

CanvasRenderingContext2D.prototype.fillCircle = function (x,y,r) {
    this.beginPath();
    this.arc(x,y,r,0,2*Math.PI,false);
    this.fill();
};

var radius = 0;
var previousPressure = 0;

var offsetX = 0;
var offsetY = 0;
var initX = 0, initY = 0;


var port = chrome.runtime.connectNative('com.kevinb.wacom');
port.onMessage.addListener(function(msg) {
    radius = 3 * msg.pressure;
    
    if (previousPressure > 0 && msg.pressure == 0) {
        ctx1.drawImage(canvas2, 0, 0);
        ctx2.clearRect(0,0,width,height);
    }
    
    if (down && !document.hidden) {
        var x = msg.x - window.screenLeft;
        var y = 900 - msg.y - window.screenTop;
        if (!isFullscreen) {
            y -= 22;
        }

        var dist = distance(lastX, lastY, x, y);

        if (dist > spacing) {
            var interim = spacing;
            while (interim < dist) {
                var frac = interim / dist;
                var one_minus_frac = 1.0 - frac;
                var pressure = one_minus_frac * previousPressure + frac * msg.pressure;
                var inter_x = one_minus_frac * lastX + frac * x;
                var inter_y = one_minus_frac * lastY + frac * y;
                ctx2.fillCircle(inter_x, inter_y, 3 * pressure);
                interim += spacing;
            }
        }

        lastX = x;
        lastY = y;
    }
    
    if (previousPressure == 0 && msg.pressure > 0) {
        lastX = msg.x - window.screenLeft;
        lastY = 900 - msg.y - window.screenTop;
        if (!isFullscreen) {
            lastY -= 22;
        }
        
        offsetX = lastX - initX;
        offsetY = lastY - initY;
    }

    previousPressure = msg.pressure;
});

var down = false;
var spacing = 1;
var lastX, lastY;
var distance = function(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
};


var canvas = document.createElement('canvas');
canvas.width = 160;
canvas.height = 150;
canvas.style.position = 'absolute';
canvas.style.left = 0;
canvas.style.top = 0;

document.body.appendChild(canvas);

var colorCtx = canvas.getContext('2d');
var overlay = document.createElement('img');
overlay.onload = function () {
    colorCtx.fillStyle = 'red';
    colorCtx.fillRect(0,0,150,150);
    colorCtx.drawImage(overlay, 0, 0);
};
overlay.src = 'colorpicker_overlay.png';

var rainbow = document.createElement('img');
rainbow.onload = function () {
    colorCtx.drawImage(rainbow, 150, 0);
};
rainbow.src = 'rainbow.png';

document.addEventListener('mousedown', function (e) {
    // TODO: extract a get pixel color methodi
    var imageData, data, color;
    
    if (e.pageX < 150 && e.pageY < 150) {
        imageData = colorCtx.getImageData(e.pageX, e.pageY, 1, 1);
        data = imageData.data;
        color = 'rgb(' + data[0] + ',' + data[1] + ',' + data[2] + ')';
        ctx2.fillStyle = color;
    } else if (e.pageX > 150 && e.pageX < 160 && e.pageY < 150) {
        imageData = colorCtx.getImageData(e.pageX, e.pageY, 1, 1);
        data = imageData.data;
        color = 'rgb(' + data[0] + ',' + data[1] + ',' + data[2] + ')';

        colorCtx.fillStyle = color;
        colorCtx.fillRect(0,0,150,150);
        colorCtx.drawImage(overlay, 0, 0);
    }
    down = true;
});

document.addEventListener('mouseup', function (e) {
    if (down) {
        down = false;
    }
});

