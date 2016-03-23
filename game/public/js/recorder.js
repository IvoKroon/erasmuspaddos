// connect to socket
var socket = io.connect('http://localhost:3000');

// get container to show code after uploading
var codeContainer = $('#code');

/**
 * Play random sounds
 */
function play() {
  var audio = new Audio();
  audio.src = './sounds/Soundfiles/Toon' + Math.ceil(Math.random() * 16) + '.mp3';
  audio.play();
}

/**
 * Start recording the desktop
 */
function record() {
  // Emit to server to start recording session
  socket.emit('server:start-recording', 'record!!');
}

/**
 * listen if uploading has been finished on the server
 */
socket.on('client:upload-finished', function(data) {
  var res = JSON.parse(data);
  codeContainer.html('Your code is: ' + res.code);
});
