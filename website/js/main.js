var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();

$(document).ready(function()
{

  $('.tlt').textillate();
});



(function() {

 var searchbtn = document.getElementById('input2');
 var playerContainer = document.getElementById('player-wrapper');
 var codeInput = document.getElementById('input1');
 var codeError = document.getElementById('codeError');
 searchbtn.addEventListener('click', function() {
 	getSound();
 });

function getSound() {
	var code = getCode();
	if(!code) return;

	var data = {
		code: code,
		type: 'GET_SOUND'
	};

	$.ajax({
		url: 'ajax.php',
		type: 'POST',
		data:data,
		success: function(res) {
			var sound = JSON.parse(res).payload[0];
			console.log(sound);
			if(sound) {
				codeError.style.display = 'none';
				var soundCloudPlayer = '<iframe class="soundcloud" width="80%" height="100" scrolling="no" frameborder="no" '+
				'src="https://w.soundcloud.com/player/?url='+ sound.sound_url +'&amp;color=19a095&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false"></iframe>';
				playerContainer.innerHTML = soundCloudPlayer;
			} else {
				codeError.style.display = 'block';
			}

		},
		error: function(err) {
			console.log(err);
		}
	});

}

function getCode() {
	var code = codeInput.value;
	if(code) return code;
	if(urlParams.code) {
		codeInput.value = urlParams.code;
		return urlParams.code;
	}
}
	getSound();
})();
