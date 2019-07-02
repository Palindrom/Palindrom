/*! Palindrom, version: 6.1.0 */
module.exports =
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
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("websocket");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("node-fetch");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("fast-json-patch");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("json-patch-queue");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*!
 * https://github.com/Palindrom/JSONPatcherProxy
 * (c) 2017 Starcounter 
 * MIT license
 * 
 * Vocabulary used in this file:
 *  * root - root object that is deeply observed by JSONPatcherProxy
 *  * tree - any subtree within the root or the root
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
   * @param {Object} tree the object you need to find its path
   */
  function getPathToTree(instance, tree) {
    const pathComponents = [];
    let parenthood = instance._parenthoodMap.get(tree);
    while (parenthood && parenthood.key) {
      // because we're walking up-tree, we need to use the array as a stack
      pathComponents.unshift(parenthood.key);
      parenthood = instance._parenthoodMap.get(parenthood.parent);
    }
    if (pathComponents.length) {
      const path = pathComponents.join('/');
      return '/' + path;
    }
    return '';
  }
  /**
   * A callback to be used as the proxy set trap callback.
   * It updates parenthood map if needed, proxifies nested newly-added objects, calls default callback with the changes occurred.
   * @param {JSONPatcherProxy} instance JSONPatcherProxy instance
   * @param {Proxy} proxifiedTree the proxy of the affected object
   * @param {Object} tree the affected object
   * @param {String} key the effect property's name
   * @param {Any} newValue the value being set
   */
  function trapForSet(instance, proxifiedTree, tree, key, newValue) {
    const pathToKey = getPathToTree(instance, tree) + '/' + escapePathComponent(key);
    const subtreeMetadata = instance._treeMetadataMap.get(newValue);

    if (instance._treeMetadataMap.has(newValue)) {
      instance._parenthoodMap.set(subtreeMetadata.originalObject, { parent: tree, key });
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
    /*
    Why do we need to check instance._isProxifyingTreeNow?

    We need to make sure we mark revocables as inherited ONLY when we're observing,
    because throughout the first proxification, a sub-object is proxified and then assigned to 
    its parent object. This assignment of a pre-proxified object can fool us into thinking
    that it's a proxified object moved around, while in fact it's the first assignment ever. 

    Checking _isProxifyingTreeNow ensures this is not happening in the first proxification, 
    but in fact is is a proxified object moved around the tree
    */
    if (subtreeMetadata && !instance._isProxifyingTreeNow) {
      subtreeMetadata.inherited = true;
    }

    // if the new value is an object, make sure to watch it
    if (
      newValue &&
      typeof newValue == 'object' &&
      !instance._treeMetadataMap.has(newValue)
    ) {
      instance._parenthoodMap.set(newValue, { parent: tree, key });
      newValue = instance._proxifyTreeRecursively(tree, newValue, key);
    }
    // let's start with this operation, and may or may not update it later
    const operation = {
      op: 'remove',
      path: pathToKey
    };
    const isTreeAnArray = Array.isArray(tree);
    if (typeof newValue == 'undefined') {
      // applying De Morgan's laws would be a tad faster, but less readable
      if (!isTreeAnArray && !tree.hasOwnProperty(key)) {
        // `undefined` is being set to an already undefined value, keep silent
        return Reflect.set(tree, key, newValue, proxifiedTree);
      } else {
        // when array element is set to `undefined`, should generate replace to `null`
        if (isTreeAnArray) {
          // undefined array elements are JSON.stringified to `null`
          (operation.op = 'replace'), (operation.value = null);
        }
        const oldSubtreeMetadata = instance._treeMetadataMap.get(tree[key]);
        if (oldSubtreeMetadata) {
          //TODO there is no test for this!
          instance._parenthoodMap.delete(tree[key]);
          instance._disableTrapsForTreeMetadata(oldSubtreeMetadata);
          instance._treeMetadataMap.delete(oldSubtreeMetadata);
        }
      }
    } else {
      if (isTreeAnArray && !Number.isInteger(+key.toString())) {
        /* array props (as opposed to indices) don't emit any patches, to avoid needless `length` patches */
        if(key != 'length') {
          console.warn('JSONPatcherProxy noticed a non-integer prop was set for an array. This will not emit a patch');
        }
        return Reflect.set(tree, key, newValue, proxifiedTree);
      }
      operation.op = 'add';
      if (tree.hasOwnProperty(key)) {
        if (typeof tree[key] !== 'undefined' || isTreeAnArray) {
          operation.op = 'replace'; // setting `undefined` array elements is a `replace` op
        }
      }
      operation.value = newValue;
    }
    const reflectionResult = Reflect.set(tree, key, newValue, proxifiedTree);
    instance._defaultCallback(operation);
    return reflectionResult;
  }
  /**
   * A callback to be used as the proxy delete trap callback.
   * It updates parenthood map if needed, calls default callbacks with the changes occurred.
   * @param {JSONPatcherProxy} instance JSONPatcherProxy instance
   * @param {Object} tree the effected object
   * @param {String} key the effected property's name
   */
  function trapForDeleteProperty(instance, tree, key) {
    if (typeof tree[key] !== 'undefined') {
      const pathToKey = getPathToTree(instance, tree) + '/' + escapePathComponent(key);
      const subtreeMetadata = instance._treeMetadataMap.get(tree[key]);

      if (subtreeMetadata) {
        if (subtreeMetadata.inherited) {
          /*
            this is an inherited proxy (an already proxified object that was moved around), 
            we shouldn't revoke it, because even though it was removed from path1, it is still used in path2.
            And we know that because we mark moved proxies with `inherited` flag when we move them

            it is a good idea to remove this flag if we come across it here, in trapForDeleteProperty.
            We DO want to revoke the proxy if it was removed again.
          */
          subtreeMetadata.inherited = false;
        } else {
          instance._parenthoodMap.delete(subtreeMetadata.originalObject);
          instance._disableTrapsForTreeMetadata(subtreeMetadata);
          instance._treeMetadataMap.delete(tree[key]);
        }
      }
      const reflectionResult = Reflect.deleteProperty(tree, key);

      instance._defaultCallback({
        op: 'remove',
        path: pathToKey
      });

      return reflectionResult;
    }
  }
  /**
    * Creates an instance of JSONPatcherProxy around your object of interest `root`. 
    * @param {Object|Array} root - the object you want to wrap
    * @param {Boolean} [showDetachedWarning = true] - whether to log a warning when a detached sub-object is modified @see {@link https://github.com/Palindrom/JSONPatcherProxy#detached-objects} 
    * @returns {JSONPatcherProxy}
    * @constructor
    */
  function JSONPatcherProxy(root, showDetachedWarning) {
    this._isProxifyingTreeNow = false;
    this._isObserving = false;
    this._treeMetadataMap = new Map();
    this._parenthoodMap = new Map();
    // default to true
    if (typeof showDetachedWarning !== 'boolean') {
      showDetachedWarning = true;
    }

    this._showDetachedWarning = showDetachedWarning;
    this._originalRoot = root;
    this._cachedProxy = null;
    this._isRecording = false;
    this._userCallback;
    this._defaultCallback;
    this._patches;
  }

  JSONPatcherProxy.prototype._generateProxyAtKey = function(parent, tree, key) {
    if (!tree) {
      return tree;
    }
    const handler = {
      set: (...args) => trapForSet(this, treeMetadata.proxy, ...args),
      deleteProperty: (...args) => trapForDeleteProperty(this, ...args)
    };
    const treeMetadata = Proxy.revocable(tree, handler);
    // cache the object that contains traps to disable them later.
    treeMetadata.handler = handler;
    treeMetadata.originalObject = tree;

    /* keeping track of the object's parent and the key within the parent */
    this._parenthoodMap.set(tree, { parent, key });

    /* keeping track of all the proxies to be able to revoke them later */
    this._treeMetadataMap.set(treeMetadata.proxy, treeMetadata);
    return treeMetadata.proxy;
  };
  // grab tree's leaves one by one, encapsulate them into a proxy and return
  JSONPatcherProxy.prototype._proxifyTreeRecursively = function(parent, tree, key) {
    for (let key in tree) {
      if (tree.hasOwnProperty(key)) {
        if (tree[key] instanceof Object) {
          tree[key] = this._proxifyTreeRecursively(
            tree,
            tree[key],
            escapePathComponent(key)
          );
        }
      }
    }
    return this._generateProxyAtKey(parent, tree, key);
  };
  // this function is for aesthetic purposes
  JSONPatcherProxy.prototype._proxifyRoot = function(root) {
    /*
    while proxifying object tree,
    the proxifying operation itself is being
    recorded, which in an unwanted behavior,
    that's why we disable recording through this
    initial process;
    */
    this.pause();
    this._isProxifyingTreeNow = true;
    const proxifiedRoot = this._proxifyTreeRecursively(
      undefined,
      root,
      ''
    );
    /* OK you can record now */
    this._isProxifyingTreeNow = false;
    this.resume();
    return proxifiedRoot;
  };
  /**
   * Turns a proxified object into a forward-proxy object; doesn't emit any patches anymore, like a normal object
   * @param {Object} treeMetadata
   */
  JSONPatcherProxy.prototype._disableTrapsForTreeMetadata = function(treeMetadata) {
    if (this._showDetachedWarning) {
      const message =
        "You're accessing an object that is detached from the observedObject tree, see https://github.com/Palindrom/JSONPatcherProxy#detached-objects";

      treeMetadata.handler.set = (
        parent,
        key,
        newValue
      ) => {
        console.warn(message);
        return Reflect.set(parent, key, newValue);
      };
      treeMetadata.handler.set = (
        parent,
        key,
        newValue
      ) => {
        console.warn(message);
        return Reflect.set(parent, key, newValue);
      };
      treeMetadata.handler.deleteProperty = (
        parent,
        key
      ) => {
        return Reflect.deleteProperty(parent, key);
      };
    } else {
      delete treeMetadata.handler.set;
      delete treeMetadata.handler.get;
      delete treeMetadata.handler.deleteProperty;
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
    this._isRecording = record;
    this._userCallback = callback;
    /*
    I moved it here to remove it from `unobserve`,
    this will also make the constructor faster, why initiate
    the array before they decide to actually observe with recording?
    They might need to use only a callback.
    */
    if (record) this._patches = [];
    this._cachedProxy = this._proxifyRoot(this._originalRoot);
    return this._cachedProxy;
  };
  /**
   * If the observed is set to record, it will synchronously return all the patches and empties patches array.
   */
  JSONPatcherProxy.prototype.generate = function() {
    if (!this._isRecording) {
      throw new Error('You should set record to true to get patches later');
    }
    return this._patches.splice(0, this._patches.length);
  };
  /**
   * Revokes all proxies, rendering the observed object useless and good for garbage collection @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/revocable}
   */
  JSONPatcherProxy.prototype.revoke = function() {
    this._treeMetadataMap.forEach(el => {
      el.revoke();
    });
  };
  /**
   * Disables all proxies' traps, turning the observed object into a forward-proxy object, like a normal object that you can modify silently.
   */
  JSONPatcherProxy.prototype.disableTraps = function() {
    this._treeMetadataMap.forEach(this._disableTrapsForTreeMetadata, this);
  };
  /**
   * Restores callback back to the original one provided to `observe`.
   */
  JSONPatcherProxy.prototype.resume = function() {
    this._defaultCallback = operation => {
      this._isRecording && this._patches.push(operation);
      this._userCallback && this._userCallback(operation);
    };
    this._isObserving = true;
  };
  /**
   * Replaces callback with a noop function.
   */
  JSONPatcherProxy.prototype.pause = function() {
    this._defaultCallback = () => {};
    this._isObserving = false;
  }
  return JSONPatcherProxy;
})();

