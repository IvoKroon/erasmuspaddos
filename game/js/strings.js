/**
 * Created by Sandervspl on 3/16/16.
 */

// globals
var HAND_Z_MIN = 700,
    HAND_Z_MAX = 1800;

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




function Stage(id) {
    this.el = document.getElementById(id);
    this.position();
    this.listeners();
    this.hitZones = [];
    this.prevTime = Date.now();

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
            that.checkPoint(x, y, zone);
        });

        that.dragging = true;
        that.prev = [x, y];
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


Stage.prototype.checkPoint = function(x, y, zone) {
    if (zone.inside(x, y)) {
        zone.string.strum();
    }
};


Stage.prototype.LMMoved = function(handX, handY) {
    var that = this;

    this.hitZones.forEach(function(zone) {
        that.checkPoint(handX, handY, zone);
    });
};


Stage.prototype.timer = function() {
    var curTime = Date.now();

    if (curTime - this.prevTime > 1000) {
        var min  = document.getElementById('timer2'),
            sec1 = document.getElementById('timer4'),
            sec2 = document.getElementById('timer5'),
            m    = parseInt(min.innerHTML),
            s    = parseInt(sec1.innerHTML),
            ss   = parseInt(sec2.innerHTML);

        if (m == 0 && s == 0 && ss == 0)
            return;

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

    return "rgb(" + r + "," + g + "," + b + ")";
};


HarpString.prototype.glowStringColor = function () {
    var mult = 1.2,
        r = this.red,
        g = this.green,
        b = this.blue;

    //determine what color we are
    //increase it by 20%
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


HarpString.prototype.render = function(ctx, stringNum) {
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




function Circle(x, y, z, radius, start, end, dir, opacity, fill) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.radius = radius;
    this.start = start;
    this.end = end;
    this.direction = dir;
    this.opacity = opacity;
    this.fill = fill;

    return this;
}


Circle.prototype.render = function(ctx) {
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.fillStyle = this.fill;
    ctx.arc(this.x, this.y, this.radius, this.start, this.end, false);
    ctx.fill();
    ctx.closePath();
};




function Pointer(x, y, z, radius, start, end, dir, opacity, fill) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.radius = radius;
    this.start = start;
    this.end = end;
    this.direction = dir;
    this.opacity = opacity;
    this.fill = fill;

    this.trailNum = 10;
    this.trails = [];

    // this.createTrail(this.trailNum);

    return this;
}


Pointer.prototype.createTrail = function() {
    for (var i = 0; i < this.trailNum; i++) {
        var r = Math.floor(Math.random() * 255),
            g = Math.floor(Math.random() * 255),
            b = Math.floor(Math.random() * 255),
            color = "rgb(" + r + "," + g + "," + b + ")";

        var p = new Circle(this.x, this.y, HAND_Z_MIN, 25, 25, 0, 2 * Math.PI, 0, color);
        this.trails.push(p);

        console.log("Pointer x: " + this.x + " Added trail #" + i +  " with colors: " + color);
    }
};




function Input(amount, canvasID) {
    this.hands = [];
    this.handsNum = amount;

    this.canvas = document.getElementById(canvasID);
    this.ctx = this.canvas.getContext('2d');

    this.create();

    return this;
}


Input.prototype.create = function() {
    var x = this.canvas.width/2 - 82,
        y = this.canvas.height/2;

    var hand = new Pointer(x, y, HAND_Z_MIN, 25, 25, 0, 2 * Math.PI, 0, "rgb(0,0,0)");
    this.hands.push(hand);

    x = this.canvas.width/2 + 74;
    y = this.canvas.height/2;

    hand = new Pointer(x, y, HAND_Z_MIN, 25, 25, 0, 2 * Math.PI, 0, "rgb(0,0,0)");
    this.hands.push(hand);
};


Input.prototype.getPos = function (canvas, normalizedPosition, id) {
    var pos = [];

    this.hands[id].x = canvas.width * normalizedPosition[0];
    this.hands[id].y = canvas.height * (1 - normalizedPosition[1]);
    this.hands[id].z = (canvas.width + canvas.height) * normalizedPosition[2];

    pos.push(this.hands[id].x);
    pos.push(this.hands[id].y);
    pos.push(this.hands[id].z);

    return { x: this.hands[id].x,
             y: this.hands[id].y,
             z: this.hands[id].z };
};


Input.prototype.draw = function(h, handZ) {
    var ctx = this.ctx;

    h.displayOpacity = 2.75 - 0.0025 * handZ;
    if (h.displayOpacity < 0.5)
        h.displayOpacity = 0.5;

    ctx.shadowBlur = 0;
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255, 255, 255, 1)";
    ctx.fillStyle = "rgba(200, 100, 100, " + h.displayOpacity + ")";
    ctx.fill();
    ctx.stroke();

    // make circle white if we are in the "touch area"
    if (h.displayOpacity >= 1) {
        ctx.lineWidth = 10;
        ctx.strokeStyle = "rgba(255,255,255,1)";
        ctx.fillStyle = "rgba(0, 100, 255, 1)";
        ctx.fill();
        ctx.stroke();
    }
};


