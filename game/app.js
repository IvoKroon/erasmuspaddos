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

// set variables
var PORT = process.env.PORT || 3000;
var CLIENT_ID = '520afab7d67f14318b21e33ffc25f092';
var CLIENT_SECRET = 'e883058fe4fadc535cd15c640ed1aae9';


// require database connection
require('./db-connection');

// listen for socket connection
io.on('connection', function (socket) {
  // require('./socket-connection.js')(socket);
});

// set soundcloud strategy
passport.use(new SoundCloudStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/soundcloud/callback"
  },
  function(accessToken, refreshToken, profile, done) {
  	var sql = 'INSERT INTO soundcloud (access_token)VALUES('+ dbConnection.escape(accessToken) +')';
		dbConnection.query(sql, function(err, result) {
			if(err) return done(err);
			return done(err, result);
		});
  }
));

// set express middleware
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');



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


// game route
app.get('/game', function(req, res) {
  res.render('game');
});

app.get('/', function(req, res) {
	// get access token from db
  dbConnection.query('SELECT access_token from soundcloud', function(err, results) {
  	if(err)  return res.send(err);
	  var scToken = results.length > 0 ? results[results.length -1].access_token : null;
	  console.log(scToken);
  	  res.render('index', {
  	  	SC_TOKEN: scToken,
  	  	CLIENT_ID: CLIENT_ID
  	  });
  })

});

app.post('/saveSound', function(req, res) {
  	
  	var uri = req.body.uri;
  	var created_at = req.body.created_at;
  	if(!uri) return res.send('no uri found');
  	var sql = 'INSERT INTO sounds (sound_url, created_at)VALUES(' + dbConnection.escape(uri) + ', ' + dbConnection.escape(created_at) +')';
		dbConnection.query(sql, function(err, result) {
			if(err) return res.send(err);
				res.json({
          'result': 'ok',
          'code': result.insertId
        });
		});
})


// start server
server.listen(+PORT, function() {
  console.log('listening on port %s, open your browser on localhost:%s', PORT, PORT);
});

