/**
 * Created by ivokroon on 24/03/16.
 */
window.addEventListener("load",loadGame);

function init(){
    //timer("strings");

}

function loadTimer(){
    var timer = new TimerFUNC();

}

function loadStart(){
    window.addEventListener("onunload",timer);
    var canvas = document.getElementById("strings");
    var b_width = 150;
    var b_height = 80;

    var center_x = canvas.width / 2 - b_width / 2;
    var center_y = canvas.height / 2 - b_height / 2;

    var buttonList = [
        {name:"start",btext:"Play",x:center_x,y:center_y,w:b_width,h:b_height,color:"#00FF00"}
    ];

    var imageList = [
        {image:"image/pino.jpg",x:canvas.width / 2 - 150,y:0,w:350,h:250}
    ];

    var menu = new Menu("strings",buttonList,imageList);
}

function loadNextScreen(){
    var buttonList = [
        {name:"End",btext:"Next",x:500,y:300,w:150,h:80,color:"#FF0000"}
    ];

    var menu = new Menu("strings",buttonList);
}

//load the game
function loadGame(){
    //load the timer
    var wrapper = document.getElementById("wrapper");
    var holder = document.createElement("div");

    //load the timer
    for(var i = 1; i < 6; i++){
        var btn = document.createElement("div");
        btn.id = "timer"+i;
        btn.className = "timer";
        if(i == 1 || i == 4 || i == 5){
            btn.innerHTML = "0";
        }else if(i == 3){
            btn.innerHTML = ":";
        }else{
            btn.innerHTML = "1";
        }
        wrapper.appendChild(btn);
    }

    //var harp = new StringInstrument("strings", "strings", 16, 2);
    console.log("harp");
    var harp = new StringInstrument("stage");
}


function TimerFUNC(){
    //this.time = 3;
    this.canvas = document.getElementById("strings");
    this.ctx = this.canvas.getContext('2d');
    //var time = 3,
    //    prevTime = Date.now(),
    //    tick = 0;
    this.time = 3;
    this.prevTime = Date.now();
    this.tick = 0;

    this.DoTimer();


}

TimerFUNC.prototype.DoTimer = function (){
    var that = this;
    if (this.time <= 0) {
        loadGame();
        return;
    }

    requestAnimFrame(function() {
        that.DoTimer();
    });
    //http://localhost/playthebridge/game/menu.html
    this.loadTimer();
};



