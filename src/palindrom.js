/*! Palindrom 
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */

/* this variable is bumped automatically when you call npm version */
const palindromVersion = '3.1.0';

const { applyPatch, validate } = require('fast-json-patch');
const JSONPatcherProxy = require('jsonpatcherproxy');
const JSONPatchQueueSynchronous = require('json-patch-queue')
  .JSONPatchQueueSynchronous;
const JSONPatchQueue = require('json-patch-queue').JSONPatchQueue;
const JSONPatchOT = require('json-patch-ot');
const JSONPatchOTAgent = require('json-patch-ot-agent');
const URL = require('./URL');
const axios = require('axios');
const {
  PalindromError,
  PalindromConnectionError
} = require('./palindrom-errors');

/* We are going to hand `websocket` lib as an external to webpack
  (see: https://webpack.js.org/configuration/externals/), 
  this will make `w3cwebsocket` property `undefined`, 
  and this will lead Palindrom to use Browser's WebSocket when it is used 
  from the bundle. And use `websocket` lib in Node environment */
const NodeWebSocket = require('websocket').w3cwebsocket;

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

const Palindrom = (() => {
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

  /**
   * Guarantees some communication to server and monitors responses for timeouts.
   * @param sendHeartbeatAction will be called to send a heartbeat
   * @param onError will be called if no response will arrive after `timeoutMs` since a message has been sent
   * @param intervalMs if no request will be sent in that time, a heartbeat will be issued
   * @param timeoutMs should a response fail to arrive in this time, `onError` will be called
   * @constructor
   */
  function Heartbeat(sendHeartbeatAction, onError, intervalMs, timeoutMs) {
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
      var scheduledError = setTimeout(() => {
        scheduledError = null;
        onError(
          new PalindromConnectionError(
            "Timeout has passed and response hasn't arrived",
            'Client',
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

  class PalindromNetworkChannel {
    constructor(
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
    }
    get useWebSocket() {
      return this._useWebSocket;
    }
    set useWebSocket(newValue) {
      this._useWebSocket = newValue;

      if (newValue == false) {
        if (this._ws) {
          this._ws.onclose = () => {
            //overwrites the previous onclose
            this._ws = null;
          };
          this._ws.close();
        }
        // define wsUrl if needed
      } else if (!this.wsUrl) {
        this.wsUrl = toWebSocketURL(this.remoteUrl.href);
      }
      return this.useWebSocket;
    }

    establish(bootstrap) {
      establish(this, this.remoteUrl.href, null, bootstrap);
    }

    reestablish(pending, bootstrap) {
      establish(
        this,
        `${this.remoteUrl.href}/reconnect`,
        JSON.stringify(pending),
        bootstrap
      );
    }

    /**
     * Send any text message by currently established channel
     * @TODO: handle readyState 2-CLOSING & 3-CLOSED (tomalec)
     * @param  {String} msg message to be sent
     * @return {PalindromNetworkChannel}     self
     */
    send(msg) {
      // send message only if there is a working ws connection
      if (this.useWebSocket && this._ws && this._ws.readyState === 1) {
        this._ws.send(msg);
        this.onSend(msg, this._ws.url, 'WS');
      } else {
        const url = this.remoteUrl.href;
        this.xhr(url, 'application/json-patch+json', msg, (res, method) => {
          this.onReceive(res.data, url, method);
        });
      }
      return this;
    }

    /**
     * Callback function that will be called once message from remote comes.
     * @param {String} [JSONPatch_sequences] message with Array of JSONPatches that were send by remote.
     * @return {[type]} [description]
     */
    onReceive(/*String_with_JSONPatch_sequences*/) {}

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

      closeWsIfNeeded(this);

      this._ws = new WebSocket(upgradeURL);
      this._ws.onopen = event => {
        this.onStateChange(this._ws.readyState, upgradeURL);
        onSocketOpenCallback && onSocketOpenCallback(event);
      };
      this._ws.onmessage = event => {
        try {
          var parsedMessage = JSON.parse(event.data);
        } catch (e) {
          this.onFatalError(
            new PalindromConnectionError(
              event.data,
              'Server',
              this._ws.url,
              'WS'
            )
          );
          return;
        }
        this.onReceive(parsedMessage, this._ws.url, 'WS');        
      };
      this._ws.onerror = event => {
        this.onStateChange(this._ws.readyState, upgradeURL, event.data);

        if (!this.useWebSocket) {
          return;
        }

        const message = [
          `WebSocket connection could not be made`,
          ` readyState: ${this._ws.readyState}`
        ].join('\n');

        this.onFatalError(
          new PalindromConnectionError(message, 'Client', upgradeURL, 'WS')
        );
      };
      this._ws.onclose = event => {
        this.onStateChange(
          this._ws.readyState,
          upgradeURL,
          null,
          event.code,
          event.reason
        );

        if (event.reason) {
          const message = [
            'WebSocket connection closed unexpectedly.',
            ` reason: ${event.reason}`,
            ` readyState: ${this._ws.readyState}`,
            ` stateCode: ${event.code}`
          ].join('\n');

          this.onFatalError(
            new PalindromConnectionError(message, 'Server', upgradeURL, 'WS')
          );
        } else if (!event.wasClean) {
          const message = [
            'WebSocket connection closed unexpectedly.',
            ` reason: ${event.reason}`,
            ` readyState: ${this._ws.readyState}`,
            ` stateCode: ${event.code}`
          ].join('\n');

          this.onConnectionError(
            new PalindromConnectionError(message, 'Server', upgradeURL, 'WS')
          );
        }
      };
    }

    getPatchUsingHTTP(href) {
      return this.xhr(
        href,
        'application/json-patch+json',
        null,
        (res, method) => {
          this.onReceive(res.data, href, method);
        },
        true
      );
    }

    changeState(href) {
      console.warn(
        "Palindrom: changeState was renamed to `getPatchUsingHTTP`, and they're both not recommended to use, please use `PalindromDOM.morphUrl` instead"
      );
      return this.getPatchUsingHTTP(href);
    }

    // TODO:(tomalec)[cleanup] hide from public API.
    setRemoteUrl(remoteUrl) {
      if (this.remoteUrlSet && this.remoteUrl && this.remoteUrl != remoteUrl) {

        const message = [
          'Session lost.',
          ' Server replied with a different session ID than the already set one.',
          ' Possibly a server restart happened while you were working.',
          ' Please reload the page.'
          ` Previous session ID: ${this.remoteUrl}`
          ` New session ID: ${remoteUrl}`
        ].join('\n');

        throw new PalindromError(message);
      }
      this.remoteUrlSet = true;
      this.remoteUrl = new URL(remoteUrl, this.remoteUrl.href);
    }

    handleResponseHeader(res) {
      /* Axios always returns lowercase headers */
      const location =
        res.headers && (res.headers['x-location'] || res.headers['location']);
      if (location) {
        this.setRemoteUrl(location);
      }
    }

    /**
     * Internal method to perform XMLHttpRequest
     * @param url (Optional) URL to send the request. If empty string, undefined or null given - the request will be sent to window location
     * @param accept (Optional) HTTP accept header
     * @param data (Optional) Data payload
     * @param [callback(response)] callback to be called in context of palindrom with response as argument
     * @returns {XMLHttpRequest} performed XHR
     */
    xhr(url, accept, data, callback, setReferer) {
      const method = data ? 'PATCH' : 'GET';
      const headers = {};
      let requestPromise;

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
          headers
        });
      } else {
        requestPromise = axios.patch(url, data, {
          headers
        });
      }
      requestPromise
        .then(res => {
          this.handleResponseHeader(res);
          callback && callback.call(this.palindrom, res, method);
        })
        .catch(error => {
          const res = error.response;

          if (res) {
            var statusCode = res.status;
            var statusText = res.statusText || res.data;
            var reason = res.data;
          } else {
            // no sufficient error information, we need to create on our own
            var statusCode = -1;
            var statusText = `An unknown network error has occurred. Raw message: ${
              error.message
            }`;
            var reason = 'Maybe you lost connection with the server';
            // log it for verbosity
            console.error(error);
          }

          const message = [
            statusText,
            ` statusCode: ${statusCode}`,            
            ` reason: ${reason}`,
            ` url: ${res.url}`
          ].join('\n');

          this.onFatalError(
            new PalindromConnectionError(message, 'Client', res.config.url, method)
          );
        });

      this.onSend(data, url, method);
    }
  }
  // TODO: auto-configure here #38 (tomalec)
  function establish(network, url, body, bootstrap) {
    return network.xhr(url, 'application/json', body, res => {
      bootstrap(res.data);
      if (network.useWebSocket) {
        network.webSocketUpgrade(network.onSocketOpened);
      }
    });
  }

  function closeWsIfNeeded(network) {
    if (network._ws) {
      network._ws.onclose = () => {};
      network._ws.close();
      network._ws = null;
    }
  }

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

  function connectToRemote(palindrom, reconnectionFn) {
    // if we lose connection at this point, the connection we're trying to establish should trigger onError
    palindrom.heartbeat.stop();

    reconnectionFn(function bootstrap(json) {
      palindrom.reconnector.stopReconnecting();

      if (palindrom.debug) {
        palindrom.remoteObj = JSON.parse(JSON.stringify(json));
      }

      palindrom.queue.reset(json);

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
    connectToRemote(palindrom, bootstrap => {
      palindrom.network.reestablish(palindrom.queue.pending, bootstrap);
    });
  }

  /**
   * Defines a connection to a remote PATCH server, serves an object that is persistent between browser and server.
   * @param {Object} [options] map of arguments. See README.md for description
   */
  class Palindrom {
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

      if (options.ignoreAdd) {
        throw new TypeError(
          'Palindrom: `ignoreAdd` is removed in favour of local state objects. see https://github.com/Palindrom/Palindrom/issues/136'
        );
      }

      this.debug = options.debug != undefined ? options.debug : true;

      const noop = function noOpFunction() {};

      this.isObserving = false;
      this.onLocalChange = options.onLocalChange || noop;
      this.onRemoteChange = options.onRemoteChange || noop;
      this.onStateReset = options.onStateReset || options.callback || noop;
      this.filterLocalChange =
        options.filterLocalChange || (operation => operation);

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
      this.onError = options.onError || noop;

      this.reconnector = new Reconnector(
        () => makeReconnection(this),
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
          this.queue = options.ot
            ? new JSONPatchOTAgent(
                this.obj,
                JSONPatchOT.transform,
                [options.localVersionPath, options.remoteVersionPath],
                this.validateAndApplySequence.bind(this),
                options.purity
              )
            : new JSONPatchQueue(
                this.obj,
                [options.localVersionPath, options.remoteVersionPath],
                this.validateAndApplySequence.bind(this),
                options.purity
              ); // full or noop OT
        }
      } else {
        // no queue - just api
        this.queue = new NoQueue(
          this.obj,
          this.validateAndApplySequence.bind(this)
        );
      }
      makeInitialConnection(this);
    }
    set ignoreAdd(newValue) {
      throw new TypeError(
        "Palindrom: Can't set `ignoreAdd`, it is removed in favour of local state objects. see https://github.com/Palindrom/Palindrom/issues/136"
      );
    }
    get useWebSocket() {
      return this.network.useWebSocket;
    }
    set useWebSocket(newValue) {
      this.network.useWebSocket = newValue;
    }
    ping() {
      sendPatches(this, []); // sends empty message to server
    }

    prepareProxifiedObject(obj) {
      if (!obj) {
        obj = {};
      }
      /* wrap a new object with a proxy observer */
      this.jsonPatcherProxy = new JSONPatcherProxy(obj);

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
        findRangeErrors(operation.value, this.onOutgoingPatchValidationError);

      const patches = [operation];
      if (this.debug) {
        this.validateSequence(this.remoteObj, patches);
      }
      sendPatches(this, this.queue.send(patches));
      this.onLocalChange(patches);
    }

    validateAndApplySequence(tree, sequence) {
      // we don't want this changes to generate patches since they originate from server, not client
      try {
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

          //notify people about it
          try {
            this.onStateReset(this.obj);
          } catch (error) {
            // to prevent the promise's catch from swallowing errors inside onStateReset
            this.onError(
              new PalindromError(
                `Palindrom: Error inside onStateReset callback: ${
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

    /**
     * Handle an error which is probably caused by random disconnection
     */
    handleConnectionError() {
      this.heartbeat.stop();
      this.reconnector.triggerReconnection();
    }

    /**
     * Handle an error which probably won't go away on itself (basically forward upstream)
     * @param {PalindromConnectionError} palindromError
     */
    handleFatalError(palindromError) {
      this.heartbeat.stop();
      this.reconnector.stopReconnecting();
      if (this.onConnectionError) {
        this.onConnectionError(palindromError);
      }
    }

    reconnectNow() {
      this.reconnector.reconnectNow();
    }

    showWarning(heading, description) {
      if (this.debug && global.console && console.warn) {
        if (description) {
          heading += ` (${description})`;
        }
        console.warn(`Palindrom warning: ${heading}`);
      }
    }

    handleRemoteChange(data, url, method) {
      this.heartbeat.notifyReceive();
      const patches = data || []; // fault tolerance - empty response string should be treated as empty patch array

      validateNumericsRangesInPatch(
        patches,
        this.onIncomingPatchValidationError,
        this.OTPatchIndexOffset
      );

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
      this.queue.receive(patches);
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
      findRangeErrors(patch[i].value, errorHandler);
    }
  }

  /**
   * Traverses/checks value looking for out-of-range numbers, throws a RangeError if it finds any
   * @param {*} val value
   * @param {Function} errorHandler
   */
  function findRangeErrors(val, errorHandler) {
    const type = typeof val;
    if (type == 'object') {
      for (const key in val) {
        if (val.hasOwnProperty(key)) {
          findRangeErrors(val[key], errorHandler);
        }
      }
    } else if (
      type === 'number' &&
      (val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER)
    ) {
      errorHandler(
        new RangeError(
          `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${val}`
        )
      );
    }
  }

  function sendPatches(palindrom, patches) {
    const txt = JSON.stringify(patches);
    palindrom.unobserve();
    palindrom.heartbeat.notifySend();
    palindrom.network.send(txt);
    palindrom.observe();
  }

  /* backward compatibility */
  global.Puppet = Palindrom;

  return Palindrom;
})();

module.exports = Palindrom;
module.exports.default = Palindrom;
module.exports.__esModule = true;
