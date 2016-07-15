/*! puppet.js version: 2.0.0
 * (c) 2013 Joachim Wester
 * MIT license
 */

(function (global) {
  /**
   * https://github.com/mrdoob/eventdispatcher.js
   * MIT license
   * @author mrdoob / http://mrdoob.com/
   */

  var EventDispatcher = function () {
  };

  EventDispatcher.prototype = {
    constructor: EventDispatcher,
    apply: function (object) {
      object.addEventListener = EventDispatcher.prototype.addEventListener;
      object.hasEventListener = EventDispatcher.prototype.hasEventListener;
      object.removeEventListener = EventDispatcher.prototype.removeEventListener;
      object.dispatchEvent = EventDispatcher.prototype.dispatchEvent;
    },
    addEventListener: function (type, listener) {
      if (this._listeners === undefined) this._listeners = {};
      var listeners = this._listeners;
      if (listeners[type] === undefined) {
        listeners[type] = [];
      }
      if (listeners[type].indexOf(listener) === -1) {
        listeners[type].push(listener);
      }
    },
    hasEventListener: function (type, listener) {
      if (this._listeners === undefined) return false;
      var listeners = this._listeners;
      if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1) {
        return true;
      }
      return false;
    },
    removeEventListener: function (type, listener) {
      if (this._listeners === undefined) return;
      var listeners = this._listeners;
      var listenerArray = listeners[type];
      if (listenerArray !== undefined) {
        var index = listenerArray.indexOf(listener);
        if (index !== -1) {
          listenerArray.splice(index, 1);
        }
      }
    },
    dispatchEvent: function (event) {
      if (this._listeners === undefined) return;
      var listeners = this._listeners;
      var listenerArray = listeners[event.type];
      if (listenerArray !== undefined) {
        event.target = this;
        var array = [];
        var length = listenerArray.length;
        for (var i = 0; i < length; i++) {
          array[i] = listenerArray[i];
        }
        for (var i = 0; i < length; i++) {
          array[i].call(this, event);
        }
      }
    }
  };

  /**
   * Defines at given object a WS URL out of given HTTP remoteURL location
   * @param  {Object} obj       Where to define the wsURL property
   * @param  {String} remoteUrl HTTP remote address
   * @return {String}           WS address
   */
  function defineWebSocketURL(obj, remoteUrl){
    var url;
    if(remoteUrl){
      url = new URL(remoteUrl, window.location);
    } else {
      url = new URL(window.location.href);
    }
    // use exactly same URL, switch only protocols
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return Object.defineProperty(obj, 'wsURL', {
      value: url
    });

  }

  /**
   * @constructor
     */
  function Reconnector(eventDispatcher, reconnectAction) {
    this._eventDispatcher = eventDispatcher;
    this._reconnect = reconnectAction;
    this._reset();
  }

  Reconnector.prototype._reset = function() {
    this._intervalMs = 1000;
    this._timeToCurrentReconnectionMs = 0;
    this._reconnectionPending = false;
    clearTimeout(this._reconnection);
    this._reconnection = null;
  };

  Reconnector.prototype._step = function() {
    if(this._timeToCurrentReconnectionMs == 0) {
      console.log("reconnecting now");
      this._dispatchEvent('reconnection-countdown', {seconds: 0});
      this._reconnectionPending = false;
      this._intervalMs *= 2;
      this._reconnect();
    } else {
      var timeToReconnectionS = (this._timeToCurrentReconnectionMs / 1000);
      this._dispatchEvent('reconnection-countdown', {seconds: timeToReconnectionS});
      console.log('reconnecting in '+ timeToReconnectionS +'s');
      this._timeToCurrentReconnectionMs -= 1000;
      setTimeout(this._step.bind(this), 1000);
    }
  };

  Reconnector.prototype._dispatchEvent = function (name, detail) {
    this._eventDispatcher.dispatchEvent(new CustomEvent(name, {bubbles: true, cancelable: false, detail: detail}));
  };

  /**
   * Notify Reconnector that connection error occurred and automatic reconnection should be scheduled.
   */
  Reconnector.prototype.triggerReconnection = function () {
    if(this._reconnectionPending) {
      return;
    }
    console.log("reconnecting in  "+(this._intervalMs)/1000+"s...");
    this._timeToCurrentReconnectionMs = this._intervalMs;
    this._reconnectionPending = true;
    this._step();
  };

  /**
   * Reconnect immediately and reset all reconnection timers.
   */
  Reconnector.prototype.reconnectNow = function () {
    this._timeToCurrentReconnectionMs = 0;
    this._intervalMs = 1000;
  };

  /**
   * Notify Reconnector that there's no need to do further actions (either connection has been established or a fatal error occured).
   * Resets state of Reconnector
   */
  Reconnector.prototype.stopReconnecting = function() {
    this._reset();
    this._dispatchEvent('reconnection-end');
  };

  /**
   * Guarantees some communication to server and monitors responses for timeouts.
   * @param sendHeartbeatAction will be called to send a heartbeat
   * @param onError will be called if no response will arrive after `timeoutMs` since a message has been sent
   * @param intervalMs if no request will be sent in that time, a heartbeat will be issued
   * @param timeoutMs should a response fail to arrive in this time, `onError` will be called
   * @constructor
     */
  function Heartbeat(sendHeartbeatAction, onError, intervalMs, timeoutMs) {
    this._send = sendHeartbeatAction;
    this._onError = onError;
    this._intervalMs = intervalMs;
    this._timeoutMs = timeoutMs;
    this._scheduledSend = null;
    this._scheduledError = null;
  }

  /**
   * Call this function at the beginning of operation and after successful reconnection.
   */
  Heartbeat.prototype.start = function() {
    if(this._scheduledSend) {
      return;
    }
    this._scheduledSend = setTimeout((function () {
      this.notifySend();
      this._send();
    }).bind(this), this._intervalMs);
  };

  /**
   * Call this method just before a message is sent. This will prevent unnecessary heartbeats.
   */
  Heartbeat.prototype.notifySend = function() {
    clearTimeout(this._scheduledSend); // sending heartbeat will not be necessary until our response arrives
    this._scheduledSend = null;
    if(this._scheduledError) {
      return;
    }
    this._scheduledError = setTimeout((function () {
      this._scheduledError = null;
      this._onError(); // timeout has passed and response hasn't arrived
    }).bind(this), this._timeoutMs);
  };

  /**
   * Call this method when a message arrives from other party. Failing to do so will result in false positive `onError` calls
   */
  Heartbeat.prototype.notifyReceive = function() {
    clearTimeout(this._scheduledError);
    this._scheduledError = null;
    this.start();
  };

  /**
   * Call this method to disable heartbeat temporarily. This is *not* automatically called when error is detected
   */
  Heartbeat.prototype.stop = function () {
    clearTimeout(this._scheduledSend);
    this._scheduledSend = null;
    clearTimeout(this._scheduledError);
    this._scheduledError = null;
  };

  function NoHeartbeat() {
    this.start = this.stop = this.notifySend = this.notifyReceive = function () {};
  }

  function PuppetNetworkChannel(puppet, remoteUrl, useWebSocket, onReceive, onSend, onConnectionError, onFatalError, onStateChange) {
    // TODO(tomalec): to be removed once we will achieve better separation of concerns
    this.puppet = puppet;

    if (remoteUrl instanceof URL) {
    this.remoteUrl = remoteUrl;
    } else if (remoteUrl) {
        this.remoteUrl = new URL(remoteUrl, window.location.href);
    } else {
        this.remoteUrl = new URL(window.location.href);
    }

    // define wsURL if needed
    if(useWebSocket){
      defineWebSocketURL(this, remoteUrl);
    }

    onReceive && (this.onReceive = onReceive);
    onSend && (this.onSend = onSend);
    onConnectionError && (this.onConnectionError = onConnectionError);
    onFatalError && (this.onFatalError = onFatalError);
    onStateChange && (this.onStateChange = onStateChange);

    //useWebSocket = useWebSocket || false;
    var that = this;
    Object.defineProperty(this, "useWebSocket", {
      get: function () {
        return useWebSocket;
      },
      set: function (newValue) {
        useWebSocket = newValue;

        if(newValue == false) {
          if(that._ws) {
            that._ws.onclose = function() { //overwrites the previous onclose
              that._ws = null;
            };
            that._ws.close();
          }
        // define wsURL if needed
        } else if(!that.wsURL) {
          defineWebSocketURL(this, remoteUrl);
        }
        return useWebSocket;
      }
    });
  }
  // TODO: auto-configure here #38 (tomalec)
  PuppetNetworkChannel.prototype.establish = function(bootstrap /*, onConnectionReady*/){
    var network = this;
    return this.xhr(
        this.remoteUrl.href,
        'application/json',
        null,
        function (res) {
          bootstrap( res.responseText );

          if (network.useWebSocket){
            network.webSocketUpgrade();
          }
          return network;
        }
      );

  };
  /**
   * Send any text message by currently established channel
   * @TODO: handle readyState 2-CLOSING & 3-CLOSED (tomalec)
   * @param  {String} msg message to be sent
   * @return {PuppetNetworkChannel}     self
   */
  PuppetNetworkChannel.prototype.send = function(msg){
    var that = this;
    // send message only if there is a working ws connection
    if (this.useWebSocket && this._ws && this._ws.readyState === 1) {
        this._ws.send(msg);
        that.onSend(msg, that._ws.url, "WS");
    } else {
      var url = this.remoteUrl.href;
      this.xhr(url, 'application/json-patch+json', msg, function (res, method) {
          that.onReceive(res.responseText, url, method);
        });
    }
    return this;
  };
  /**
   * Callback function that will be called once message from remote comes.
   * @param {String} [JSONPatch_sequences] message with Array of JSONPatches that were send by remote.
   * @return {[type]} [description]
   */
  PuppetNetworkChannel.prototype.onReceive = function(/*String_with_JSONPatch_sequences*/){};
  PuppetNetworkChannel.prototype.onSend = function () { };
  PuppetNetworkChannel.prototype.onStateChange = function () { };
  PuppetNetworkChannel.prototype.upgrade = function(msg){
  };

  /**
   * Send a WebSocket upgrade request to the server.
   * For testing purposes WS upgrade url is hardcoded now in PuppetJS (replace __default/ID with __default/ID)
   * In future, server should suggest the WebSocket upgrade URL
   * @TODO:(tomalec)[cleanup] hide from public API.
   * @param {Function} [callback] Function to be called once connection gets opened.
   * @returns {WebSocket} created WebSocket
   */
  PuppetNetworkChannel.prototype.webSocketUpgrade = function (callback) {
    var that = this;
    // resolve session path given in referrer in the context of remote WS URL
    var upgradeURL = (
      new URL(
        this.remoteUrl.pathname,
        this.wsURL
        )
      ).href;
    // ws[s]://[user[:pass]@]remote.host[:port]/__[sessionid]/

    that._ws = new WebSocket(upgradeURL);
    that._ws.onopen = function (event) {
      that.onStateChange(that._ws.readyState, upgradeURL);
      callback && callback(event);
      //TODO: trigger on-ready event (tomalec)
    };
    that._ws.onmessage = function (event) {
      that.onReceive(event.data, that._ws.url, "WS");
    };
    that._ws.onerror = function (event) {
      that.onStateChange(that._ws.readyState, upgradeURL, event.data);

      if (!that.useWebSocket) {
          return;
      }

      var m = {
          statusText: "WebSocket connection could not be made.",
          readyState: that._ws.readyState,
          url: upgradeURL
      };

      that.onError(JSON.stringify(m), upgradeURL, "WS");
    };
    that._ws.onclose = function (event) {
      that.onStateChange(that._ws.readyState, upgradeURL, null, event.code, event.reason);

      var m = {
          statusText: "WebSocket connection closed.",
          readyState: that._ws.readyState,
          url: upgradeURL,
          statusCode: event.code,
          reason: event.reason
      };

      if(event.reason) {
        that.onFatalError(JSON.stringify(m), upgradeURL, "WS");
      } else {
        that.onConnectionError();
      }
    };
  };
  PuppetNetworkChannel.prototype.changeState = function (href) {
    var that = this;
    return this.xhr(href, 'application/json-patch+json', null, function (res, method) {
      that.onReceive(res.responseText, href, method);
    }, true);
  };

  // TODO:(tomalec)[cleanup] hide from public API.
  PuppetNetworkChannel.prototype.setRemoteUrl = function (remoteUrl) {
    if (this.remoteUrlSet && this.remoteUrl && this.remoteUrl.href != remoteUrl) {
        throw new Error("Session lost. Server replied with a different session ID that was already set. \nPossibly a server restart happened while you were working. \nPlease reload the page.\n\nPrevious session ID: " + this.remoteUrl + "\nNew session ID: " + remoteUrl);
    }
    this.remoteUrlSet = true;
    this.remoteUrl = new URL(remoteUrl, this.remoteUrl.href);
  };

  // TODO:(tomalec)[cleanup] hide from public API.
  PuppetNetworkChannel.prototype.handleResponseHeader = function (xhr) {
    var location = xhr.getResponseHeader('X-Location') || xhr.getResponseHeader('Location');
    if (location) {
      this.setRemoteUrl(location);
    }
  };

  /**
   * Internal method to perform XMLHttpRequest
   * @param url (Optional) URL to send the request. If empty string, undefined or null given - the request will be sent to window location
   * @param accept (Optional) HTTP accept header
   * @param data (Optional) Data payload
   * @param [callback(response)] callback to be called in context of puppet with response as argument
   * @returns {XMLHttpRequest} performed XHR
   */
  PuppetNetworkChannel.prototype.xhr = function (url, accept, data, callback, setReferer) {
    var that = this;
    var req = new XMLHttpRequest();
    var method = "GET";
    req.onload = function () {
      var res = this;
      that.handleResponseHeader(res);
      if (res.status >= 400 && res.status <= 599) {
        that.onFatalError(JSON.stringify({ statusCode: res.status, statusText: res.statusText, text: res.responseText }), url, method);
        throw new Error('PuppetJs JSON response error. Server responded with error ' + res.status + ' ' + res.statusText + '\n\n' + res.responseText);
      }
      else {
        callback && callback.call(that.puppet, res, method);
      }
    };
    req.onerror = that.onConnectionError.bind(that);
    url = url || window.location.href;
    if (data) {
      method = "PATCH";
      req.open(method, url, true);
      req.setRequestHeader('Content-Type', 'application/json-patch+json');
    }
    else {
      req.open(method, url, true);
    }
    if (accept) {
      req.setRequestHeader('Accept', accept);
    }
    if (that.remoteUrl && setReferer) {
      req.setRequestHeader('X-Referer', that.remoteUrl.pathname);
    }
    that.onSend(data, url, method);
    req.send(data);

    return req;
  };

  /**
   * Non-queuing object that conforms JSON-Patch-Queue API
   * @param {Function} apply function to apply received patch
   */
  function NoQueue(apply){
    this.apply = apply;
  }
  /** just forward message */
  NoQueue.prototype.send = function(msg){
    return msg;
  };
  /** Apply given JSON Patch sequence immediately */
  NoQueue.prototype.receive = function(obj, sequence){
    this.apply(obj, sequence);
  };

  function connectToRemote(puppet) {
    console.log("connecting");
    puppet.network.establish(function bootstrap(responseText){
      puppet.reconnector.stopReconnecting();
      var json = JSON.parse(responseText);
      var bigPatch = [{ op: "replace", path: "", value: json }];
      puppet.validateAndApplySequence(puppet.obj, bigPatch);

      if (puppet.debug) {
        puppet.remoteObj = responseText; // JSON.parse(JSON.stringify(puppet.obj));
      }

      recursiveMarkObjProperties(puppet.obj);
      puppet.observe();
      console.log("connected");
      if (puppet.onDataReady) {
        puppet.onDataReady.call(puppet, puppet.obj);
      }

      puppet.heartbeat.start();
    });
  }

  /**
   * Defines a connection to a remote PATCH server, serves an object that is persistent between browser and server.
   * @param {Object}             [options]                    map of arguments
   * @param {String}             [options.remoteUrl]          PATCH server URL
   * @param {Function}           [options.callback]        Called after initial state object is received from the remote (NOT necessarily after WS connection was established)
   * @param {Object}             [options.obj]                object where the parsed JSON data will be inserted
   * @param {Boolean}            [options.useWebSocket=false] Set to true to enable WebSocket support
   * @param {RegExp}             [options.ignoreAdd=null]     Regular Expression for `add` operations to be ignored (tested against JSON Pointer in JSON Patch)
   * @param {Boolean}            [options.debug=false]        Set to true to enable debugging mode
   * @param {Function}           [options.onLocalChange]      Helper callback triggered each time a change is observed locally
   * @param {Function}           [options.onRemoteChange]     Helper callback triggered each time a patch is obtained from remote
   * @param {JSONPointer}        [options.localVersionPath]   local version path, set it to enable Versioned JSON Patch communication
   * @param {JSONPointer}        [options.remoteVersionPath]  remote version path, set it (and `localVersionPath`) to enable Versioned JSON Patch communication
   * @param {Number}             [options.retransmissionThreshold]  after server reports this number of messages missing, we start retransmission
   * @param {Boolean}            [options.ot=false]           true to enable OT
   * @param {Boolean}            [options.purity=false]       true to enable purist mode of OT
   * @param {Function}           [options.onPatchReceived]
   * @param {Function}           [options.onPatchSent]
   * @param {Function}           [options.jsonpatch=jsonpatch] jsonpatch provider
   * @param {HTMLElement | window} [options.listenTo]         HTMLElement or window to listen to clicks
   */
  function Puppet(options) {
    options || (options={});
    this.jsonpatch = options.jsonpatch || this.jsonpatch;
    this.debug = options.debug != undefined ? options.debug : true;

    if ("obj" in options) {
        if (typeof options.obj != "object") {
            throw new Error("'options.obj' is not an object");
        }
        this.obj = options.obj;
    }
    else {
        this.obj = {};
    }

    this.observer = null;
    this.onLocalChange = options.onLocalChange;
    this.onRemoteChange = options.onRemoteChange;
    this.onPatchReceived = options.onPatchReceived || function () { };
    this.onPatchSent = options.onPatchSent || function () { };
    this.onSocketStateChanged = options.onSocketStateChanged || function () { };
    this.onConnectionError = options.onConnectionError || function () { };
    this.retransmissionThreshold = options.retransmissionThreshold || 3;

    this.reconnector = new Reconnector(this, function () {
      connectToRemote(this);
    }.bind(this));

    if(options.pingInterval) {
      const intervalMs = options.pingInterval*1000;
      this.heartbeat = new Heartbeat(this.sendHeartbeat.bind(this), this.handleConnectionError.bind(this), intervalMs, intervalMs);
    } else {
      this.heartbeat = new NoHeartbeat();
    }

    this.network = new PuppetNetworkChannel(
        this, // puppet instance TODO: to be removed, used for error reporting
        options.remoteUrl,
        options.useWebSocket || false, // useWebSocket
        this.handleRemoteChange.bind(this), //onReceive
        this.onPatchSent.bind(this), //onSend,
        this.handleConnectionError.bind(this), //onConnectionError,
        this.handleFatalError.bind(this), //onFatalError,
        this.onSocketStateChanged.bind(this) //onStateChange
      );

    Object.defineProperty(this, "useWebSocket", {
      get: function () {
        return this.network.useWebSocket;
      },
      set: function (newValue) {
        this.network.useWebSocket = newValue;
      }
    });

    this.ignoreCache = {};
    this.ignoreAdd = options.ignoreAdd || null; //undefined, null or regexp (tested against JSON Pointer in JSON Patch)

    //usage:
    //puppet.ignoreAdd = null;  //undefined or null means that all properties added on client will be sent to remote
    //puppet.ignoreAdd = /./; //ignore all the "add" operations
    //puppet.ignoreAdd = /\/\$.+/; //ignore the "add" operations of properties that start with $
    //puppet.ignoreAdd = /\/_.+/; //ignore the "add" operations of properties that start with _

    this.onDataReady = options.callback;

    this._createQueue = function() {
      // choose queuing engine
      if(options.localVersionPath){
        if(!options.remoteVersionPath){
          //just versioning
          this.queue = new JSONPatchQueueSynchronous(options.localVersionPath, this.validateAndApplySequence.bind(this), options.purity);
        } else {
          // double versioning or OT
          this.queue = options.ot ?
              new JSONPatchOTAgent(JSONPatchOT.transform, [options.localVersionPath, options.remoteVersionPath], this.validateAndApplySequence.bind(this), options.purity) :
              new JSONPatchQueue([options.localVersionPath, options.remoteVersionPath], this.validateAndApplySequence.bind(this), options.purity); // full or noop OT
        }
      } else {
        // no queue - just api
        this.queue = new NoQueue(this.validateAndApplySequence.bind(this));
      }
    };
    this._createQueue();

    connectToRemote(this);
  }

  function markObjPropertyByPath(obj, path) {
    var keys = path.split('/');
    var len = keys.length;
    if (len > 2) {
      for (var i = 1; i < len - 1; i++) {
        obj = obj[keys[i]];
      }
    }
    recursiveMarkObjProperties(obj[keys[len - 1]], len > 1? obj : undefined);
  }

  function placeMarker(subject, parent) {
    if (parent != undefined && !subject.hasOwnProperty('$parent')) {
      Object.defineProperty(subject, '$parent', {
        enumerable: false,
        get: function () {
          return parent;
        }
      });
    }
  }

  function recursiveMarkObjProperties(subject, parent) {
    var child;
    if(subject !== null && typeof subject === 'object'){
      placeMarker(subject, parent);
      for (var i in subject) {
        child = subject[i];
        if (subject.hasOwnProperty(i)) {
          recursiveMarkObjProperties(child, subject);
      }
    }
  }
  }

  Puppet.prototype = Object.create(EventDispatcher.prototype); //inherit EventTarget API from EventDispatcher

  var dispatchErrorEvent = function (puppet, error) {
    var errorEvent;
    if (ErrorEvent.prototype.initErrorEvent) {
      var ev = document.createEvent("ErrorEvent");
      ev.initErrorEvent('error', true, true, error.message, "", ""); //IE10+
      Object.defineProperty(ev, 'error', {value: error}); //ev.error is ignored
    } else {
      errorEvent = new ErrorEvent("error", {bubbles: true, cancelable: true, error: error}); //this works everywhere except IE
    }
    puppet.dispatchEvent(errorEvent);
  };

  Puppet.prototype.jsonpatch = global.jsonpatch;

  Puppet.prototype.sendHeartbeat = function () {
    this.handleLocalChange([]); // sends empty message to server
  };

  Puppet.prototype.observe = function () {
    this.observer = this.jsonpatch.observe(this.obj, this.filterChangedCallback.bind(this));
  };

  Puppet.prototype.unobserve = function () {
    if (this.observer) { //there is a bug in JSON-Patch when trying to unobserve something that is already unobserved
      this.jsonpatch.unobserve(this.obj, this.observer);
      this.observer = null;
    }
  };

  Puppet.prototype.filterChangedCallback = function (patches) {
    this.filterIgnoredPatches(patches);
    if(patches.length) {
      this.handleLocalChange(patches);
    }
  };

  function isIgnored(pattern, ignoreCache, path, op) {
    if (op === 'add' && pattern.test(path)) {
      ignoreCache[path] = true;
      return true;
    }
    var arr = path.split('/');
    var joined = '';
    for (var i = 1, ilen = arr.length; i < ilen; i++) {
      joined += '/' + arr[i];
      if (ignoreCache[joined]) {
        return true; //once we decided to ignore something that was added, other operations (replace, remove, ...) are ignored as well
      }
    }
    return false;
  }

  //ignores private member changes
  Puppet.prototype.filterIgnoredPatches = function (patches) {
    if(this.ignoreAdd){
      for (var i = 0, ilen = patches.length; i < ilen; i++) {
        if (isIgnored(this.ignoreAdd, this.ignoreCache, patches[i].path, patches[i].op)) { //if it is ignored, remove patch
          patches.splice(i, 1); //ignore changes to properties that start with PRIVATE_PREFIX
          ilen--;
          i--;
        }
      }
    }
    return patches;
  };

  Puppet.prototype._sendPatches = function(patches) {
    var txt = JSON.stringify(patches);
    if (txt.indexOf('__Jasmine_been_here_before__') > -1) {
      throw new Error("PuppetJs did not handle Jasmine test case correctly");
    }
    this.unobserve();
    this.heartbeat.notifySend();
    this.network.send(txt);
    this.observe();
  };

  Puppet.prototype.handleLocalChange = function (patches) {
    var that = this;

    if(this.debug) {
      this.validateSequence(this.remoteObj, patches);
    }

    this._sendPatches(this.queue.send(patches));
    patches.forEach(function (patch) {
      markObjPropertyByPath(that.obj, patch.path);
    });
    if (this.onLocalChange) {
      this.onLocalChange(patches);
    }
  };

  Puppet.prototype.validateAndApplySequence = function (tree, sequence) {
    // we don't want this changes to generate patches since they originate from server, not client
    this.unobserve();
    try {
      var results = this.jsonpatch.apply(tree, sequence, this.debug);
    } catch (error) {
      if(this.debug) {
        error.message = "Incoming patch validation error: " + error.message;
        dispatchErrorEvent(this, error);
        return;
      } else {
        throw error;
      }
    }

    var that = this;
    sequence.forEach(function (patch) {
      if (patch.path === "") {
        var desc = JSON.stringify(sequence);
        if (desc.length > 103) {
          desc = desc.substring(0, 100) + "...";
        }
        //TODO Error
        that.showWarning("Server pushed patch that replaces the object root", desc);
      }
      if (patch.op === "add" || patch.op === "replace" || patch.op === "test") {
        markObjPropertyByPath(that.obj, patch.path);
      }
    });

    // notifications have to happen only where observe has been re-enabled
    // otherwise some listener might produce changes that would go unnoticed
    this.observe();

    // until notifications are converged to single method (events vs. callbacks, #74)
    if (this.onRemoteChange) {
      console.warn("PuppetJs.onRemoteChange is deprecated, please use patch-applied event instead.");
      this.onRemoteChange(sequence, results);
    }
    this.dispatchEvent(new CustomEvent("patch-applied", {bubbles: true, cancelable: true, detail: {patches: sequence, results: results}}));
  };

  Puppet.prototype.validateSequence = function (tree, sequence) {
    var error = this.jsonpatch.validate(sequence, tree);
    if (error) {
      error.message = "Outgoing patch validation error: " + error.message;
      dispatchErrorEvent(this, error);
    }
  };

  /**
   * Handle an error which is probably caused by random disconnection
   */
  Puppet.prototype.handleConnectionError = function () {
    this.heartbeat.stop();
    this.reconnector.triggerReconnection();
  };

  /**
   * Handle an error which probably won't go away on itself (basically forward upstream)
   */
  Puppet.prototype.handleFatalError = function (data, url, method) {
    this.heartbeat.stop();
    this.reconnector.stopReconnecting();
    if (this.onConnectionError) {
      this.onConnectionError(data, url, method);
    }
  };

  Puppet.prototype.reconnectNow = function () {
    this.reconnector.reconnectNow();
  };

  Puppet.prototype.showWarning = function (heading, description) {
    if (this.debug && global.console && console.warn) {
      if (description) {
        heading += " (" + description + ")";
      }
      console.warn("PuppetJs warning: " + heading);
    }
  };

  Puppet.prototype.handleRemoteChange = function (data, url, method) {
    this.heartbeat.notifyReceive();
    var patches = JSON.parse(data || '[]'); // fault tolerance - empty response string should be treated as empty patch array

    if (this.onPatchReceived) {
      this.onPatchReceived(data, url, method);
    }

    // apply only if we're still watching
    if (!this.observer) {
      return;
    }

    this.queue.receive(this.obj, patches);
    if(this.queue.pending && this.queue.pending.length && this.queue.pending.length > this.retransmissionThreshold) {
      // remote counterpart probably failed to receive one of earlier messages, because it has been receiving
      // (but not acknowledging messages for some time
      this.queue.pending.forEach(this._sendPatches.bind(this));
    }
    if (this.debug) {
      this.remoteObj = JSON.parse(JSON.stringify(this.obj));
    }
  };

  global.Puppet = Puppet;
})(window);