TimerFUNC.prototype.loadTimer = function(){

    if (isNaN(this.time)) {
        console.log("Done");
        return;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    var curTime = Date.now();
    var diff = curTime - this.prevTime;

    //console.log(prevTime);

    if (diff > 1000) {
        this.time--;

        if (this.time == 0)
            this.time = "";

        this.tick = 0;
        this.prevTime = Date.now();
    }

    this.tick += 1.5;
    var size = 180 - this.tick;

    this.ctx.font = size + "px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(this.time, this.canvas.width/2, this.canvas.height/2);
};


function timer(id){
    var secs = 3;
    var now = Math.floor(Date.now());
    var times  = 4;
    var canvas = document.getElementById(id);
    var ctx = canvas.getContext('2d');

    var text;
    var interval = setInterval(function(){
        //console.log(times--)
        console.log(times);
        if(times == 4){
            makeCanvasText("",canvas,ctx);
        }
        else if(times == 3){
            makeCanvasText("3",canvas,ctx);
        }else if(times == 2){
            makeCanvasText("2",canvas,ctx);
        }else if(times == 1){
            makeCanvasText("1",canvas,ctx);
        }else if(times == 0){
            makeCanvasText("GO!",canvas,ctx);
            clearInterval(interval);
            loadStart();
        }else{

        }
        times --;
    }, 1000);


}

function makeCanvasText(text,canvas,ctx){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.beginPath();
    ctx.font = "30px Arial";
    ctx.fillText(text,10,50);
    ctx.fillStyle = "#00ff00";
    ctx.closePath();
    console.log(text);
}

function setTime(time){

    console.log("time "+time);
}


//Do stuff
function Menu(id,buttonlist,imageList){
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext('2d');

    //this is for the new screens.
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

    //load the image

    //check if imageList is available
    if(imageList){
        for(var i = 0; i < imageList.length; i++) {
            var imageListItem = imageList[i];
            var image_class = new Image_canvas(imageListItem.x,imageListItem.y,imageListItem.w, imageListItem.h, imageListItem.image);
            var image = image_class.load();
        }
    }

    this.buttonList = buttonlist;
    this.buttonNum = buttonlist.length;

    this.buttons = [];

    //load the game 1 sec later so that image is loaded
    var that = this;
    setTimeout(function(){
        if(imageList) {
            renderImage(that.ctx, image);
        }
        that.startPost();
        that.leapMove(image);

        that.create();
        that.render();
    }, 500);

}

Menu.prototype.leapMove = function (image) {
    var that = this;

    var now = Math.floor(Date.now());

    //setup the timer
    var nows = [];
    var startTime = [];

    for(var i = 0; i < that.buttonList.length; i++){
        //push the data in the timer arrays
        nows.push(now);
        startTime.push(0);
    }

    var controller = Leap.loop(function(frame){
        if(frame.hands.length > 0)
        {
            var hands = frame.hands;
            for(var i = 0; i < hands.length; i++)
            {
                var positions = hands[i].pointables[0]['positions'][0];
                that.moveObject(that, positions, nows, startTime,image);
            }
        }
    });
};

Menu.prototype.moveObject = function (that, positions, nows,startTime,image) {
    //setup
    var speed = 4;
    var x = (positions[0] * speed + 400);
    var y = (positions[1] * speed);

    var buttonRadius = 20;

    that.ctx.clearRect(0,0,that.canvas.width,that.canvas.height);
    if(image) {
        renderImage(that.ctx, image);
    }
    //load the other buttons
    that.create();
    that.render();

    //load the pointer
    var pointer = new Pointer(x,y,buttonRadius,"rgb(255,0,0)");
    pointer.create(that.ctx);

    //check for collision
    that.checkCollision(x,y,buttonRadius,buttonRadius,nows,startTime);
};


//Start position
Menu.prototype.startPost = function(){
    var x = this.canvas.width/2 - 82,
        y = this.canvas.height/2;

    var pointer = new Pointer(x,y,20,"rgb(255,0,0)");
    pointer.create(this.ctx);
};


//Check collisions of the buttons
Menu.prototype.checkCollision = function (lx,ly,lw,lh,nows,startTime) {
    for (var i = 0; i < this.buttonList.length; i++) {
        var bx = this.buttonList[i].x,
            by = this.buttonList[i].y,
            bw = this.buttonList[i].w,
            bh = this.buttonList[i].h;

        //Check collision.
        if( lx < bx + bw &&
            lx + lw > bx &&
            ly < by + bh &&
            ly + lh > by) {
            //set start time to
            startTime[i] = Math.floor(Date.now());


            console.log("inside "+i);

            //set the timer on 3 seconds
            if (startTime[i] - nows[i] > 3000) {
                //load the next page
                var pageLoader = new PageLoader(this.buttonList[i].name);

                //reset timer
                nows[i] = Math.floor(Date.now());
                startTime[i] = nows[i];
            }

        }else{
            //reset timer
            nows[i] = Math.floor(Date.now());
            startTime[i] = nows[i];
        }

    }

};

//PageLoader
function PageLoader(pageName){
    this.pageName = pageName;
    this.checker();
}

//Check what button is used
//then go to this page.
PageLoader.prototype.checker = function(){
    if(this.pageName == "start"){
        console.log("Application started!");
        loadTimer();
    }else if(this.pageName == "End"){
        loadTimer();
    }
};

//create the buttons
Menu.prototype.create = function(){
    for(var i = 0; i < this.buttonNum; i++){
        //make the buttons
        var b = new Button(
            this.buttonList[i].x,
            this.buttonList[i].y,
            this.buttonList[i].w,
            this.buttonList[i].h,
            this.buttonList[i].color,
            this.buttonList[i].btext
        );
        //add push the buttons in an array
        this.buttons.push(b);
    }
};

//render the buttons
Menu.prototype.render = function(){
    for(var i = 0; i < this.buttonNum; i++){
        //use circle render function
        this.buttons[i].render(this.ctx);
    }
};

//Setup the pointer
function Pointer(x,y,radius,fill){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = fill;

    return this;
}

//Create the pointer
Pointer.prototype.create = function(ctx){
    var circle = new Circle(this.x,this.y,this.radius,this.color);
    circle.render(ctx);
};


//Setup a circle
function Circle(x, y, radius, fill) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.fill = fill;

    return this;
}

//Render circle
Circle.prototype.render = function(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.fill;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 20;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
};

function Image_canvas(x,y,w,h,image_name){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.image_name = image_name;

    return this;
}

Image_canvas.prototype.load = function(){
    var imageObj = new Image();
    imageObj.onload = function() {

    };
    imageObj.src = this.image_name;

    return {image:imageObj,x:this.x,y:this.y,w:this.w,h:this.h};
};

function renderImage(ctx,image){
    //console.log(image);
    ctx.drawImage(image.image, image.x, image.y, image.w, image.h);
}

//Make the buttons
function Button(x,y,w,h,color,text){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.text = text;

    return this;
}

//Render the buttons
Button.prototype.render = function(ctx){
    var font = 20;
    ctx.save();
    //setup text
    ctx.font = "Bold 20px Arial";

    //get the width of the text "for centering"
    var width = ctx.measureText(this.text).width;

    //make the rect with color
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w,this.h);

    //make the text
    ctx.fillStyle = "#000000";
    var x_center = this.x + this.w / 2 - width / 2;
    var y_center = this.y + this.h / 2 + font / 2;
    ctx.fillText(this.text, x_center, y_center);
    ctx.restore();
};

