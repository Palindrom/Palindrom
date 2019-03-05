/*! Palindrom
 * https://github.com/Palindrom/Palindrom
 * (c) 2019 Omar Alsahker
 * MIT license
 */

/* EventTarget API shim for Node */
import EventEmitter from 'events';

export class EventTarget extends EventEmitter {
    addEventListener(name, callback) {
        super.addListener(name, callback);
    }
    removeListener(name, callback) {
        super.removeListener(name, callback);
    }
    dispatchEvent(event) {
        super.emit(event.name, event)
    }
}
export function CustomEvent(name, value) {
    this.name = name;
    Object.assign(this, value);
}