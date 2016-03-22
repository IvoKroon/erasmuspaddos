
var iosocket;
var toggleVal = 0;

function initSocketIO() {
   iosocket = io.connect('http://localhost:3000');
   console.log(iosocket);
}

initSocketIO();