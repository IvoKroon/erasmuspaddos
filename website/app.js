// require modules
require('./helpers/assign-polyfill');
var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var ejs = require('ejs');
var i18n = require('./helpers/i18n');
var session = require('express-session');
var renderWrap = require('./helpers/renderWrap');
// set variables
var PORT = process.env.PORT || 3001;

// require database connection
require('./db-connection');
// set middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('./public'));
app.set('view engine', 'html');
app.engine('html',  ejs.renderFile);
app.use(session({
  secret: 'keyboard cat',
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: true
}));
app.use(i18n);
app.use(renderWrap);


//////// ROUTES ////////////
app.get('/', function(req, res) {
  var code = req.query.code;
  if(!code) {
    return res.render('home', {sound:null, notFound: null, code:null});
  }
  // get data from database
  var sql = 'SELECT * FROM sounds WHERE id=' + dbConnection.escape(code) + '';
  dbConnection.query(sql, function(err, result) {
    if(err) return console.log(err);
    // render with data
    res.render('home', {
      sound: result.length > 0 ? result[0] : null,
      code: code,
      notFound: result.length < 1 ? 1 : 0
    });
  });
});

app.get('/info', function(req, res) {
  // render info page
  res.render('info');
});


app.get('/sounds', i18n, function(req, res) {
  // get data from database
  var sql = 'SELECT * FROM sounds ';
  dbConnection.query(sql, function(err, result) {
    if(err) return console.log(err);
    // render with data
    res.render('sounds', {
      sounds: result
    });
  });
});


// start server
app.listen(+PORT, function() {
  console.log('listening on port %s, open your browser on localhost:%s', PORT, PORT);
});

