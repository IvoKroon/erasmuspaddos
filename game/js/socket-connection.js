window.addEventListener('load', init);

var iosocket;

function init() {
    initSocketIO();
}

function initSocketIO() {
    iosocket = io.connect("http://localhost:3000");
}
