/*! Palindrom 
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */

/* URL DOM API shim */
var resolve = require('url').resolve;
var parse = require('url').parse;

var URL = (function() {
  function URL(path, baseURL) {
    var urlObj;
    if (baseURL) {
      urlObj = resolve(baseURL, path);
      urlObj = parse(urlObj);
    } else {
      // it's absolute
      urlObj = parse(path);
    }
    /* copy href, protocol, pathname etc.. */
    Object.assign(this, urlObj);
  }
  return URL;
})();

module.exports = URL;
