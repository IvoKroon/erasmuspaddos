var SerialPort = require("serialport").SerialPort;

var serialPort;
var portName = '/dev/cu.usbmodem1421';

// Listen to serial port
serialPort = new SerialPort(portName, {
    baudrate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
});

serialPort.on("open", function () {
    console.log('open serial communication');
});

module.exports = function (socket) {

  serialPort.on("open", function () {
    socketEvents(socket);
  });

}

function socketEvents(socket) {
  socket.on('stringtouched', function(data) {
      console.log(data);
  });
}