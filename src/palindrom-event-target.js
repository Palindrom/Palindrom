/*! Palindrom
 * https://github.com/Palindrom/Palindrom
 * (c) 2019 Omar Alsahker
 * MIT license
 */

// privatize the prop
const listeners = Symbol('listeners');

export class PalindromEventTarget {
    constructor() {
        this[listeners] = {};
    }
    addEventListener(name, callback) {
        if (!this[listeners][name]) {
            this[listeners][name] = new Set();
        }
        this[listeners][name].add(callback);
    }
    removeListener(name, callback) {
        if (!this[listeners][name]) {
            return;
        }
        this[listeners][name].remove(callback);
    }
    fire(eventName, detail) {
        if (this[listeners][eventName]) {
            this[listeners][eventName].forEach(listener =>
                listener({ detail })
            );
        }
    }
}
