/*! puppet.js 0.2.6
 * (c) 2013 Joachim Wester
 * MIT license
 */

(function (global) {
  var lastClickHandler
    , lastPopstateHandler
    , lastPushstateHandler
    , lastBlurHandler
    , lastPuppet;

  /**
   * Defines a connection to a remote PATCH server, returns callback to a object that is persistent between browser and server
   * @param remoteUrl If undefined, current window.location.href will be used as the PATCH server URL
   * @param callback Called after initial state object is received from the server
   * @param obj Optional object where the parsed JSON data will be inserted
   */
  function Puppet(remoteUrl, callback, obj) {
    if (window.Promise === undefined) {
      throw new Error("Promise API not available. If you are using an outdated browser, make sure to load a Promise/A+ shim, e.g. https://github.com/jakearchibald/es6-promise");
    }

    this.debug = true;
    this.remoteUrl = remoteUrl;
    this.callback = callback;
    this.obj = obj || {};
    this.observer = null;
    this.referer = null;

    var useWebSocket = false;
    var that = this;
    Object.defineProperty(this, "useWebSocket", {
      get: function () {
        return useWebSocket;
      },
      set: function (newValue) {
        if(newValue == false) {
          if(that._ws) {
            that._ws.onclose = function() { //overwrites the previous onclose
              that._ws = null;
            };
            that._ws.close();
          }
        }
        return useWebSocket = newValue;
      }
    });

    this.localPatchQueue = [];
    this.handleResponseCookie();

    this.ignoreCache = [];
    this.ignoreAdd = null; //undefined, null or regexp (tested against JSON Pointer in JSON Patch)

    //usage:
    //puppet.ignoreAdd = null;  //undefined or null means that all properties added on client will be sent to server
    //puppet.ignoreAdd = /./; //ignore all the "add" operations
    //puppet.ignoreAdd = /\/\$.+/; //ignore the "add" operations of properties that start with $
    //puppet.ignoreAdd = /\/_.+/; //ignore the "add" operations of properties that start with _

    this.cancelled = false;
    this.lastRequestPromise = this.xhr(this.remoteUrl, 'application/json', null, this.bootstrap.bind(this));
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
  /**
   * [bootstrap description]
   * @param  {[type]} res [description]
   * @return {Promise || true}     Promise for #webSocketUpgrade or just `true` is websockets disabled.
   */
  Puppet.prototype.bootstrap = function (res) {
    var tmp = JSON.parse(res.responseText);
    recursiveExtend(this.obj, tmp);

    if (this.debug) {
      this.remoteObj = JSON.parse(JSON.stringify(this.obj));
    }

    recursiveMarkObjProperties(this, "obj");
    this.observe();
    if (this.callback) {
      this.callback(this.obj);
    }
    if (lastClickHandler) {
      document.body.removeEventListener('click', lastClickHandler);
      window.removeEventListener('popstate', lastPopstateHandler);
      window.removeEventListener('puppet-redirect-pushstate', lastPushstateHandler);
      document.body.removeEventListener('blur', lastBlurHandler, true);
    }
    document.body.addEventListener('click', lastClickHandler = this.clickHandler.bind(this));
    window.addEventListener('popstate', lastPopstateHandler = this.historyHandler.bind(this)); //better here than in constructor, because Chrome triggers popstate on page load
    window.addEventListener('puppet-redirect-pushstate', lastPushstateHandler = this.historyHandler.bind(this));
    document.body.addEventListener('blur', lastBlurHandler = this.sendLocalChange.bind(this), true);

    if (!lastPuppet) {
      lastPuppet = this;
      this.fixShadowRootClicks();
    }

    return this.useWebSocket ? this.webSocketUpgrade() : true ;
  };

  /**
   * Send a WebSocket upgrade request to the server.
   * For testing purposes WS upgrade url is hardcoded now in PuppetJS (replace __default/ID with __default/wsupgrade/ID)
   * In future, server should suggest the WebSocket upgrade URL
   * @returns {Promise} that WS get opened, resolves/rejects with WS event [description]
   */
  Puppet.prototype.webSocketUpgrade = function () {
    var that = this;
    var host = window.location.host;
    var wsPath = this.referer.replace(/__([^\/]*)\//g, "__$1/wsupgrade/");
    var upgradeURL = "ws://" + host + wsPath;
    return new Promise(function (resolve, reject) {
      that._ws = new WebSocket(upgradeURL);
      that._ws.onopen = function (event) {
        resolve( event );
      };
      that._ws.onmessage = function (event) {
        var patches = JSON.parse(event.data);
        that.handleRemoteChange(patches);
        that.webSocketSendResolve( event );
      };
      that._ws.onerror = function (event) {
        that.showError("WebSocket connection could not be made", (event.data || "") + "\nCould not connect to: " + upgradeURL);
        reject( event );
      };
      that._ws.onclose = function (event) {
        that.showError("WebSocket connection closed", event.code + " " + event.reason);
      };
    });
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
    if (this.referer && this.referer !== referer) {
      this.showError("Error: Session lost", "Server replied with a different session ID that was already set. \nPossibly a server restart happened while you were working. \nPlease reload the page.\n\nPrevious session ID: " + this.referer + "\nNew session ID: " + referer);
    }
    this.referer = referer;
  };

  Puppet.prototype.observe = function () {
    this.cancelled = false;
    this.observer = jsonpatch.observe(this.obj, this.queueLocalChange.bind(this));
  };

  Puppet.prototype.unobserve = function () {
    this.cancelled = true;
    if (this.observer) { //there is a bug in JSON-Patch when trying to unobserve something that is already unobserved
      jsonpatch.unobserve(this.obj, this.observer);
      this.observer = null;
    }
  };

  Puppet.prototype.queueLocalChange = function (patches) {
    Array.prototype.push.apply(this.localPatchQueue, patches);
    if ((document.activeElement.nodeName !== 'INPUT' && document.activeElement.nodeName !== 'TEXTAREA') || document.activeElement.getAttribute('update-on') === 'input') {
      this.flattenPatches(this.localPatchQueue);
      if (this.localPatchQueue.length) {
        this.handleLocalChange(this.localPatchQueue);
        this.localPatchQueue.length = 0;
      }
    }
  };

  Puppet.prototype.sendLocalChange = function (ev) {
    if (ev && (ev.target === document.body || ev.target.nodeName === "BODY")) { //Polymer warps ev.target so it is not exactly document.body
      return; //IE triggers blur event on document.body. This is not what we need
    }
    jsonpatch.generate(this.observer);
    this.flattenPatches(this.localPatchQueue);
    if (this.localPatchQueue.length) {
      this.handleLocalChange(this.localPatchQueue);
      this.localPatchQueue.length = 0;
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
    for (var i = 0, ilen = patches.length; i < ilen; i++) {
      if (this.isIgnored(patches[i].path, patches[i].op)) { //if it is ignored, remove patch
        patches.splice(i, 1); //ignore changes to properties that start with PRIVATE_PREFIX
        ilen--;
        i--;
      }
      else if (patches[i].op === 'replace') { //if it is already seen in the patches array, replace the previous instance
        if (seen[patches[i].path] !== undefined) {
          patches[seen[patches[i].path]] = patches[i];
          patches.splice(i, 1);
          ilen--;
          i--;
        }
        else {
          seen[patches[i].path] = i;
        }
      }
    }
  };

  Puppet.prototype.handleLocalChange = function (patches) {
    var that = this;

    if(this.debug) {
      var errors = this.validatePatches(patches, this.remoteObj, true);
      errors.forEach(function(error, index) {
        if(error) {
          that.showError("Outgoing patch validation error", error + "\n\nIn patch:\n\n" + JSON.stringify(patches[index]) );
        }
      });
    }

    var txt = JSON.stringify(patches);
    if (txt.indexOf('__Jasmine_been_here_before__') > -1) {
      throw new Error("PuppetJs did not handle Jasmine test case correctly");
    }
    if (this.useWebSocket) {
      if(!this._ws) {
        this.lastRequestPromise = this.lastRequestPromise.then( this.webSocketUpgrade.bind(this) );
      }
      this.lastRequestPromise = this.lastRequestPromise.then( this.webSocketSend.bind(this,txt) );
    }
    else {
      //"referer" should be used as the url when sending JSON Patches (see https://github.com/PuppetJs/PuppetJs/wiki/Server-communication)
      this.lastRequestPromise = this.lastRequestPromise.then(function () {
        return that.xhr(that.referer || that.remoteUrl, 'application/json-patch+json', txt, function (res) {
          var patches = JSON.parse(res.responseText || '[]'); //fault tolerance - empty response string should be treated as empty patch array
          that.handleRemoteChange(patches);
        })
      });
    }
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

  /**
   * Performs patch sequence validation using Fast-JSON-Patch. Only run when the `debug` flag is set to `true`.
   * Can be overridden/monkey patched to add more validations.
   * Additional parameter `isOutgoing` allows to make validations depending whether the sequence is incoming or outgoing.
   * @param sequence
   * @param tree
   * @param isOutgoing
   * @returns {Array}
   */
  Puppet.prototype.validatePatches = function (sequence, tree, isOutgoing) {
    var errors = jsonpatch.validate(sequence, tree);
    return errors;
  };

  Puppet.prototype.handleRemoteChange = function (patches) {
    var that = this;

    if (!this.observer) {
      return; //ignore remote change if we are not watching anymore
    }

    if(this.debug) {
      var errors = this.validatePatches(patches, this.obj, false);
      errors.forEach(function(error, index) {
        if(error) {
          that.showError("Incoming patch validation error", error + "\n\nIn patch:\n\n" + JSON.stringify(patches[index]));
        }
      });
    }

    this.unobserve();
    jsonpatch.apply(this.obj, patches);
    patches.forEach(function (patch) {
      if (patch.path === "") {
        var desc = JSON.stringify(patches);
        if (desc.length > 103) {
          desc = desc.substring(0, 100) + "...";
        }
        that.showWarning("Server pushed patch that replaces the object root", desc);
      }
      if (patch.op === "add" || patch.op === "replace" || patch.op === "test") {
        markObjPropertyByPath(that.obj, patch.path);
      }
    });
    this.observe();
    if (this.onRemoteChange) {
      this.onRemoteChange(patches);
    }

    if(this.debug) {
      this.remoteObj = JSON.parse(JSON.stringify(this.obj));
    }
  };

  Puppet.prototype.changeState = function (href) {
    var that = this;
    this.lastRequestPromise = this.lastRequestPromise.then(function () {
      return that.xhr(href, 'application/json-patch+json', null, function (res) {
        var patches = JSON.parse(res.responseText || '[]'); //fault tolerance - empty response string should be treated as empty patch array
        that.handleRemoteChange(patches);
      })
    });
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

    if (target.nodeName !== 'A') {
      var parentA = closestHrefParent(target, 'A');
      if (parentA) {
        target = parentA;
      }
    }

    //needed since Polymer 0.2.0 in Chrome stable / Web Plaftorm features disabled
    //because target.href returns undefined for <polymer-ui-menu-item href="..."> (which is an error)
    //while target.getAttribute("href") returns desired href (as string)
    var href = target.href || target.getAttribute("href");

    if (href && Puppet.isApplicationLink(href)) {
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

  Puppet.prototype.showWarning = function (heading, description) {
    if (this.debug && global.console && console.warn) {
      if (description) {
        heading += " (" + description + ")";
      }
      console.warn("PuppetJs warning: " + heading);
    }
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
        DIV.style.position = 'fixed';
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
   * @returns {Promise} Promise that XHR will be sent. Resolves with response, or callback's result for response (if callback given)
   */
  Puppet.prototype.xhr = function (url, accept, data, callback, beforeSend) {
    //this.handleResponseCookie();
    cookie.erase('Location'); //more invasive cookie erasing because sometimes the cookie was still visible in the requests
    var that = this;
    return new Promise(function (resolve, reject) {
      if (that.cancelled) {
        console.error("PuppetJs: Promise cancelled on request");
        reject();
        return;
      }
      var req = new XMLHttpRequest();
      req.onload = function () {
        var res = this;
        that.handleResponseCookie();
        that.handleResponseHeader(res);
        if (res.status >= 400 && res.status <= 599) {
          that.showError('PuppetJs JSON response error', 'Server responded with error ' + res.status + ' ' + res.statusText + '\n\n' + res.responseText);
          reject();
        }
        else {
          resolve( callback && callback.call(that, res) || res);
        }
      };
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
      if (that.referer) {
        req.setRequestHeader('X-Referer', that.referer);
      }
      if (beforeSend) {
        beforeSend.call(that, req);
      }
      req.send(data);
    });
  };

  /**
   * Internal method to perform WebSocket request that returns a promise which is resolved when the response comes
   * @param data Data payload
   * @returns {Promise} that data will be sent to WS, resolves with WS event
   * @see #webSocketUpgrade
   */
  Puppet.prototype.webSocketSend = function (data) {
    var that = this;
    return new Promise(function (resolve, reject) {
      that.webSocketSendResolve = resolve;
      that._ws.send(data);
    });
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
        var shadowRoot = el.childNodes[i].shadowRoot || el.childNodes[i].polymerShadowRoot_;
        if (shadowRoot) {
          out.push(shadowRoot);
          this.findShadowRoots(shadowRoot, out);
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
    var clickHandler = function (event) {
      if (lastPuppet) {
        lastPuppet.clickHandler(event);
      }
    };

    //existing shadow roots
    var shadowRoots = this.findShadowRoots(document.documentElement);
    for (var i = 0, ilen = shadowRoots.length; i < ilen; i++) {
      (shadowRoots[i].impl || shadowRoots[i]).addEventListener("click", clickHandler);
    }

    //future shadow roots
    var old = Element.prototype.createShadowRoot;
    Element.prototype.createShadowRoot = function () {
      var shadowRoot = old.apply(this, arguments);
      shadowRoot.addEventListener("click", clickHandler);
      return shadowRoot;
    }
  };

  /**
   * Returns information if a given element is an internal application link that PuppetJS should intercept into a history push
   * @param elem HTMLElement or String
   * @returns {boolean}
   */
  Puppet.isApplicationLink = function (elem) {
    if (typeof elem === 'string') {
      //type string is reported in Polymer / Canary (Web Platform features disabled)
      var parser = document.createElement('A');
      parser.href = elem;

      // @see http://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
      // IE doesn't populate all link properties when setting .href with a relative URL,
      // however .href will return an absolute URL which then can be used on itself
      // to populate these additional fields.
      if (parser.host == "") {
        parser.href = parser.href;
      }

      elem = parser;
    }
    return (elem.protocol == window.location.protocol && elem.host == window.location.host);
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

  //goes up the DOM tree (including given element) until it finds an element that matches the nodeName
  var closestHrefParent = function (elem) {
    while (elem != null) {
      if (elem.nodeType === 1 && (elem.href || elem.getAttribute('href'))) {
        return elem;
      }
      elem = elem.parentNode;
    }
    return null;
  };

  global.Puppet = Puppet;
})(window);
