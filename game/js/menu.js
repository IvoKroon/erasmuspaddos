/**
 * Created by Sandervspl on 3/16/16.
 */




function Button(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;

    return this;
}

Button.prototype.render = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();
};




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

Menu.prototype.listeners = function () {
    var that = this;

    document.addEventListener('click', function(e) {
        var cx  = e.clientX,
            cy  = e.clientY;

        for (var i = 0; i < that.buttons.length; i++) {
            var bx1 = that.buttons[i].x,
                by1 = that.buttons[i].y,
                bx2 = that.buttons[i].x + that.buttons[i].width,
                by2 = that.buttons[i].y + that.buttons[i].height;

                if (cx > bx1 && cx < bx2) {
                    if (cy > by1 && cy < by2) {
                        console.log("Knop: " + (i+1));
                    }
                }
        }
    }, false);
};

Menu.prototype.create = function () {
    for (var i = 0; i < this.buttonsNum; i++) {
        var x = this.canvas.width/2 - i * 75,
            y = this.canvas.height/2;

        var b = new Button(x, y, 50, 50);

        this.buttons.push(b);
    }
};

Menu.prototype.render = function () {
    for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].render(this.ctx);
    }
};

var menu = new Menu("menu", 0, 0, 1280, 800, 2);