var SerialPort = require("serialport").SerialPort;

// create server
var http = require('http');
var io = require('socket.io');
var server = http.createServer();
server.listen(3000);
var socket = io.listen(server);


// serial port
var serialPort;
var portName = '/dev/cu.usbmodem1411';

// Listen to serial port
serialPort = new SerialPort(portName, {
    baudrate: 9600
    // dataBits: 8,
    // parity: 'none',
    // stopBits: 1,
    // flowControl: false
});

// listen to events
serialPort.on('open', function() {
    console.log('open serial communication');
});

socket.on('connection', function(socket)
{
    socket.on('stringtouched', function(data)
    {
        console.log(data);
        serialPort.write(data);
    });
});
