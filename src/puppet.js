// puppet.js 0.1.7
// (c) 2013 Joachim Wester
// MIT license

(function (global) {
  var lastClickHandler
    , lastPopstateHandler
    , lastBlurHandler;

  /**
   * Defines a connection to a remote PATCH server, returns callback to a object that is persistent between browser and server
   * @param remoteUrl If undefined, current window.location.href will be used as the PATCH server URL
   * @param callback Called after initial state object is received from the server
   * @param obj Optional object where the parsed JSON data will be inserted
   */
  function Puppet(remoteUrl, callback, obj) {
    this.debug = true;
    this.remoteUrl = remoteUrl;
    this.callback = callback;
    this.obj = obj || {};
    this.observer = null;
    this.referer = null;
    this.queue = [];
    this.handleResponseCookie();

    this.ignoreCache = [];
    this.ignoreAdd = null; //undefined, null or regexp (tested against JSON Pointer in JSON Patch)

    //usage:
    //puppet.ignoreAdd = null;  //undefined or null means that all properties added on client will be sent to server
    //puppet.ignoreAdd = /./; //ignore all the "add" operations
    //puppet.ignoreAdd = /\/\$.+/; //ignore the "add" operations of properties that start with $
    //puppet.ignoreAdd = /\/_.+/; //ignore the "add" operations of properties that start with _

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
    placeMarkers(parent, key);
    parent = parent[key];
    for (var i in parent) {
      if (parent.hasOwnProperty(i) && typeof parent[i] === 'object') {
        recursiveMarkObjProperties(parent, i);
      }
    }
  }

  function recursiveExtend(par, obj) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (typeof obj[i] === 'object' && par.hasOwnProperty(i)) {
          recursiveExtend(par[i], obj[i]);
        }
        else {
          par[i] = obj[i];
        }
      }
    }
  }

  Puppet.prototype.bootstrap = function (event) {
    var tmp = JSON.parse(event.target.responseText);
    recursiveExtend(this.obj, tmp);

    recursiveMarkObjProperties(this, "obj");
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
    this.fixShadowRootClicks();
  };

  Puppet.prototype.handleResponseHeader = function (xhr) {
    var location = xhr.getResponseHeader('X-Location') || xhr.getResponseHeader('Location');
    if (location) {
      this.setReferer(location);
    }
  };

  /**
   * PuppetJs does not use cookies because of sessions (you need to take care of it in your application code)
   * Reason PuppetJs handles cookies is different:
   * JavaScript cannot read HTTP "Location" header for the main HTML document, but it can read cookies
   * So if you want to establish session in the main HTML document, send "Location" value as a cookie
   * The cookie will be erased (replaced with empty value) after reading
   */
  Puppet.prototype.handleResponseCookie = function () {
    var location = cookie.read('Location');
    if (location) { //if cookie exists and is not empty
      this.setReferer(location);
      cookie.erase('Location');
    }
  };

  Puppet.prototype.setReferer = function (referer) {
    if(this.referer && this.referer !== referer) {
      this.showError("Error: Session lost", "Server replied with a different session ID that was already set. \nPossibly a server restart happened while you were working. \nPlease reload the page.\n\nPrevious session ID: " + this.referer + "\nNew session ID: " + referer);
    }
    this.referer = referer;
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
      this.flattenPatches(this.queue);
      if (this.queue.length) {
        this.handleLocalChange(this.queue);
        this.queue.length = 0;
      }
    }
  };

  Puppet.prototype.sendLocalChange = function () {
    jsonpatch.generate(this.observer);
    this.flattenPatches(this.queue);
    if (this.queue.length) {
      this.handleLocalChange(this.queue);
      this.queue.length = 0;
    }
  };

  Puppet.prototype.isIgnored = function (path, op) {
    if (this.ignoreAdd) {
      if (op === 'add' && this.ignoreAdd.test(path)) {
        this.ignoreCache[path] = true;
        return true;
      }
      var arr = path.split('/');
      var joined = '';
      for (var i = 1, ilen = arr.length; i < ilen; i++) {
        joined += '/' + arr[i];
        if (this.ignoreCache[joined]) {
          return true; //once we decided to ignore something that was added, other operations (replace, remove, ...) are ignored as well
        }
      }
    }
    return false;
  };

  //merges redundant patches and ignores private member changes
  Puppet.prototype.flattenPatches = function (patches) {
    var seen = {};
    for (var i = patches.length - 1; i >= 0; i--) {
      if (this.isIgnored(patches[i].path, patches[i].op)) {
        patches.splice(i, 1); //ignore changes to properties that start with PRIVATE_PREFIX
      }
      else if (patches[i].op === 'replace') {
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
    //"referer" should be used as the url when sending JSON Patches (see https://github.com/PuppetJs/PuppetJs/wiki/Server-communication)
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

  /**
   * Returns information if a given element is an internal application link that PuppetJS should intercept into a history push
   * @param elem HTMLElement or String
   * @returns {boolean}
   */
  Puppet.prototype.isApplicationLink = function (elem) {
    if (typeof elem === 'string') {
      //type string is reported in Polymer / Canary (Web Platform features disabled)
      var parser = document.createElement('A');
      parser.href = elem;
      elem = parser;
    }
    return (elem.protocol == window.location.protocol && elem.host == window.location.host);
  };

  Puppet.prototype.changeState = function (href) {
    this.xhr(href, 'application/json-patch+json', null, this.handleRemoteChange.bind(this));
  };

  Puppet.prototype.clickHandler = function (event) {
    if (event.detail && event.detail.target) {
      //detail is Polymer
      event = event.detail;
    }
    var target = event.target;
    if (target.impl) {
      //impl is Polymer
      target = target.impl;
    }

    //needed since Polymer 0.2.0 in Chrome stable / Web Plaftorm features disabled
    //because target.href returns undefined for <polymer-ui-menu-item href="..."> (which is an error)
    //while target.getAttribute("href") returns desired href (as string)
    var href = target.href || target.getAttribute("href");

    if (href && this.isApplicationLink(href)) {
      event.preventDefault();
      event.stopPropagation();
      this.morphUrl(href);
    }
    else if (target.type === 'submit') {
      event.preventDefault();
    }
    else {
      this.sendLocalChange(); //needed for checkbox
    }
  };

  Puppet.prototype.historyHandler = function (/*event*/) {
    this.changeState(location.href);
  };

  Puppet.prototype.showError = function (heading, description) {
    if (this.debug) {
      var DIV = document.getElementById('puppetjs-error');
      if (!DIV) {
        DIV = document.createElement('DIV');
        DIV.id = 'puppetjs-error';
        DIV.style.border = '1px solid #dFb5b4';
        DIV.style.background = '#fcf2f2';
        DIV.style.padding = '10px 16px';
        DIV.style.position = 'absolute';
        DIV.style.top = '0';
        DIV.style.left = '0';
        DIV.style.zIndex = '999';
        document.body.appendChild(DIV);
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

  /**
   * Internal method to perform XMLHttpRequest
   * @param url (Optional) URL to send the request. If empty string, undefined or null given - the request will be sent to window location
   * @param accept (Optional) HTTP accept header
   * @param data (Optional) Data payload
   * @param callback (Optional) function
   * @param beforeSend (Optional) Function that modifies the XHR object before the request is sent. Added for hackability
   */
  Puppet.prototype.xhr = function (url, accept, data, callback, beforeSend) {
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
    if (beforeSend) {
      beforeSend.call(that, req);
    }
    req.send(data);
  };

  /**
   * Push a new URL to the browser address bar and send a patch request (empty or including queued local patches)
   * so that the URL handlers can be executed on the server
   * @param url
   */
  Puppet.prototype.morphUrl = function (url) {
    history.pushState(null, null, url);
    this.changeState(url);
  };

  /**
   * Returns array of shadow roots inside of a element (recursive)
   * @param el
   * @param out (Optional)
   */
  Puppet.prototype.findShadowRoots = function (el, out) {
    if (!out) {
      out = [];
    }
    for (var i = 0, ilen = el.childNodes.length; i < ilen; i++) {
      if (el.childNodes[i].nodeType === 1) {
        if (el.childNodes[i].shadowRoot) {
          out.push(el.childNodes[i].shadowRoot);
          this.findShadowRoots(el.childNodes[i].shadowRoot, out);
        }
        this.findShadowRoots(el.childNodes[i], out);
      }
    }
    return out;
  };

  /**
   * Catches clicks in Shadow DOM
   * @see <a href="https://groups.google.com/forum/#!topic/polymer-dev/fDRlCT7nNPU">discussion</a>
   */
  Puppet.prototype.fixShadowRootClicks = function () {
    //existing shadow roots
    var shadowRoots = this.findShadowRoots(document.documentElement);
    for (var i = 0, ilen = shadowRoots.length; i < ilen; i++) {
      (shadowRoots[i].impl || shadowRoots[i]).addEventListener("click", this.clickHandler.bind(this));
    }

    //future shadow roots
    var old = Element.prototype.createShadowRoot;
    var that = this;
    Element.prototype.createShadowRoot = function () {
      var shadowRoot = old.apply(this, arguments);
      (shadowRoot.impl || shadowRoot).addEventListener("click", that.clickHandler.bind(that));
      return shadowRoot;
    }
  };

  /**
   * Cookie helper
   * @see Puppet.prototype.handleResponseCookie
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