/*! puppet.js version: 2.2.0
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
  PuppetNetworkChannel.prototype.establish = function(bootstrap){
    establish(this, this.remoteUrl.href, null, bootstrap);
  };
  PuppetNetworkChannel.prototype.reestablish = function(pending, bootstrap) {
    establish(this, this.remoteUrl.href + "/reconnect", JSON.stringify(pending), bootstrap);
  };

  // TODO: auto-configure here #38 (tomalec)
  function establish(network, url, body, bootstrap){
    return network.xhr(
        url,
        'application/json',
        body,
        function (res) {
          bootstrap(JSON.parse(res.responseText));
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

  function closeWsIfNeeded(network) {
    if(network._ws) {
      network._ws.onclose = function () {};
      network._ws.close();
      network._ws = null;
    }
  }

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
    if(that._currentXhr) {
      that._currentXhr.abort();
    }
    var req = new XMLHttpRequest();
    that._currentXhr = req;
    var method = "GET";
    req.onload = function () {
      var res = this;
      that.handleResponseHeader(res);
      if (res.status >= 400 && res.status <= 599) {
        that.onFatalError({ statusCode: res.status, statusText: res.statusText, reason: res.responseText }, url, method);
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
  NoQueue.prototype.reset = function(obj, newState) {
    var patch = [{ op: "replace", path: "", value: newState }];
    this.apply(obj, patch);
  };

  function connectToRemote(puppet, reconnectionFn) {
    // if we lose connection at this point, the connection we're trying to establish should trigger onError
    puppet.heartbeat.stop();
    reconnectionFn(function bootstrap(json){
      puppet.reconnector.stopReconnecting();
      puppet.queue.reset(puppet.obj, json);

      if (puppet.debug) {
        puppet.remoteObj = json;
      }

      puppet.observe();
      if (puppet.onDataReady) {
        puppet.onDataReady.call(puppet, puppet.obj);
      }

      puppet.heartbeat.start();
    });
  }

  function makeInitialConnection(puppet) {
    connectToRemote(puppet, puppet.network.establish.bind(puppet.network));
  }

  function makeReconnection(puppet) {
    connectToRemote(puppet, function (bootstrap) {
      puppet.network.reestablish(puppet.queue.pending, bootstrap);
    });
  }

  /**
   * Defines a connection to a remote PATCH server, serves an object that is persistent between browser and server.
   * @param {Object} [options] map of arguments. See README.md for description
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

    var noop = function () { };

    this.observer = null;
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

  Puppet.prototype.ping = function () {
    sendPatches(this, []); // sends empty message to server
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

  function sendPatches(puppet, patches) {
    var txt = JSON.stringify(patches);
    puppet.unobserve();
    puppet.heartbeat.notifySend();
    puppet.network.send(txt);
    puppet.observe();
  }

  Puppet.prototype.handleLocalChange = function (patches) {
    if(this.debug) {
      this.validateSequence(this.remoteObj, patches);
    }

    sendPatches(this, this.queue.send(patches));
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
    if(patches.length === 0) { // ping message
      return;
    }

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
      this.queue.pending.forEach(sendPatches.bind(null, this));
    }
    if (this.debug) {
      this.remoteObj = JSON.parse(JSON.stringify(this.obj));
    }
  };

  global.Puppet = Puppet;
})(window);
