export class WSServerMock {
    constructor() {
        this.callbacks = {};
    }
    on(name, fn) {
        this.callbacks[name] = fn;
    }
    simulate(name, ...args) {
        this.callbacks[name](...args);
    }
}

export class WSServerMockConnection {
    constructor() {
        this.onmessage = null;
        this.readyState = 1;
    }
    send() {}
}