/**
 * Created by Sandervspl on 4/4/16.
 */

// globals
var POINTER_TRAIL_MAX = 10,
    HANDS_NUM_MAX = 1,
    STRINGS_NUM_MAX = 16;

var iosocket = io.connect("http://localhost:3000");

var COLOR_RED_RGB   = "rgb(255,0,0)",
    COLOR_GREEN_RGB = "rgb(0,255,0)";

var _screenID = 0,
    SCREEN_ID_MENU = 0,
    SCREEN_ID_COUNTDOWN = 1,
    SCREEN_ID_STRINGS = 2,
    SCREEN_ID_GAME_OVER = 3;

var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

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

function clearRect() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}




function Stage(id, input) {
    this.el = document.getElementById(id);
    this.position();
    this.listeners();
    this.hitZones = [];
    this.prevTime = Date.now();
    this.timeStarted = false;
    this.timeDone = false;
    this.input = input;
    this.loadTime = Date.now();

    return this;
}


Stage.prototype.position = function() {
    var offset = this.offset();
    this.positionTop = Math.floor(offset.left);
    this.positionLeft = Math.floor(offset.top);
};


Stage.prototype.offset = function() {
    var _x, _y,
        el = this.el;

    if (typeof el.getBoundingClientRect !== "undefined") {
        return el.getBoundingClientRect();
    } else {
        _x = 0;
        _y = 0;

        while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
            _x += el.offsetLeft;
            _y += el.offsetTop;
            el = el.offsetParent;
        }

        return { top: _y - window.scrollY, left: _x - window.scrollX };
    }
};


Stage.prototype.listeners = function() {
    var that = this;

    that.dragging = false;
    that.limit = false;

    window.addEventListener('resize', function() {
        that.position();
    }, false);

    window.addEventListener('scroll', function() {
        that.position();
    }, false);

    this.el.addEventListener('mousemove', function(e) {
        var x = e.clientX - that.positionTop,
            y = e.clientY - that.positionLeft;

        that.hitZones.forEach(function(zone) {
            that.checkPoint(0, x, y, zone);
        });

        that.dragging = true;
        that.prev = [x, y];

        that.input[0].x = x;
        that.input[0].y = y;
    }, false);
};


Stage.prototype.addRect = function(id) {
    var el = document.getElementById(id),
        rect = new Rect(el.offsetLeft,
            el.offsetTop,
            el.offsetWidth,
            el.offsetHeight
        );
    rect.el = el;

    this.hitZones.push(rect);

    return rect;
};


Stage.prototype.addString = function(rect, string) {
    rect.string = string;

    this.hitZones.push(rect);
    return rect;
};


Stage.prototype.givePointerColorOfString = function(id, string) {
    for (var i = 0; i < POINTER_TRAIL_MAX; i++) {
        var r = string.red,
            g = string.green,
            b = string.blue,
            a = 0.4;

        if (i == POINTER_TRAIL_MAX - 1)
            a = 1.0;

        this.input[id].pointers[i].fill = "rgba(" + r + "," + g + "," + b + "," + a + ")";
    }
};


Stage.prototype.checkPoint = function(id, x, y, zone) {
    if (zone.inside(x, y)) {
        zone.string.strum();
        this.givePointerColorOfString(id, zone.string);
    }
};


Stage.prototype.LeapMotionMoved = function(id, handX, handY) {
    var that = this;

    this.hitZones.forEach(function(zone) {
        that.checkPoint(id, handX, handY, zone);
    });
};


Stage.prototype.startTimer = function() {
    var t = document.getElementsByClassName('timer');

    for (var i = 0; i < t.length; i++) {
        t[i].style.display = "block";
    }

    this.timeStarted = true;
};


Stage.prototype.timerDone = function() {
    if (!this.timeDone) {
        this.timeDone = true;
    }
};


Stage.prototype.timer = function() {
    if (!this.timeStarted)
        this.startTimer();

    var curTime = Date.now();

    if (curTime - this.prevTime > 1000) {
        var min  = document.getElementById('timer2'),
            sec1 = document.getElementById('timer4'),
            sec2 = document.getElementById('timer5'),
            m    = parseInt(min.innerHTML),
            s    = parseInt(sec1.innerHTML),
            ss   = parseInt(sec2.innerHTML);

        // END TIMER + RECORDING
        if (m == 0 && s == 0 && ss == 0) {
            this.timerDone();
            return;
        }

        if (m == 1) {
            m = 0;
        }

        if (s == 0 && min.innerHTML === "1") {
            s = 6;
        }

        if (ss == 0) {
            s--;
            ss = 9;
        } else {
            ss--;
        }

        min.innerHTML  = m + "";
        sec1.innerHTML = s + "";
        sec2.innerHTML = ss + "";

        this.prevTime = curTime;
    }
};


