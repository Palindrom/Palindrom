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
    this.debug = true;
    this.remoteUrl = remoteUrl;
    this.callback = callback;
    this.obj = null;
    this.observer = null;
    this.referer = null;
    this.queue = [];
    this.handleResponseCookie();
    this.xhr(this.remoteUrl, 'application/json', null, this.bootstrap.bind(this));
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

  function markObjPropertyByPath(obj, path) {
    var keys = path.split('/');
    var len = keys.length;
    if (keys.length > 2) {
      for (var i = 1; i < len - 1; i++) {
        obj = obj[keys[i]];
      }
    }
    recursiveMarkObjProperties(obj, keys[len - 1]);
  }

  function placeMarkers(parent, key) {
    var subject = parent[key];
    if (subject === null) {
      parent[key] = PuppetJsClickTrigger$;
    }
    else if (typeof subject === 'object' && !subject.hasOwnProperty('$parent')) {
      Object.defineProperty(subject, '$parent', {
        enumerable: false,
        get: function () {
          return parent;
        }
      });
    }
  }

  function recursiveMarkObjProperties(parent, key) {
    if (key && parent) {
      placeMarkers(parent, key);
      parent = parent[key];
    }

    if (parent) {
      for (var i in parent) {
        if (parent.hasOwnProperty(i) && typeof parent[i] === 'object') {
          recursiveMarkObjProperties(parent, i);
        }
      }
    }
  }

  Puppet.prototype.bootstrap = function (event) {
    this.obj = JSON.parse(event.target.responseText);
    recursiveMarkObjProperties(this.obj);
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
    var location = cookie.read('Location');
    if (location) { //if cookie exists and is not empty
      this.referer = location;
      cookie.erase('Location');
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
    this.unobserve();
    patches.forEach(function (patch) {
      if ((patch.op === "add" || patch.op === "replace" || patch.op === "test") && patch.value === null) {
        patch.value = PuppetJsClickTrigger$;
        jsonpatch.apply(that.obj, [patch]);
      }
      markObjPropertyByPath(that.obj, patch.path);
    });
    this.observe();
  };

  Puppet.prototype.handleRemoteChange = function (event) {
    if (!this.observer) {
      return; //ignore remote change if we are not watching anymore
    }
    var patches = JSON.parse(event.target.responseText || '[]'); //fault tolerance - empty response string should be treated as empty patch array
    if (patches.length === void 0) {
      throw new Error("Patches should be an array");
    }
    this.unobserve();
    jsonpatch.apply(this.obj, patches);
    var that = this;
    patches.forEach(function (patch) {
      if (patch.op === "add" || patch.op === "replace" || patch.op === "test") {
        markObjPropertyByPath(that.obj, patch.path);
      }
    });
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

  Puppet.prototype.showError = function (heading, description) {
    if (this.debug) {
      var DIV = document.getElementById('puppetjs-error');
      if(!DIV) {
        DIV = document.createElement('DIV');
        DIV.id = 'puppetjs-error';
        DIV.style.border = '1px solid #dFb5b4';
        DIV.style.background = '#fcf2f2';
        DIV.style.padding = '10px 16px';
        if (document.body.firstChild) {
          document.body.insertBefore(DIV, document.body.firstChild);
        }
        else {
          document.body.appendChild(DIV);
        }
      }

      var H1 = document.createElement('H1');
      H1.innerHTML = heading;

      var PRE = document.createElement('PRE');
      PRE.innerHTML = description;
      PRE.style.whiteSpace = 'pre-wrap';

      DIV.appendChild(H1);
      DIV.appendChild(PRE);
    }
    throw new Error(description);
  };

  Puppet.prototype.xhr = function (url, accept, data, callback) {
    //this.handleResponseCookie();
    cookie.erase('Location'); //more invasive cookie erasing because sometimes the cookie was still visible in the requests

    var req = new XMLHttpRequest();
    var that = this;
    req.addEventListener('load', function (event) {
      that.handleResponseCookie();
      that.handleResponseHeader(event.target);
      if (event.target.status >= 400 && event.target.status <= 599) {
        that.showError('PuppetJs JSON response error', 'Server responded with error ' + event.target.status + ' ' + event.target.statusText + '\n\n' + event.target.responseText);
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

  /**
   * Cookie helper
   * reference: http://www.quirksmode.org/js/cookies.html
   * reference: https://github.com/js-coder/cookie.js/blob/gh-pages/cookie.js
   */
  var cookie = {
    create: function createCookie(name, value, days) {
      var expires = "";
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
      }
      document.cookie = name + "=" + value + expires + '; path=/';
    },

    readAll: function readCookies() {
      if (document.cookie === '') return {};
      var cookies = document.cookie.split('; ')
        , result = {};
      for (var i = 0, l = cookies.length; i < l; i++) {
        var item = cookies[i].split('=');
        result[decodeURIComponent(item[0])] = decodeURIComponent(item[1]);
      }
      return result;
    },

    read: function readCookie(name) {
      return cookie.readAll()[name];
    },

    erase: function eraseCookie(name) {
      cookie.create(name, "", -1);
    }
  };

  global.Puppet = Puppet;
})(window);