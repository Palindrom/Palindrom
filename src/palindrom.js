/*! Palindrom
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */

import PalindromNetworkChannel from './palindrom-network-channel';
import { applyPatch, validate } from 'fast-json-patch';
import JSONPatcherProxy from 'jsonpatcherproxy';
import { JSONPatchQueueSynchronous, JSONPatchQueue } from 'json-patch-queue';
import JSONPatchOT from 'json-patch-ot';
import JSONPatchOTAgent from 'json-patch-ot-agent';
import { PalindromError, PalindromConnectionError } from './palindrom-errors';
import {PalindromEventTarget, PalindromCustomEvent} from './palindrom-event-target'

/* this variable is bumped automatically when you call `npm version` */
const palindromVersion = '5.2.0';
const CLIENT = 'Client';

    if (typeof global === 'undefined') {
        if (typeof window !== 'undefined') {
            /* incase neither window nor global existed, e.g React Native */
            var global = window;
        } else {
            var global = {};
        }
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
            scheduledError = setTimeout(() => {
                scheduledError = null;
                onError(
                    new PalindromConnectionError(
                        "Timeout has passed and response hasn't arrived",
                        CLIENT,
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

    /**
     * Defines a connection to a remote PATCH server, serves an object that is persistent between browser and server.
     * @param {Object} [options] map of arguments. See README.md for description
     */
    export default class Palindrom extends PalindromEventTarget {
        /**
         * Palindrom version
         */
        static get version() {
            return palindromVersion;
        }
        constructor(options) {
            super();
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

            this.debug = options.debug != undefined ? options.debug : true;

            this.isObserving = false;
            this.onStateReset = detail => this.fire('state-reset', detail);
            this.filterLocalChange =
                options.filterLocalChange || (operation => operation);

            this.onPatchSent = detail => this.fire('patch-sent', detail);
            this.onSocketStateChanged = detail => this.fire('socket-state-changed', detail);
            this.onConnectionError = detail => this.fire('connection-error', detail);
            this.onReconnectionCountdown = detail => this.fire('reconnection-countdown', detail);
            this.onReconnectionEnd = detail => this.fire('reconnection-end', detail);
            this.onSocketOpened = detail => this.fire('socket-opened', detail);
            this.onIncomingPatchValidationError = detail => this.fire('incoming-patch-validation-error', detail);
            this.onError = detail => this.fire('error', detail);
            this.onOutgoingPatchValidationError = detail => this.fire('outgoing-patch-validation-error', detail);

            this.retransmissionThreshold = options.retransmissionThreshold || 3;

            this.reconnector = new Reconnector(
                () => this._connectToRemote(JSON.stringify(this.queue.pending)),
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
                    if (options.ot) {
                        this.queue = new JSONPatchOTAgent(
                            this.obj,
                            JSONPatchOT.transform,
                            [
                                options.localVersionPath,
                                options.remoteVersionPath
                            ],
                            this.validateAndApplySequence.bind(this),
                            options.purity
                        );
                    } else {
                        this.queue = new JSONPatchQueue(
                            this.obj,
                            [
                                options.localVersionPath,
                                options.remoteVersionPath
                            ],
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
            this._sendPatches(this, []); // sends empty message to server
        }

        _sendPatches(patches) {
            const txt = JSON.stringify(patches);
            this.unobserve();
            this.heartbeat.notifySend();
            this.network.send(txt);
            this.observe();
        }

        closeConnection() {
            this.network.closeConnection();
        }

        prepareProxifiedObject(obj) {
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
                    filtered && this.handleLocalChange(filtered);
                }
            );

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

            const patches = [operation];
            if (this.debug) {
                this.validateSequence(this.remoteObj, patches);
            }
            this._sendPatches(this.queue.send(patches));
            this.fire('local-change', patches)
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
                    findRangeErrors(
                        this.obj,
                        this.onIncomingPatchValidationError
                    );

                    this.fire('state-reset', this.obj)
                }
                this.fire('remote-change', {sequence, results})
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

        handleRemoteChange(data, url, method) {
            this.fire('patch-received', {data, url, method});

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
                this.queue.pending.forEach(this._sendPatches, this);
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

