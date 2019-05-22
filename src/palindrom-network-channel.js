import URL from './URLShim';
import { PalindromError, PalindromConnectionError } from './palindrom-errors';
/* this package will be empty in the browser bundle,
and will import https://www.npmjs.com/package/websocket in node */
import WebSocket from 'websocket';
import nodeFetch from 'node-fetch';

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

export default class PalindromNetworkChannel {
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

    async _establish(reconnectionPendingData = null) {
        const data = await this._xhr(
            reconnectionPendingData ? 'PATCH' : 'GET',
            this.remoteUrl.href + (reconnectionPendingData ? '/reconnect' : ''),
            'application/json',
            reconnectionPendingData
        );
        if (this.useWebSocket) {
            this.webSocketUpgrade(this.onSocketOpened);
        }
        return data;
    }

    /**
     * Send any text message by currently established channel
     * @TODO: handle readyState 2-CLOSING & 3-CLOSED (tomalec)
     * @param  {String} msg message to be sent
     * @return {PalindromNetworkChannel}     self
     */
    async send(msg) {
        // send message only if there is a working ws connection
        if (this.useWebSocket && this._ws && this._ws.readyState === 1) {
            this._ws.send(msg);
            this.onSend(msg, this._ws.url,'WS');
        } else {
            const url = this.remoteUrl.href;
            const data = await this._xhr(
                'PATCH',
                url,
                'application/json-patch+json',
                msg
            );
            this.onReceive(data, url, 'PATCH');
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

        this.closeConnection();
        // in node, WebSocket will have `w3cwebsocket` prop. In the browser it won't

        const UsedSocket = WebSocket.w3cwebsocket || WebSocket;
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
     * @see #_xhr
     */
    async getPatchUsingHTTP(href) {
        // we don't need to try catch here because we want the error to be thrown at whoever calls getPatchUsingHTTP
        const data = await this._xhr(
            'GET',
            href,
            'application/json-patch+json',
            null,
            true
        );
        this.onReceive(data, href, 'GET');
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
     * Handles unsecessful HTTP requests
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

        this.onConnectionError(
            new PalindromConnectionError(message, CLIENT, url, method)
        );
    }

    /**
     * Internal method to perform HTTP Request.
     * Requests PATCH if there is given `data`, GET otherwie.
     * @param {String} method HTTP method to be used
     * @param {String} [url=window.location] URL to send the request. If empty string, undefined or null given - the request will be sent to window location
     * @param {String} [accept] HTTP accept header
     * @param {Object} [data] Data payload
     * @returns {Promise<Object>} promise for fetched JSON data
     */
    async _xhr(method, url, accept, data, setReferer) {
        const config = { headers: {}, method, credentials: 'include' };
        const headers = config.headers;

        if (data) {
            headers['Content-Type'] = 'application/json-patch+json';
            config.body = JSON.stringify(data);
        }
        if (accept) {
            headers['Accept'] = accept;
        }
        if (this.remoteUrl && setReferer) {
            headers['X-Referer'] = this.remoteUrl.pathname;
        }

        this.onSend(data, url, method);

        let isomorphicFetch = typeof global !== 'undefined' ?  global.fetch : nodeFetch;

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