if (true) {
  module.exports = JSONPatcherProxy;
  module.exports.default = JSONPatcherProxy;
}


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("json-patch-ot");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("json-patch-ot-agent");

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: external "url"
var external_url_ = __webpack_require__(2);

// CONCATENATED MODULE: ./src/URLShim.js
/*! Palindrom
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */

/* URL DOM API shim */


function URL(path, baseURL) {
    var urlObj;
    if (baseURL) {
        urlObj = Object(external_url_["resolve"])(baseURL, path);
        urlObj = Object(external_url_["parse"])(urlObj);
    } else {
        // it's absolute
        urlObj = Object(external_url_["parse"])(path);
    }
    /* copy href, protocol, pathname etc.. */
    Object.assign(this, urlObj);
}

// CONCATENATED MODULE: ./src/palindrom-errors.js
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
// EXTERNAL MODULE: external "websocket"
var external_websocket_ = __webpack_require__(0);
var external_websocket_default = /*#__PURE__*/__webpack_require__.n(external_websocket_);

// EXTERNAL MODULE: external "node-fetch"
var external_node_fetch_ = __webpack_require__(1);
var external_node_fetch_default = /*#__PURE__*/__webpack_require__.n(external_node_fetch_);

// CONCATENATED MODULE: ./src/palindrom-network-channel.js


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

