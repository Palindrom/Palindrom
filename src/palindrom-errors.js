export class PalindromError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}

export class PalindromConnectionError extends PalindromError {
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