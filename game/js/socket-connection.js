window.addEventListener('load', init);

var iosocket;
var toggleVal = 0;

function init() {
    initSocketIO();
}

function initSocketIO() {
    iosocket = io.connect("http://localhost:3000");
}