class palindrom_network_channel_PalindromNetworkChannel {
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

    /**
     * Fetches initial state from server using GET request,
     * or fetches new state after reconnection using PATCH request if any `reconnectionPendingData` given.
     * @param  {Array<JSONPatch>}  [reconnectionPendingData=null] Patches already sent to the remote, but not necesarily acknowledged
     * @return {Promise<Object>}                           Promise for new state of the synced object.
     */
    async _establish(reconnectionPendingData = null) {
        const data = reconnectionPendingData ?
            await this._fetch('PATCH', this.remoteUrl.href + '/reconnect', 'application/json', JSON.stringify(reconnectionPendingData)) :
            await this._fetch('GET', this.remoteUrl.href, 'application/json', null);

        if (this.useWebSocket) {
            this.webSocketUpgrade(this.onSocketOpened);
        }
        return data;
    }

    /**
     * Send any text message by currently established channel
     * @TODO: handle readyState 2-CLOSING & 3-CLOSED (tomalec)
     * @param  {JSONPatch} patch message to be sent
     * @return {PalindromNetworkChannel}     self
     */
    async send(patch) {
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
            this.onReceive(data, url, method);
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

        const UsedSocket = external_websocket_default.a.w3cwebsocket || external_websocket_default.a;
        this._ws = new UsedSocket(upgradeURL);
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
                        SERVER,
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
                'WebSocket connection could not be made',
                'readyState: ' + this._ws.readyState
            ].join('\n');

