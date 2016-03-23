// set screencastify app id
screencastify.setAppId('5741160238678016');

// get tokens
var CLIENT_ID = $("meta[name=SC_CLIENT_ID]").attr("content");
var ACCESS_TOKEN = $("meta[name=SC_TOKEN]").attr("content");
var codeContainer = $('#code');
if(!ACCESS_TOKEN) console.warn("access token is empty");

// get new recorder
var recorder = new screencastify.Recorder();

// get random sound
function play() {
  var audio = new Audio();
  audio.src = './sounds/Soundfiles/Toon' + Math.ceil(Math.random() * 16) + '.mp3';
  audio.play();
}

// start recording the browser screen
function record() {
  recorder.start({
    recordConfig: { // optional
        captureSource: 'screen', // for window picker, use 'screen' for screen picker
        audio: {
            mic: false,
            system: true
        }
    },
    shareUrl: 'https://your page', // URL of your page that handles shared files.
    payload: 'optional arbitrary string' // Can be retrieved in share handler.
  }).then(function() {
    // START GAME HERE
    console.log('recording')
    codeContainer.html('');
  });
}
// Get file if user has stopped recording
screencastify.onSharedFiles = function(fileIds) {

  // get the file by file-id
  screencastify.getFile(fileIds[0]).then(function(fileInfo) {
  // create new form data and append data to it
    var fd = new FormData();
    fd.append('oauth_token', ACCESS_TOKEN);
    fd.append("track[title]", 'erasmuspaddos-track1');
    fd.append("track[asset_data]", fileInfo.file);

    // send a ajax request to soundcloud api
    $.ajax({
        url: 'https://api.soundcloud.com/v1/tracks?client_id=' + CLIENT_ID,
        type: 'POST',
        data: fd,
        cache: false,
        contentType: false,
        processData: false,
        xhr: function() {
            var xhr = $.ajaxSettings.xhr();
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    var percent = Math.floor((e.loaded / e.total) * 100);
                    $("#uploadProgress").attr('value', percent);
                    console.log(percent + '% uploaded');
                }
            };
            return xhr;
        },
        success: function(res) {
            console.log('Upload Complete!');
            $("#uploadProgress").attr('value', 0);
            saveSound(res);
            // TODO save track data in database
        },
        error: function(err) {console.log(err);}
    });
  });
  // return true so that screencastify know that we are handling the file
  return true;
}

// stop recording
function stop() {
    recorder.stop();
}

// save sound url to database
function saveSound(data) {
  console.log(data);
  $.ajax({
    type: 'POST',
    url: '/saveSound',
    data: data,
    success: function(res) {
      codeContainer.html('Your code is: ' + res.code);
    },
    error: function(err) {
      console.log('saving in database failed!');
    }
  })
}