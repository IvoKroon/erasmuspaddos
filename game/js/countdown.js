var canvas = document.getElementById('strings'),
    ctx = canvas.getContext('2d');

var prevTime = Date.now(),
    tick = 0,
    time = 3;


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

function draw() {
    if (isNaN(time))
        return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var curTime = Date.now(),
        diff = curTime - prevTime;

    if (diff > 1000) {
        time--;

        if (time == 0)
            time = "";

        tick = 0;
        prevTime = Date.now();
    }

    tick += 3;
    var size = 280 - tick;

    ctx.font = size + "px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(time, canvas.width/2, canvas.height/2);
}


function loop() {
    if (time <= 0)
        return;

    requestAnimFrame(function() {
        loop();
    });

    draw();
}


loop();