Stage.prototype.clearScreen = function() {
    var t = document.getElementsByClassName('timer');

    for (var i = 0; i < t.length; i++) {
        t[i].style.display = "none";
    }

    clearRect();
};




function Rect(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    return this;
}


Rect.prototype.inside = function(x,y) {
    return x >= this.x && y >= this.y
        && x <= this.x + this.width
        && y <= this.y + this.height;
};




function HarpString(rect, id) {
    this.id = id;
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;

    this._strumForce = 0;
    this.a = 0;
    this.sound = new Audio("sounds/Soundfiles/Toon" + (this.id + 1) + ".mp3");
    this.sound.preload = "auto";

    this.red = 0;
    this.green = 0;
    this.blue = 0;
    this.color = "rgb(" + this.r + "," + this.g + "," + this.b + ")";

    this.isGlowing = false;
    this.shadowColor = "";
    this.shadowBlur = 0;
}


HarpString.prototype.strum = function() {
    this._strumForce = 20;
    this.isGlowing = true;
    this.playTone();
    this.sendDataToArduino();
};


HarpString.prototype.sendDataToArduino = function() {
    var val = this.id + '';
    iosocket.emit('stringtouched', val);
};


HarpString.prototype.playTone = function() {
    if (this.sound.ended) {
        this.sound.play();
    } else {
        if (this.sound.currentTime > 0.1) {
            this.sound.currentTime = 0.1;
        } else {
            this.sound.play();
        }
    }
};


HarpString.prototype.stringColor = function(stringNum) {
    var r = Math.floor(Math.sin(.3 * stringNum + 2) * 127 + 128),
        g = Math.floor(Math.sin(.3 * stringNum + 4) * 127 + 128),
        b = Math.floor(Math.sin(.3 * stringNum + 6) * 127 + 128);

    this.red = r;
    this.green = g;
    this.blue = b;
    this.color = "rgb(" + r + "," + g + "," + b + ")";

    return this.color;
};


HarpString.prototype.glowStringColor = function () {
    var mult = 1.2,
        r = this.red,
        g = this.green,
        b = this.blue;

    // determine what color we are
    // increase it by 20%
    if (r >= g && r >= b) {
        r *= mult;
        if (r > 255)
            r = 255;
    }

    if (g >= r && g >= b) {
        g *= mult;
        if (g > 255)
            g = 255;
    }

    if (b >= r && b >= g) {
        b *= mult;
        if (b > 255)
            b = 255;
    }

    return "rgb(" + r + "," + g + "," + b + ")";
};


HarpString.prototype.render = function(stringNum) {
    // determine color of glow
    this.shadowColor = this.glowStringColor();

    // light up strings when strum
    this.stringGlowBrightness();

    ctx.strokeStyle = this.stringColor(stringNum);
    ctx.shadowColor = this.shadowColor;
    ctx.shadowBlur  = this.shadowBlur;

    // render strings
    ctx.lineWidth = 15 - (0.65 * stringNum);
    ctx.beginPath();

    // start point
    ctx.moveTo(this.x, this.y);
    ctx.bezierCurveTo(
        // first curve point
        this.x + Math.sin(this.a) * this._strumForce,
        this.y + this.height * 0.3,

        // second curve point
        this.x + Math.sin(this.a) * this._strumForce,
        this.y + this.height * 0.6,

        // end point
        this.x,
        this.y + this.height
    );
    ctx.stroke();
    ctx.closePath();

    this._strumForce *= 0.985;
    this.a += 0.8;
};


// control brightness of the glow of the string during and after strum
HarpString.prototype.stringGlowBrightness = function() {
    if (this.sound.ended)
        this.isGlowing = false;

    if (this.isGlowing) {
        this.shadowBlur = 100;
    } else {
        this.shadowBlur = this.shadowBlurVal();
    }
};


HarpString.prototype.shadowBlurVal = function() {
    var reduceB = 2;

    return (this.shadowBlur > reduceB) ? this.shadowBlur - reduceB : this.shadowBlur - this.shadowBlur;
};




