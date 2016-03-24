/**
 * Created by ivokroon on 16/03/16.
 */

window.addEventListener("load",init);

function init(){
    var buttonList = [
        {name:"start",x:500,y:300,w:150,h:80,color:"#00FF00"},
        {name:"button3",x:0,y:550,w:150,h:70,color:"#FF0000"},
        {name:"button4",x:0,y:250,w:150,h:90,color:"#FF0000"}
    ];

    var interaction = new Interaction("menu",buttonList);
}

function loadNext(){
    var buttonList = [
        {name:"lala",x:0,y:0,w:150,h:70,color:"#FF0000"},
        {name:"go",x:500,y:200,w:150,h:50,color:"#FF0000"}
    ];

    var interaction = new Interaction("menu",buttonList);
}

function loadThird(){
    var buttonList = [
        {name:"third",x:0,y:0,w:150,h:70,color:"#00FF00"},
        {name:"bla",x:100,y:200,w:150,h:50,color:"#00FF00"}
    ];

    var interaction = new Interaction("menu",buttonList);
}

//function Setup(id,buttonlist){
//    this.canvas = document.getElementById(id);
//    this.ctx = this.canvas.getContext('2d');
//
//    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
//
//    this.buttonList = buttonlist;
//    this.buttonNum = buttonlist.length;
//
//    this.
//}



function Interaction(id,buttonlist){
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext('2d');

    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

    this.buttonList = buttonlist;
    this.buttonNum = buttonlist.length;

    console.log(buttonlist);

    this.buttons = [];
    //this.mouseMovement();

    this.leapMove();

    this.create();
    this.render();
}

Interaction.prototype.renderLM = function(){
    var that = this;

};


Interaction.prototype.leapMove = function () {
    var that = this;

    var now = Math.floor(Date.now());
    //var startTime = 0;
    var nows = [now,now,now];

    var startTime = [0,0,0];

    var controller = Leap.loop(function(frame){
        if(frame.hands.length > 0)
        {
            var hands = frame.hands;
            var hand = hands[0];
            var positions = hand.pointables[0]['positions'][0];

            that.moveObject(that, positions, nows,startTime);
        }
    });
};

//function Pointer(x, y, z, radius, start, end, dir, opacity, fill) {
//    this.x = x;
//    this.y = y;
//    this.z = z;
//    this.radius = radius;
//    this.start = start;
//    this.end = end;
//    this.direction = dir;
//    this.opacity = opacity;
//    this.fill = fill;
//
//    return this;
//}






Interaction.prototype.moveObject = function (that, positions, nows,startTime) {
    var y = that.canvas.height / 2 + positions[1] * 2 - 300;
    var x = that.canvas.width / 2 + positions[0] * 3;
    var w = 20;
    var h = 20;

    that.ctx.clearRect(0,0,that.canvas.width,that.canvas.height);

    that.ctx.beginPath();
    that.ctx.fillStyle = "#FF0000";
    that.ctx.rect(x, y, w, h);
    //ctx.arc(100,75,50,0,2*Math.PI);
    that.ctx.fillStyle = "#00FF00";
    //that.ctx.arc(cx,cy,cw/2,0,2*Math.PI);
    that.ctx.fill();

    that.create();
    that.render();

    that.checkCollision(x,y,w,h,nows,startTime);
};

Interaction.prototype.checkCollision = function (lx,ly,lw,lh,nows,startTime) {
    for (var i = 0; i < this.buttonList.length; i++) {
        var bx = this.buttonList[i].x,
            by = this.buttonList[i].y,
            bw = this.buttonList[i].w,
            bh = this.buttonList[i].h;

        if( lx < bx + bw &&
            lx + lw > bx &&
            ly < by + bh &&
            ly + lh > by) {
            //set start time to
            startTime[i] = Math.floor(Date.now());
            //console.log(startTime[i]);
            console.log("inside "+i);
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


function PageLoader(pageName){
    this.pageName = pageName;
    this.checker();
}


PageLoader.prototype.checker = function(){
    if(this.pageName == "start"){
        console.log("Application started!");
        loadNext();
    }else if(this.pageName == "go"){
        console.log("Next page!");
        loadThird();
    }
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

    return this;
}

//Interaction.prototype.mouseMovement = function(){
//    var that = this;
//    //window.requestAnimationFrame(draw);
//    //use this thing lalala
//    //allalala
//    var now = Math.floor(Date.now());
//    //var startTime = 0;
//    var nows = [now,now,now];
//    var startTime = [0,0,0];
//    document.addEventListener("mousemove", function(e) {
//        that.ctx.clearRect(0,0,that.canvas.width,that.canvas.height);
//        var cx = e.clientX,
//            cy = e.clientY,
//            cw = 20,
//            ch = 20;
//
//        that.ctx.beginPath();
//        that.ctx.fillStyle = "#FF0000";
//        that.ctx.rect(cx, cy, cw, ch);
//        //ctx.arc(100,75,50,0,2*Math.PI);
//        that.ctx.fillStyle = "#00FF00";
//        //that.ctx.arc(cx,cy,cw/2,0,2*Math.PI);
//        that.ctx.fill();
//
//        that.create();
//        that.render();
//
//        for (var i = 0; i < 3; i++) {
//            var bx = that.buttonList[i].x,
//                by = that.buttonList[i].y,
//                bw = that.buttonList[i].w,
//                bh = that.buttonList[i].h;
//
//            if( cx < bx + bw &&
//                cx + cw > bx &&
//                cy < by + bh &&
//                cy + ch > by) {
//                //return true;
//                console.log('in'+i);
//
//                startTime[i] = Math.floor(Date.now());
//
//                if (startTime[i] - nows[i] > 1000) {
//
//                    console.log(that.buttonList[i].name);
//
//                    if(that.buttonList[i].name == "start"){
//                        alert("start");
//                    }
//                    //alert('Go' + i);
//                    //loadNext();
//                }
//            }else{
//                //console.log('out'+i);
//                nows[i] = Math.floor(Date.now());
//                startTime[i] = nows[i];
//            }
//
//        }
//    });
//};


Interaction.prototype.create = function(){
    for(var i = 0; i < this.buttonNum; i++){
        var b = new Button(
            this.buttonList[i].x,
            this.buttonList[i].y,
            this.buttonList[i].w,
            this.buttonList[i].h,
            this.buttonList[i].color
        );
        this.buttons.push(b);
    }
};

Interaction.prototype.render = function(){
    for(var i = 0; i < this.buttonNum; i++){
        this.buttons[i].render(this.ctx);
    }
};

function Button(x,y,w,h,color){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;

    return this;
}

Button.prototype.render = function(ctx){

    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.fill();
};

Button.prototype.remove = function(ctx){
    ctx.clearRect(x,y,w,h);
}



//var menu = new Menu("mainCanvas",0,0,1280,800,10);