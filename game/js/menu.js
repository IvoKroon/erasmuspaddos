/**
 * Created by Sandervspl on 3/16/16.
 */

// globals
var COLOR_RED_RGB   = "rgb(255,0,0)",
    COLOR_GREEN_RGB = "rgb(0,255,0)";

window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();





// Button Constructor
function Button(id, x, y, w, h, fill) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.fill = fill;
    this.isHovered = false;

    return this;
}

// transition from red to green
Button.prototype.colorTransition = function () {
    // pull apart an RGB string and put each value inside a color variable
    var clr   = this.fill,
        rgb   = clr.substring(clr.indexOf('(') + 1, clr.lastIndexOf(')')).split(/,\s*/),
        red   = parseInt(rgb[0]),
        green = parseInt(rgb[1]),
        blue  = parseInt(rgb[2]);

    // decrease/increase or set at a min/max value depending on current color value
    red = (red > 0) ? red -= 9 : red = 0;
    green = (green < 200) ? green += 3 : green = 255;

    // set button's fill value and render this later
    this.fill = "rgb(" + red + "," + green + "," + blue + ")";
};


// button press action
Button.prototype.press = function () {
    alert("button " + this.id + " pressed!");
};


// button is being hovered by pointer or mouse
Button.prototype.hovered = function () {
    if (this.isHovered) {
        this.colorTransition();

        if (this.fill === COLOR_GREEN_RGB) {
            console.log("a");
            this.press();
        }
    }
};


// render/draw a button on the canvas
Button.prototype.render = function (ctx) {
    this.hovered();

    ctx.beginPath();
    ctx.fillStyle = this.fill;
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();
};





// Menu Constructor
function Menu(canvasID, x, y, w, h, b) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.buttonsNum = b;
    this.buttons = [];

    this.canvas = document.getElementById(canvasID);
    this.ctx    = this.canvas.getContext('2d');

    this.listeners();
    this.create();
    this.render();

    return this;
}


// browser events
Menu.prototype.listeners = function () {
    var that = this;

    document.addEventListener('click', function(e) {
        var clickX  = e.clientX,
            clickY  = e.clientY;

        for (var i = 0; i < that.buttons.length; i++) {
            var b   = that.buttons[i],
                bx1 = b.x,
                by1 = b.y,
                bx2 = b.x + b.width,
                by2 = b.y + b.height,
                didHitButton = Menu.prototype.collisionRect(clickX, clickY, bx1, by1, bx2, by2);

                if (didHitButton) {
                    b.press();
                }
        }
    }, false);

    document.addEventListener('mousemove', function(e) {
        var clickX  = e.clientX,
            clickY  = e.clientY;

        for (var i = 0; i < that.buttons.length; i++) {
            var b   = that.buttons[i],
                bx1 = b.x,
                by1 = b.y,
                bx2 = b.x + b.width,
                by2 = b.y + b.height,
                didHitButton = Menu.prototype.collisionRect(clickX, clickY, bx1, by1, bx2, by2);

            if (didHitButton) {
                b.isHovered = true;
            } else {
                // reset to red if not hovered
                if (b.fill !== COLOR_RED_RGB) {
                    b.fill = COLOR_RED_RGB;
                    b.isHovered = false;
                }
            }
        }
    }, false);
};


// checks if our input is inside a rectangle
Menu.prototype.collisionRect = function (x, y, x1, y1, x2, y2) {
    if (x > x1 && x < x2) {
        if (y > y1 && y < y2) {
            return true;
        }
    }

    return false;
};


// create the buttons on our canvas and put them in an array
Menu.prototype.create = function () {
    for (var i = 0; i < this.buttonsNum; i++) {
        var h = 50 + i * 25,
            w = 50 + i * 25,
            x = 50 + w * i,
            y = this.canvas.height/2;


        var b = new Button(i, x, y, h, w, COLOR_RED_RGB);

        this.buttons.push(b);
    }
};


// render the buttons in our array on screen
Menu.prototype.render = function () {
    var that = this;

    // loop
    requestAnimFrame(function() {
        that.render();
    });

    for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].render(this.ctx);
    }
};


// create menu (canvasID, x, y, width, height, buttons)
// this triggers the code
var menu = new Menu("menu", 0, 0, 1280, 800, 4);