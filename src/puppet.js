(function (global) {

  var lastClickHandler
    , lastPopstateHandler
    , lastBlurHandler;

  /**
   * Defines a connection to a remote PATCH server, returns callback to a object that is persistent between browser and server
   * @param remoteUrl If undefined, current window.location.href will be used as the PATCH server URL
   * @param callback Called after initial state object is received from the server
   */
  function Puppet(remoteUrl, callback) {
    this.remoteUrl = remoteUrl;
    this.callback = callback;
    this.obj = null;
    this.observer = null;
    this.referer = null;
    this.queue = [];
    this.handleResponseCookie();
    this.xhr(this.remoteUrl, 'application/json', null, this.bootstrap.bind(this));
  }

  //http://www.quirksmode.org/js/cookies.html
  function createCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toGMTString();
    }
    document.cookie = name + "=" + value + expires + '; path=/';
  }

  function readCookie(name) {
    return readCookies()[name];
  }

  //http://www.quirksmode.org/js/cookies.html
  function eraseCookie(name) {
    createCookie(name, "", -1);
  }

  //https://github.com/js-coder/cookie.js/blob/gh-pages/cookie.js
  function readCookies() {
    if (document.cookie === '') return {};
    var cookies = document.cookie.split('; ')
      , result = {};
    for (var i = 0, l = cookies.length; i < l; i++) {
      var item = cookies[i].split('=');
      result[decodeURIComponent(item[0])] = decodeURIComponent(item[1]);
    }
    return result;
  }

  /**
   * PuppetJsClickTrigger$ contains Unicode symbols for "NULL" text rendered stylized using Unicode
   * character "SYMBOL FOR NULL" (2400)
   *
   * With PuppetJs, any property having `null` value will be rendered as stylized "NULL" text
   * to emphasize that it probably should be set as empty string instead.
   *
   * The benefit of having this string is that any local change to `null` value (also
   * from `null` to `null`) can be detected and sent as `null` to the server.
   */
  var PuppetJsClickTrigger$ = "\u2400";

  function recursiveMarkObjNulls(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof key === "string" && obj[key] === null) {
          obj[key] = PuppetJsClickTrigger$;
        }
        else if (typeof obj[key] === "object") {
          recursiveMarkObjNulls(obj[key]);
        }
      }
    }
  }

  Puppet.prototype.bootstrap = function (event) {
    this.obj = JSON.parse(event.target.responseText);
    recursiveMarkObjNulls(this.obj);
    this.observe();
    if (this.callback) {
      this.callback(this.obj);
    }
    if (lastClickHandler) {
      document.body.removeEventListener('click', lastClickHandler);
      window.removeEventListener('popstate', lastPopstateHandler);
      document.body.removeEventListener('blur', lastBlurHandler, true);
    }
    document.body.addEventListener('click', lastClickHandler = this.clickHandler.bind(this));
    window.addEventListener('popstate', lastPopstateHandler = this.historyHandler.bind(this)); //better here than in constructor, because Chrome triggers popstate on page load
    document.body.addEventListener('blur', lastBlurHandler = this.sendLocalChange.bind(this), true);
  };

  Puppet.prototype.handleResponseHeader = function (xhr) {
    var location = xhr.getResponseHeader('Location');
    if (location) {
      this.referer = location;
    }
  };

  /**
   * JavaScript cannot read HTTP "Location" header for the main HTML document, but it can read cookies
   * So if you want to establish session in the main HTML document, send "Location" value as a cookie
   * The cookie will be erased (replaced with empty value) after reading
   */
  Puppet.prototype.handleResponseCookie = function () {
    var location = readCookie('Location');
    if (location) { //if cookie exists and is not empty
      this.referer = location;
      eraseCookie('Location');
    }
  };

  Puppet.prototype.observe = function () {
    this.observer = jsonpatch.observe(this.obj, this.queueLocalChange.bind(this));
  };

  Puppet.prototype.unobserve = function () {
    if (this.observer) { //there is a bug in JSON-Patch when trying to unobserve something that is already unobserved
      jsonpatch.unobserve(this.obj, this.observer);
      this.observer = null;
    }
  };

  Puppet.prototype.queueLocalChange = function (patches) {
    Array.prototype.push.apply(this.queue, patches);
    if ((document.activeElement.nodeName !== 'INPUT' && document.activeElement.nodeName !== 'TEXTAREA') || document.activeElement.getAttribute('update-on') === 'input') {
      this.sendLocalChange();
    }
  };

  Puppet.prototype.sendLocalChange = function () {
    jsonpatch.generate(this.observer);
    if (this.queue.length) {
      this.flattenPatches(this.queue);
      this.handleLocalChange(this.queue);
      this.queue.length = 0;
    }
  };

  //merges redundant patches
  Puppet.prototype.flattenPatches = function (patches) {
    var seen = {};
    for (var i = patches.length - 1; i >= 0; i--) {
      if (patches[i].op === 'replace') {
        if (seen[patches[i].path]) {
          patches.splice(i, 1);
        }
        else {
          seen[patches[i].path] = true;
        }
      }
    }
  };

  Puppet.prototype.handleLocalChange = function (patches) {
    var txt = JSON.stringify(patches);
    if (txt.indexOf('__Jasmine_been_here_before__') > -1) {
      throw new Error("PuppetJs did not handle Jasmine test case correctly");
    }
    this.xhr(this.referer || this.remoteUrl, 'application/json-patch+json', txt, this.handleRemoteChange.bind(this));
    var that = this;
    patches.forEach(function (patch) {
      if ((patch.op === "add" || patch.op === "replace" || patch.op === "test") && patch.value === null) {
        that.unobserve();
        patch.value = PuppetJsClickTrigger$;
        jsonpatch.apply(that.obj, [patch]);
        that.observe();
      }
    });
  };

  Puppet.prototype.handleRemoteChange = function (event) {
    if (!this.observer) {
      return; //ignore remote change if we are not watching anymore
    }
    var patches = JSON.parse(event.target.responseText || '[]'); //fault tolerance - empty response string should be treated as empty patch array
    if (patches.length === void 0) {
      throw new Error("Patches should be an array");
    }
    patches.forEach(function (patch) {
      if (patch.op === "add" || patch.op === "replace" || patch.op === "test") {
        recursiveMarkObjNulls(patch);
      }
    });
    this.unobserve();
    jsonpatch.apply(this.obj, patches);
    this.observe();
    if (this.onRemoteChange) {
      this.onRemoteChange(patches);
    }
  };

  Puppet.prototype.isApplicationLink = function (href) {
    return (href.protocol == window.location.protocol && href.host == window.location.host);
  };

  Puppet.prototype.changeState = function (href) {
    this.xhr(href, 'application/json-patch+json', null, this.handleRemoteChange.bind(this));
  };

  Puppet.prototype.clickHandler = function (event) {
    var target = event.target;
    if (window.PuppetExternalLink) {
      target = window.PuppetExternalLink;
      window.PuppetExternalLink = null;
    }
    if (target.href && this.isApplicationLink(target)) {
      event.preventDefault();
      history.pushState(null, null, target.href);
      this.changeState(target.href);
    }
    else if (target.type === 'submit') {
      event.preventDefault();
    }
  };

  Puppet.prototype.historyHandler = function (/*event*/) {
    this.changeState(location.href);
  };

  Puppet.prototype.xhr = function (url, accept, data, callback) {
    //this.handleResponseCookie();
    eraseCookie('Location'); //more invasive cookie erasing because sometimes the cookie was still visible in the requests

    var req = new XMLHttpRequest();
    var that = this;
    req.addEventListener('load', function (event) {
      that.handleResponseCookie();
      that.handleResponseHeader(event.target);
      if (event.target.status >= 400 && event.target.status < 599) {
        throw new Error("Server responded with error " + event.target.status + " " + event.target.statusText + ". More details in developer tools Network tab");
      }
      else {
        callback.call(that, event);
      }
    }, false);
    url = url || window.location.href;
    if (data) {
      req.open("PATCH", url, true);
      req.setRequestHeader('Content-Type', 'application/json-patch+json');
    }
    else {
      req.open("GET", url, true);
    }
    if (accept) {
      req.setRequestHeader('Accept', accept);
    }
    if (this.referer) {
      req.setRequestHeader('X-Referer', this.referer);
    }
    req.send(data);
  };

  Puppet.prototype.catchExternaLink = function (element) {
    element.addEventListener("click", function (event) {
      window.PuppetExternalLink = event.target;
    });
  };

  global.Puppet = Puppet;
})(window);