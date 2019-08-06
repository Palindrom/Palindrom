/*! Palindrom, version: 6.2.0 */
var PalindromDOM =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 21);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return PalindromError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PalindromConnectionError; });
class PalindromError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}

class PalindromConnectionError extends PalindromError {
    /**
     *
     * @param {String} message the message that describes the error
     * @param {String} side <Server|Client> the side where the error occured
     * @param {String} url The relevant URL
     * @param {String} connectionType <WebSocket|HTTP>
     */
    constructor(message, side, url, connectionType) {
        if (!side || !['Server', 'Client'].includes(side)) {
            throw new TypeError(
                "Error constructing PalindromConnectionError, `side` parameter is required and can either be 'Server' or 'Client'"
            );
        }
        super(message);
        this.side = side;
        this.message = `${side} error\n\t${message.replace(/\n/g, '\n\t')}`;
        this.url = url;
        this.connectionType = connectionType;
    }
}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = null;

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return URL; });
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(url__WEBPACK_IMPORTED_MODULE_0__);
/*! Palindrom
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */

/* URL DOM API shim */


function URL(path, baseURL) {
    var urlObj;
    if (baseURL) {
        urlObj = Object(url__WEBPACK_IMPORTED_MODULE_0__["resolve"])(baseURL, path);
        urlObj = Object(url__WEBPACK_IMPORTED_MODULE_0__["parse"])(urlObj);
    } else {
        // it's absolute
        urlObj = Object(url__WEBPACK_IMPORTED_MODULE_0__["parse"])(path);
    }
    /* copy href, protocol, pathname etc.. */
    Object.assign(this, urlObj);
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var punycode = __webpack_require__(11);
var util = __webpack_require__(14);

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = __webpack_require__(15);

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Heartbeat; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return NoHeartbeat; });
/* harmony import */ var _palindrom_errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);

const CLIENT = 'Client';
/**
 * Guarantees some communication to server and monitors responses for timeouts.
 * @param sendHeartbeatAction will be called to send a heartbeat
 * @param onError will be called if no response will arrive after `timeoutMs` since a message has been sent
 * @param intervalMs if no request will be sent in that time, a heartbeat will be issued
 * @param timeoutMs should a response fail to arrive in this time, `onError` will be called
 * @constructor
 */
function Heartbeat(
    sendHeartbeatAction,
    onError,
    intervalMs,
    timeoutMs
) {
    let scheduledSend;
    let scheduledError;

    /**
     * Call this function at the beginning of operation and after successful reconnection.
     */
    this.start = function() {
        if (scheduledSend) {
            return;
        }
        scheduledSend = setTimeout(() => {
            this.notifySend();
            sendHeartbeatAction();
        }, intervalMs);
    };

    /**
     * Call this method just before a message is sent. This will prevent unnecessary heartbeats.
     */
    this.notifySend = function() {
        clearTimeout(scheduledSend); // sending heartbeat will not be necessary until our response arrives
        scheduledSend = null;
        if (scheduledError) {
            return;
        }
        scheduledError = setTimeout(() => {
            scheduledError = null;
            onError(
                new _palindrom_errors_js__WEBPACK_IMPORTED_MODULE_0__[/* PalindromConnectionError */ "a"](
                    "Timeout has passed and response hasn't arrived",
                    CLIENT,
                    this.remoteUrl,
                    'Unknown'
                )
            ); // timeout has passed and response hasn't arrived
        }, timeoutMs);
    };

    /**
     * Call this method when a message arrives from other party. Failing to do so will result in false positive `onError` calls
     */
    this.notifyReceive = function() {
        clearTimeout(scheduledError);
        scheduledError = null;
        this.start();
    };

    /**
     * Call this method to disable heartbeat temporarily. This is *not* automatically called when error is detected
     */
    this.stop = () => {
        clearTimeout(scheduledSend);
        scheduledSend = null;
        clearTimeout(scheduledError);
        scheduledError = null;
    };
}

function NoHeartbeat() {
    this.start = this.stop = this.notifySend = this.notifyReceive = () => {};
}


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = WebSocket;

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PalindromNetworkChannel; });
/* harmony import */ var _URLShim_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _palindrom_errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(0);
/* harmony import */ var _heartbeat_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var websocket__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var websocket__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(websocket__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var node_fetch__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1);
/* harmony import */ var node_fetch__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(node_fetch__WEBPACK_IMPORTED_MODULE_4__);



/* this package will be empty in the browser bundle,
and will import https://www.npmjs.com/package/websocket in node */



const CLIENT = 'Client';
const SERVER = 'Server';

/**
 * Replaces http and https to ws and wss in a URL and returns it as a string.
 * @param  {String} remoteUrl HTTP remote address
 * @return {String}           WS address
 */
function toWebSocketURL(remoteUrl) {
    /* replace 'http' strictly in the beginning of the string,
    this covers http and https */
    return remoteUrl.replace(/^http/i, 'ws');
}

class PalindromNetworkChannel {
    constructor(
        palindrom,
        remoteUrl,
        useWebSocket,
        onReceive,
        onSend,
        onConnectionError,
        onSocketOpened,
        onStateChange,
        pingIntervalS
    ) {
        // TODO(tomalec): to be removed once we will achieve better separation of concerns
        this.palindrom = palindrom;

        if (typeof window !== 'undefined' && window.location) {
            this.remoteUrl = new _URLShim_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"](remoteUrl, window.location.href);
        } else {
            // in Node, URL is absolute
            this.remoteUrl = new _URLShim_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"](remoteUrl);
        }

        onReceive && (this.onReceive = onReceive);
        onSend && (this.onSend = onSend);
        onConnectionError && (this.onConnectionError = onConnectionError);
        onStateChange && (this.onStateChange = onStateChange);
        onSocketOpened && (this.onSocketOpened = onSocketOpened);

        Object.defineProperty(this, 'useWebSocket', {
            get: function() {
                return useWebSocket;
            },
            set: newValue => {
                useWebSocket = newValue;

                if (newValue == false) {
                    if (this._ws) {
                        this._ws.onclose = function() {
                            //overwrites the previous onclose
                            this._ws = null;
                        };
                        this._ws.close();
                    }
                    // define wsUrl if needed
                } else if (!this.wsUrl) {
                    this.wsUrl = toWebSocketURL(this.remoteUrl.href);
                }
                return useWebSocket;
            }
        });

        if (pingIntervalS) {
            const intervalMs = pingIntervalS * 1000;
            this.heartbeat = new _heartbeat_js__WEBPACK_IMPORTED_MODULE_2__[/* Heartbeat */ "a"](
                () => {this.send([]);},
                this._handleConnectionError.bind(this),
                intervalMs,
                intervalMs
            );
        } else {
            this.heartbeat = new _heartbeat_js__WEBPACK_IMPORTED_MODULE_2__[/* NoHeartbeat */ "b"]();
        }
    }

    /**
     * Fetches initial state from server using GET request,
     * or fetches new state after reconnection using PATCH request if any `reconnectionPendingData` given.
     * @param  {Array<JSONPatch>}  [reconnectionPendingData=null] Patches already sent to the remote, but not necesarily acknowledged
     * @return {Promise<Object>}                           Promise for new state of the synced object.
     */
    async _establish(reconnectionPendingData = null) {
        this.heartbeat.stop();
        const data = reconnectionPendingData ?
            await this._fetch('PATCH', this.remoteUrl.href + '/reconnect', 'application/json', JSON.stringify(reconnectionPendingData)) :
            await this._fetch('GET', this.remoteUrl.href, 'application/json', null);

        if (this.useWebSocket) {
            this.webSocketUpgrade(this.onSocketOpened);
        }
        this.heartbeat.start();
        return data;
    }

    /**
     * Handle an error which is probably caused by random disconnection
     * @param {PalindromConnectionError} palindromError
     */
    _handleConnectionError(palindromError) {
        this.heartbeat.stop();
        this.palindrom.reconnector.triggerReconnection();
        this.onConnectionError(palindromError);
    }
    /**
     * Handle an error which probably won't go away on itself (basically forward upstream)
     * @param {PalindromConnectionError} palindromError
     */
    _handleFatalError(palindromError) {
        this.heartbeat.stop();
        this.palindrom.reconnector.stopReconnecting();
        this.onConnectionError(palindromError);
    }

    /**
     * Notify heartbeat and onReceive callback about received change
     */
    _notifyReceive() {
        this.heartbeat.notifyReceive();
        this.onReceive(...arguments);
    }

    /**
     * Send any text message by currently established channel
     * @TODO: handle readyState 2-CLOSING & 3-CLOSED (tomalec)
     * @param  {JSONPatch} patch message to be sent
     * @return {PalindromNetworkChannel}     self
     */
    async send(patch) {
        this.heartbeat.notifySend();
        const msg = JSON.stringify(patch);
        // send message only if there is a working ws connection
        if (this.useWebSocket && this._ws && this._ws.readyState === 1) {
            this._ws.send(msg);
            this.onSend(msg, this._ws.url,'WS');
        } else {
            const url = this.remoteUrl.href;
            const method = 'PATCH';
            const data = await this._fetch(
                method,
                url,
                'application/json-patch+json',
                msg
            );

            //TODO the below assertion should pass. However, some tests wrongly respond with an object instead of a patch
            //console.assert(data instanceof Array, "expecting parsed JSON-Patch");
            this._notifyReceive(data, url, method);
        }
        return this;
    }

