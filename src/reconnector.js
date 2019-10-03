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
export default function Reconnector(
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
            reconnection = setTimeout(step, 1000);
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
