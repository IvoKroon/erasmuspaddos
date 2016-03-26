// require modules
var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var ejs = require('ejs');
var i18n = require('./helpers/i18n');
var session = require('express-session');

// set variables
var PORT = process.env.PORT || 3001;

// require database connection
require('./db-connection');


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


//////// ROUTES ////////////
app.get('/', i18n, function(req, res) {
  var code = req.query.code;
  var i18n = req.i18n;
  if(!code) {
    return res.render('home', {sound:null, notFound: null, i18n:i18n});
  }
  var sql = 'SELECT * FROM sounds WHERE id=' + dbConnection.escape(code) + '';
  dbConnection.query(sql, function(err, result) {
    if(err) return console.log(err);

    res.render('home', {
      sound: result.length > 0 ? result[0] : null,
      notFound: result.length < 1 ? 1 : 0,
      i18n:i18n
    });
  });
});

app.get('/info', i18n, function(req, res) {
  res.render('info', { i18n: req.i18n });
});

app.get('/sounds', i18n, function(req, res) {
  var sql = 'SELECT * FROM sounds ';
  dbConnection.query(sql, function(err, result) {
    if(err) return console.log(err);
    console.log(result);
    res.render('sounds', {
      sounds: result,
      i18n: req.i18n
    });
  });
});


// start server
app.listen(+PORT, function() {
  console.log('listening on port %s, open your browser on localhost:%s', PORT, PORT);
});

