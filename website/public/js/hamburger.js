/**
 * Created by Daphne on 21/03/16.
 */

function togglescroll() {
    $('body').on('touchstart', function(e) {
        if ($('body').hasClass('noscroll')) {
            e.preventDefault();
        }
    });
}

$(document).ready(function() {
    togglescroll();
    $(".icon").click(function() {
        $(".mobilenav").fadeToggle(500);
        $(".top-menu").toggleClass("top-animate");
        $(".mid-menu").toggleClass("mid-animate");
        $(".bottom-menu").toggleClass("bottom-animate");
    });
});

// PUSH ESC KEY TO EXIT

$(document).keydown(function(e) {
    if (e.keyCode == 27) {
        $(".mobilenav").fadeOut(500);
        $(".top-menu").removeClass("top-animate");
        $(".mid-menu").removeClass("mid-animate");
        $(".bottom-menu").removeClass("bottom-animate");
    }
});
