var canvas = document.getElementById('strings'),
    ctx = canvas.getContext('2d');

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

    tick += 1.5;
    var size = 180 - tick;

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