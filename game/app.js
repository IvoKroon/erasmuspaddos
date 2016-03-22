var fs  = require('fs');
var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function (socket) {
  // require('./socket-config.js')(socket);
});


var PORT = process.env.PORT || 3000;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

app.get('/callback', function(req, res) {
  res.render('index');
})
app.get('/game', function() {
  res.render('game');
})

app.get('*', function(req, res) {
  res.render('index');
});


server.listen(+PORT, function() {
  console.log('listening on port %s, open your browser on localhost:%s', PORT, PORT);
});

