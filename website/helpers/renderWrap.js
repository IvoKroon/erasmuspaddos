/**
 * Override express render function
 * @param req
 * @param res
 * @param next
 */
module.exports = function renderWrap(req, res, next) {
  // store a copy of the render function
  var _render = res.render;

  // override the render function
  res.render = function(target, options, fn) {
    // append default values in options
    var i18n = req.i18n;
    var opt = Object.assign({i18n:i18n}, options);
    // call the render function
    _render.call(this, target, opt, fn);
  };
  next();
};