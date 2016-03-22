var SerialPort = require("serialport").SerialPort;

// serial port
var serialPort;
var portName = '/dev/cu.usbmodem1411';

// Listen to serial port
serialPort = new SerialPort(portName, {
    baudrate: 9600
});


module.exports = function(socket) {
	// listen to events
	serialPort.on('open', function() {
	    console.log('open serial communication');
	    startSockets(socket);
	});
}

function startSockets(socket) {
  socket.on('stringtouched', function(data)
  {
      console.log(data);
      serialPort.write(data);
  });
}