    /**
     * Callback function that will be called once message from remote comes.
     * @param {JSONPatch} data single parsed JSON Patch (array of operations objects) that was send by remote.
     * @param {String} url from which the change was issued
     * @param {String} method HTTP method which resulted in this change ('GET' or 'PATCH') or 'WS' if came as Web Socket message
     */
    onReceive() {}

    onSend() {}
    onStateChange() {}
    upgrade(msg) {}

    /**
     * Send a WebSocket upgrade request to the server.
     * For testing purposes WS upgrade url is hard-coded now in Palindrom (replace __default/ID with __default/ID)
     * In future, server should suggest the WebSocket upgrade URL
     * @TODO:(tomalec)[cleanup] hide from public API.
     * @param {Function} [callback] Function to be called once connection gets opened.
     * @returns {WebSocket} created WebSocket
     */
    webSocketUpgrade(onSocketOpenCallback) {
        this.wsUrl = toWebSocketURL(this.remoteUrl.href);
        const upgradeURL = this.wsUrl;

        this.closeConnection();
        // in node, WebSocket will have `w3cwebsocket` prop. In the browser it won't

        const UsedSocket = websocket__WEBPACK_IMPORTED_MODULE_3___default.a.w3cwebsocket || websocket__WEBPACK_IMPORTED_MODULE_3___default.a;
        this._ws = new UsedSocket(upgradeURL);
        this._ws.onopen = event => {
            this.onStateChange(this._ws.readyState, upgradeURL);
            onSocketOpenCallback && onSocketOpenCallback(event);
        };
        this._ws.onmessage = event => {
            try {
                var parsedMessage = JSON.parse(event.data);
            } catch (e) {
                this._handleFatalError(
                    new _palindrom_errors_js__WEBPACK_IMPORTED_MODULE_1__[/* PalindromConnectionError */ "a"](
                        event.data,
                        SERVER,
                        this._ws.url,
                        'WS'
                    )
                );
                return;
            }
            this._notifyReceive(parsedMessage, this._ws.url, 'WS');
        };
        this._ws.onerror = event => {
            this.onStateChange(this._ws.readyState, upgradeURL, event.data);

            if (!this.useWebSocket) {
                return;
            }

            const message = [
                'WebSocket connection could not be made',
                'readyState: ' + this._ws.readyState
            ].join('\n');

            this._handleFatalError(
                new _palindrom_errors_js__WEBPACK_IMPORTED_MODULE_1__[/* PalindromConnectionError */ "a"](message, CLIENT, upgradeURL, 'WS')
            );
        };
        this._ws.onclose = event => {
            //TODO none of the tests enters here
            this.onStateChange(
                this._ws.readyState,
                upgradeURL,
                null,
                event.code,
                event.reason
            );

            const message = [
                'WebSocket connection closed unexpectedly.',
                'reason: ' + event.reason,
                'readyState: ' + this._ws.readyState,
                'stateCode: ' + event.code
            ].join('\n');

            if (event.reason) {
                this._handleFatalError(
                    new _palindrom_errors_js__WEBPACK_IMPORTED_MODULE_1__[/* PalindromConnectionError */ "a"](
                        message,
                        SERVER,
                        upgradeURL,
                        'WS'
                    )
                );
            } else if (!event.wasClean) {
                this._handleConnectionError(
                    new _palindrom_errors_js__WEBPACK_IMPORTED_MODULE_1__[/* PalindromConnectionError */ "a"](
                        message,
                        SERVER,
                        upgradeURL,
                        'WS'
                    )
                );
            }
        };
    }
    closeConnection() {
        if (this._ws) {
            this._ws.onclose = () => {};
            this._ws.close();
            this._ws = null;
        }
    }
    /**
     * @param {String} href
     * @throws {Error} network error if occured
     * @returns {Promise<Object>} fetched patch
     * @see #_fetch
     */
    async getPatchUsingHTTP(href) {
        // we don't need to try catch here because we want the error to be thrown at whoever calls getPatchUsingHTTP
        const method = 'GET';
        const data = await this._fetch(
            method,
            href,
            'application/json-patch+json',
            null,
            true
        );

        //TODO the below assertion should pass. However, some tests wrongly respond with an object instead of a patch
        //console.assert(data instanceof Array, "expecting parsed JSON-Patch");
        this._notifyReceive(data, href, method);
        return data;
    }

    _setRemoteUrl(remoteUrl) {
        if (
            this.remoteUrlSet &&
            this.remoteUrl &&
            this.remoteUrl != remoteUrl
        ) {
            const message = [
                'Session lost.',
                'Server replied with a different session ID than the already set one.',
                'Possibly a server restart happened while you were working.',
                'Please reload the page.',
                'Previous session ID: ' + this.remoteUrl,
                'New session ID: ' + remoteUrl
            ].join('\n');

            throw new _palindrom_errors_js__WEBPACK_IMPORTED_MODULE_1__[/* PalindromError */ "b"](message);
        }
        this.remoteUrlSet = true;
        this.remoteUrl = new _URLShim_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"](remoteUrl, this.remoteUrl.href);
    }

    _handleLocationHeader(res) {
        const location = res.headers.get('x-location') || res.headers.get('location');
        if (location) {
            this._setRemoteUrl(location);
        }
    }
    /**
     * Handles unsuccessful HTTP requests
     * @param error
     */
    async _handleFailureResponse(url, method, error) {
        // no sufficient error information, we need to create on our own
        var statusCode = -1;
        var statusText = `An unknown network error has occurred. Raw message: ${
            error.message
        }`;
        var reason = 'Maybe you lost connection with the server';
        // log it for verbosity
        console.error(error);

        const message = [
            statusText,
            'statusCode: ' + statusCode,
            'reason: ' + reason,
            'url: ' + url,
            'HTTP method: ' + method
        ].join('\n');

        this._handleFatalError(
            new _palindrom_errors_js__WEBPACK_IMPORTED_MODULE_1__[/* PalindromConnectionError */ "a"](message, CLIENT, url, method)
        );
    }

    /**
     * Internal method to perform HTTP Request.
     * @param {String} method HTTP method to be used
     * @param {String} url URL to send the request. If empty string, undefined or null given - the request will be sent to window location
     * @param {String} [accept] HTTP accept header
     * @param {String} [data] stringified data payload
     * @param {Boolean} [setReferer=false] Should `X-Referer` header be sent
     * @returns {Promise<Object>} promise for fetched JSON data
     */
    async _fetch(method, url, accept, data, setReferer) {
        const config = { headers: {}, method, credentials: 'include' };
        const headers = config.headers;

        if (data) {
            headers['Content-Type'] = 'application/json-patch+json';
            config.body = data;
        }
        if (accept) {
            headers['Accept'] = accept;
        }
        if (this.remoteUrl && setReferer) {
            headers['X-Referer'] = this.remoteUrl.pathname;
        }

        this.onSend(data, url, method);

        let isomorphicFetch = typeof global !== 'undefined' && global.fetch || node_fetch__WEBPACK_IMPORTED_MODULE_4___default.a;

        const response = await isomorphicFetch(url, config);
        const dataPromise = response.json();

        return dataPromise
            .then(data => {
                // if we're here, it's a valid JSON response
                // response.ok is `false` for 4xx responses
                if (response.status < 500) {
                    this._handleLocationHeader(response);
                    return data;
                } else {
                    const error = new Error(`HTTP ${response.status} response: response body is ${JSON.stringify(data)}`);
                    throw error;
                }
            })
            .catch(error => {
                this._handleFailureResponse(url, method, error);
                throw error;
            });
    }
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(10)))

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*!
 * https://github.com/Palindrom/JSONPatcherProxy
 * (c) 2017 Starcounter 
 * MIT license
 */

