var fs = require('fs');
var path = require('path');
var defaultLangPath = path.resolve(__dirname, '../lang/nl.json');

/**
 * Express i18n middleware
 * @param req
 * @param res
 * @param next
 */
module.exports = function middleware(req, res, next) {
  // init vars
  var query = req.query;
  var defaultLang = 'nl';
  // Check if url container lang query string and save that in a session
  if(query.lang) req.session.lang = query.lang.toLowerCase();

  // check if session exists overwrite defautlang
  if(req.session.lang) defaultLang = req.session.lang;

  // get path of language
  var langPath = path.resolve(__dirname, '../lang/' + defaultLang + '.json');

  // Check is file exists in directory
  fs.access(langPath, function(err, _) {
    // if file does'nt exists render pass deafult language path
    if(err) return initializeI18n(req, defaultLangPath, next);
    // pass language path to next function
    initializeI18n(req, langPath, next);
  })
};

/**
 * Get language content from json
 * @param req
 * @param path
 * @param next
 * @api private
 */
function initializeI18n(req, path, next) {
  // get fle content
  fs.readFile(path, 'utf8', function (err,lang) {
    if (err) { console.log(err); return next(); }
    // bind i18n func to request
    req.i18n = i18n(lang);
    // next middleware
    next();
  });
}

/**
 * Get translation by property name
 * @param lang
 * @returns {Function}
 * @api private
 */
function i18n(lang) {
  // parse json
  var languageData = JSON.parse(lang);
  // return function
  return function(src, prop) {
    // check if property exists in json
    if(!languageData[src]) throw new Error('Property: ' + src + ' does not exists in json');
    if(!languageData[src][prop]) throw new Error('Property: ' + prop + ' does not exists in ' + src);
    // return property value
    return languageData[src][prop];
  }
}