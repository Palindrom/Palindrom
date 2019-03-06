/**
 * Non-queuing object that conforms JSON-Patch-Queue API
 * @param {Object} obj target object where patches are applied
 * @param {Function} apply function to apply received patch, must return the object in its final state
 */
export default class NoQueue {
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