/** Class representing a JS Object observer  */
const JSONPatcherProxy = (function() {
  /**
  * Deep clones your object and returns a new object.
  */
  function deepClone(obj) {
    switch (typeof obj) {
      case 'object':
        return JSON.parse(JSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
      case 'undefined':
        return null; //this is how JSON.stringify behaves for array items
      default:
        return obj; //no need to clone primitives
    }
  }
  JSONPatcherProxy.deepClone = deepClone;

  function escapePathComponent(str) {
    if (str.indexOf('/') == -1 && str.indexOf('~') == -1) return str;
    return str.replace(/~/g, '~0').replace(/\//g, '~1');
  }
  JSONPatcherProxy.escapePathComponent = escapePathComponent;

  /**
   * Walk up the parenthood tree to get the path
   * @param {JSONPatcherProxy} instance 
   * @param {Object} obj the object you need to find its path
   */
  function findObjectPath(instance, obj) {
    const pathComponents = [];
    let parentAndPath = instance.parenthoodMap.get(obj);
    while (parentAndPath && parentAndPath.path) {
      // because we're walking up-tree, we need to use the array as a stack
      pathComponents.unshift(parentAndPath.path);
      parentAndPath = instance.parenthoodMap.get(parentAndPath.parent);
    }
    if (pathComponents.length) {
      const path = pathComponents.join('/');
      return '/' + path;
    }
    return '';
  }
  /**
   * A callback to be used as th proxy set trap callback.
   * It updates parenthood map if needed, proxifies nested newly-added objects, calls default callbacks with the changes occurred.
   * @param {JSONPatcherProxy} instance JSONPatcherProxy instance
   * @param {Object} target the affected object
   * @param {String} key the effect property's name
   * @param {Any} newValue the value being set
   */
  function setTrap(instance, target, key, newValue) {
    const parentPath = findObjectPath(instance, target);

    const destinationPropKey = parentPath + '/' + escapePathComponent(key);

    if (instance.proxifiedObjectsMap.has(newValue)) {
      const newValueOriginalObject = instance.proxifiedObjectsMap.get(newValue);

      instance.parenthoodMap.set(newValueOriginalObject.originalObject, {
        parent: target,
        path: key
      });
    }
    /*
        mark already proxified values as inherited.
        rationale: proxy.arr.shift()
        will emit
        {op: replace, path: '/arr/1', value: arr_2}
        {op: remove, path: '/arr/2'}

        by default, the second operation would revoke the proxy, and this renders arr revoked.
        That's why we need to remember the proxies that are inherited.
      */
    const revokableInstance = instance.proxifiedObjectsMap.get(newValue);
    /*
    Why do we need to check instance.isProxifyingTreeNow?

    We need to make sure we mark revokables as inherited ONLY when we're observing,
    because throughout the first proxification, a sub-object is proxified and then assigned to 
    its parent object. This assignment of a pre-proxified object can fool us into thinking
    that it's a proxified object moved around, while in fact it's the first assignment ever. 

    Checking isProxifyingTreeNow ensures this is not happening in the first proxification, 
    but in fact is is a proxified object moved around the tree
    */
    if (revokableInstance && !instance.isProxifyingTreeNow) {
      revokableInstance.inherited = true;
    }

    // if the new value is an object, make sure to watch it
    if (
      newValue &&
      typeof newValue == 'object' &&
      !instance.proxifiedObjectsMap.has(newValue)
    ) {
      instance.parenthoodMap.set(newValue, {
        parent: target,
        path: key
      });
      newValue = instance._proxifyObjectTreeRecursively(target, newValue, key);
    }
    // let's start with this operation, and may or may not update it later
    const operation = {
      op: 'remove',
      path: destinationPropKey
    };
    if (typeof newValue == 'undefined') {
      // applying De Morgan's laws would be a tad faster, but less readable
      if (!Array.isArray(target) && !target.hasOwnProperty(key)) {
        // `undefined` is being set to an already undefined value, keep silent
        return Reflect.set(target, key, newValue);
      } else {
        // when array element is set to `undefined`, should generate replace to `null`
        if (Array.isArray(target)) {
          // undefined array elements are JSON.stringified to `null`
          (operation.op = 'replace'), (operation.value = null);
        }
        const oldValue = instance.proxifiedObjectsMap.get(target[key]);
        // was the deleted a proxified object?
        if (oldValue) {
          instance.parenthoodMap.delete(target[key]);
          instance.disableTrapsForProxy(oldValue);
          instance.proxifiedObjectsMap.delete(oldValue);
        }
      }
    } else {
      if (Array.isArray(target) && !Number.isInteger(+key.toString())) {
        /* array props (as opposed to indices) don't emit any patches, to avoid needless `length` patches */
        if(key != 'length') {
          console.warn('JSONPatcherProxy noticed a non-integer prop was set for an array. This will not emit a patch');
        }
        return Reflect.set(target, key, newValue);
      }
      operation.op = 'add';
      if (target.hasOwnProperty(key)) {
        if (typeof target[key] !== 'undefined' || Array.isArray(target)) {
          operation.op = 'replace'; // setting `undefined` array elements is a `replace` op
        }
      }
      operation.value = newValue;
    }
    const reflectionResult = Reflect.set(target, key, newValue);
    instance.defaultCallback(operation);
    return reflectionResult;
  }
  /**
   * A callback to be used as th proxy delete trap callback.
   * It updates parenthood map if needed, calls default callbacks with the changes occurred.
   * @param {JSONPatcherProxy} instance JSONPatcherProxy instance
   * @param {Object} target the effected object
   * @param {String} key the effected property's name
   */
  function deleteTrap(instance, target, key) {
    if (typeof target[key] !== 'undefined') {
      const parentPath = findObjectPath(instance, target);
      const destinationPropKey = parentPath + '/' + escapePathComponent(key);

      const revokableProxyInstance = instance.proxifiedObjectsMap.get(
        target[key]
      );

      if (revokableProxyInstance) {
        if (revokableProxyInstance.inherited) {
          /*
            this is an inherited proxy (an already proxified object that was moved around), 
            we shouldn't revoke it, because even though it was removed from path1, it is still used in path2.
            And we know that because we mark moved proxies with `inherited` flag when we move them

            it is a good idea to remove this flag if we come across it here, in deleteProperty trap.
            We DO want to revoke the proxy if it was removed again.
          */
          revokableProxyInstance.inherited = false;
        } else {
          instance.parenthoodMap.delete(revokableProxyInstance.originalObject);
          instance.disableTrapsForProxy(revokableProxyInstance);
          instance.proxifiedObjectsMap.delete(target[key]);
        }
      }
      const reflectionResult = Reflect.deleteProperty(target, key);

      instance.defaultCallback({
        op: 'remove',
        path: destinationPropKey
      });

      return reflectionResult;
    }
  }
  /* pre-define resume and pause functions to enhance constructors performance */
  function resume() {
    this.defaultCallback = operation => {
      this.isRecording && this.patches.push(operation);
      this.userCallback && this.userCallback(operation);
    };
    this.isObserving = true;
  }
  function pause() {
    this.defaultCallback = () => {};
    this.isObserving = false;
  }
  /**
    * Creates an instance of JSONPatcherProxy around your object of interest `root`. 
    * @param {Object|Array} root - the object you want to wrap
    * @param {Boolean} [showDetachedWarning = true] - whether to log a warning when a detached sub-object is modified @see {@link https://github.com/Palindrom/JSONPatcherProxy#detached-objects} 
    * @returns {JSONPatcherProxy}
    * @constructor
    */
  function JSONPatcherProxy(root, showDetachedWarning) {
    this.isProxifyingTreeNow = false;
    this.isObserving = false;
    this.proxifiedObjectsMap = new Map();
    this.parenthoodMap = new Map();
    // default to true
    if (typeof showDetachedWarning !== 'boolean') {
      showDetachedWarning = true;
    }

    this.showDetachedWarning = showDetachedWarning;
    this.originalObject = root;
    this.cachedProxy = null;
    this.isRecording = false;
    this.userCallback;
    /**
     * @memberof JSONPatcherProxy
     * Restores callback back to the original one provided to `observe`.
     */
    this.resume = resume.bind(this);
    /**
     * @memberof JSONPatcherProxy
     * Replaces your callback with a noop function.
     */
    this.pause = pause.bind(this);
  }

  JSONPatcherProxy.prototype.generateProxyAtPath = function(parent, obj, path) {
    if (!obj) {
      return obj;
    }
    const traps = {
      set: (target, key, value, receiver) =>
        setTrap(this, target, key, value, receiver),
      deleteProperty: (target, key) => deleteTrap(this, target, key)
    };
    const revocableInstance = Proxy.revocable(obj, traps);
    // cache traps object to disable them later.
    revocableInstance.trapsInstance = traps;
    revocableInstance.originalObject = obj;

    /* keeping track of object's parent and path */

    this.parenthoodMap.set(obj, { parent, path });

    /* keeping track of all the proxies to be able to revoke them later */
    this.proxifiedObjectsMap.set(revocableInstance.proxy, revocableInstance);
    return revocableInstance.proxy;
  };
  // grab tree's leaves one by one, encapsulate them into a proxy and return
  JSONPatcherProxy.prototype._proxifyObjectTreeRecursively = function(
    parent,
    root,
    path
  ) {
    for (let key in root) {
      if (root.hasOwnProperty(key)) {
        if (root[key] instanceof Object) {
          root[key] = this._proxifyObjectTreeRecursively(
            root,
            root[key],
            escapePathComponent(key)
          );
        }
      }
    }
    return this.generateProxyAtPath(parent, root, path);
  };
  // this function is for aesthetic purposes
  JSONPatcherProxy.prototype.proxifyObjectTree = function(root) {
    /*
    while proxyifying object tree,
    the proxyifying operation itself is being
    recorded, which in an unwanted behavior,
    that's why we disable recording through this
    initial process;
    */
    this.pause();
    this.isProxifyingTreeNow = true;
    const proxifiedObject = this._proxifyObjectTreeRecursively(
      undefined,
      root,
      ''
    );
    /* OK you can record now */
    this.isProxifyingTreeNow = false;
    this.resume();
    return proxifiedObject;
  };
  /**
   * Turns a proxified object into a forward-proxy object; doesn't emit any patches anymore, like a normal object
   * @param {Proxy} proxy - The target proxy object
   */
  JSONPatcherProxy.prototype.disableTrapsForProxy = function(
    revokableProxyInstance
  ) {
    if (this.showDetachedWarning) {
      const message =
        "You're accessing an object that is detached from the observedObject tree, see https://github.com/Palindrom/JSONPatcherProxy#detached-objects";

      revokableProxyInstance.trapsInstance.set = (
        targetObject,
        propKey,
        newValue
      ) => {
        console.warn(message);
        return Reflect.set(targetObject, propKey, newValue);
      };
      revokableProxyInstance.trapsInstance.set = (
        targetObject,
        propKey,
        newValue
      ) => {
        console.warn(message);
        return Reflect.set(targetObject, propKey, newValue);
      };
      revokableProxyInstance.trapsInstance.deleteProperty = (
        targetObject,
        propKey
      ) => {
        return Reflect.deleteProperty(targetObject, propKey);
      };
    } else {
      delete revokableProxyInstance.trapsInstance.set;
      delete revokableProxyInstance.trapsInstance.get;
      delete revokableProxyInstance.trapsInstance.deleteProperty;
    }
  };
  /**
   * Proxifies the object that was passed in the constructor and returns a proxified mirror of it. Even though both parameters are options. You need to pass at least one of them.
   * @param {Boolean} [record] - whether to record object changes to a later-retrievable patches array.
   * @param {Function} [callback] - this will be synchronously called with every object change with a single `patch` as the only parameter.
   */
  JSONPatcherProxy.prototype.observe = function(record, callback) {
    if (!record && !callback) {
      throw new Error('You need to either record changes or pass a callback');
    }
    this.isRecording = record;
    this.userCallback = callback;
    /*
    I moved it here to remove it from `unobserve`,
    this will also make the constructor faster, why initiate
    the array before they decide to actually observe with recording?
    They might need to use only a callback.
    */
    if (record) this.patches = [];
    this.cachedProxy = this.proxifyObjectTree(this.originalObject);
    return this.cachedProxy;
  };
  /**
   * If the observed is set to record, it will synchronously return all the patches and empties patches array.
   */
  JSONPatcherProxy.prototype.generate = function() {
    if (!this.isRecording) {
      throw new Error('You should set record to true to get patches later');
    }
    return this.patches.splice(0, this.patches.length);
  };
  /**
   * Revokes all proxies rendering the observed object useless and good for garbage collection @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/revocable}
   */
  JSONPatcherProxy.prototype.revoke = function() {
    this.proxifiedObjectsMap.forEach(el => {
      el.revoke();
    });
  };
  /**
   * Disables all proxies' traps, turning the observed object into a forward-proxy object, like a normal object that you can modify silently.
   */
  JSONPatcherProxy.prototype.disableTraps = function() {
    this.proxifiedObjectsMap.forEach(this.disableTrapsForProxy, this);
  };
  return JSONPatcherProxy;
})();

if (true) {
  module.exports = JSONPatcherProxy;
  module.exports.default = JSONPatcherProxy;
}


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/*!
 * https://github.com/Palindrom/JSONPatchOT
 * JSON-Patch-OT version: 1.0.1
 * (c) 2017 Tomek Wytrebowicz
 * MIT license
 */

var JSONPatchOT = (function(){

  var debug = false;
  var JSONPatchOT = JSONPatchOT || {};
  JSONPatchOT.transform = function (sequenceA, sequences) {
    var concatAllSequences = [];
    concatAllSequences = concatAllSequences.concat.apply(concatAllSequences, sequences);
    // var clonedPatch = JSON.parse(JSON.stringify(this.patch)); // clone needed for debugging and visualization
    var clonedPatch = JSON.parse(JSON.stringify(sequenceA)); // clone needed for debugging and visualization
    var result = concatAllSequences.reduce(composeJSONPatches, clonedPatch); // <=> composeJSONPatches(this, operations.concat() )
    return result;
    // return new JSONPatchOperation(result, this.localRevision, operations[operations.length-1].localRevision, this.localRevPropName, this.remoteRevPropName);
  };
  JSONPatchOT.transformAgainstSingleOp = function(sequenceA, operationObj){

  };
  var composeJSONPatches = function( original, operationObj ){

      // basic validation (as in fast-json-patch)
      if (operationObj.value === undefined && (operationObj.op === "add" || operationObj.op === "replace" || operationObj.op === "test")) {
          throw new Error("'value' MUST be defined");
      }
      if (operationObj.from === undefined && (operationObj.op === "copy" || operationObj.op === "move")) {
          throw new Error("'from' MUST be defined");
      }

      // apply patch operation to all original ops
      if(transformAgainst[operationObj.op]){ // if we have any function to transform operationObj.op at all
        if(typeof transformAgainst[operationObj.op] == "function"){ //not perfectly performant but gives easier maintenance and flexibility with transformations
          transformAgainst[operationObj.op](operationObj, original);
        } else {
          var orgOpsLen = original.length, currentOp = 0;
          while (currentOp < orgOpsLen) {
            var originalOp = original[currentOp];
            currentOp++;

            if( transformAgainst[operationObj.op][originalOp.op] ){
              transformAgainst[operationObj.op][originalOp.op](operationObj, originalOp)
            } else{
              debug && console.log("No function to transform " + originalOp.op + "against" + operationObj.op);
            }
          }
        }
      } else {
        debug && console.log("No function to transform against " + operationObj.op)
      }
      return original;
    };
    var transformAgainst = {
      remove: function(patchOp, original){
        debug && console.log("Transforming ", JSON.stringify(original) ," against `remove` ", patchOp);
        var orgOpsLen = original.length, currentOp = 0, originalOp;
        // remove operation objects
        while (originalOp = original[currentOp]) {


          // TODO: `move`, and `copy` (`from`) may not be covered well (tomalec)
          debug && console.log("TODO: `move`, and `copy` (`from`) may not be covered well (tomalec)");
          if( (originalOp.op === 'add' || originalOp.op === 'test') && patchOp.path === originalOp.path ){
            // do nothing ? (tomalec)
          } else
          // node in question was removed
          if( originalOp.from &&
                  (originalOp.from === patchOp.path || originalOp.from.indexOf(patchOp.path + "/") === 0 ) ||
              ( patchOp.path === originalOp.path || originalOp.path.indexOf(patchOp.path + "/") === 0 ) ){
            debug && console.log("Removing ", originalOp);
            original.splice(currentOp,1);
            orgOpsLen--;
            currentOp--;
          }
          currentOp++;
        }
        // shift indexes
        // var match = patchOp.path.match(/(.*\/)(\d+)$/); // last element is a number
        var lastSlash = patchOp.path.lastIndexOf("/");
        if( lastSlash > -1){
          var index = patchOp.path.substr(lastSlash+1);
          var arrayPath = patchOp.path.substr(0,lastSlash+1);
          if( isValidIndex(index)){
            debug && console.warn("Bug prone guessing that, as number given in path, this is an array!");

            debug && console.log("Shifting array indexes");
            orgOpsLen = original.length;
            currentOp = 0;
            while (currentOp < orgOpsLen) {
              originalOp = original[currentOp];
              currentOp++;

              if(originalOp.path.indexOf(arrayPath) === 0){//item from the same array
                originalOp.path = replacePathIfHigher(originalOp.path, arrayPath, index);
              }
              if(originalOp.from && originalOp.from.indexOf(arrayPath) === 0){//item from the same array
                originalOp.from = replacePathIfHigher(originalOp.from, arrayPath, index);
              }
            }
          }
        }

      },
      replace: function(patchOp, original){
        debug && console.log("Transforming ", JSON.stringify(original) ," against `replace` ", patchOp);
        var currentOp = 0, originalOp;
        // remove operation objects withing replaced JSON node
        while (originalOp = original[currentOp]) {


          // TODO: `move`, and `copy` (`from`) may not be covered well (tomalec)
          debug && console.log("TODO: `move`, and `copy` (`from`) may not be covered well (tomalec)");
          // node in question was removed
          // IT:
          // if( patchOp.path === originalOp.path || originalOp.path.indexOf(patchOp.path + "/") === 0 ){
          if( originalOp.from &&
                  (originalOp.from === patchOp.path || originalOp.from.indexOf(patchOp.path + "/") === 0 ) ||
              originalOp.path.indexOf(patchOp.path + "/") === 0 ){
            debug && console.log("Removing ", originalOp);
            original.splice(currentOp,1);
            currentOp--;
          }
          currentOp++;
        }

      }
    };
    function replacePathIfHigher(path, repl, index){
      var result = path.substr(repl.length);
      // var match = result.match(/^(\d+)(.*)/);
      // if(match && match[1] > index){
      var eoindex = result.indexOf("/");
      eoindex > -1 || (eoindex = result.length);
      var oldIndex = result.substr(0, eoindex);
      var rest  = result.substr(eoindex);
      if(isValidIndex(oldIndex) && oldIndex > index){
        return repl + (oldIndex -1) + rest;
      } else {
        return path;
      }
    }
    function isValidIndex(str) {
        var n = ~~Number(str);
        return String(n) === str && n >= 0;
    }
    return JSONPatchOT;
}());

if(true) {
  module.exports = JSONPatchOT;
  module.exports.default = JSONPatchOT;
  module.exports.__esModule = true;
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

if(typeof JSONPatchQueue === 'undefined') {
	if(true) {
		var JSONPatchQueue = __webpack_require__(18).JSONPatchQueue;
	}
	else {}
}

/**
 * [JSONPatchOTAgent description]
 * @param {Object} obj The target object where patches are applied
 * @param {Function} transform function(seqenceA, sequences) that transforms `seqenceA` against `sequences`.
 * @param {Array<JSON-Pointer>} versionPaths JSON-Pointers to version numbers [local, remote]
 * @param {function} apply apply(JSONobj, JSONPatchSequence) function to apply JSONPatch to object. Must return the final state of the object.
 * @param {Boolean} purity 
 * @constructor
 * @extends {JSONPatchQueue}
 * @version: 2.0.0-rc.0
 */
var JSONPatchOTAgent = function(obj, transform, versionPaths, apply, purity){
	JSONPatchQueue.call(this, obj, versionPaths, apply, purity);
	this.transform = transform;
	/**
	 * History of performed JSON Patch sequences that might not yet be acknowledged by Peer
	 * @type {Array<JSONPatch>}
	 */
	this.pending = [];

};
JSONPatchOTAgent.prototype = Object.create(JSONPatchQueue.prototype);
JSONPatchOTAgent.prototype.constructor = JSONPatchOTAgent;
JSONPatchOTAgent.prototype.ackLocalVersion = 0;

/**
 * Wraps JSON Patch sequence with version related operation objects
 * @param  {JSONPatch} sequence JSON Patch sequence to wrap
 * @return {VersionedJSONPatch}
 */
JSONPatchOTAgent.prototype.send = function(sequence){
	var newSequence = sequence.slice(0);
	newSequence.unshift({ // test for conflict resolutions
		op: "test",
		path: this.remotePath,
		value: this.remoteVersion
	});
	var versionedJSONPatch = JSONPatchQueue.prototype.send.call(this, newSequence);
	this.pending.push(versionedJSONPatch);
    return versionedJSONPatch;
};


/**
 * Process received versioned JSON Patch
 * Adds to queue, transform and apply when applicable.
 * @param  {Object} obj object to apply patches to
 * @param  {JSONPatch} versionedJsonPatch patch to be applied
 * @param  {Function} [applyCallback] optional `function(object, consecutiveTransformedPatch)` to be called when applied, must return the final state of the object, if not given #apply will be called
 */
JSONPatchOTAgent.prototype.receive = function(versionedJsonPatch, applyCallback){
	var apply = applyCallback || this.apply,
		queue = this;

	return JSONPatchQueue.prototype.receive.call(this, versionedJsonPatch,
		function applyOT(obj, remoteVersionedJsonPatch){
			// console.log("applyPatch", queue, arguments);
	        // transforming / applying
	        var consecutivePatch = remoteVersionedJsonPatch.slice(0);

	        // shift first operation object as it should contain test for our local version.
	        // ! We assume correct sequence structure, and queuing applied before.
	        //
	        // Latest local version acknowledged by remote
	        // Thanks to the queue version may only be higher or equal to current.
	        var localVersionAckByRemote = consecutivePatch.shift().value;
	        var ackDistance = localVersionAckByRemote - queue.ackLocalVersion;
	        queue.ackLocalVersion = localVersionAckByRemote;

	        //clear pending operations
	        queue.pending.splice(0,ackDistance);
	        if(queue.pending.length){// is there any pending local operation?
	            // => Remote sent us something based on outdated versionDistance
	            // console.info("Transformation needed", consecutivePatch, 'by', queue.nonAckList);
	            consecutivePatch = queue.transform(
	                    consecutivePatch,
	                    queue.pending
	                );
			}
			return queue.obj = apply(queue.obj, consecutivePatch);
		});
};

/**
 * Reset queue internals and object to new, given state
 * @param newState versioned object representing desired state along with versions
 */
JSONPatchOTAgent.prototype.reset = function(newState){
	this.ackLocalVersion = JSONPatchQueue.getPropertyByJsonPointer(newState, this.localPath);
	this.pending = [];
	return this.obj = JSONPatchQueue.prototype.reset.call(this, newState);
};
if(true) {
	module.exports = JSONPatchOTAgent;
	module.exports.default = JSONPatchOTAgent;
	module.exports.__esModule = true;
}

/***/ }),
/* 10 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;/*! https://mths.be/punycode v1.3.2 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports =  true && exports &&
		!exports.nodeType && exports;
	var freeModule =  true && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.3.2',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		true
	) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
			return punycode;
		}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}

}(this));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(12)(module), __webpack_require__(13)))

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 13 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.decode = exports.parse = __webpack_require__(16);
exports.encode = exports.stringify = __webpack_require__(17);


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * version: 3.0.0-rc.0
 */
var queue = __webpack_require__(19);
var sync = __webpack_require__(20);

module.exports = { JSONPatchQueue: queue, JSONPatchQueueSynchronous: sync, /* Babel demands this */__esModule:  true };


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * JSON Patch Queue for asynchronous operations, and asynchronous networking.
 * version: 3.0.0-rc.0
 * @param {Object} obj The target object where patches are applied
 * @param {Array<JSON-Pointer>} versionPaths JSON-Pointers to version numbers [local, remote]
 * @param {function} apply    apply(JSONobj, JSONPatchSequence) function to apply JSONPatch to object.
 * @param {Boolean} [purist]       If set to true adds test operation before replace.
 */
var JSONPatchQueue = function(obj, versionPaths, apply, purist){

	/**
	 * The target object where patches are applied
	 * @type {Object}
	 */
	this.obj = obj;
	/**
	 * Queue of consecutive JSON Patch sequences. May contain gaps.
	 * Item with index 0 has 1 version gap to this.remoteVersion.
	 * @type {Array}
	 */
	this.waiting = [];
	/**
	 * JSON-Pointer to local version in shared JSON document
	 * @type {JSONPointer}
	 */
	this.localPath = versionPaths[0];
	/**
	 * JSON-Pointer to remote version in shared JSON document
	 * @type {JSONPointer}
	 */
	this.remotePath = versionPaths[1];
	/**
	 * Function to apply JSONPatchSequence to JSON object
	 * @type {Function}
	 */
	this.apply = apply;
	/**
	 * If set to true adds test operation before replace.
	 * @type {Bool}
	 */
	this.purist = purist;

};
/** local version */
JSONPatchQueue.prototype.localVersion = 0;
/** Latest localVersion that we know that was acknowledged by remote */
// JSONPatchQueue.prototype.ackVersion = 0;
/** Latest acknowledged remote version */
JSONPatchQueue.prototype.remoteVersion = 0;

// instance property
//  JSONPatchQueue.prototype.waiting = [];
/** needed? OT only? */
// JSONPatchQueue.prototype.pending = [];
/**
 * Process received versioned JSON Patch
 * Applies or adds to queue.
 * @param  {JSONPatch} versionedJsonPatch patch to be applied
 * @param  {Function} [applyCallback]     optional `function(object, consecutivePatch)` to be called when applied, if not given #apply will be called
 */
JSONPatchQueue.prototype.receive = function(versionedJsonPatch, applyCallback){
	var apply = applyCallback || this.apply,
		consecutivePatch = versionedJsonPatch.slice(0);
	// strip Versioned JSON Patch specyfiv operation objects from given sequence
		if(this.purist){
			var testRemote = consecutivePatch.shift();
		}
		var replaceRemote = consecutivePatch.shift(),
			newRemoteVersion = replaceRemote.value;

	// TODO: perform versionedPath validation if needed (tomalec)

	if( newRemoteVersion <= this.remoteVersion){
	// someone is trying to change something that was already updated
    	throw new Error("Given version was already applied.");
	} else if ( newRemoteVersion == this.remoteVersion + 1 ){
	// consecutive new version
		while( consecutivePatch ){// process consecutive patch(-es)
			this.remoteVersion++;
			this.obj = apply(this.obj, consecutivePatch);
			consecutivePatch = this.waiting.shift();
		}
	} else {
	// add sequence to queue in correct position.
		this.waiting[newRemoteVersion - this.remoteVersion -2] = consecutivePatch;
	}
};
/**
 * Wraps JSON Patch sequence with version related operation objects
 * @param  {JSONPatch} sequence JSON Patch sequence to wrap
 * @return {VersionedJSONPatch}
 */
JSONPatchQueue.prototype.send = function(sequence){
	this.localVersion++;
	var newSequence = sequence.slice(0);
	if(this.purist){
		newSequence.unshift({ // test for consecutiveness
			op: "test",
			path: this.localPath,
			value: this.localVersion - 1
		},{ // replace for queue
			op: "replace",
			path: this.localPath,
			value: this.localVersion
		});
	} else {
		newSequence.unshift({ // replace for queue (+assumed test for consecutiveness_)
			op: "replace",
			path: this.localPath,
			value: this.localVersion
		});
	}
	return newSequence;
};

JSONPatchQueue.getPropertyByJsonPointer = function(obj, pointer) {
	var parts = pointer.split('/');
	if(parts[0] === "") {
		parts.shift();
	}
	var target = obj;
	while(parts.length) {
		var path = parts.shift().replace('~1', '/').replace('~0', '~');
		if(parts.length) {
			target = target[path];
		}
	}
	return target[path];
};

/**
 * Reset queue internals and object to new, given state
 * @param newState versioned object representing desired state along with versions
 */
JSONPatchQueue.prototype.reset = function(newState){
	this.remoteVersion = JSONPatchQueue.getPropertyByJsonPointer(newState, this.remotePath);
	this.waiting = [];
	var patch = [{ op: "replace", path: "", value: newState }];
	return this.obj = this.apply(this.obj, patch);
};

if(true) {
	module.exports = JSONPatchQueue;
	module.exports.default = JSONPatchQueue;
	/* Babel demands this */
	module.exports.__esModule = true;
}


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * JSON Patch Queue for synchronous operations, and asynchronous networking.
 * version: 3.0.0-rc.0
 * @param {Object} Obj The target object where patches are applied
 * @param {JSON-Pointer} versionPath JSON-Pointers to version numbers
 * @param {function} apply    apply(JSONobj, JSONPatchSequence) function to apply JSONPatch to object.
 * @param {Boolean} [purist]       If set to true adds test operation before replace.
 */
var JSONPatchQueueSynchronous = function(obj, versionPath, apply, purist){

	/**
	 * The target object where patches are applied
	 * @type {Object}
	 */
	this.obj = obj;

	/**
	 * Queue of consecutive JSON Patch sequences. May contain gaps.
	 * Item with index 0 has 1 sequence version gap to `this.version`.
	 * @type {Array}
	 */
	this.waiting = [];
	/**
	 * JSON-Pointer to local version in shared JSON document
	 * @type {JSONPointer}
	 */
	this.versionPath = versionPath;
	/**
	 * Function to apply JSONPatchSequence to JSON object
	 * @type {Function}
	 */
	this.apply = apply;
	/**
	 * If set to true adds test operation before replace.
	 * @type {Bool}
	 */
	this.purist = purist;
};
/** JSON version */
JSONPatchQueueSynchronous.prototype.version = 0;
//JSONPatchQueueSynchronous.prototype.purist = false;
// instance property
//  JSONPatchQueueSynchronous.prototype.waiting = [];
/**
 * Process received versioned JSON Patch.
 * Applies or adds to queue.
 * @param  {JSONPatch} versionedJsonPatch patch to be applied
 * @param  {Function} [applyCallback]     optional `function(object, consecutivePatch)` to be called when applied, if not given #apply will be called
 */
JSONPatchQueueSynchronous.prototype.receive = function(versionedJsonPatch, applyCallback){
	var apply = applyCallback || this.apply,
		consecutivePatch = versionedJsonPatch.slice(0);
	// strip Versioned JSON Patch specyfiv operation objects from given sequence
		if(this.purist){
			var testRemote = consecutivePatch.shift();
		}
		var replaceVersion = consecutivePatch.shift(),
			newVersion = replaceVersion.value;

	// TODO: perform versionedPath validation if needed (tomalec)

	if( newVersion <= this.version){
	// someone is trying to change something that was already updated
    	throw new Error("Given version was already applied.");
	} else if ( newVersion == this.version + 1 ){
	// consecutive new version
		while( consecutivePatch ){// process consecutive patch(-es)
			this.version++;
			this.obj = apply(this.obj, consecutivePatch);
			consecutivePatch = this.waiting.shift();
		}
	} else {
	// add sequence to queue in correct position.
		this.waiting[newVersion - this.version -2] = consecutivePatch;
	}
};
/**
 * Wraps JSON Patch sequence with version related operation objects
 * @param  {JSONPatch} sequence JSON Patch sequence to wrap
 * @return {VersionedJSONPatch}
 */
JSONPatchQueueSynchronous.prototype.send = function(sequence){
	this.version++;
	var newSequence = sequence.slice(0);
	newSequence.unshift({
		op: "replace",
		path: this.versionPath,
		value: this.version
	});
	if(this.purist){
		newSequence.unshift({ // test for purist
			op: "test",
			path: this.versionPath,
			value: this.version-1
		});
	}
	return newSequence;
};

JSONPatchQueueSynchronous.getPropertyByJsonPointer = function(obj, pointer) {
	var parts = pointer.split('/');
	if(parts[0] === "") {
		parts.shift();
	}
	var target = obj;
	while(parts.length) {
		var path = parts.shift().replace('~1', '/').replace('~0', '~');
		if(parts.length) {
			target = target[path];
		}
	}
	return target[path];
};

/**
 * Reset queue internals and object to new, given state
 * @param newState versioned object representing desired state along with versions
 */
JSONPatchQueueSynchronous.prototype.reset = function(newState){
	this.version = JSONPatchQueueSynchronous.getPropertyByJsonPointer(newState, this.versionPath);
	this.waiting = [];
	var patch = [{ op: "replace", path: "", value: newState }];
	return this.obj = this.apply(this.obj, patch);
};

if(true) {
	module.exports = JSONPatchQueueSynchronous;
	module.exports.default = JSONPatchQueueSynchronous;
	/* Babel demands this */
	module.exports.__esModule = true;
}


/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./src/palindrom-network-channel.js
var palindrom_network_channel = __webpack_require__(6);

// EXTERNAL MODULE: external "null"
var external_null_ = __webpack_require__(1);

// EXTERNAL MODULE: ./node_modules/jsonpatcherproxy/src/jsonpatcherproxy.js
var jsonpatcherproxy = __webpack_require__(7);
var jsonpatcherproxy_default = /*#__PURE__*/__webpack_require__.n(jsonpatcherproxy);

// EXTERNAL MODULE: ./node_modules/json-patch-ot/src/json-patch-ot.js
var json_patch_ot = __webpack_require__(8);
var json_patch_ot_default = /*#__PURE__*/__webpack_require__.n(json_patch_ot);

// EXTERNAL MODULE: ./node_modules/json-patch-ot-agent/src/json-patch-ot-agent.js
var json_patch_ot_agent = __webpack_require__(9);
var json_patch_ot_agent_default = /*#__PURE__*/__webpack_require__.n(json_patch_ot_agent);

// EXTERNAL MODULE: ./src/palindrom-errors.js
var palindrom_errors = __webpack_require__(0);

// CONCATENATED MODULE: ./src/reconnector.js
/**
 * @callback reconnectionCallback called when reconnection attempt is scheduled.
 * It's called every second until reconnection attempt is made (`milliseconds` reaches 0)
 * @param {number} milliseconds - number of milliseconds to next reconnection attempt. >= 0
 */
/**
 * @param {Function} reconnect used to perform reconnection. No arguments
 * @param {reconnectionCallback} onReconnectionCountdown called to notify that reconnection attempt is scheduled
 * @param {Function} onReconnectionEnd called to notify that reconnection attempt is not longer scheduled
 * @constructor
 */
function Reconnector(
    reconnect,
    onReconnectionCountdown,
    onReconnectionEnd
) {
    let intervalMs;
    let timeToCurrentReconnectionMs;
    let reconnectionPending;
    let reconnection;
    const defaultIntervalMs = 1000;

    function reset() {
        intervalMs = defaultIntervalMs;
        timeToCurrentReconnectionMs = 0;
        reconnectionPending = false;
        clearTimeout(reconnection);
        reconnection = null;
    }

    const step = () => {
        if (timeToCurrentReconnectionMs == 0) {
            onReconnectionCountdown(0);
            reconnectionPending = false;
            intervalMs *= 2;
            reconnect();
        } else {
            onReconnectionCountdown(timeToCurrentReconnectionMs);
            timeToCurrentReconnectionMs -= 1000;
            setTimeout(step, 1000);
        }
    };

    /**
     * Notify Reconnector that connection error occurred and automatic reconnection should be scheduled.
     */
    this.triggerReconnection = () => {
        if (reconnectionPending) {
            return;
        }
        timeToCurrentReconnectionMs = intervalMs;
        reconnectionPending = true;
        step();
    };

    /**
     * Reconnect immediately and reset all reconnection timers.
     */
    this.reconnectNow = () => {
        timeToCurrentReconnectionMs = 0;
        intervalMs = defaultIntervalMs;
    };

    /**
     * Notify Reconnector that there's no need to do further actions (either connection has been established or a fatal error occured).
     * Resets state of Reconnector
     */
    this.stopReconnecting = () => {
        reset();
        onReconnectionEnd();
    };

    // remember, we're still in constructor
    reset();
}

// CONCATENATED MODULE: ./src/noqueue.js
/**
 * Non-queuing object that conforms JSON-Patch-Queue API
 * @param {Object} obj target object where patches are applied
 * @param {Function} apply function to apply received patch, must return the object in its final state
 */
class NoQueue {
    constructor(obj, apply) {
        this.obj = obj;
        this.apply = apply;
    }

    /** just forward message */
    send(msg) {
        return msg;
    }

    /** Apply given JSON Patch sequence immediately */
    receive(sequence) {
        return (this.obj = this.apply(this.obj, sequence));
    }

    reset(newState) {
        const patch = [{ op: 'replace', path: '', value: newState }];
        return (this.obj = this.apply(this.obj, patch));
    }
}

// CONCATENATED MODULE: ./src/palindrom.js
/*! Palindrom
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */





const { applyPatch, validate } = Object(external_null_["require"])('fast-json-patch');

const { JSONPatchQueueSynchronous, JSONPatchQueue } = Object(external_null_["require"])('json-patch-queue');






/* this variable is bumped automatically when you call npm version */
const palindromVersion = '6.2.0';

if (typeof global === 'undefined') {
    if (typeof window !== 'undefined') {
        /* incase neither window nor global existed, e.g React Native */
        var global = window;
    } else {
        var global = {};
    }
}

/**
 * Defines a connection to a remote PATCH server, serves an object that is persistent between browser and server.
 * @param {Object} [options] map of arguments. See README.md for description
 */
class palindrom_Palindrom {
    /**
     * Palindrom version
     */
    static get version() {
        return palindromVersion;
    }
    constructor(options) {
        /**
         * Palindrom instance version
         */
        this.version = palindromVersion;

        if (typeof options !== 'object') {
            throw new TypeError(
                'Palindrom constructor requires an object argument.'
            );
        }
        if (!options.remoteUrl) {
            throw new TypeError('remoteUrl is required');
        }

        if (options.callback) {
            console.warn(
                'options.callback is deprecated. Please use `onStateReset` instead'
            );
        }

        this.debug = options.debug != undefined ? options.debug : true;

        this.isObserving = false;

        function noop() {}

        this.onLocalChange = options.onLocalChange || noop;
        this.onRemoteChange = options.onRemoteChange || noop;
        this.onStateReset = options.onStateReset || options.callback || noop;
        this.filterLocalChange =
            options.filterLocalChange || (operation => operation);

        this.onPatchReceived = options.onPatchReceived || noop;
        this.onPatchSent = options.onPatchSent || noop;
        this.onSocketStateChanged = options.onSocketStateChanged || noop;
        this.onConnectionError = options.onConnectionError || noop;
        this.retransmissionThreshold = options.retransmissionThreshold || 3;
        this.onReconnectionCountdown = options.onReconnectionCountdown || noop;
        this.onReconnectionEnd = options.onReconnectionEnd || noop;
        this.onSocketOpened = options.onSocketOpened || noop;
        this.onIncomingPatchValidationError =
            options.onIncomingPatchValidationError || noop;
        this.onOutgoingPatchValidationError =
            options.onOutgoingPatchValidationError || noop;
        this.onError = options.onError || noop;

        this.reconnector = new Reconnector(
            () => this._connectToRemote(this.queue.pending),
            this.onReconnectionCountdown,
            this.onReconnectionEnd
        );

        this.network = new palindrom_network_channel["a" /* default */](
            this, // palindrom instance TODO: to be removed, used for error reporting
            options.remoteUrl,
            options.useWebSocket || false, // useWebSocket
            this.handleRemoteChange.bind(this), //onReceive
            this.onPatchSent.bind(this), //onSend,
            this.onConnectionError.bind(this),
            this.onSocketOpened.bind(this),
            this.onSocketStateChanged.bind(this), //onStateChange
            options.pingIntervalS
        );
        /**
         * how many OT operations are there in each patch 0, 1 or 2
         */
        this.OTPatchIndexOffset = 0;
        // choose queuing engine
        if (options.localVersionPath) {
            if (!options.remoteVersionPath) {
                this.OTPatchIndexOffset = 1;
                // just versioning
                this.queue = new JSONPatchQueueSynchronous(
                    this.obj,
                    options.localVersionPath,
                    this.validateAndApplySequence.bind(this),
                    options.purity
                );
            } else {
                this.OTPatchIndexOffset = 2;
                // double versioning or OT
                if (options.ot) {
                    this.queue = new json_patch_ot_agent_default.a(
                        this.obj,
                        json_patch_ot_default.a.transform,
                        [options.localVersionPath, options.remoteVersionPath],
                        this.validateAndApplySequence.bind(this),
                        options.purity
                    );
                } else {
                    this.queue = new JSONPatchQueue(
                        this.obj,
                        [options.localVersionPath, options.remoteVersionPath],
                        this.validateAndApplySequence.bind(this),
                        options.purity
                    ); // full or noop OT
                }
            }
        } else {
            // no queue - just api
            this.queue = new NoQueue(
                this.obj,
                this.validateAndApplySequence.bind(this)
            );
        }
        this._connectToRemote();
    }
    async _connectToRemote(reconnectionPendingData = null) {
        const json = await this.network._establish(reconnectionPendingData);
        this.reconnector.stopReconnecting();

        if (this.debug) {
            this.remoteObj = JSON.parse(JSON.stringify(json));
        }

        this.queue.reset(json);
    }
    get useWebSocket() {
        return this.network.useWebSocket;
    }
    set useWebSocket(newValue) {
        this.network.useWebSocket = newValue;
    }

    _sendPatch(patch) {
        this.unobserve();
        this.network.send(patch);
        this.observe();
    }

    prepareProxifiedObject(obj) {
        if (!obj) {
            obj = {};
        }
        /* wrap a new object with a proxy observer */
        this.jsonPatcherProxy = new jsonpatcherproxy_default.a(obj);

        const proxifiedObj = this.jsonPatcherProxy.observe(false, operation => {
            const filtered = this.filterLocalChange(operation);
            // totally ignore falsy (didn't pass the filter) JSON Patch operations
            filtered && this.handleLocalChange(filtered);
        });

        /* make it read-only and expose it as `obj` */
        Object.defineProperty(this, 'obj', {
            get() {
                return proxifiedObj;
            },
            set() {
                throw new Error('palindrom.obj is readonly');
            },
            /* so that we can redefine it */
            configurable: true
        });
        /* JSONPatcherProxy default state is observing */
        this.isObserving = true;
    }

    observe() {
        this.jsonPatcherProxy && this.jsonPatcherProxy.resume();
        this.isObserving = true;
    }

    unobserve() {
        this.jsonPatcherProxy && this.jsonPatcherProxy.pause();
        this.isObserving = false;
    }

    handleLocalChange(operation) {
        // it's a single operation, we need to check only it's value
        operation.value &&
            findRangeErrors(
                operation.value,
                this.onOutgoingPatchValidationError,
                operation.path
            );

        const patch = [operation];
        if (this.debug) {
            this.validateSequence(this.remoteObj, patch);
        }

        this._sendPatch(this.queue.send(patch));
        this.onLocalChange(patch);
    }

    validateAndApplySequence(tree, sequence) {
        try {
            // we don't want this changes to generate patches since they originate from server, not client
            this.unobserve();
            const results = applyPatch(tree, sequence, this.debug);
            // notifications have to happen only where observe has been re-enabled
            // otherwise some listener might produce changes that would go unnoticed
            this.observe();
            // the state was fully replaced
            if (results.newDocument !== tree) {
                // object was reset, proxify it again
                this.prepareProxifiedObject(results.newDocument);

                this.queue.obj = this.obj;

                // validate json response
                findRangeErrors(this.obj, this.onIncomingPatchValidationError);
                // Catch errors in onStateReset
                try {
                    this.onStateReset(this.obj);
                } catch (error) {
                   // to prevent the promise's catch from swallowing errors inside onStateReset
                   this.onError(
                       new palindrom_errors["b" /* PalindromError */](
                           `Error inside onStateReset callback: ${
                               error.message
                           }`
                       )
                   );
                   console.error(error);
               }
            }
            this.onRemoteChange(sequence, results);
        } catch (error) {
            if (this.debug) {
                this.onIncomingPatchValidationError(error);
                return;
            } else {
                throw error;
            }
        }
        return this.obj;
    }

    validateSequence(tree, sequence) {
        const error = validate(sequence, tree);
        if (error) {
            this.onOutgoingPatchValidationError(error);
        }
    }

    reconnectNow() {
        this.reconnector.reconnectNow();
    }
    /**
     * Callback to react on change received from remote.
     * @see PalindromNetworkChannel.onReceive
     * 
     * @param {JSONPatch} data single parsed JSON Patch (array of operations objects) that was send by remote.
     * @param {String} url from which the change was issued
     * @param {String} method HTTP method which resulted in this change ('GET' or 'PATCH') or 'WS' if came as Web Socket message
     */
    handleRemoteChange(data, url, method) {
        //TODO the below assertion should pass. However, some tests wrongly respond with an object instead of a patch
        //console.assert(data instanceof Array, "expecting parsed JSON-Patch");
        this.onPatchReceived(data, url, method);

        const patch = data || []; // fault tolerance - empty response string should be treated as empty patch array

        validateNumericsRangesInPatch(
            patch,
            this.onIncomingPatchValidationError,
            this.OTPatchIndexOffset
        );

        if (patch.length === 0) {
            // ping message
            return;
        }

        // apply only if we're still watching
        if (!this.isObserving) {
            return;
        }
        this.queue.receive(patch);
        if (
            this.queue.pending &&
            this.queue.pending.length &&
            this.queue.pending.length > this.retransmissionThreshold
        ) {
            // remote counterpart probably failed to receive one of earlier messages, because it has been receiving
            // (but not acknowledging messages for some time
            this.queue.pending.forEach(this._sendPatch, this);
        }

        if (this.debug) {
            this.remoteObj = JSON.parse(JSON.stringify(this.obj));
        }
    }
}

/**
 * Iterates a JSON-Patch, traversing every patch value looking for out-of-range numbers
 * @param {JSONPatch} patch patch to check
 * @param {Function} errorHandler the error handler callback
 * @param {*} startFrom the index where iteration starts
 */
function validateNumericsRangesInPatch(patch, errorHandler, startFrom) {
    for (let i = startFrom, len = patch.length; i < len; i++) {
        findRangeErrors(patch[i].value, errorHandler, patch[i].path);
    }
}

/**
 * Traverses/checks value looking for out-of-range numbers, throws a RangeError if it finds any
 * @param {*} val value
 * @param {Function} errorHandler
 */
function findRangeErrors(val, errorHandler, variablePath = '') {
    const type = typeof val;
    if (type == 'object') {
        for (const key in val) {
            if (val.hasOwnProperty(key)) {
                findRangeErrors(
                    val[key],
                    errorHandler,
                    variablePath + '/' + key
                );
            }
        }
    } else if (
        type === 'number' &&
        (val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER)
    ) {
        errorHandler(
            new RangeError(
                `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${val}, variable path is: ${variablePath}`
            )
        );
    }
}

// CONCATENATED MODULE: ./src/palindrom-dom.js
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PalindromDOM", function() { return palindrom_dom_PalindromDOM; });
/* concated harmony reexport Palindrom */__webpack_require__.d(__webpack_exports__, "Palindrom", function() { return palindrom_Palindrom; });
/*! Palindrom
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */


class AbortError extends Error {};

    /** scroll to coordiates and return if the scroll was successful */
    function attemptScroll(x, y) {
        scrollTo(x, y);
        return window.scrollX === x && window.scrollY === y;
    }

    async function sleep(duration) {
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    /**
     * PalindromDOM
     * @extends {Palindrom}
     * @param {Object} [options] map of arguments. See README.md for description
     */
   class palindrom_dom_PalindromDOM extends palindrom_Palindrom {
        constructor(options) {
            if (typeof options !== 'object') {
                throw new Error(
                    'PalindromDOM constructor requires an object argument.'
                );
            }
            if (!options.remoteUrl) {
                throw new Error('remoteUrl is required');
            }

            const onStateReset = options.onStateReset || options.callback;
            if (options.callback) {
                console.warn(
                    'Palindrom: options.callback is deprecated. Please use `onStateReset` instead'
                );
            }

            options.onStateReset = function addDOMListeners(obj) {
                this.listen();
                onStateReset && onStateReset.call(this, obj);
            };

            // construct Palindrom
            super(options);

            this.element = options.listenTo || document;
            this.clickHandler = this.clickHandler.bind(this);
            this.historyHandler = this.historyHandler.bind(this);

            this.morphUrlEventHandler = this.morphUrlEventHandler.bind(this);
            this._scrollWatcher = this._scrollWatcher.bind(this);

            /* in some cases, people emit redirect requests before `listen` is called */
            this.element.addEventListener(
                'palindrom-redirect-pushstate',
                this.morphUrlEventHandler
            );

            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }
        }

        listen() {
            this.listening = true;
            this.element.addEventListener('click', this.clickHandler);
            window.addEventListener('popstate', this.historyHandler); //better here than in constructor, because Chrome triggers popstate on page load

            this.element.addEventListener(
                'palindrom-morph-url',
                this.morphUrlEventHandler
            );

            this.element.addEventListener(
                'palindrom-redirect-pushstate',
                this.morphUrlEventHandler
            );

            this._watchingScroll();
        }
        _watchingScroll() {
            window.addEventListener('scroll', this._scrollWatcher);
        }
        _unwatchingScroll() {
            window.removeEventListener('scroll', this._scrollWatcher);
        }
        _scrollWatcher() {
            // do not record self created scroll events
            if(this._attemptingScroll) {
                return;
            }
            clearTimeout(this._scrollDebounceTimeout);
            this._scrollDebounceTimeout = setTimeout(() => {
                history.replaceState([window.scrollX, window.scrollY], null);
            }, 20);
        }
        unlisten() {
            this.listening = false;

            this.element.removeEventListener('click', this.clickHandler);
            window.removeEventListener('popstate', this.historyHandler); //better here than in constructor, because Chrome triggers popstate on page load
            this.element.removeEventListener(
                'palindrom-redirect-pushstate',
                this.morphUrlEventHandler
            );

            this.element.removeEventListener(
                'palindrom-morph-url',
                this.morphUrlEventHandler
            );
            this._unwatchingScroll();
        }

        /**
         * @param {String} href
         * @throws {Error} network error if occured or the `palindrom-before-redirect` was cancelled by calling event.preventDefault()
         * @fires Palindrom#palindrom-before-redirect
         * @fires Palindrom#palindrom-after-redirect
         * @returns {Promise<Object>} JSON response
         */
        async getPatchUsingHTTP(href) {
            /**
             * palindrom-before-redirect event.
             *
             * @event Palindrom#palindrom-before-redirect
             * @type {CustomEvent}
             * @property {Object} detail containing `href` property that contains the URL
             */
            const beforeEvent = new CustomEvent('palindrom-before-redirect', {
                detail: {
                    href
                },
                cancelable: true,
                bubbles: true
            });

            this.element.dispatchEvent(beforeEvent);

            if (beforeEvent.defaultPrevented) {
                throw new AbortError(
                    '`getPatchUsingHTTP` was aborted by cancelling `palindrom-before-redirect` event.'
                );
            }

            const data = await this.network.getPatchUsingHTTP(href);
            let detail = { href, data };

            /**
             * palindrom-after-redirect event
             *
             * @event Palindrom#palindrom-after-redirect
             * @type {CustomEvent}
             * @property {Object} detail containing `href: String` and `data: Object`
             */
            const afterEvent = new CustomEvent('palindrom-after-redirect', {
                detail,
                bubbles: true
            });

            this.element.dispatchEvent(afterEvent);
            return data;
        }

        //TODO move fallback to window.location.href from PalindromNetworkChannel to here (PalindromDOM)

        /**
     * DISABLED FOR NOW: we don't know when rendering actually finishes.
     * It's left here for the hope of having synchronous rendering at some point in the future.
     * ====
     * we need to scroll asynchronously, because we need the document rendered to search for the anchored element
     * and even though onReceive + applyPatch are sync, Polymer is not, it renders async-ly
    PalindromDOM.prototype.scrollToAnchorOrTopAsync = function(link) {
      this.scrollAsyncTimeout && clearTimeout(this.scrollAsyncTimeout);
      if (window && window.document) {
        var anchorIndex;
        var anchor;
        // does the URL have an anchor
        if (link && (anchorIndex = link.indexOf('#')) > -1) {
          anchor = link.substr(anchorIndex);
        }
        if (!anchor) {
          window.scrollTo(0, 0);
        } else {
          // if somehow someone manages to navigate twice in a 100ms,
          // we don't scroll for their first navigation, i.e de-bouncing

          this.scrollAsyncTimeout = setTimeout(() => {
            // does that anchor exist in the page?
            const anchorTarget = document.querySelector(anchor); // look for #element-id
            if (anchorTarget) {
              anchorTarget.scrollIntoView();
            } else {
              window.scrollTo(0, 0);
            }
          }, 100);
        }
      }
    };
    */
        /**
         * Push a new URL to the browser address bar and send a patch request (empty or including queued local patches)
         * so that the URL handlers can be executed on the remote
         * @param url
         * @returns {boolean} true if morphing was successful
         */
        async morphUrl(url) {
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;
            try {
                const res = await this.getPatchUsingHTTP(url);
                if (res) {
                    // mark current state's scroll position
                    history.replaceState(
                        [scrollX, scrollY],
                        null,
                        window.location.href
                    );

                    // push a new state with the new position
                    history.pushState([0, 0], null, url);

                    // scroll it!
                    scrollTo(0, 0);
                    return true;
                }
            } catch (error) {
                if (error instanceof AbortError) {
                    return false;
                }
                throw new Error(`HTTP request failed, error message: ${error.message}`);
            }
        }
        /**
         * Handles `palindrom-morph-url` event and channels its `detail.url` to `morphUrl`
         * @param {palindrom-morph-url Event} event
         */
        morphUrlEventHandler(event) {
            return this.morphUrl(event.detail.url);
        }

        clickHandler(event) {
            //Don't morph ctrl/cmd + click & middle mouse button
            if (event.ctrlKey || event.metaKey || event.which == 2) {
                return;
            }

            if (event.detail && event.detail.target) {
                //detail is Polymer
                event = event.detail;
            }

            let target = event.target;

            if (target.nodeName !== 'A') {
                let eventPath = event.composedPath && event.composedPath();
                if (!eventPath) {
                    // for backwards compatibility with SDv0
                    eventPath = event.path;
                }
                for (let i = 0; i < eventPath.length; i++) {
                    if (eventPath[i].nodeName == 'A') {
                        target = eventPath[i];
                        break;
                    }
                }
            }
            const anchorTarget = target.target || target.getAttribute('target');
            const hasDownloadAttribute = target.hasAttribute('download');

            if (
                !hasDownloadAttribute &&
                (!anchorTarget || anchorTarget === '_self')
            ) {
                //needed since Polymer 0.2.0 in Chrome stable / Web Plaftorm features disabled
                //because target.href returns undefined for <polymer-ui-menu-item href="..."> (which is an error)
                //while target.getAttribute("href") returns desired href (as string)
                const href = target.href || target.getAttribute('href');
                if (href && palindrom_dom_PalindromDOM.isApplicationLink(href)) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.morphUrl(href);
                } else if (target.type === 'submit') {
                    event.preventDefault();
                }
            }
        }
        async historyHandler(event) {
            await this.getPatchUsingHTTP(location.href);
            const [scrollX, scrollY] = event.state || [0, 0];

            // flag if the user has scrolled, not our own code
            let userHadScrolled = false;

            // flag if this code it scrolling, not the user
            this._attemptingScroll = false;

            // if this handler is called && we're not attemptingScroll, then the user has scrolled!
            const scrollHandler = () => (userHadScrolled = !this._attemptingScroll);
            window.addEventListener('scroll', scrollHandler);

            // give the user a chance to cancel history scrolling by scrolling on their own (eg momentum mouse wheel)
            await sleep(30);

            for (let i = 0; i < 30 && !userHadScrolled; i++) {
                // prevent our scroll attempt from setting `hadScrolled`
                this._attemptingScroll = true;
                const scrollSucceeded = attemptScroll(scrollX, scrollY);
                this._attemptingScroll = false;
                if (scrollSucceeded) {
                    break;
                } else {
                    await sleep(30);
                }
            }
            window.removeEventListener('scroll', scrollHandler);
        }

        /**
         * Returns information if a given element is an internal application link that Palindrom should intercept into a history push
         * @param elem HTMLElement or String
         * @returns {boolean}
         */
        static isApplicationLink(elem) {
            if (typeof elem === 'string') {
                //type string is reported in Polymer / Canary (Web Platform features disabled)
                const parser = document.createElement('A');
                parser.href = elem;

                // @see http://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
                // IE doesn't populate all link properties when setting .href with a relative URL,
                // however .href will return an absolute URL which then can be used on itself
                // to populate these additional fields.
                if (parser.host == '') {
                    parser.href = parser.href;
                }
                elem = parser;
            }
            return (
                elem.protocol == window.location.protocol &&
                elem.host == window.location.host
            );
        }
    }


/***/ })
/******/ ])["default"];