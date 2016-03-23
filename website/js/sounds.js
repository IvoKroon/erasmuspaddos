(function(){
function getAllSounds() {
	var data = {
		type: 'GET_ALL_SOUNDS'
	};

	$.ajax({
		url: 'ajax.php',
		type: 'POST',
		data:data,
		success: function(res) {
			var sounds = JSON.parse(res).payload;
			console.log(sounds);
			var elements = $();
			for(var i = 0; i < sounds.length; i++) {
				var sound = sounds[i];

			  elements = elements.add('<div class="col-md-6 col-sm-12">'+
            '<iframe class="soundcloud" width="80%" height="100" scrolling="no" frameborder="no" '+
            'src="https://w.soundcloud.com/player/?url='+ sound.sound_url +'&amp;color=00ffe9&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false"></iframe></div>');
			}
			$('#soundsContainer').append(elements);

		},
		error: function(err) {
			console.log(err);
		}
	});
}
getAllSounds();
})();