function Pointer(id, x, y, start, end, dir, fill, stroke, lwidth) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.baseRadius = { min: 15, max: 18 };
    this.radius = this.baseRadius.min;
    this.start = start;
    this.end = end;
    this.direction = dir;
    this.fill = fill;
    this.strokeStyle = stroke;
    this.lineWidth = lwidth;
    this.tick = 0;

    return this;
}


Pointer.prototype.getPos = function (normalizedPosition) {
    this.x = canvas.width * normalizedPosition[0];
    this.y = canvas.height * (1 - normalizedPosition[1]);

    return { x: this.x,
        y: this.y };
};


Pointer.prototype.draw = function() {
    ctx.shadowBlur = 0;
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.strokeStyle;
    ctx.fillStyle = this.fill;
    ctx.fill();
    ctx.stroke();
};


Pointer.prototype.render = function() {
    // pulse
    var osc = 0.5 + Math.sin(this.tick / 13);
    this.radius = this.baseRadius.min + this.id + ((this.baseRadius.max - this.baseRadius.min) * osc);

    this.tick++;
    if (this.tick > Number.MAX_VALUE)
        this.tick = 0;

    // create circle and position it
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, this.start, this.end, this.direction);
    ctx.closePath();
    this.draw();
};




function Input(x, y) {
    this.x = x;
    this.y = y;

    // create pointer + trail
    this.pointers = this.create();

    return this;
}


Input.prototype.create = function() {
    var a = [];
    var fill, stroke, lineWidth;

    for (var i = 0; i < POINTER_TRAIL_MAX; i++) {
        fill = "rgba(255,255,255,0.4)";
        stroke = "rgba(0,0,0,0)";
        lineWidth = 0;

        if (i == POINTER_TRAIL_MAX - 1) {
            fill = "rgba(0,100,255,1)";
            stroke = "rgba(255,255,255,1)";
            lineWidth = 10;
        }

        var h = new Pointer(i, this.x, this.y, 25, 0, 2 * Math.PI, fill, stroke, lineWidth);
        a.push(h);
    }

    return a;
};


Input.prototype.render = function() {
    var p = this.pointers;

    for (var i = 0; i < POINTER_TRAIL_MAX; i++) {
        var p1 = p[i],
            p2 = p[i - 1];

        p[p.length - 1].x = this.x;
        p[p.length - 1].y = this.y;

        if (i > 0) {
            p2.x += (p1.x - p2.x) * 0.5;
            p2.y += (p1.y - p2.y) * 0.5;
        }

        p1.render(i);
    }
};




function StringInstrument(stageID) {
    this.strings = [];

    this.input = [];
    this.createInput();

    this.stage = new Stage(stageID, this.input);

    this.clr = new Leap.Controller();
    this.clr.connect();

    this.create();

    // these will both continue to loop
    this.renderLeapMotion();
    this.render();

    return this;
}


StringInstrument.prototype.create = function() {
    for (var i = 0; i < STRINGS_NUM_MAX; i++) {
        var srect = new Rect(50 + i * 78, 0, 10, 800);
        var s     = new HarpString(srect, i);

        this.stage.addString(srect, s);
        this.strings.push(s);
    }
};


StringInstrument.prototype.createInput = function() {
    for (var i = 0; i < HANDS_NUM_MAX; i++) {
        var x = -50 + canvas.width/2 + i * 100;
        var y = canvas.height/2;
        var inp = new Input(x, y);
        this.input.push(inp);
    }
};


StringInstrument.prototype.renderLeapMotion = function() {
    var that = this;

    this.clr.on("frame", function (frame) {
        if (frame.pointables.length > 0) {
            for (var i = 0, len = frame.hands.length; i < len; i++)
            {
                // hand limit
                var curHands = i + 1;
                if (curHands > HANDS_NUM_MAX)
                    return;

                //Get a pointable (hand) and normalize the index finger's dip position
                var hand = frame.hands[i],
                    interactionBox = frame.interactionBox,
                    normalizedPosition = interactionBox.normalizePoint(hand.indexFinger.dipPosition, true);

                // Convert the normalized coordinates to span the canvas
                var handPos = that.input[i].pointers[POINTER_TRAIL_MAX - 1].getPos(normalizedPosition);

                // store main pointer's info in its input object
                that.input[i].x = handPos.x;
                that.input[i].y = handPos.y;

                // loop through all objects
                for (var j = 0, len2 = frame.hands.length; j < len2; j++)
                {
                    // only check string collision inside canvas
                    var isInRange = handPos.x > 0 && handPos.y < canvas.width;

                    if (isInRange && that.stage.timeStarted && _screenID == SCREEN_ID_STRINGS) {
                        that.stage.LeapMotionMoved(i, handPos.x, handPos.y);
                    }
                }
            }
        }
    });
};


