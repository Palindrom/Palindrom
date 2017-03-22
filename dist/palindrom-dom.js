var PalindromDOM =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * version: 2.0.1
 */
var queue = __webpack_require__(7);
var sync = __webpack_require__(6);

module.exports = { JSONPatchQueue: queue, JSONPatchQueueSynchronous: sync, /* Babel demands this */__esModule:  true };


/***/ }),
/* 1 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/*! palindrom.js version: 2.4.0
 * (c) 2013 Joachim Wester
 * MIT license
 */

if(true) {
  var jsonpatch = __webpack_require__(3);
  var JSONPatcherProxy = __webpack_require__(8);
  var JSONPatchQueueSynchronous = __webpack_require__(0).JSONPatchQueueSynchronous;
  var JSONPatchQueue = __webpack_require__(0).JSONPatchQueue;
  var JSONPatchOT = __webpack_require__(5);
  var JSONPatchOTAgent = __webpack_require__(4);
}
var Palindrom = (function () {

  if(typeof global === 'undefined') {
    if(typeof window !== 'undefined') { /* incase neither window nor global existed, e.g React Native */
      var global = window;
    }
    else { var global = {}; }
  }

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
   * @param  {Object} obj       Where to define the wsUrl property
   * @param  {String} remoteUrl HTTP remote address
   * @return {String}           WS address
   */
  function defineWebSocketURL(obj, remoteUrl){
    /* replace 'http' strictly in the beginning of the string,
    this covers http and https */
    var url = remoteUrl.replace(/^http/i, 'ws');
    obj.wsUrl = url;
  }

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
  function Reconnector(reconnect, onReconnectionCountdown, onReconnectionEnd) {
    var intervalMs,
        timeToCurrentReconnectionMs,
        reconnectionPending,
        reconnection,
        defaultIntervalMs = 1000;

    function reset() {
      intervalMs = defaultIntervalMs;
      timeToCurrentReconnectionMs = 0;
      reconnectionPending = false;
      clearTimeout(reconnection);
      reconnection = null;
    }

    var step = (function () {
      if(timeToCurrentReconnectionMs == 0) {
        onReconnectionCountdown(0);
        reconnectionPending = false;
        intervalMs *= 2;
        reconnect();
      } else {
        onReconnectionCountdown(timeToCurrentReconnectionMs);
        timeToCurrentReconnectionMs -= 1000;
        setTimeout(step, 1000);
      }
    });

    /**
     * Notify Reconnector that connection error occurred and automatic reconnection should be scheduled.
     */
    this.triggerReconnection = function () {
      if(reconnectionPending) {
        return;
      }
      timeToCurrentReconnectionMs = intervalMs;
      reconnectionPending = true;
      step();
    };

    /**
     * Reconnect immediately and reset all reconnection timers.
     */
    this.reconnectNow = function () {
      timeToCurrentReconnectionMs = 0;
      intervalMs = defaultIntervalMs;
    };

    /**
     * Notify Reconnector that there's no need to do further actions (either connection has been established or a fatal error occured).
     * Resets state of Reconnector
     */
    this.stopReconnecting = function() {
      reset();
      onReconnectionEnd();
    };

    // remember, we're still in constructor
    reset();
  }

  /**
   * Guarantees some communication to server and monitors responses for timeouts.
   * @param sendHeartbeatAction will be called to send a heartbeat
   * @param onError will be called if no response will arrive after `timeoutMs` since a message has been sent
   * @param intervalMs if no request will be sent in that time, a heartbeat will be issued
   * @param timeoutMs should a response fail to arrive in this time, `onError` will be called
   * @constructor
     */
  function Heartbeat(sendHeartbeatAction, onError, intervalMs, timeoutMs) {
    var scheduledSend,
        scheduledError;

    /**
     * Call this function at the beginning of operation and after successful reconnection.
     */
    this.start = function() {
      if(scheduledSend) {
        return;
      }
      scheduledSend = setTimeout((function () {
        this.notifySend();
        sendHeartbeatAction();
      }).bind(this), intervalMs);
    };

    /**
     * Call this method just before a message is sent. This will prevent unnecessary heartbeats.
     */
    this.notifySend = function() {
      clearTimeout(scheduledSend); // sending heartbeat will not be necessary until our response arrives
      scheduledSend = null;
      if(scheduledError) {
        return;
      }
      scheduledError = setTimeout((function () {
        scheduledError = null;
        onError(); // timeout has passed and response hasn't arrived
      }).bind(this), timeoutMs);
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
    this.stop = function () {
      clearTimeout(scheduledSend);
      scheduledSend = null;
      clearTimeout(scheduledError);
      scheduledError = null;
    };
  }


  function NoHeartbeat() {
    this.start = this.stop = this.notifySend = this.notifyReceive = function () {};
  }

  function PalindromNetworkChannel(palindrom, remoteUrl, useWebSocket, onReceive, onSend, onConnectionError, onFatalError, onStateChange) {
    // TODO(tomalec): to be removed once we will achieve better separation of concerns
    this.palindrom = palindrom;

    this.remoteUrl = new URL(remoteUrl, window.location.href);

    // define wsUrl if needed
    if(useWebSocket){
      defineWebSocketURL(this, this.remoteUrl.href);
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
        // define wsUrl if needed
        } else if(!that.wsUrl) {
          defineWebSocketURL(this, newValue);
        }
        return useWebSocket;
      }
    });
  }
  PalindromNetworkChannel.prototype.establish = function(bootstrap){
    establish(this, this.remoteUrl.href, null, bootstrap);
  };
  PalindromNetworkChannel.prototype.reestablish = function(pending, bootstrap) {
    establish(this, this.remoteUrl.href + "/reconnect", JSON.stringify(pending), bootstrap);
  };

  // TODO: auto-configure here #38 (tomalec)
  function establish(network, url, body, bootstrap){
    return network.xhr(
        url,
        'application/json',
        body,
        function (res) {
          bootstrap(res.responseText);
          if (network.useWebSocket){
            network.webSocketUpgrade();
          }
        }
      );
  }
  /**
   * Send any text message by currently established channel
   * @TODO: handle readyState 2-CLOSING & 3-CLOSED (tomalec)
   * @param  {String} msg message to be sent
   * @return {PalindromNetworkChannel}     self
   */
  PalindromNetworkChannel.prototype.send = function(msg){
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
  PalindromNetworkChannel.prototype.onReceive = function(/*String_with_JSONPatch_sequences*/){};
  PalindromNetworkChannel.prototype.onSend = function () { };
  PalindromNetworkChannel.prototype.onStateChange = function () { };
  PalindromNetworkChannel.prototype.upgrade = function(msg){
  };

  function closeWsIfNeeded(network) {
    if(network._ws) {
      network._ws.onclose = function () {};
      network._ws.close();
      network._ws = null;
    }
  }

  /**
   * Send a WebSocket upgrade request to the server.
   * For testing purposes WS upgrade url is hardcoded now in Palindrom (replace __default/ID with __default/ID)
   * In future, server should suggest the WebSocket upgrade URL
   * @TODO:(tomalec)[cleanup] hide from public API.
   * @param {Function} [callback] Function to be called once connection gets opened.
   * @returns {WebSocket} created WebSocket
   */
  PalindromNetworkChannel.prototype.webSocketUpgrade = function (callback) {
    var that = this;

    // resolve session path given in referrer in the context of remote WS URL
    var upgradeURL = (
      new URL(
        this.remoteUrl.pathname,
        this.wsUrl
        )
      ).href;
    // ws[s]://[user[:pass]@]remote.host[:port]/__[sessionid]/

    closeWsIfNeeded(that);
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

      that.onFatalError(m, upgradeURL, "WS");
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
        that.onFatalError(m, upgradeURL, "WS");
      } else {
        that.onConnectionError();
      }
    };
  };
  PalindromNetworkChannel.prototype.changeState = function (href) {
    var that = this;
    return this.xhr(href, 'application/json-patch+json', null, function (res, method) {
      that.onReceive(res.responseText, href, method);
    }, true);
  };

  // TODO:(tomalec)[cleanup] hide from public API.
  PalindromNetworkChannel.prototype.setRemoteUrl = function (remoteUrl) {
    if (this.remoteUrlSet && this.remoteUrl && this.remoteUrl != remoteUrl) {
        throw new Error("Session lost. Server replied with a different session ID that was already set. \nPossibly a server restart happened while you were working. \nPlease reload the page.\n\nPrevious session ID: " + this.remoteUrl + "\nNew session ID: " + remoteUrl);
    }
    this.remoteUrlSet = true;
    this.remoteUrl = new URL(remoteUrl, this.remoteUrl);
  };

  // TODO:(tomalec)[cleanup] hide from public API.
  PalindromNetworkChannel.prototype.handleResponseHeader = function (xhr) {
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
   * @param [callback(response)] callback to be called in context of palindrom with response as argument
   * @returns {XMLHttpRequest} performed XHR
   */
  PalindromNetworkChannel.prototype.xhr = function (url, accept, data, callback, setReferer) {
    var that = this;
    var req = new XMLHttpRequest();
    var method = "GET";
    req.onload = function () {
      var res = this;
      that.handleResponseHeader(res);
      if (res.status >= 400 && res.status <= 599) {
        that.onFatalError({ statusCode: res.status, statusText: res.statusText, reason: res.responseText }, url, method);
      }
      else {
        callback && callback.call(that.palindrom, res, method);
      }
    };
    req.onerror = that.onConnectionError.bind(that);
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
  NoQueue.prototype.reset = function(obj, newState) {
    var patch = [{ op: "replace", path: "", value: newState }];
    this.apply(obj, patch);
  };

  function connectToRemote(palindrom, reconnectionFn) {
    // if we lose connection at this point, the connection we're trying to establish should trigger onError
    palindrom.heartbeat.stop();
    reconnectionFn(function bootstrap(responseText){
      var json = JSON.parse(responseText);
      palindrom.reconnector.stopReconnecting();
      palindrom.queue.reset(palindrom.obj, json);

      if (palindrom.debug) {
        palindrom.remoteObj = responseText; // JSON.parse(JSON.stringify(palindrom.obj));
      }

      palindrom.observe();
      if (palindrom.onDataReady) {
        palindrom.onDataReady.call(palindrom, palindrom.obj);
      }

      palindrom.heartbeat.start();
    });
  }

  function makeInitialConnection(palindrom) {
    connectToRemote(palindrom, palindrom.network.establish.bind(palindrom.network));
  }

  function makeReconnection(palindrom) {
    connectToRemote(palindrom, function (bootstrap) {
      palindrom.network.reestablish(palindrom.queue.pending, bootstrap);
    });
  }


  /**
   * Defines a connection to a remote PATCH server, serves an object that is persistent between browser and server.
   * @param {Object} [options] map of arguments. See README.md for description
   */
  function Palindrom(options) {
    if(typeof options !== "object") {
      throw new Error('Palindrom constructor requires an object argument.');
    }
    if (!options.remoteUrl) {
          throw new Error('remoteUrl is required');
    }
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
    /* wrap the given object with a proxy observer */
    this.jsonPatcherProxy = new JSONPatcherProxy(this.obj);

    var noop = function () { };

    this.isObjectProxified = false;
    this.isObserving = false;
    this.onLocalChange = options.onLocalChange;
    this.onRemoteChange = options.onRemoteChange;
    this.onPatchReceived = options.onPatchReceived || noop;
    this.onPatchSent = options.onPatchSent || noop;
    this.onSocketStateChanged = options.onSocketStateChanged || noop;
    this.onConnectionError = options.onConnectionError || noop;
    this.retransmissionThreshold = options.retransmissionThreshold || 3;
    this.onReconnectionCountdown = options.onReconnectionCountdown || noop;
    this.onReconnectionEnd = options.onReconnectionEnd || noop;

    this.reconnector = new Reconnector(function () {
      makeReconnection(this);
    }.bind(this),
    this.onReconnectionCountdown,
    this.onReconnectionEnd);

    if(options.pingIntervalS) {
      const intervalMs = options.pingIntervalS*1000;
      this.heartbeat = new Heartbeat(this.ping.bind(this), this.handleConnectionError.bind(this), intervalMs, intervalMs);
    } else {
      this.heartbeat = new NoHeartbeat();
    }

    this.network = new PalindromNetworkChannel(
        this, // palindrom instance TODO: to be removed, used for error reporting
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
    //palindrom.ignoreAdd = null;  //undefined or null means that all properties added on client will be sent to remote
    //palindrom.ignoreAdd = /./; //ignore all the "add" operations
    //palindrom.ignoreAdd = /\/\$.+/; //ignore the "add" operations of properties that start with $
    //palindrom.ignoreAdd = /\/_.+/; //ignore the "add" operations of properties that start with _

    this.onDataReady = options.callback;

    // choose queuing engine
    if(options.localVersionPath){
      if(!options.remoteVersionPath){
        // just versioning
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

    makeInitialConnection(this);
  }

  Palindrom.prototype = Object.create(EventDispatcher.prototype); //inherit EventTarget API from EventDispatcher

  var dispatchErrorEvent = function (palindrom, error) {
    var errorEvent;
    if (ErrorEvent.prototype.initErrorEvent) {
      var ev = document.createEvent("ErrorEvent");
      ev.initErrorEvent('error', true, true, error.message, "", ""); //IE10+
      Object.defineProperty(ev, 'error', {value: error}); //ev.error is ignored
    } else {
      errorEvent = new ErrorEvent("error", {bubbles: true, cancelable: true, error: error}); //this works everywhere except IE
    }
    palindrom.dispatchEvent(errorEvent);
  };

  Palindrom.prototype.jsonpatch = jsonpatch;

  Palindrom.prototype.ping = function () {
    sendPatches(this, []); // sends empty message to server
  };

  Palindrom.prototype.observe = function () {
    /* if we haven't ever proxified our object,
    this means it's the first observe call,
    let's proxify it then! */
    if (!this.isObjectProxified) {
        this.obj = this.jsonPatcherProxy.observe(true, this.filterChangedCallback.bind(this));
        this.isObjectProxified = true;
    }
    /* we are already observing, just disable event emitting. */
    else {
        this.jsonPatcherProxy.switchObserverOn();
    }
    this.isObserving = true;
  };
  Palindrom.prototype.unobserve = function () {
        this.jsonPatcherProxy && this.jsonPatcherProxy.switchObserverOff();
        this.isObserving = false;
  };

  Palindrom.prototype.filterChangedCallback = function (patch) {
    /* because JSONPatcherProxy is synchronous,
    it passes a single patch to the callback,
    to make the review process easier, I'll convert it to an array
    to keep the change minimal, once approved, I can enhance this,
    or we can keep it in case we decided to introduce batching/delaying */
    var patches = [patch];
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
  Palindrom.prototype.filterIgnoredPatches = function (patches) {
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

  function sendPatches(palindrom, patches) {
    var txt = JSON.stringify(patches);
    palindrom.unobserve();
    palindrom.heartbeat.notifySend();
    palindrom.network.send(txt);
    palindrom.observe();
  }

  Palindrom.prototype.handleLocalChange = function (patches) {

    if(this.debug) {
      this.validateSequence(this.remoteObj, patches);
    }

    sendPatches(this, this.queue.send(patches));
    if (this.onLocalChange) {
      this.onLocalChange(patches);
    }
  };

  Palindrom.prototype.validateAndApplySequence = function (tree, sequence) {
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
    });

    // notifications have to happen only where observe has been re-enabled
    // otherwise some listener might produce changes that would go unnoticed
    this.observe();

    // until notifications are converged to single method (events vs. callbacks, #74)
    if (this.onRemoteChange) {
      console.warn("Palindrom.onRemoteChange is deprecated, please use patch-applied event instead.");
      this.onRemoteChange(sequence, results);
    }
    this.dispatchEvent(new CustomEvent("patch-applied", {bubbles: true, cancelable: true, detail: {patches: sequence, results: results}}));
  };

  Palindrom.prototype.validateSequence = function (tree, sequence) {
    var error = this.jsonpatch.validate(sequence, tree);
    if (error) {
      error.message = "Outgoing patch validation error: " + error.message;
      dispatchErrorEvent(this, error);
    }
  };

  /**
   * Handle an error which is probably caused by random disconnection
   */
  Palindrom.prototype.handleConnectionError = function () {
    this.heartbeat.stop();
    this.reconnector.triggerReconnection();
  };

  /**
   * Handle an error which probably won't go away on itself (basically forward upstream)
   */
  Palindrom.prototype.handleFatalError = function (data, url, method) {
    this.heartbeat.stop();
    this.reconnector.stopReconnecting();
    if (this.onConnectionError) {
      this.onConnectionError(data, url, method);
    }
  };

  Palindrom.prototype.reconnectNow = function () {
    this.reconnector.reconnectNow();
  };

  Palindrom.prototype.showWarning = function (heading, description) {
    if (this.debug && global.console && console.warn) {
      if (description) {
        heading += " (" + description + ")";
      }
      console.warn("Palindrom warning: " + heading);
    }
  };

  Palindrom.prototype.handleRemoteChange = function (data, url, method) {
    this.heartbeat.notifyReceive();
    var patches = JSON.parse(data || '[]'); // fault tolerance - empty response string should be treated as empty patch array
    if(patches.length === 0) { // ping message
      return;
    }

    if (this.onPatchReceived) {
      this.onPatchReceived(data, url, method);
    }

    // apply only if we're still watching
    if (!this.isObserving) {
      return;
    }

    this.queue.receive(this.obj, patches);

    if(this.queue.pending && this.queue.pending.length && this.queue.pending.length > this.retransmissionThreshold) {
      // remote counterpart probably failed to receive one of earlier messages, because it has been receiving
      // (but not acknowledging messages for some time
      this.queue.pending.forEach(sendPatches.bind(null, this));
    }

    if (this.debug) {
      this.remoteObj = JSON.parse(JSON.stringify(this.obj));
    }
  };

  /* backward compatibility */
  global.Puppet = Palindrom;

  return Palindrom;
})();

if(true) {
  module.exports = Palindrom;
  module.exports.default = Palindrom;
  module.exports.__esModule = true;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/*!
 * https://github.com/Starcounter-Jack/JSON-Patch
 * json-patch-duplex.js version: 1.1.8
 * (c) 2013 Joachim Wester
 * MIT license
 */
var jsonpatch;
(function (jsonpatch) {
    var _objectKeys = function (obj) {
        if (_isArray(obj)) {
            var keys = new Array(obj.length);
            for (var k = 0; k < keys.length; k++) {
                keys[k] = "" + k;
            }
            return keys;
        }
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                keys.push(i);
            }
        }
        return keys;
    };
    function _equals(a, b) {
        switch (typeof a) {
            case 'undefined': //backward compatibility, but really I think we should return false
            case 'boolean':
            case 'string':
            case 'number':
                return a === b;
            case 'object':
                if (a === null)
                    return b === null;
                if (_isArray(a)) {
                    if (!_isArray(b) || a.length !== b.length)
                        return false;
                    for (var i = 0, l = a.length; i < l; i++)
                        if (!_equals(a[i], b[i]))
                            return false;
                    return true;
                }
                var bKeys = _objectKeys(b);
                var bLength = bKeys.length;
                if (_objectKeys(a).length !== bLength)
                    return false;
                for (var i = 0; i < bLength; i++)
                    if (!_equals(a[i], b[i]))
                        return false;
                return true;
            default:
                return false;
        }
    }
    /* We use a Javascript hash to store each
     function. Each hash entry (property) uses
     the operation identifiers specified in rfc6902.
     In this way, we can map each patch operation
     to its dedicated function in efficient way.
     */
    /* The operations applicable to an object */
    var objOps = {
        add: function (obj, key) {
            obj[key] = this.value;
        },
        remove: function (obj, key) {
            var removed = obj[key];
            delete obj[key];
            return removed;
        },
        replace: function (obj, key) {
            var removed = obj[key];
            obj[key] = this.value;
            return removed;
        },
        move: function (obj, key, tree) {
            var getOriginalDestination = { op: "_get", path: this.path };
            apply(tree, [getOriginalDestination]);
            // In case value is moved up and overwrites its ancestor
            var original = getOriginalDestination.value === undefined ?
                undefined : JSON.parse(JSON.stringify(getOriginalDestination.value));
            var temp = { op: "_get", path: this.from };
            apply(tree, [temp]);
            apply(tree, [
                { op: "remove", path: this.from }
            ]);
            apply(tree, [
                { op: "add", path: this.path, value: temp.value }
            ]);
            return original;
        },
        copy: function (obj, key, tree) {
            var temp = { op: "_get", path: this.from };
            apply(tree, [temp]);
            apply(tree, [
                { op: "add", path: this.path, value: temp.value }
            ]);
        },
        test: function (obj, key) {
            return _equals(obj[key], this.value);
        },
        _get: function (obj, key) {
            this.value = obj[key];
        }
    };
    /* The operations applicable to an array. Many are the same as for the object */
    var arrOps = {
        add: function (arr, i) {
            arr.splice(i, 0, this.value);
            // this may be needed when using '-' in an array
            return i;
        },
        remove: function (arr, i) {
            var removedList = arr.splice(i, 1);
            return removedList[0];
        },
        replace: function (arr, i) {
            var removed = arr[i];
            arr[i] = this.value;
            return removed;
        },
        move: objOps.move,
        copy: objOps.copy,
        test: objOps.test,
        _get: objOps._get
    };
    /* The operations applicable to object root. Many are the same as for the object */
    var rootOps = {
        add: function (obj) {
            rootOps.remove.call(this, obj);
            for (var key in this.value) {
                if (this.value.hasOwnProperty(key)) {
                    obj[key] = this.value[key];
                }
            }
        },
        remove: function (obj) {
            var removed = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    removed[key] = obj[key];
                    objOps.remove.call(this, obj, key);
                }
            }
            return removed;
        },
        replace: function (obj) {
            var removed = apply(obj, [
                { op: "remove", path: this.path }
            ]);
            apply(obj, [
                { op: "add", path: this.path, value: this.value }
            ]);
            return removed[0];
        },
        move: objOps.move,
        copy: objOps.copy,
        test: function (obj) {
            return (JSON.stringify(obj) === JSON.stringify(this.value));
        },
        _get: function (obj) {
            this.value = obj;
        }
    };
    function escapePathComponent(str) {
        if (str.indexOf('/') === -1 && str.indexOf('~') === -1)
            return str;
        return str.replace(/~/g, '~0').replace(/\//g, '~1');
    }
    function _getPathRecursive(root, obj) {
        var found;
        for (var key in root) {
            if (root.hasOwnProperty(key)) {
                if (root[key] === obj) {
                    return escapePathComponent(key) + '/';
                }
                else if (typeof root[key] === 'object') {
                    found = _getPathRecursive(root[key], obj);
                    if (found != '') {
                        return escapePathComponent(key) + '/' + found;
                    }
                }
            }
        }
        return '';
    }
    function getPath(root, obj) {
        if (root === obj) {
            return '/';
        }
        var path = _getPathRecursive(root, obj);
        if (path === '') {
            throw new Error("Object not found in root");
        }
        return '/' + path;
    }
    var beforeDict = [];
    var Mirror = (function () {
        function Mirror(obj) {
            this.observers = [];
            this.obj = obj;
        }
        return Mirror;
    }());
    var ObserverInfo = (function () {
        function ObserverInfo(callback, observer) {
            this.callback = callback;
            this.observer = observer;
        }
        return ObserverInfo;
    }());
    function getMirror(obj) {
        for (var i = 0, ilen = beforeDict.length; i < ilen; i++) {
            if (beforeDict[i].obj === obj) {
                return beforeDict[i];
            }
        }
    }
    function getObserverFromMirror(mirror, callback) {
        for (var j = 0, jlen = mirror.observers.length; j < jlen; j++) {
            if (mirror.observers[j].callback === callback) {
                return mirror.observers[j].observer;
            }
        }
    }
    function removeObserverFromMirror(mirror, observer) {
        for (var j = 0, jlen = mirror.observers.length; j < jlen; j++) {
            if (mirror.observers[j].observer === observer) {
                mirror.observers.splice(j, 1);
                return;
            }
        }
    }
    function unobserve(root, observer) {
        observer.unobserve();
    }
    jsonpatch.unobserve = unobserve;
    function deepClone(obj) {
        switch (typeof obj) {
            case "object":
                return JSON.parse(JSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
            case "undefined":
                return null; //this is how JSON.stringify behaves for array items
            default:
                return obj; //no need to clone primitives
        }
    }
    function observe(obj, callback) {
        var patches = [];
        var root = obj;
        var observer;
        var mirror = getMirror(obj);
        if (!mirror) {
            mirror = new Mirror(obj);
            beforeDict.push(mirror);
        }
        else {
            observer = getObserverFromMirror(mirror, callback);
        }
        if (observer) {
            return observer;
        }
        observer = {};
        mirror.value = deepClone(obj);
        if (callback) {
            observer.callback = callback;
            observer.next = null;
            var dirtyCheck = function () {
                generate(observer);
            };
            var fastCheck = function () {
                clearTimeout(observer.next);
                observer.next = setTimeout(dirtyCheck);
            };
            if (typeof window !== 'undefined') {
                if (window.addEventListener) {
                    window.addEventListener('mouseup', fastCheck);
                    window.addEventListener('keyup', fastCheck);
                    window.addEventListener('mousedown', fastCheck);
                    window.addEventListener('keydown', fastCheck);
                    window.addEventListener('change', fastCheck);
                }
                else {
                    document.documentElement.attachEvent('onmouseup', fastCheck);
                    document.documentElement.attachEvent('onkeyup', fastCheck);
                    document.documentElement.attachEvent('onmousedown', fastCheck);
                    document.documentElement.attachEvent('onkeydown', fastCheck);
                    document.documentElement.attachEvent('onchange', fastCheck);
                }
            }
        }
        observer.patches = patches;
        observer.object = obj;
        observer.unobserve = function () {
            generate(observer);
            clearTimeout(observer.next);
            removeObserverFromMirror(mirror, observer);
            if (typeof window !== 'undefined') {
                if (window.removeEventListener) {
                    window.removeEventListener('mouseup', fastCheck);
                    window.removeEventListener('keyup', fastCheck);
                    window.removeEventListener('mousedown', fastCheck);
                    window.removeEventListener('keydown', fastCheck);
                }
                else {
                    document.documentElement.detachEvent('onmouseup', fastCheck);
                    document.documentElement.detachEvent('onkeyup', fastCheck);
                    document.documentElement.detachEvent('onmousedown', fastCheck);
                    document.documentElement.detachEvent('onkeydown', fastCheck);
                }
            }
        };
        mirror.observers.push(new ObserverInfo(callback, observer));
        return observer;
    }
    jsonpatch.observe = observe;
    function generate(observer) {
        var mirror;
        for (var i = 0, ilen = beforeDict.length; i < ilen; i++) {
            if (beforeDict[i].obj === observer.object) {
                mirror = beforeDict[i];
                break;
            }
        }
        _generate(mirror.value, observer.object, observer.patches, "");
        if (observer.patches.length) {
            apply(mirror.value, observer.patches);
        }
        var temp = observer.patches;
        if (temp.length > 0) {
            observer.patches = [];
            if (observer.callback) {
                observer.callback(temp);
            }
        }
        return temp;
    }
    jsonpatch.generate = generate;
    // Dirty check if obj is different from mirror, generate patches and update mirror
    function _generate(mirror, obj, patches, path) {
        if (obj === mirror) {
            return;
        }

        if (typeof obj.toJSON === "function") {
            obj = obj.toJSON();
        }
        var newKeys = _objectKeys(obj);
        var oldKeys = _objectKeys(mirror);
        var changed = false;
        var deleted = false;
        //if ever "move" operation is implemented here, make sure this test runs OK: "should not generate the same patch twice (move)"
        for (var t = oldKeys.length - 1; t >= 0; t--) {
            var key = oldKeys[t];
            var oldVal = mirror[key];
            if (obj.hasOwnProperty(key) && !(obj[key] === undefined && oldVal !== undefined && _isArray(obj) === false)) {
                var newVal = obj[key];
                if (typeof oldVal == "object" && oldVal != null && typeof newVal == "object" && newVal != null) {
                    _generate(oldVal, newVal, patches, path + "/" + escapePathComponent(key));
                }
                else {
                    if (oldVal !== newVal) {
                        changed = true;
                        patches.push({ op: "replace", path: path + "/" + escapePathComponent(key), value: deepClone(newVal) });
                    }
                }
            }
            else {
                patches.push({ op: "remove", path: path + "/" + escapePathComponent(key) });
                deleted = true; // property has been deleted
            }
        }
        if (!deleted && newKeys.length == oldKeys.length) {
            return;
        }
        for (var t = 0; t < newKeys.length; t++) {
            var key = newKeys[t];
            if (!mirror.hasOwnProperty(key) && obj[key] !== undefined) {
                patches.push({ op: "add", path: path + "/" + escapePathComponent(key), value: deepClone(obj[key]) });
            }
        }
    }
    var _isArray;
    if (Array.isArray) {
        _isArray = Array.isArray;
    }
    else {
        _isArray = function (obj) {
            return obj.push && typeof obj.length === 'number';
        };
    }
    //3x faster than cached /^\d+$/.test(str)
    function isInteger(str) {
        var i = 0;
        var len = str.length;
        var charCode;
        while (i < len) {
            charCode = str.charCodeAt(i);
            if (charCode >= 48 && charCode <= 57) {
                i++;
                continue;
            }
            return false;
        }
        return true;
    }
    /**
     * Apply a json-patch operation on an object tree
     * Returns an array of results of operations.
     * Each element can either be a boolean (if op == 'test') or
     * the removed object (operations that remove things)
     * or just be undefined
     */
    function apply(tree, patches, validate) {
        var results = [], p = 0, plen = patches.length, patch, key;
        while (p < plen) {
            patch = patches[p];
            p++;
            // Find the object
            var path = patch.path || "";
            var keys = path.split('/');
            var obj = tree;
            var t = 1; //skip empty element - http://jsperf.com/to-shift-or-not-to-shift
            var len = keys.length;
            var existingPathFragment = undefined;
            while (true) {
                key = keys[t];
                if (validate) {
                    if (existingPathFragment === undefined) {
                        if (obj[key] === undefined) {
                            existingPathFragment = keys.slice(0, t).join('/');
                        }
                        else if (t == len - 1) {
                            existingPathFragment = patch.path;
                        }
                        if (existingPathFragment !== undefined) {
                            this.validator(patch, p - 1, tree, existingPathFragment);
                        }
                    }
                }
                t++;
                if (key === undefined) {
                    if (t >= len) {
                        results.push(rootOps[patch.op].call(patch, obj, key, tree)); // Apply patch
                        break;
                    }
                }
                if (_isArray(obj)) {
                    if (key === '-') {
                        key = obj.length;
                    }
                    else {
                        if (validate && !isInteger(key)) {
                            throw new JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", p - 1, patch.path, patch);
                        }
                        key = parseInt(key, 10);
                    }
                    if (t >= len) {
                        if (validate && patch.op === "add" && key > obj.length) {
                            throw new JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", p - 1, patch.path, patch);
                        }
                        results.push(arrOps[patch.op].call(patch, obj, key, tree)); // Apply patch
                        break;
                    }
                }
                else {
                    if (key && key.indexOf('~') != -1)
                        key = key.replace(/~1/g, '/').replace(/~0/g, '~'); // escape chars
                    if (t >= len) {
                        results.push(objOps[patch.op].call(patch, obj, key, tree)); // Apply patch
                        break;
                    }
                }
                obj = obj[key];
            }
        }
        return results;
    }
    jsonpatch.apply = apply;
    function compare(tree1, tree2) {
        var patches = [];
        _generate(tree1, tree2, patches, '');
        return patches;
    }
    jsonpatch.compare = compare;
    // provide scoped __extends for TypeScript's `extend` keyword so it will not provide global one during compilation
    function __extends(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var JsonPatchError = (function (_super) {
        __extends(JsonPatchError, _super);
        function JsonPatchError(message, name, index, operation, tree) {
            _super.call(this, message);
            this.message = message;
            this.name = name;
            this.index = index;
            this.operation = operation;
            this.tree = tree;
        }
        return JsonPatchError;
    }(Error));
    jsonpatch.JsonPatchError = JsonPatchError;
    /**
     * Recursively checks whether an object has any undefined values inside.
     */
    function hasUndefined(obj) {
        if (obj === undefined) {
            return true;
        }
        if (typeof obj == "array" || typeof obj == "object") {
            for (var i in obj) {
                if (hasUndefined(obj[i])) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Validates a single operation. Called from `jsonpatch.validate`. Throws `JsonPatchError` in case of an error.
     * @param {object} operation - operation object (patch)
     * @param {number} index - index of operation in the sequence
     * @param {object} [tree] - object where the operation is supposed to be applied
     * @param {string} [existingPathFragment] - comes along with `tree`
     */
    function validator(operation, index, tree, existingPathFragment) {
        if (typeof operation !== 'object' || operation === null || _isArray(operation)) {
            throw new JsonPatchError('Operation is not an object', 'OPERATION_NOT_AN_OBJECT', index, operation, tree);
        }
        else if (!objOps[operation.op]) {
            throw new JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', index, operation, tree);
        }
        else if (typeof operation.path !== 'string') {
            throw new JsonPatchError('Operation `path` property is not a string', 'OPERATION_PATH_INVALID', index, operation, tree);
        }
        else if (operation.path.indexOf('/') !== 0 && operation.path.length > 0) {
            // paths that aren't emptystring should start with "/"
            throw new JsonPatchError('Operation `path` property must start with "/"', 'OPERATION_PATH_INVALID', index, operation, tree);
        }
        else if ((operation.op === 'move' || operation.op === 'copy') && typeof operation.from !== 'string') {
            throw new JsonPatchError('Operation `from` property is not present (applicable in `move` and `copy` operations)', 'OPERATION_FROM_REQUIRED', index, operation, tree);
        }
        else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && operation.value === undefined) {
            throw new JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_REQUIRED', index, operation, tree);
        }
        else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && hasUndefined(operation.value)) {
            throw new JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED', index, operation, tree);
        }
        else if (tree) {
            if (operation.op == "add") {
                var pathLen = operation.path.split("/").length;
                var existingPathLen = existingPathFragment.split("/").length;
                if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
                    throw new JsonPatchError('Cannot perform an `add` operation at the desired path', 'OPERATION_PATH_CANNOT_ADD', index, operation, tree);
                }
            }
            else if (operation.op === 'replace' || operation.op === 'remove' || operation.op === '_get') {
                if (operation.path !== existingPathFragment) {
                    throw new JsonPatchError('Cannot perform the operation at a path that does not exist', 'OPERATION_PATH_UNRESOLVABLE', index, operation, tree);
                }
            }
            else if (operation.op === 'move' || operation.op === 'copy') {
                var existingValue = { op: "_get", path: operation.from, value: undefined };
                var error = jsonpatch.validate([existingValue], tree);
                if (error && error.name === 'OPERATION_PATH_UNRESOLVABLE') {
                    throw new JsonPatchError('Cannot perform the operation from a path that does not exist', 'OPERATION_FROM_UNRESOLVABLE', index, operation, tree);
                }
            }
        }
    }
    jsonpatch.validator = validator;
    /**
     * Validates a sequence of operations. If `tree` parameter is provided, the sequence is additionally validated against the object tree.
     * If error is encountered, returns a JsonPatchError object
     * @param sequence
     * @param tree
     * @returns {JsonPatchError|undefined}
     */
    function validate(sequence, tree) {
        try {
            if (!_isArray(sequence)) {
                throw new JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
            }
            if (tree) {
                tree = JSON.parse(JSON.stringify(tree)); //clone tree so that we can safely try applying operations
                apply.call(this, tree, sequence, true);
            }
            else {
                for (var i = 0; i < sequence.length; i++) {
                    this.validator(sequence[i], i);
                }
            }
        }
        catch (e) {
            if (e instanceof JsonPatchError) {
                return e;
            }
            else {
                throw e;
            }
        }
    }
    jsonpatch.validate = validate;
})(jsonpatch || (jsonpatch = {}));
if (true) {
    exports.apply = jsonpatch.apply;
    exports.observe = jsonpatch.observe;
    exports.unobserve = jsonpatch.unobserve;
    exports.generate = jsonpatch.generate;
    exports.compare = jsonpatch.compare;
    exports.validate = jsonpatch.validate;
    exports.validator = jsonpatch.validator;
    exports.JsonPatchError = jsonpatch.JsonPatchError;
}
else {
    var exports = {};
    var isBrowser = true;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = jsonpatch;
/*
When in browser, setting `exports = {}`
fools other modules into thinking they're
running in a node environment, which breaks
some of them. Here is super light wieght fix.
*/
if (isBrowser) {
    exports = undefined;
}


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

if(typeof JSONPatchQueue === 'undefined') {
	if(true) {
		var JSONPatchQueue = __webpack_require__(0).JSONPatchQueue;
	}
	else {
		throw new Error('You need to reference JSONPatchQueue before JSONPatchOTAgent');
	}
}

/**
 * [JSONPatchOTAgent description]
 * @param {Function} transform function(seqenceA, sequences) that transforms `seqenceA` against `sequences`.
 * @param {Array<JSON-Pointer>} versionPaths JSON-Pointers to version numbers [local, remote]
 * @param {function} apply    apply(JSONobj, JSONPatchSequence) function to apply JSONPatch to object.
 * @param {Boolean} purity       [description]
 * @constructor
 * @extends {JSONPatchQueue}
 * @version: 1.1.2
 */
var JSONPatchOTAgent = function(transform, versionPaths, apply, purity){
	JSONPatchQueue.call(this, versionPaths, apply, purity);
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
 * @param  {Object} obj                   object to apply patches to
 * @param  {JSONPatch} versionedJsonPatch patch to be applied
 * @param  {Function} [applyCallback]     optional `function(object, consecutiveTransformedPatch)` to be called when applied, if not given #apply will be called
 */
JSONPatchOTAgent.prototype.receive = function(obj, versionedJsonPatch, applyCallback){
	var apply = applyCallback || this.apply,
		queue = this;

	return JSONPatchQueue.prototype.receive.call(this, obj, versionedJsonPatch,
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
	    	apply(obj, consecutivePatch);
		});
};

/**
 * Reset queue internals and object to new, given state
 * @param obj object to apply new state to
 * @param newState versioned object representing desired state along with versions
 */
JSONPatchOTAgent.prototype.reset = function(obj, newState){
	this.ackLocalVersion = JSONPatchQueue.getPropertyByJsonPointer(newState, this.localPath);
	this.pending = [];
	JSONPatchQueue.prototype.reset.call(this, obj, newState);
};
if(true) {
	module.exports = JSONPatchOTAgent;
	module.exports.default = JSONPatchOTAgent;
	module.exports.__esModule = true;
}

/***/ }),
/* 5 */
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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * JSON Patch Queue for synchronous operations, and asynchronous networking.
 * version: 2.0.1
 * @param {JSON-Pointer} versionPath JSON-Pointers to version numbers
 * @param {function} apply    apply(JSONobj, JSONPatchSequence) function to apply JSONPatch to object.
 * @param {Boolean} [purist]       If set to true adds test operation before replace.
 */
var JSONPatchQueueSynchronous = function(versionPath, apply, purist){
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
 * @param  {Object} obj                   object to apply patches to
 * @param  {JSONPatch} versionedJsonPatch patch to be applied
 * @param  {Function} [applyCallback]     optional `function(object, consecutivePatch)` to be called when applied, if not given #apply will be called
 */
JSONPatchQueueSynchronous.prototype.receive = function(obj, versionedJsonPatch, applyCallback){
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
			apply(obj, consecutivePatch);
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
 * @param obj object to apply new state to
 * @param newState versioned object representing desired state along with versions
 */
JSONPatchQueueSynchronous.prototype.reset = function(obj, newState){
	this.version = JSONPatchQueueSynchronous.getPropertyByJsonPointer(newState, this.versionPath);
	this.waiting = [];
	var patch = [{ op: "replace", path: "", value: newState }];
	this.apply(obj, patch);
};

if(true) {
	module.exports = JSONPatchQueueSynchronous;
	module.exports.default = JSONPatchQueueSynchronous;
	/* Babel demands this */
	module.exports.__esModule = true;
}


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * JSON Patch Queue for asynchronous operations, and asynchronous networking.
 * version: 2.0.1
 * @param {Array<JSON-Pointer>} versionPaths JSON-Pointers to version numbers [local, remote]
 * @param {function} apply    apply(JSONobj, JSONPatchSequence) function to apply JSONPatch to object.
 * @param {Boolean} [purist]       If set to true adds test operation before replace.
 */
var JSONPatchQueue = function(versionPaths, apply, purist){
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
 * @param  {Object} obj                   object to apply patches to
 * @param  {JSONPatch} versionedJsonPatch patch to be applied
 * @param  {Function} [applyCallback]     optional `function(object, consecutivePatch)` to be called when applied, if not given #apply will be called
 */
JSONPatchQueue.prototype.receive = function(obj, versionedJsonPatch, applyCallback){
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
			apply(obj, consecutivePatch);
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
 * @param obj object to apply new state to
 * @param newState versioned object representing desired state along with versions
 */
JSONPatchQueue.prototype.reset = function(obj, newState){
	this.remoteVersion = JSONPatchQueue.getPropertyByJsonPointer(newState, this.remotePath);
	this.waiting = [];
	var patch = [{ op: "replace", path: "", value: newState }];
	this.apply(obj, patch);
};

if(true) {
	module.exports = JSONPatchQueue;
	module.exports.default = JSONPatchQueue;
	/* Babel demands this */
	module.exports.__esModule = true;
}


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/*!
 * https://github.com/PuppetJS/JSONPatcherProxy
 * JSONPatcherProxy version: 0.0.1
 * (c) 2017 Starcounter and contributors
 * MIT license
 */

/** Class representing a JS Object observer  */
var JSONPatcherProxy = (function() {
  function JSONPatcherProxy(root) {
    this.originalObject = root;
    this.cachedProxy = null;
    this.isRecording = false;
    this.userCallback;
    var sender = this;
    /**
     * @memberof JSONPatcherProxy
     * Disables patches omitting (to both callback and patches array). However, the object will be updated if you change it.
     */
    this.switchObserverOn = function() {
      sender.defaultCallback = function(event) {
        if (sender.isRecording) {
          sender.patches.push(event);
        }
        if (sender.userCallback) {
          sender.userCallback(event);
        }
      };
    };
    /**
     * @memberof JSONPatcherProxy
     * Enables patches omitting (to both callback and patches array). Starting from the moment you call it. Any changes before that go unnoticed.
     */
    this.switchObserverOff = function() {
      sender.defaultCallback = function() {};
    };
  }
  /**
  * Deep clones your object and returns a new object.
  */
  JSONPatcherProxy.deepClone = function(obj) {
    switch (typeof obj) {
      case "object":
        return JSON.parse(JSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
      case "undefined":
        return null; //this is how JSON.stringify behaves for array items
      default:
        return obj; //no need to clone primitives
    }
  };
  JSONPatcherProxy.escapePathComponent = function(str) {
    if (str.indexOf("/") === -1 && str.indexOf("~") === -1) return str;
    return str.replace(/~/g, "~0").replace(/\//g, "~1");
  };
  JSONPatcherProxy.prototype.generateProxyAtPath = function(obj, path) {
    if (!obj) {
      return obj;
    }
    var instance = this;
    var proxy = new Proxy(obj, {
      get: function(target, propKey, receiver) {
        if (propKey.toString() === "_isProxified") {
          return true; //to distinguish proxies
        }
        return Reflect.get(target, propKey, receiver);
      },
      set: function(target, key, receiver) {
        var distPath = path +
          "/" +
          JSONPatcherProxy.escapePathComponent(key.toString());
        // if the new value is an object, make sure to watch it
        if (
          receiver /* because `null` is in object */ &&
          typeof receiver === "object" &&
          receiver._isProxified !== true
        ) {
          receiver = instance.generateProxyAtPath(receiver, distPath);
        }
        if (typeof receiver === "undefined") {
          if (target.hasOwnProperty(key)) {
            // when array element is set to `undefined`, should generate replace to `null`
            if (Array.isArray(target)) {
              //undefined array elements are JSON.stringified to `null`
              instance.defaultCallback({
                op: "replace",
                path: distPath,
                value: null
              });
            } else {
              instance.defaultCallback({ op: "remove", path: distPath });
            }
            return Reflect.set(target, key, receiver);
          } else if (!Array.isArray(target)) {
            return Reflect.set(target, key, receiver);
          }
        }
        if (Array.isArray(target) && !Number.isInteger(+key.toString())) {
          return Reflect.set(target, key, receiver);
        }
        if (target.hasOwnProperty(key)) {
          if (typeof target[key] === "undefined") {
            if (Array.isArray(target)) {
              instance.defaultCallback({
                op: "replace",
                path: distPath,
                value: receiver
              });
            } else {
              instance.defaultCallback({
                op: "add",
                path: distPath,
                value: receiver
              });
            }
            return Reflect.set(target, key, receiver);
          } else {
            instance.defaultCallback({
              op: "replace",
              path: distPath,
              value: receiver
            });
            return Reflect.set(target, key, receiver);
          }
        } else {
          instance.defaultCallback({
            op: "add",
            path: distPath,
            value: receiver
          });
          return Reflect.set(target, key, receiver);
        }
      },
      deleteProperty: function(target, key) {
        if (typeof target[key] !== "undefined") {
          instance.defaultCallback({
            op: "remove",
            path: (
              path + "/" + JSONPatcherProxy.escapePathComponent(key.toString())
            )
          });
        }
        // else {
        return Reflect.deleteProperty(target, key);
      }
    });
    return proxy;
  };
  //grab tree's leaves one by one, encapsulate them into a proxy and return
  JSONPatcherProxy.prototype._proxifyObjectTreeRecursively = function(
    root,
    path
  ) {
    for (var key in root) {
      if (root.hasOwnProperty(key)) {
        if (typeof root[key] === "object") {
          var distPath = path + "/" + JSONPatcherProxy.escapePathComponent(key);
          root[key] = this.generateProxyAtPath(root[key], distPath);
          this._proxifyObjectTreeRecursively(root[key], distPath);
        }
      }
    }
    return this.generateProxyAtPath(root, "");
  };
  //this function is for aesthetic purposes
  JSONPatcherProxy.prototype.proxifyObjectTree = function(root) {
    /*
        while proxyifying object tree,
        the proxyifying operation itself is being
        recorded, which in an unwanted behavior,
        that's why we disable recording through this
        initial process;
        */
    this.switchObserverOff();
    var proxifiedObject = this._proxifyObjectTreeRecursively(root, "");
    /* OK you can record now */
    this.switchObserverOn();
    return proxifiedObject;
  };
  /**
     * Proxifies the object that was passed in the constructor and returns a proxified mirror of it.
     * @param {Boolean} record - whether to record object changes to a later-retrievable patches array.
     * @param {Function} [callback] - this will be synchronously called with every object change with a single `patch` as the only parameter.
     */
  JSONPatcherProxy.prototype.observe = function(record, callback) {
    if (!record && !callback) {
      throw new Error(
        "You need to either record changes or pass a callback"
      );
    }
    this.isRecording = record;
    if (callback) this.userCallback = callback;
    /*
    I moved it here to remove it from `unobserve`,
    this will also make the constructor faster, why initiate
    the array before they decide to actually observe with recording?
    They might need to use only a callback.
    */
    if (record) this.patches = [];
    return this.cachedProxy = this.proxifyObjectTree(
      JSONPatcherProxy.deepClone(this.originalObject)
    );
  };
  /**
     * If the observed is set to record, it will synchronously return all the patches and empties patches array.
     */
  JSONPatcherProxy.prototype.generate = function() {
    if (!this.isRecording) {
      throw new Error("You should set record to true to get patches later");
    }
    return this.patches.splice(0, this.patches.length);
  };
  /**
     * Synchronously de-proxifies the last state of the object and returns it unobserved.
     */
  JSONPatcherProxy.prototype.unobserve = function() {
    //return a normal, non-proxified object
    return JSONPatcherProxy.deepClone(this.cachedProxy);
  };
  return JSONPatcherProxy;
})();

module.exports = JSONPatcherProxy;
module.exports.default = JSONPatcherProxy;

/***/ })
/******/ ]);

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/*! palindrom-dom.js version: 2.4.0
 * (c) 2013 Joachim Wester
 * MIT license
 */
if(true) {
  var Palindrom = __webpack_require__(2);
}

var PalindromDOM = (function () {
  /**
   * PalindromDOM
   * @extends {Palindrom}
   * @param {Object} [options] map of arguments. See README.md for description
   */
  var PalindromDOM = function (options){
    if(typeof options !== "object") {
      throw new Error('PalindromDOM constructor requires an object argument.');
    }
    if (!options.remoteUrl) {
          throw new Error('remoteUrl is required');
    }
    var onDataReady = options.callback;
    this.element = options.listenTo || document.body;
    var clickHandler = this.clickHandler.bind(this);
    this.historyHandler = this.historyHandler.bind(this);

    this.historyHandlerDeprecated = function () {
      console.warn("`puppet-redirect-pushstate` event is deprecated, please use `palindrom-redirect-pushstate`, if you're using `puppet-redirect`, please upgrade to `palindrom-redirect`");
      this.historyHandler();
    }.bind(this);

    /* in some cases, people emit redirect requests before `listen` is called */
    this.element.addEventListener('palindrom-redirect-pushstate', this.historyHandler);
    /* backward compatibility: for people using old puppet-redirect */
    this.element.addEventListener('puppet-redirect-pushstate', this.historyHandlerDeprecated);

    options.callback = function addDOMListeners(obj){
      this.listen();
      onDataReady && onDataReady.call(this, obj);
    };

    this.listen = function(){
      this.listening = true;
      this.element.addEventListener('click', clickHandler);
      window.addEventListener('popstate', this.historyHandler); //better here than in constructor, because Chrome triggers popstate on page load

      this.element.addEventListener('palindrom-redirect-pushstate', this.historyHandler);

      /* backward compatibility: for people using old puppet-redirect */
      this.element.addEventListener('puppet-redirect-pushstate', this.historyHandlerDeprecated);
    };
    this.unlisten = function(){
      this.listening = false;

      this.element.removeEventListener('click', clickHandler);
      window.removeEventListener('popstate', this.historyHandler); //better here than in constructor, because Chrome triggers popstate on page load
      this.element.removeEventListener('palindrom-redirect-pushstate', this.historyHandler);

      /* backward compatibility: for people using old puppet-redirect */
      this.element.removeEventListener('puppet-redirect-pushstate', this.historyHandlerDeprecated);
    };

    //TODO move fallback to window.location.href from PalindromNetworkChannel to here (PalindromDOM)

    Palindrom.call(this, options);
  };
  PalindromDOM.prototype = Object.create(Palindrom.prototype);

  /**
   * Push a new URL to the browser address bar and send a patch request (empty or including queued local patches)
   * so that the URL handlers can be executed on the remote
   * @param url
   */
  PalindromDOM.prototype.morphUrl = function (url) {
    history.pushState(null, null, url);
    this.network.changeState(url);
  };

  PalindromDOM.prototype.clickHandler = function (event) {
    //Don't morph ctrl/cmd + click & middle mouse button
    if (event.ctrlKey || event.metaKey || event.which == 2) {
      return;
    }

    if (event.detail && event.detail.target) {
      //detail is Polymer
      event = event.detail;
    }

    var target = event.target;

    if (target.nodeName !== 'A') {
        for (var i = 0; i < event.path.length; i++) {
            if (event.path[i].nodeName == "A") {
                target = event.path[i];
                break;
            }
        }
    }

    //needed since Polymer 0.2.0 in Chrome stable / Web Plaftorm features disabled
    //because target.href returns undefined for <polymer-ui-menu-item href="..."> (which is an error)
    //while target.getAttribute("href") returns desired href (as string)
    var href = target.href || target.getAttribute("href");

    if (href && PalindromDOM.isApplicationLink(href)) {
      event.preventDefault();
      event.stopPropagation();
      this.morphUrl(href);
    }
    else if (target.type === 'submit') {
      event.preventDefault();
    }
  };

  PalindromDOM.prototype.historyHandler = function (/*event*/) {
    this.network.changeState(location.href);
  };

  /**
   * Returns information if a given element is an internal application link that Palindrom should intercept into a history push
   * @param elem HTMLElement or String
   * @returns {boolean}
   */
  PalindromDOM.isApplicationLink = function (elem) {
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

  /* backward compatibility, not sure if this is good practice */
  if(typeof global === 'undefined') { var global = window };
  global.PuppetDOM = PalindromDOM;
  
  /* Since we have Palindrom bundled,
  let's expose it in case anyone needs it */
  global.Puppet = Palindrom;
  global.Palindrom = Palindrom;  

  return PalindromDOM;
})();

if(true) {
  module.exports = PalindromDOM;
  module.exports.default = PalindromDOM;
  module.exports.__esModule = true;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ })
/******/ ]);