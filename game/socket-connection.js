var path = require('path');
var fs = require('fs');
var uploadPath = path.resolve(__dirname, './public/uploads/');
var exec = require('child_process').exec;
var request = require('request');

// set minutes here
var minutes = 1 * 60;


module.exports = function(socket) {
  startSockets(socket);
}

/**
 * Start listening to sockets events
 * @param socket
 */
function startSockets(socket) {
  socket.on('server:start-recording', function(data)
  {
    // log access_token
    console.log(ACCESS_TOKEN);

    // create new name for file
    var name = Date.now() + '.mp3';
    // set upload path
    var fullPath = path.join(uploadPath + '/' + name);

    // execute command to start recording
    exec('ffmpeg -f dshow -i audio="virtual-audio-capturer" -r 20 -t ' + minutes + ' ' + fullPath,
      function(error, stdout, stderr) {
      console.log('stdout: %s', stdout);
      console.log('stderr: %s', stderr);
      if (error !== null) {
        return console.log('exec error: %s', error);
      }
      // upload to soundcloud
      return uploadToSC(socket, fullPath);
    });
  });
}

/**
 * Start uploading to soundcloud api
 * @param socket
 * @param path
 */
function uploadToSC(socket, path) {
  // create request to soundcloud api
  var r = request.post('https://api.soundcloud.com/v1/tracks?client_id=' + CLIENT_ID, function optionalCallback (err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err);
    }

    try {
      var response = JSON.parse(body);
      saveSound(response, function(id) {
        // emit that uploading has finished
        socket.emit('client:upload-finished', JSON.stringify({code:id}));
        // delete file after uploading to soundcloud
        fs.unlinkSync(path);
      });
    }catch(e) {
      throw e;
    }

  });
  // append form data to request
  var form = r.form();
  // set access_token IMPORTANT
  form.append('oauth_token', ACCESS_TOKEN);
  // set name for track
  form.append('track[title]', 'paddos' + Date.now());

  // Get mp3 and attach to form
  form.append('track[asset_data]', fs.createReadStream(path))
}

/**
 * Save the  track url to the database and return lastInserted id
 * @param data
 * @param cb
 */
function saveSound(data, cb) {
  var sql = 'INSERT INTO sounds (sound_url, created_at)VALUES(' + dbConnection.escape(data.uri) + ', ' + dbConnection.escape(data.created_at) +')';
  dbConnection.query(sql, function(err, result) {
    if(err) return console.log(err);
    cb(result.insertId);
  });
}


