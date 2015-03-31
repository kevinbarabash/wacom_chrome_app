function createCanvas(opacity) {
    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.top = 0;
    if (opacity) {
        canvas.style.opacity = opacity;
    }
    document.body.appendChild(canvas);
    return canvas;
}

var canvas1 = createCanvas();
var canvas2 = createCanvas(0.5);

var ctx1 = canvas1.getContext('2d');

ctx1.fillStyle = 'cyan';
ctx1.fillRect(0,0,window.innerWidth,window.innerHeight);

var ctx2 = canvas2.getContext('2d');

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
        down = false;
        ctx1.globalAlpha = 0.5;
        ctx1.drawImage(canvas2, 0, 0);
        ctx2.clearRect(0,0,window.innerWidth,window.innerHeight);
    }
    
    if (down) {
        var x = msg.x - window.screenLeft;
        var y = 900 - msg.y - window.screenTop - 22;

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
        //ctx2.fillCircle(e.pageX, e.pageY, radius);

        lastX = x;
        lastY = y;
    }
    
    if (previousPressure == 0 && msg.pressure > 0) {
        lastX = msg.x - window.screenLeft;
        lastY = 900 - msg.y - window.screenTop - 22;
        down = true;
        
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

//document.addEventListener('mousedown', function (e) {
//    down = true;
//});
//
//document.addEventListener('mouseup', function (e) {
//    if (down) {
//        down = false;
//    }
//});