Input.prototype.drawTrail = function(h, handX, handY) {
    // grab trail array of this pointer (hand)
    var t = h.trails;

    for (var i = 0; i < t.length; i++) {
        var t1 = t[i],
            t2 = t[i-1];

        t[t.length - 1].render(this.ctx);

        t[t.length - 1].x = handX;
        t[t.length - 1].y = handY;
        t1.render(this.ctx);

        if(i > 0) {
            t2.x += (t1.x - t2.x) * 0.6;
            t2.y += (t1.y - t2.y) * 0.6;
        }
    }
};


Input.prototype.render = function(id, handX, handY, handZ) {
    var h = this.hands[id],
        ctx = this.ctx;

    // render and draw trail behind pointer
    this.drawTrail(h, handX, handY);

    // create circle and position it
    ctx.beginPath();
    ctx.arc(handX, handY, h.radius, h.start, h.end, h.direction);

    // set opacity according to Z value and
    // don't render hand pointers out of range
    if (handZ < HAND_Z_MAX) {
        this.draw(h, handZ);
    }

    ctx.closePath();
};




function StringInstrument(stageID, canvasID, stringNum, handsNum) {
    this.strings = [];
    this.stringNum = stringNum;
    this.stage = new Stage(stageID);

    this.canvas = document.getElementById(canvasID);
    this.ctx = this.canvas.getContext('2d');

    this.doRenderHands = true;
    this.handsNum = handsNum;
    this.input = new Input(this.handsNum, canvasID);

    this.clr = new Leap.Controller();
    this.clr.connect();

    this.create();

    // create loops
    this.renderLM(canvasID);
    this.render();

    return this;
}


StringInstrument.prototype.create = function() {
    for (var i = 0; i < this.stringNum; i++) {
        var srect = new Rect(50 + i * 78, 0, 10, 800);
        var s     = new HarpString(srect, i);

        this.stage.addString(srect, s);
        this.strings.push(s);
    }
};


// MOVE TO STAGE?
// NOTHING TO DO WITH THE STRINGS
StringInstrument.prototype.renderLM = function(canvasID) {
    var that = this,
        canvasElement = document.getElementById(canvasID);

    this.clr.on("frame", function (frame) {
        if (frame.pointables.length > 0) {
            that.doRenderHands = true;

            //Get a pointable (hand) and normalize the index finger's dip position
            for (var i = 0, len = frame.hands.length; i < len; i++) {
                // hand limit
                if (i+1 > that.handsNum)
                    return;

                var hand = frame.hands[i],
                    interactionBox = frame.interactionBox,
                    normalizedPosition = interactionBox.normalizePoint(hand.indexFinger.dipPosition, true);

                // Convert the normalized coordinates to span the canvas
                var handPos = that.input.getPos(canvasElement, normalizedPosition, i);

                // loop through all objects
                for (var j = 0, len2 = frame.hands.length; j < len2; j++)
                {
                    // only check string collision inside canvas and visible Z range
                    var isInRange = handPos.x > 0 && handPos.y < canvasElement.width && handPos.z < HAND_Z_MIN;
                    if (isInRange) {
                        that.stage.LMMoved(handPos.x, handPos.y);
                    }
                }
            }
        } else {
            that.doRenderHands = false;
        }
    });
};


StringInstrument.prototype.render = function() {
    var that = this;

    // loop
    requestAnimFrame(function() {
        that.render();
    });

    // timer
    this.stage.timer();

    // clear screen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // render strings
    for (var i = 0; i < this.stringNum; i++) {
        this.strings[i].render(this.ctx, i);
    }

    // render hands
    if (this.doRenderHands) {
        for (i = 0; i < this.handsNum; i++) {
            this.input.render(i, this.input.hands[i].x, this.input.hands[i].y, this.input.hands[i].z);
        }
    }
};

var harp = new StringInstrument("stage", "strings", 16, 2);