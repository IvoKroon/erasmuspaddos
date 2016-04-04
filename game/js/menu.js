/**
 * Created by Sandervspl on 3/16/16.
 */

// globals
var COLOR_RED_RGB   = "rgb(255,0,0)",
    COLOR_GREEN_RGB = "rgb(0,255,0)";

var canvas = document.getElementById("menu"),
    ctx    = canvas.getContext('2d');

var _screenID = 0;

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

function loadjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", filename);
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        fileref=document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}





// Button Constructor
function Button(id, x, y, w, h, fill) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.fill = fill;
    this.isHovered = false;
    this.isPressed = false;

    return this;
}

// transition from red to green
Button.prototype.colorTransition = function() {
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
Button.prototype.press = function() {
    if (!this.isPressed) {
        _screenID++;
        this.isPressed = true;
    }
};


// button is being hovered by pointer or mouse
Button.prototype.hovered = function() {
    if (this.isHovered) {
        this.colorTransition();

        if (this.fill === COLOR_GREEN_RGB) {
            this.press();
        }
    }
};


// render/draw a button on the canvas
Button.prototype.render = function() {
    this.hovered();

    ctx.beginPath();
    ctx.fillStyle = this.fill;
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();
};





function Screen(id, buttonNum) {
    this.id = id;
    this.buttonNum = buttonNum;
    this.buttons = [];

    this.listeners();
    this.create(arguments);
}


Screen.prototype.create = function(arg) {
    for (var i = 2, j = 0; i < arg.length; i++) {
        var b = new Button(j, arg[i], arg[++i], 100, 100, "rgba(255,0,0,1)");
        j++;

        this.buttons.push(b);
    }
};


Screen.prototype.render = function() {
    for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].render();
    }
};


// checks if our input is inside a rectangle
Screen.prototype.collisionRect = function(x, y, x1, y1, x2, y2) {
    if (x > x1 && x < x2) {
        if (y > y1 && y < y2) {
            return true;
        }
    }

    return false;
};


// browser events
Screen.prototype.listeners = function() {
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
                didHitButton = that.collisionRect(clickX, clickY, bx1, by1, bx2, by2);

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
                didHitButton = that.collisionRect(clickX, clickY, bx1, by1, bx2, by2);

            if (didHitButton) {
                b.isHovered = true;
            } else {
                // reset variables if not hovered anymore
                if (b.fill !== COLOR_RED_RGB) {
                    b.fill = COLOR_RED_RGB;
                    b.isHovered = false;
                    b.isPressed = false;
                }
            }
        }
    }, false);
};





// Menu Constructor
function Menu(x, y, w, h, b) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.buttonsNum = b;
    this.buttons = [];
    this.screenNum = 0;
    this.screens = [];

    this.createScreens();
    this.render();

    return this;
}


Menu.prototype.createScreens = function() {
    // screen 1
    var screenLayout = {
        x1: canvas.width/2 - 100,
        y1: canvas.height/2,

        x2: canvas.width/2 + 100,
        y2: canvas.height/2
    };

    var s = new Screen(0, 2, screenLayout.x1, screenLayout.y1, screenLayout.x2, screenLayout.y2);
    this.screens.push(s);


    // screen 2
    screenLayout = {
        x1: canvas.width/2 - 100,
        y1: canvas.height/2 - 100,

        x2: canvas.width/2 + 100,
        y2: canvas.height/2 - 100
    };

    s = new Screen(0, 2, screenLayout.x1, screenLayout.y1, screenLayout.x2, screenLayout.y2);
    this.screens.push(s);

    this.screenNum = this.screens.length;
};


// render the buttons in our array on screen
Menu.prototype.render = function() {
    var that = this;

    // loop
    requestAnimFrame(function() {
        that.render();
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // render current screen
    if (_screenID < this.screenNum)
        this.screens[_screenID].render();
};


// create menu (x, y, width, height, buttons)
// this triggers the code
var menu = new Menu(0, 0, canvas.width, canvas.height, 4);