StringInstrument.prototype.render = function() {
    // clear screen
    clearRect();

    if (_screenID > SCREEN_ID_STRINGS)
        return;

    var that = this;

    // loop
    requestAnimFrame(function() {
        if (_screenID == SCREEN_ID_STRINGS)
            that.render();
    });

    // timer
    this.stage.timer();

    // render strings
    for (var i = 0; i < STRINGS_NUM_MAX; i++) {
        this.strings[i].render(i);
    }

    // render pointers
    for (i = 0; i < HANDS_NUM_MAX; i++) {
        this.input[i].render();
    }
};

















// Button Constructor
function Button(id, x, y, w, h, text, fill) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.fill = fill;
    this.text = text;
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


// button is being hovered by pointer or mouse
Button.prototype.hovered = function() {
    if (this.isHovered) {
        this.colorTransition();

        if (this.fill === COLOR_GREEN_RGB) {
            this.press();
        }
    }
};


Button.prototype.unhover = function() {
    this.isHovered = false;
    this.fill = COLOR_RED_RGB;
};


// button press action
Button.prototype.press = function() {
    if (!this.isPressed) {
        _screenID++;
        this.isPressed = true;
    }
};


// render/draw a button on the canvas
Button.prototype.render = function() {
    this.hovered();

    ctx.beginPath();
    ctx.fillStyle = this.fill;
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.text, this.x + this.width/2, this.y + this.height/2 + 10);
};





function Screen(id, buttonNum) {
    this.id = id;
    this.buttonNum = buttonNum;
    this.buttons = [];

    this.listeners();
    this.create(arguments);

    return this;
}


Screen.prototype.create = function(arg) {
    for (var i = 4, j = 0; i < arg.length; i++)
    {
        // id, x, y, width, height, text, fillStyle
        // buttons share same size with each other
        var b = new Button(j, arg[i], arg[++i], arg[2], arg[3], arg[++i], "rgba(255,0,0,1)");
        j++;

        this.buttons.push(b);
    }
};


Screen.prototype.render = function() {
    for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].render();
    }
};


Screen.prototype.unhover = function() {
    for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].isHovered = false;
        this.buttons[i].fill = COLOR_RED_RGB;
    }
};


// checks if our input is inside a rectangle
Screen.prototype.collisionRect = function(x, y) {
    for (var i = 0; i < this.buttons.length; i++) {
        var res = false;
        var b   = this.buttons[i],
            bx1 = b.x,
            by1 = b.y,
            bx2 = b.x + b.width,
            by2 = b.y + b.height;

        if (x > bx1 && x < bx2) {
            if (y > by1 && y < by2) {
                res = true;
            }
        }

        // unhover
        if (!res && b.isHovered) {
            b.isHovered = false;
            b.unhover();
        }

        // hover
        if (res && !b.isHovered) {
            b.isHovered = true;
        }
    }
};


// browser events
Screen.prototype.listeners = function() {
    var that = this;

    window.addEventListener('resize', function() {
        that.position();
    }, false);

    window.addEventListener('scroll', function() {
        that.position();
    }, false);

    document.addEventListener('mousemove', function(e) {
        var clickX  = e.clientX,
            clickY  = e.clientY;

            that.collisionRect(clickX, clickY);
    }, false);
};





// Menu Constructor
function Menu(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.buttons = [];
    this.screenNum = 0;
    this.screens = [];

    this.createScreens();
    this.render();

    return this;
}

// MAKE SCREEN HERE
// YOU CAN ADD AS MANY BUTTONS AS YOU LIKE
Menu.prototype.createScreens = function() {
    // screen 1
    var screenLayout = {
        // button dimensions
        w:  200,
        h:  100,

        // button 1 position
        x1: canvas.width/2 - 100,
        y1: canvas.height/2,
        text1: "START"
    };

    // id, button amount, width, height, x, y, text
    var s = new Screen(0, 1,
        screenLayout.w, screenLayout.h,
        screenLayout.x1, screenLayout.y1,
        screenLayout.text1);
    this.screens.push(s);

    this.screenNum = this.screens.length;
};


