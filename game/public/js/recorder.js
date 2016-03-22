  
  // setup app ids
  screencastify.setAppId('5741160238678016');
  var CLIENT_ID = "520afab7d67f14318b21e33ffc25f092";
  SC.initialize({
      client_id: CLIENT_ID,
      redirect_uri: "http://localhost:3000/callback",
  });

  // get new recorder
  var recorder = new screencastify.Recorder();
  // connect to soundcluod once to get access_token
  // SC.connect();
  
  // manually fill in access_token
  // uncomment SC.connect and authenticate with soundcloud
  // paste the access_token from the url here after authentication
  var accessToken = '';

  // get random sound
  function play() {
      var audio = new Audio();
      audio.src = './sounds/Soundfiles/Toon' + Math.ceil(Math.random() * 16) + '.mp3';
      audio.play();
  }
  setTimeout(function() {
    record();
  }, 1000);
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
          // recording has been started
        console.log('recording')
      });
  }
  // Get file if user has stopped recording
  screencastify.onSharedFiles = function(fileIds) {

      // get the file by file-id
      screencastify.getFile(fileIds[0]).then(function(fileInfo) {
        // create new form data and append data to it
          var fd = new FormData();
          fd.append('oauth_token', accessToken);
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
                  console.dir(res); // This is the JSON object of the resulting track
                  $("#uploadProgress").attr('value', 0);
                  // TODO save track data in database
              },
              error: function(err) {console.log(err);}
          });
      });
      // return true so that screencastify know that we are handling the file
      return true;
  }
  // stop recorder form recording
  function stop() {
      recorder.stop();
  }