/*! Palindrom
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */

import PalindromNetworkChannel from './palindrom-network-channel.js';
import { applyPatch, validate } from 'fast-json-patch/index.mjs';
import { JSONPatcherProxy } from 'jsonpatcherproxy';
import { JSONPatchQueue } from 'json-patch-queue';
import { JSONPatchOT } from 'json-patch-ot';
import { JSONPatchOTAgent } from 'json-patch-ot-agent';
import { PalindromError, PalindromConnectionError } from './palindrom-errors.js';
import Reconnector from './reconnector.js';
import NoQueue from './noqueue.js';

/* this variable is bumped automatically when you call npm version */
const palindromVersion = '6.4.0-0';

if (typeof global === 'undefined') {
    if (typeof window !== 'undefined') {
        /* incase neither window nor global existed, e.g React Native */
        var global = window;
    } else {
        var global = {};
    }
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

        this.network = new PalindromNetworkChannel(
            this, // palindrom instance TODO: to be removed, used for error reporting
            options.remoteUrl,
            options.useWebSocket || false, // useWebSocket
            this.handleRemoteChange.bind(this), //onReceive
            this.onPatchSent.bind(this), //onSend,
            this.onConnectionError.bind(this),
            this.onSocketOpened.bind(this),
            this.onSocketStateChanged.bind(this), //onStateChange
            options.pingIntervalS
        );
        /**
         * how many meta (OT) operations are there in each patch 0 or 2
         */
        this.OTPatchIndexOffset = 0;
        // choose queuing engine
        if (options.localVersionPath && options.remoteVersionPath) {
            // double versioning or OT
            this.OTPatchIndexOffset = 2;
            if (options.ot) {
                this.queue = new JSONPatchOTAgent(
                    this.obj,
                    JSONPatchOT.transform,
                    [options.localVersionPath, options.remoteVersionPath],
                    this.validateAndApplySequence.bind(this),
                    options.purity
                );
            } else {
                this.queue = new JSONPatchQueue(
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
        this._connectToRemote();
    }
    async _connectToRemote(reconnectionPendingData = null) {
        const json = await this.network._establish(reconnectionPendingData);
        this.reconnector.stopReconnecting();

        if (this.debug) {
            this.remoteObj = JSON.parse(JSON.stringify(json));
        }

        this.queue.reset(json);
    }
    get useWebSocket() {
        return this.network.useWebSocket;
    }
    set useWebSocket(newValue) {
        this.network.useWebSocket = newValue;
    }

    _sendPatch(patch) {
        this.unobserve();
        this.network.send(patch);
        this.observe();
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
        const error = validate(sequence, tree);
        if (error) {
            this.onOutgoingPatchValidationError(error);
        }
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
    /**
     * Stops all networking, stops listeners, heartbeats, etc.
     */
    stop() {
        this.unobserve();
        this.reconnector.stopReconnecting();
        this.network.stop();
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
export {Palindrom};