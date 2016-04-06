// require modules
var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var request = require('request');
var passport = require('passport');
var SoundCloudStrategy = require('passport-soundcloud').Strategy;
var ejs = require('ejs');

// set variables
var PORT = process.env.PORT || 3000;
global.CLIENT_ID = '520afab7d67f14318b21e33ffc25f092';
global.CLIENT_SECRET = 'e883058fe4fadc535cd15c640ed1aae9';
global.ACCESS_TOKEN = '';

// require database connection
require('./db-connection');

// arduino
require('./server');

// listen for socket connection
io.on('connection', function (socket) {
  require('./socket-connection.js')(socket);
  require('./server')(socket)
});

// set soundcloud strategy
passport.use(new SoundCloudStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/soundcloud/callback"
  },
  function(accessToken, refreshToken, profile, done) {
  	var sql = 'INSERT INTO soundcloud (access_token)VALUES('+ dbConnection.escape(accessToken) +')';
		ACCESS_TOKEN = accessToken;
		dbConnection.query(sql, function(err, result) {
			if(err) return done(err);
			return done(err, result);
		});
  }
));

// set express middleware
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'html');
app.engine('html',  ejs.renderFile);
app.use(express.static('./public'));

//////////////////////////////////////
//						ROUTES
//////////////////////////////////////

// set soundcloud authentication routs
app.get('/auth/soundcloud', passport.authenticate('soundcloud'));
app.get('/auth/soundcloud/callback',
	passport.authenticate('soundcloud', { failureRedirect: '/', session: false }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});

app.get('/game', function(req, res) {
  res.render('game');
});
app.get('/', function(req, res) {
	// get access token from db
  dbConnection.query('SELECT access_token from soundcloud', function(err, results) {
  	if(err)  return res.send(err);
		ACCESS_TOKEN =results.length > 0 ? results[results.length -1].access_token : null;
		if(!ACCESS_TOKEN) console.warn('No acces_token found, authenticate with http://localhost:3000/auth/soundcloud');
		res.render('index', {
      title: 'Home'
    });
  })
});

// start server
server.listen(+PORT, function() {
  console.log('listening on port %s, open your browser on localhost:%s', PORT, PORT);
});

