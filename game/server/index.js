var SerialPort = require("serialport").SerialPort;
var values = [];

// serial port
var serialPort;
var portName = '/dev/cu.usbmodem1411';

// Listen to serial port
serialPort = new SerialPort(portName, {
    baudrate: 9600
});

// listen to events
serialPort.on('open', function() {
    console.log('open serial communication');
});

socket.on('connection', function(socket)
{
    socket.on('stringtouched', function(data)
    {
        var found = values.filter(function(val) {
            return val == data;
        });

        if(found.length > 0) {
            // console.log(' exists in value');
            // console.log(values);
        } else {
            values.push(data);
            setTimeout(send.bind(this, data), 5);
        }

    });
});

function send(data) {
    // delete values[values.indexOf(data)];
    for(var i = 0; i < values.length; i++) {

        if(values[i] == data) {
            values.splice(i, 1);
        }
    }
    
    serialPort.write(data);
}