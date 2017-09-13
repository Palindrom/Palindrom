/*! Palindrom 
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */
if (typeof require !== 'undefined') {
  /* include only applyPatch and validate */
  var { applyPatch, validate } = require('fast-json-patch');
  var JSONPatcherProxy = require('jsonpatcherproxy');
  var JSONPatchQueueSynchronous = require('json-patch-queue')
    .JSONPatchQueueSynchronous;
  var JSONPatchQueue = require('json-patch-queue').JSONPatchQueue;
  var JSONPatchOT = require('json-patch-ot');
  var JSONPatchOTAgent = require('json-patch-ot-agent');
  var URL = require('./URL');
  var axios = require('axios');

  /* We are going to hand `websocket` lib as an external to webpack
  (see: https://webpack.js.org/configuration/externals/), 
  this will make `w3cwebsocket` property `undefined`, 
  and this will lead Palindrom to use Browser's WebSocket when it is used 
  from the bundle. And use `websocket` lib in Node environment */
  var NodeWebSocket = require('websocket').w3cwebsocket;

  /* this allows us to stub WebSockets */
  if (!global.WebSocket && NodeWebSocket) {
    /* we are in production env */
    var WebSocket = NodeWebSocket;
  } else if (global.WebSocket) {
    /* we are in testing env */
    var WebSocket = global.WebSocket;
  }
  /* else {
    we are using Browser's WebSocket
  } */
}
var Palindrom = (function() {
  if (typeof global === 'undefined') {
    if (typeof window !== 'undefined') {
      /* incase neither window nor global existed, e.g React Native */
      var global = window;
    } else {
      var global = {};
    }
  }

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

    var step = function() {
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
    this.triggerReconnection = function() {
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
    this.reconnectNow = function() {
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
    var scheduledSend, scheduledError;

    /**
     * Call this function at the beginning of operation and after successful reconnection.
     */
    this.start = function() {
      if (scheduledSend) {
        return;
      }
      scheduledSend = setTimeout(
        function() {
          this.notifySend();
          sendHeartbeatAction();
        }.bind(this),
        intervalMs
      );
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
      scheduledError = setTimeout(
        function() {
          scheduledError = null;
          onError(); // timeout has passed and response hasn't arrived
        }.bind(this),
        timeoutMs
      );
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
    this.stop = function() {
      clearTimeout(scheduledSend);
      scheduledSend = null;
      clearTimeout(scheduledError);
      scheduledError = null;
    };
  }

  function NoHeartbeat() {
    this.start = this.stop = this.notifySend = this.notifyReceive = function() {};
  }

  function PalindromNetworkChannel(
    palindrom,
    remoteUrl,
    useWebSocket,
    onReceive,
    onSend,
    onConnectionError,
    onSocketOpened,
    onFatalError,
    onStateChange
  ) {
    // TODO(tomalec): to be removed once we will achieve better separation of concerns
    this.palindrom = palindrom;

    if (typeof window !== 'undefined' && window.location) {
      this.remoteUrl = new URL(remoteUrl, window.location.href);
    } else {
      // in Node, URL is absolute
      this.remoteUrl = new URL(remoteUrl);
    }

    onReceive && (this.onReceive = onReceive);
    onSend && (this.onSend = onSend);
    onConnectionError && (this.onConnectionError = onConnectionError);
    onFatalError && (this.onFatalError = onFatalError);
    onStateChange && (this.onStateChange = onStateChange);
    onSocketOpened && (this.onSocketOpened = onSocketOpened);
    //useWebSocket = useWebSocket || false;
    var that = this;
    Object.defineProperty(this, 'useWebSocket', {
      get: function() {
        return useWebSocket;
      },
      set: function(newValue) {
        useWebSocket = newValue;

        if (newValue == false) {
          if (that._ws) {
            that._ws.onclose = function() {
              //overwrites the previous onclose
              that._ws = null;
            };
            that._ws.close();
          }
          // define wsUrl if needed
        } else if (!that.wsUrl) {
          that.wsUrl = toWebSocketURL(that.remoteUrl.href);
        }
        return useWebSocket;
      }
    });
  }
  PalindromNetworkChannel.prototype.establish = function(bootstrap) {
    establish(this, this.remoteUrl.href, null, bootstrap);
  };
  PalindromNetworkChannel.prototype.reestablish = function(pending, bootstrap) {
    establish(
      this,
      this.remoteUrl.href + '/reconnect',
      JSON.stringify(pending),
      bootstrap
    );
  };

  // TODO: auto-configure here #38 (tomalec)
  function establish(network, url, body, bootstrap) {
    return network.xhr(url, 'application/json', body, function(res) {
      bootstrap(res.data);
      if (network.useWebSocket) {
        network.webSocketUpgrade(network.onSocketOpened);
      }
    });
  }
  /**
   * Send any text message by currently established channel
   * @TODO: handle readyState 2-CLOSING & 3-CLOSED (tomalec)
   * @param  {String} msg message to be sent
   * @return {PalindromNetworkChannel}     self
   */
  PalindromNetworkChannel.prototype.send = function(msg) {
    var that = this;
    // send message only if there is a working ws connection
    if (this.useWebSocket && this._ws && this._ws.readyState === 1) {
      this._ws.send(msg);
      that.onSend(msg, that._ws.url, 'WS');
    } else {
      var url = this.remoteUrl.href;
      this.xhr(url, 'application/json-patch+json', msg, function(res, method) {
        that.onReceive(res.data, url, method);
      });
    }
    return this;
  };
  /**
   * Callback function that will be called once message from remote comes.
   * @param {String} [JSONPatch_sequences] message with Array of JSONPatches that were send by remote.
   * @return {[type]} [description]
   */
  PalindromNetworkChannel.prototype.onReceive = function(/*String_with_JSONPatch_sequences*/) {};
  PalindromNetworkChannel.prototype.onSend = function() {};
  PalindromNetworkChannel.prototype.onStateChange = function() {};
  PalindromNetworkChannel.prototype.upgrade = function(msg) {};

  function closeWsIfNeeded(network) {
    if (network._ws) {
      network._ws.onclose = function() {};
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
  PalindromNetworkChannel.prototype.webSocketUpgrade = function(onSocketOpenCallback) {
    var that = this;

    this.wsUrl = toWebSocketURL(this.remoteUrl.href);
    var upgradeURL = this.wsUrl;

    closeWsIfNeeded(that);
    that._ws = new WebSocket(upgradeURL);
    that._ws.onopen = function(event) {
      that.onStateChange(that._ws.readyState, upgradeURL);
      onSocketOpenCallback && onSocketOpenCallback(event);
    };
    that._ws.onmessage = function(event) {
      that.onReceive(JSON.parse(event.data), that._ws.url, 'WS');
    };
    that._ws.onerror = function(event) {
      that.onStateChange(that._ws.readyState, upgradeURL, event.data);

      if (!that.useWebSocket) {
        return;
      }

      var m = {
        statusText: 'WebSocket connection could not be made.',
        readyState: that._ws.readyState,
        url: upgradeURL
      };

      that.onFatalError(m, upgradeURL, 'WS');
    };
    that._ws.onclose = function(event) {
      that.onStateChange(
        that._ws.readyState,
        upgradeURL,
        null,
        event.code,
        event.reason
      );

      var m = {
        statusText: 'WebSocket connection closed.',
        readyState: that._ws.readyState,
        url: upgradeURL,
        statusCode: event.code,
        reason: event.reason
      };

      if (event.reason) {
        that.onFatalError(m, upgradeURL, 'WS');
      } else {
        that.onConnectionError();
      }
    };
  };
  PalindromNetworkChannel.prototype.getPatchUsingHTTP = function(href) {
    var that = this;
    return this.xhr(
      href,
      'application/json-patch+json',
      null,
      function(res, method) {
        that.onReceive(res.data, href, method);
      },
      true
    );
  };
  PalindromNetworkChannel.prototype.changeState = function(href) {
    console.warn(
      "Palindrom: changeState was renamed to `getPatchUsingHTTP`, and they're both not recommended to use, please use `PalindromDOM.morphUrl` instead"
    );
    return this.getPatchUsingHTTP(href);
  };
  // TODO:(tomalec)[cleanup] hide from public API.
  PalindromNetworkChannel.prototype.setRemoteUrl = function(remoteUrl) {
    if (this.remoteUrlSet && this.remoteUrl && this.remoteUrl != remoteUrl) {
      throw new Error(
        'Session lost. Server replied with a different session ID that was already set. \nPossibly a server restart happened while you were working. \nPlease reload the page.\n\nPrevious session ID: ' +
          this.remoteUrl +
          '\nNew session ID: ' +
          remoteUrl
      );
    }
    this.remoteUrlSet = true;
    this.remoteUrl = new URL(remoteUrl, this.remoteUrl.href);
  };

  PalindromNetworkChannel.prototype.handleResponseHeader = function(res) {
    /* Axios always returns lowercase headers */
    var location = res.headers['x-location'] || res.headers['location'];
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
  PalindromNetworkChannel.prototype.xhr = function(
    url,
    accept,
    data,
    callback,
    setReferer
  ) {
    const method = data ? 'PATCH' : 'GET';
    const headers = {};
    const that = this;
    var requestPromise;

    if (data) {
      headers['Content-Type'] = 'application/json-patch+json';
    }
    if (accept) {
      headers['Accept'] = accept;
    }
    if (this.remoteUrl && setReferer) {
      headers['X-Referer'] = this.remoteUrl.pathname;
    }
    if (method === 'GET') {
      requestPromise = axios.get(url, {
        headers: headers
      });
    } else {
      requestPromise = axios.patch(url, data, {
        headers: headers
      });
    }
    requestPromise
      .then(function(res) {
        that.handleResponseHeader(res);
        callback && callback.call(that.palindrom, res, method);
      })
      .catch(function(res) {
        that.onFatalError(
          {
            statusCode: res.status,
            statusText: res.statusText,
            reason: res.data
          },
          url,
          method
        );
        console.log(res);
      });

    this.onSend(data, url, method);
  };

  /**
   * Non-queuing object that conforms JSON-Patch-Queue API
   * @param {Function} apply function to apply received patch
   */
  function NoQueue(apply) {
    this.apply = apply;
  }
  /** just forward message */
  NoQueue.prototype.send = function(msg) {
    return msg;
  };
  /** Apply given JSON Patch sequence immediately */
  NoQueue.prototype.receive = function(obj, sequence) {
    this.apply(obj, sequence);
  };
  NoQueue.prototype.reset = function(obj, newState) {
    var patch = [{ op: 'replace', path: '', value: newState }];
    this.apply(obj, patch);
  };

  function connectToRemote(palindrom, reconnectionFn) {
    // if we lose connection at this point, the connection we're trying to establish should trigger onError
    palindrom.heartbeat.stop();

    reconnectionFn(function bootstrap(json) {
      palindrom.reconnector.stopReconnecting();

      if (palindrom.debug) {
        palindrom.remoteObj = JSON.parse(JSON.stringify(json));
      }

      palindrom.queue.reset(palindrom.obj, json);

      palindrom.heartbeat.start();
    });
  }

  function makeInitialConnection(palindrom) {
    connectToRemote(
      palindrom,
      palindrom.network.establish.bind(palindrom.network)
    );
  }

  function makeReconnection(palindrom) {
    connectToRemote(palindrom, function(bootstrap) {
      palindrom.network.reestablish(palindrom.queue.pending, bootstrap);
    });
  }

  /**
   * Defines a connection to a remote PATCH server, serves an object that is persistent between browser and server.
   * @param {Object} [options] map of arguments. See README.md for description
   */
  function Palindrom(options) {
    if (typeof options !== 'object') {
      throw new Error('Palindrom constructor requires an object argument.');
    }
    if (!options.remoteUrl) {
      throw new Error('remoteUrl is required');
    }

    if (options.ignoreAdd) {
      throw new TypeError(
        'Palindrom: `ignoreAdd` is removed in favour of local state objects. see https://github.com/Palindrom/Palindrom/issues/136'
      );
    }
    Object.defineProperty(this, 'ignoreAdd', {
      set: function() {
        throw new TypeError(
          "Palindrom: Can't set `ignoreAdd`, it is removed in favour of local state objects. see https://github.com/Palindrom/Palindrom/issues/136"
        );
      }
    });

    this.debug = options.debug != undefined ? options.debug : true;

    var noop = function noOpFunction() {};

    this.isObserving = false;
    this.onLocalChange = options.onLocalChange || noop;
    this.onRemoteChange = options.onRemoteChange || noop;
    this.onStateReset = options.onStateReset || options.callback || noop;
    this.filterLocalChange = options.filterLocalChange || (operation => operation);
    if (options.callback) {
      console.warn(
        'Palindrom: options.callback is deprecated. Please use `onStateReset` instead'
      );
    }

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

    this.reconnector = new Reconnector(
      function() {
        makeReconnection(this);
      }.bind(this),
      this.onReconnectionCountdown,
      this.onReconnectionEnd
    );

    if (options.pingIntervalS) {
      const intervalMs = options.pingIntervalS * 1000;
      this.heartbeat = new Heartbeat(
        this.ping.bind(this),
        this.handleConnectionError.bind(this),
        intervalMs,
        intervalMs
      );
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
      this.onSocketOpened.bind(this),
      this.handleFatalError.bind(this), //onFatalError,
      this.onSocketStateChanged.bind(this) //onStateChange
    );

    Object.defineProperty(this, 'useWebSocket', {
      get: function() {
        return this.network.useWebSocket;
      },
      set: function(newValue) {
        this.network.useWebSocket = newValue;
      }
    });

    // choose queuing engine
    if (options.localVersionPath) {
      if (!options.remoteVersionPath) {
        // just versioning
        this.queue = new JSONPatchQueueSynchronous(
          options.localVersionPath,
          this.validateAndApplySequence.bind(this),
          options.purity
        );
      } else {
        // double versioning or OT
        this.queue = options.ot
          ? new JSONPatchOTAgent(
              JSONPatchOT.transform,
              [options.localVersionPath, options.remoteVersionPath],
              this.validateAndApplySequence.bind(this),
              options.purity
            )
          : new JSONPatchQueue(
              [options.localVersionPath, options.remoteVersionPath],
              this.validateAndApplySequence.bind(this),
              options.purity
            ); // full or noop OT
      }
    } else {
      // no queue - just api
      this.queue = new NoQueue(this.validateAndApplySequence.bind(this));
    }
    makeInitialConnection(this);
  }

  Palindrom.prototype.ping = function() {
    sendPatches(this, []); // sends empty message to server
  };
  Palindrom.prototype.prepareProxifiedObject = function(obj) {
    if (!obj) {
      obj = {};
    }
    /* wrap a new object with a proxy observer */
    this.jsonPatcherProxy = new JSONPatcherProxy(obj);

    const proxifiedObj = this.jsonPatcherProxy.observe(
      false,
      operation => {
        const filtered = this.filterLocalChange(operation);
        // totally ignore falsy (didn't pass the filter) JSON Patch operations
        filtered && this.handleLocalChange(filtered)
      }
    );

    /* make it read-only and expose it as `obj` */
    Object.defineProperty(this, 'obj', {
      get: function() {
        return proxifiedObj;
      },
      set: function() {
        throw new Error('palindrom.obj is readonly');
      },
      /* so that we can redefine it */
      configurable: true
    });
    /* JSONPatcherProxy default state is observing */
    this.isObserving = true;
  };

  Palindrom.prototype.observe = function() {
    this.jsonPatcherProxy && this.jsonPatcherProxy.resume();
    this.isObserving = true;
  };
  Palindrom.prototype.unobserve = function() {
    this.jsonPatcherProxy && this.jsonPatcherProxy.pause();
    this.isObserving = false;
  };

  function sendPatches(palindrom, patches) {
    var txt = JSON.stringify(patches);
    palindrom.unobserve();
    palindrom.heartbeat.notifySend();
    palindrom.network.send(txt);
    palindrom.observe();
  }

  Palindrom.prototype.handleLocalChange = function(operation) {
    const patches = [operation];
    if (this.debug) {
      this.validateSequence(this.remoteObj, patches);
    }
    sendPatches(this, this.queue.send(patches));
    this.onLocalChange(patches);
  };

  Palindrom.prototype.validateAndApplySequence = function(tree, sequence) {
    // we don't want this changes to generate patches since they originate from server, not client
    try {
      this.unobserve();
      var results = applyPatch(tree, sequence, this.debug);
      // notifications have to happen only where observe has been re-enabled
      // otherwise some listener might produce changes that would go unnoticed
      this.observe();
      // the state was fully replaced
      if (results.newDocument !== tree) {
        // object was reset, proxify it again
        this.prepareProxifiedObject(results.newDocument);

        //notify people about it
        this.onStateReset(this.obj);
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
  };

  Palindrom.prototype.validateSequence = function(tree, sequence) {
    var error = validate(sequence, tree);
    if (error) {
      this.onOutgoingPatchValidationError(error);
    }
  };

  /**
   * Handle an error which is probably caused by random disconnection
   */
  Palindrom.prototype.handleConnectionError = function() {
    this.heartbeat.stop();
    this.reconnector.triggerReconnection();
  };

  /**
   * Handle an error which probably won't go away on itself (basically forward upstream)
   */
  Palindrom.prototype.handleFatalError = function(data, url, method) {
    this.heartbeat.stop();
    this.reconnector.stopReconnecting();
    if (this.onConnectionError) {
      this.onConnectionError(data, url, method);
    }
  };

  Palindrom.prototype.reconnectNow = function() {
    this.reconnector.reconnectNow();
  };

  Palindrom.prototype.showWarning = function(heading, description) {
    if (this.debug && global.console && console.warn) {
      if (description) {
        heading += ' (' + description + ')';
      }
      console.warn('Palindrom warning: ' + heading);
    }
  };

  Palindrom.prototype.handleRemoteChange = function(data, url, method) {
    this.heartbeat.notifyReceive();
    var patches = data || []; // fault tolerance - empty response string should be treated as empty patch array

    if (patches.length === 0) {
      // ping message
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
    if (
      this.queue.pending &&
      this.queue.pending.length &&
      this.queue.pending.length > this.retransmissionThreshold
    ) {
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

if (typeof module !== 'undefined') {
  module.exports = Palindrom;
  module.exports.default = Palindrom;
  module.exports.__esModule = true;
}