// render the buttons in our array on screen
Menu.prototype.render = function() {
    var that = this;

    // loop
    requestAnimFrame(function() {
        // only render menu when we are not on strings screen
        if (_screenID < SCREEN_ID_COUNTDOWN)
            that.render();
    });

    clearRect();

    // render current screen
    if (_screenID < this.screenNum)
        this.screens[_screenID].render();
};







function Countdown(prevTime, tick, time) {
    this.prevTime = prevTime;
    this.tick = tick;
    this.time = time;

    this.loop();
}

Countdown.prototype.draw = function() {
    if (isNaN(this.time)) {
        return;
    }

    clearRect();

    var curTime = Date.now(),
        diff = curTime - this.prevTime;

    if (diff > 1000) {
        this.time--;

        // countdown is over
        if (this.time == 0) {
            this.time = "";
            _screenID++;
        }

        this.tick = 0;
        this.prevTime = Date.now();
    }

    this.tick += 3;
    var size = 280 - this.tick;

    ctx.font = size + "px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(this.time, canvas.width/2, canvas.height/2);
};


Countdown.prototype.loop = function() {
    var that = this;

    if (this.time <= 0)
        return;

    requestAnimFrame(function() {
        that.loop();
    });

    this.draw();
};








function Game() {
    this.hasGameStarted = false;
    this.hasCountdownStarted = false;
    this.menu = "";
    this.harp = "";
    this.countdown = "";

    this.startMenu();

    this.input = [];
    this.createInput();

    this.clr = new Leap.Controller();
    this.clr.connect();

    this.renderLeapMotion();
    this.render();

    var that = this;
    iosocket.on('client:upload-finished', function(data) {
        var res = JSON.parse(data);
        that.gameOver(res.code);
    });

    return this;
}


Game.prototype.createInput = function() {
    for (var i = 0; i < HANDS_NUM_MAX; i++) {
        var x = canvas.width/2 - 300;
        var y = canvas.height/2;

        var input = new Input(x, y);
        this.input.push(input);
    }
};


Game.prototype.renderLeapMotion = function() {
    if (_screenID > SCREEN_ID_MENU)
        return;

    var that = this;

    this.clr.on("frame", function (frame) {
        if (frame.pointables.length > 0) {
            for (var i = 0, len = frame.hands.length; i < len; i++)
            {
                // hand limit
                var curHands = i + 1;
                if (curHands > HANDS_NUM_MAX)
                    return;

                //Get a pointable (hand) and normalize the index finger's dip position
                var hand = frame.hands[i],
                    interactionBox = frame.interactionBox,
                    normalizedPosition = interactionBox.normalizePoint(hand.indexFinger.dipPosition, true);

                // Convert the normalized coordinates to span the canvas
                var handPos = that.input[i].pointers[POINTER_TRAIL_MAX - 1].getPos(normalizedPosition);

                // store main pointer's info in its input object
                that.input[i].x = handPos.x;
                that.input[i].y = handPos.y;

                // check if we hit something
                that.menu.screens[_screenID].collisionRect(that.input[i].x, that.input[i].y);
            }
        }
    });
};


Game.prototype.startMenu = function() {
    this.menu = new Menu(0, 0, canvas.width, canvas.height);
};


Game.prototype.startGame = function() {
    HANDS_NUM_MAX = 2;
    this.harp = new StringInstrument('canvas');
    iosocket.emit('server:start-recording', 'record!!');
};

Game.prototype.startCountdown = function() {
    this.countdown = new Countdown(Date.now(), 0, 3);
};

Game.prototype.gameOver = function(code) {
    _screenID++;
    this.clr.disconnect();
    clearRect();
    this.harp.stage.clearScreen();

    ctx.font = "120px Arial";
    var id = "Uw ID: " +  code;
    ctx.fillText(id, canvas.width/2, canvas.height/2);

    setTimeout(this.doOver, 10000);
};

Game.prototype.doOver = function() {
    location.reload();
};


Game.prototype.render = function() {
    var that = this;

    // loop
    requestAnimFrame(function() {
        that.render();
    });

    // decide what screen to display
    if (_screenID == SCREEN_ID_COUNTDOWN && !this.hasCountdownStarted) {
        this.startCountdown();
        this.hasCountdownStarted = true;
    }
    else if (_screenID == SCREEN_ID_STRINGS && !this.hasGameStarted) {
        this.startGame();
        this.hasGameStarted = true;
    }

    if (_screenID == SCREEN_ID_MENU) {
        for (var i = 0; i < HANDS_NUM_MAX; i++) {
            this.input[i].render();
        }
    }
};

var game = new Game();