            this.onFatalError(
                new PalindromConnectionError(message, CLIENT, upgradeURL, 'WS')
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
                this.onFatalError(
                    new PalindromConnectionError(
                        message,
                        SERVER,
                        upgradeURL,
                        'WS'
                    )
                );
            } else if (!event.wasClean) {
                this.onConnectionError(
                    new PalindromConnectionError(
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
        this.onReceive(data, href, method);
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

            throw new PalindromError(message);
        }
        this.remoteUrlSet = true;
        this.remoteUrl = new URL(remoteUrl, this.remoteUrl.href);
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

        this.onFatalError(
            new PalindromConnectionError(message, CLIENT, url, method)
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

        let isomorphicFetch = typeof global !== 'undefined' && global.fetch || external_node_fetch_default.a;

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

// EXTERNAL MODULE: external "fast-json-patch"
var external_fast_json_patch_ = __webpack_require__(3);

// EXTERNAL MODULE: ../JSONPatcherProxy/src/jsonpatcherproxy.js
var jsonpatcherproxy = __webpack_require__(5);
var jsonpatcherproxy_default = /*#__PURE__*/__webpack_require__.n(jsonpatcherproxy);

// EXTERNAL MODULE: external "json-patch-queue"
var external_json_patch_queue_ = __webpack_require__(4);

// EXTERNAL MODULE: external "json-patch-ot"
var external_json_patch_ot_ = __webpack_require__(6);
var external_json_patch_ot_default = /*#__PURE__*/__webpack_require__.n(external_json_patch_ot_);

// EXTERNAL MODULE: external "json-patch-ot-agent"
var external_json_patch_ot_agent_ = __webpack_require__(7);
var external_json_patch_ot_agent_default = /*#__PURE__*/__webpack_require__.n(external_json_patch_ot_agent_);

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

// CONCATENATED MODULE: ./src/heartbeat.js

const heartbeat_CLIENT = 'Client';
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
                new PalindromConnectionError(
                    "Timeout has passed and response hasn't arrived",
                    heartbeat_CLIENT,
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
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return palindrom_Palindrom; });
/*! Palindrom
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */












/* this variable is bumped automatically when you call npm version */
const palindromVersion = '6.1.0';

if (typeof palindrom_global === 'undefined') {
    if (typeof window !== 'undefined') {
        /* incase neither window nor global existed, e.g React Native */
        var palindrom_global = window;
    } else {
        var palindrom_global = {};
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

        this.network = new palindrom_network_channel_PalindromNetworkChannel(
            this, // palindrom instance TODO: to be removed, used for error reporting
            options.remoteUrl,
            options.useWebSocket || false, // useWebSocket
            this.handleRemoteChange.bind(this), //onReceive
            this.onPatchSent.bind(this), //onSend,
            this.handleConnectionError.bind(this),
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
                this.queue = new external_json_patch_queue_["JSONPatchQueueSynchronous"](
                    this.obj,
                    options.localVersionPath,
                    this.validateAndApplySequence.bind(this),
                    options.purity
                );
            } else {
                this.OTPatchIndexOffset = 2;
                // double versioning or OT
                if (options.ot) {
                    this.queue = new external_json_patch_ot_agent_default.a(
                        this.obj,
                        external_json_patch_ot_default.a.transform,
                        [options.localVersionPath, options.remoteVersionPath],
                        this.validateAndApplySequence.bind(this),
                        options.purity
                    );
                } else {
                    this.queue = new external_json_patch_queue_["JSONPatchQueue"](
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
        this.heartbeat.stop();
        const json = await this.network._establish(reconnectionPendingData);
        this.reconnector.stopReconnecting();

        if (this.debug) {
            this.remoteObj = JSON.parse(JSON.stringify(json));
        }

        this.queue.reset(json);
        this.heartbeat.start();
    }
    get useWebSocket() {
        return this.network.useWebSocket;
    }
    set useWebSocket(newValue) {
        this.network.useWebSocket = newValue;
    }

    ping() {
        this._sendPatch([]); // sends empty message to server
    }

    _sendPatch(patch) {
        this.unobserve();
        this.heartbeat.notifySend();
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
            const results = Object(external_fast_json_patch_["applyPatch"])(tree, sequence, this.debug);
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
                       new PalindromError(
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
        const error = Object(external_fast_json_patch_["validate"])(sequence, tree);
        if (error) {
            this.onOutgoingPatchValidationError(error);
        }
    }

    /**
     * Handle an error which is probably caused by random disconnection
     * @param {PalindromConnectionError} palindromError
     */
    handleConnectionError(palindromError) {
        this.heartbeat.stop();
        this.reconnector.triggerReconnection();
        this.onConnectionError(palindromError);
    }

    /**
     * Handle an error which probably won't go away on itself (basically forward upstream)
     * @param {PalindromConnectionError} palindromError
     */
    handleFatalError(palindromError) {
        this.heartbeat.stop();
        this.reconnector.stopReconnecting();
        this.onConnectionError(palindromError);
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

        this.heartbeat.notifyReceive();
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


/***/ })
/******/ ])["default"];