

$(document).ready(function()
{

  $('.tlt').textillate();
});

function switchLang(locale) {
  var origin = window.location.origin;
  var pathname = window.location.pathname;
  var qs = '?lang='+locale;
  var fullPath = origin + pathname + qs;
  window.location.href = fullPath;
}