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
  constructor(message, side, url = window.location.href, connectionType) {
    if (!side || !['Server', 'Client'].includes(side)) {
      throw new TypeError(
        "Error constructing PalindromConnectionError, `side` parameter is required and can either be 'Server' or 'Client'"
      );
    }
    super(message);
    this.side = side;
    this.message = `${side} error: ${message}`;
  }
}

class PalindromValidationError extends PalindromError {
  /**
   * 
   * @param {String} message the message that describes the error
   * @param {String} direction <Outgoing|Incoming>
   */
  constructor(message, direction) {
    if (!direction || !['Outgoing', 'Incoming'].includes(direction)) {
      throw new TypeError(
        "Error constructing PalindromValidationError, `direction` parameter is required and can either be 'Outgoing' or 'Incoming'"
      );
    }
    super(message);
    this.message = `${direction}PatchValidationError: ${message}`;
    this.direction = direction;
  }
}

module.exports = {
  PalindromError,
  PalindromConnectionError,
  PalindromValidationError
};
