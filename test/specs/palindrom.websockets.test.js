import { Server as MockSocketServer } from 'mock-socket';
import Palindrom from '../../src/palindrom';
import assert from 'assert';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { PalindromConnectionError } from '../../src/palindrom-errors';
import { sleep } from '../utils';

describe('Sockets', () => {
    beforeEach(() => {
        
    });
    afterEach(() => {
        
    });

    describe('Palindrom constructor', () => {
        describe('if `useWebSocket` flag is provided', () => {
            it('should try to open WebSocket connection ', async () => {
                const server = new MockSocketServer('ws://localhost/testURL');

                fetchMock.mock('http://localhost/testURL', {
                    status: 200,
                    headers: { location: 'http://localhost/testURL' },
                    body: '{"hello": "world"}'
                });

                var palindrom = new Palindrom({
                    remoteUrl: 'http://localhost/testURL',
                    useWebSocket: true
                });
                /* socket should be undefined before XHR delay */
                assert(typeof palindrom.network._ws === 'undefined');

                await sleep();
                /* socket should NOT be undefined after XHR delay */
                assert(typeof palindrom.network._ws !== 'undefined');
                server.stop();
            });

            it('should calculate WebSocket URL correctly', async () => {
                const server = new MockSocketServer('ws://localhost/testURL');

                fetchMock.mock('http://localhost/testURL', {
                    status: 200,
                    headers: { location: 'http://localhost/testURL' },
                    body: '{"hello": "world"}'
                });

                var palindrom = new Palindrom({
                    remoteUrl: 'http://localhost/testURL',
                    useWebSocket: true
                });

                await sleep();
                assert(palindrom.network._ws.url === 'ws://localhost/testURL');

                server.stop();
            });

            it('should resolve to correct WebSocket URL from location header, with root slash /', async () => {
                const server = new MockSocketServer(
                    'ws://localhost/default/this_is_a_nice_url'
                );

                fetchMock.mock('http://localhost/testURL', {
                    status: 200,
                    headers: { location: '/default/this_is_a_nice_url' },
                    body: '{"hello": "world"}'
                });

                var palindrom = new Palindrom({
                    remoteUrl: 'http://localhost/testURL',
                    useWebSocket: true
                });

                await sleep();
                assert.equal(
                    palindrom.network._ws.url,
                    'ws://localhost/default/this_is_a_nice_url'
                );
                server.stop();
            });

            it('should resolve to correct WebSocket URL from location header, relatively', async () => {
                const server = new MockSocketServer(
                    'ws://localhost/default/this_is_a_nice_url'
                );

                fetchMock.mock('http://localhost/testURL', {
                    status: 200,
                    headers: { location: 'default/this_is_a_nice_url' },
                    body: '{"hello": "world"}'
                });

                var palindrom = new Palindrom({
                    remoteUrl: 'http://localhost/testURL',
                    useWebSocket: true
                });

                await sleep();
                assert(
                    palindrom.network._ws.url ===
                        'ws://localhost/default/this_is_a_nice_url'
                );

                server.stop();
            });

            it('should resolve to correct WebSocket URL from location header, with root slash and extra pathname', async () => {
                const server = new MockSocketServer(
                    'ws://localhost/default/this_is_a_nice_url'
                );

                fetchMock.mock('http://localhost/testURL/koko', {
                    status: 200,
                    headers: { location: '/default/this_is_a_nice_url' },
                    body: '{"hello": "world"}'
                });

                var palindrom = new Palindrom({
                    remoteUrl: 'http://localhost/testURL/koko',
                    useWebSocket: true
                });

                await sleep();
                assert(
                    palindrom.network._ws.url ===
                        'ws://localhost/default/this_is_a_nice_url'
                );

                server.stop();
            });

            it('should resolve to correct WebSocket URL from location header, without root slash and extra pathname', async () => {
                const server = new MockSocketServer(
                    'ws://localhost/testURL/default/this_is_a_nice_url'
                );

                fetchMock.mock('http://localhost/testURL/koko', {
                    status: 200,
                    headers: { location: 'default/this_is_a_nice_url' },
                    body: '{"hello": "world"}'
                });

                var palindrom = new Palindrom({
                    remoteUrl: 'http://localhost/testURL/koko',
                    useWebSocket: true
                });

                await sleep();
                assert(
                    palindrom.network._ws.url ===
                        'ws://localhost/testURL/default/this_is_a_nice_url'
                );
                /* stop server  */
                server.stop();
            });
            it('should use wss for https remote URL', async () => {
                const server = new MockSocketServer(
                    'wss://localhost/testURL/default/this_is_a_nice_url'
                );

                fetchMock.mock('https://localhost/testURL/koko', {
                    status: 200,
                    headers: { location: 'default/this_is_a_nice_url' },
                    body: '{"hello": "world"}'
                });

                var palindrom = new Palindrom({
                    remoteUrl: 'https://localhost/testURL/koko',
                    useWebSocket: true
                });

                await sleep();
                assert(
                    palindrom.network._ws.url ===
                        'wss://localhost/testURL/default/this_is_a_nice_url'
                );

                server.stop();
            });

            it('should use same host, port, username, and password as provided in remoteUrl', async () => {
                const server = new MockSocketServer(
                    'ws://localhost/test/this_is_a_nice_url'
                );

                const remoteUrl = 'http://localhost/testURL/koko';

                fetchMock.mock(remoteUrl, {
                    status: 200,
                    headers: { location: '/test/this_is_a_nice_url' },
                    body: '{"hello": "world"}'
                });

                var palindrom = new Palindrom({
                    remoteUrl,
                    useWebSocket: true
                });

                await sleep();
                assert(
                    palindrom.network._ws.url ===
                        'ws://localhost/test/this_is_a_nice_url'
                );

                server.stop();
            });
            describe('Before XHR connection is established', () => {
                it("shouldn't start a socket connection", async () => {
                    const server = new MockSocketServer(
                        'ws://localhost/test/this_is_a_nice_url'
                    );

                    const remoteUrl = 'http://localhost/testURL/koko';
                    let everConnected = false;

                    fetchMock.mock(remoteUrl, {
                        status: 200,
                        headers: { location: '/test/this_is_a_nice_url' },
                        body: '{"hello": "world"}'
                    });

                    server.on('connection', server => {
                        everConnected = true;
                    });

                    var palindrom = new Palindrom({
                        remoteUrl,
                        useWebSocket: true
                    });

                    palindrom.addEventListener('state-reset', ev => {
                        assert(
                            everConnected === false,
                            `shouldn't connect before XHR`
                        );
                    });

                    await sleep(20);
                    assert(everConnected === true, 'should connect after XHR ');

                    server.stop();
                });

                it("shouldn't send any change patches", async () => {
                    const server = new MockSocketServer(
                        'ws://localhost/test/this_is_a_cool_url'
                    );

                    const remoteUrl = 'http://localhost/testURL/koko';

                    fetchMock.mock(remoteUrl, {
                        status: 200,
                        headers: { location: '/test/this_is_a_cool_url' },
                        body: '{"hello": "world"}'
                    });

                    const messages = [];

                    server.on('message', patches => {
                        let patchesParsed = JSON.parse(patches);
                        messages.push(...patchesParsed);
                    });

                    var palindrom = new Palindrom({
                        remoteUrl,
                        useWebSocket: true
                    });

                    // Wait for XHR to finish
                    await sleep();
                    palindrom.obj.firstName = 'Omar';

                    await sleep();
                    assert(messages.length === 0);
                    server.stop();
                });
            });
            describe('Sockets events', () => {
                it('onSocketOpened callback should be called', async () => {
                    const server = new MockSocketServer(
                        'ws://localhost/testURL'
                    );

                    fetchMock.mock('http://localhost/testURL', {
                        status: 200,
                        headers: { location: 'http://localhost/testURL' },
                        body: '{"hello": "world"}'
                    });

                    var spy = sinon.spy();
                    var palindrom = new Palindrom({
                        remoteUrl: 'http://localhost/testURL',
                        useWebSocket: true
                    });

                    palindrom.addEventListener('socket-opened', ev => {
                        spy(ev.detail);
                    });

                    assert.equal(
                        spy.callCount,
                        0,
                        'socket should not be opened before XHR delay'
                    );

                    await sleep(20);

                    assert.equal(
                        spy.callCount,
                        1,
                        'socket should be opened before XHR delay'
                    );
                    server.stop();
                });

                it('Should call onConnectionError when a non-JSON message is sent', async () => {
                    const server = new MockSocketServer(
                        'ws://localhost/testURL'
                    );

                    fetchMock.mock('http://localhost/testURL', {
                        status: 200,
                        headers: { location: 'http://localhost/testURL' },
                        body: '{"hello": "world"}'
                    });

                    var spy = sinon.spy();
                    var palindrom = new Palindrom({
                        remoteUrl: 'http://localhost/testURL',
                        useWebSocket: true
                    });

                    palindrom.addEventListener('connection-error', ev => {
                        spy(ev.detail);
                    });

                    /* no issues so far */
                    assert(spy.notCalled);

                    await sleep();
                    server.send(
                        `[{"op": "replace", "path": "/hello", "value": "bye"}]`
                    );

                    assert.equal(palindrom.obj.hello, 'bye');

                    /* no issues so far */
                    assert(spy.notCalled);

                    server.send(`Some error message from the server`);

                    /* Now! */
                    assert(spy.calledOnce);

                    const error = spy.lastCall.args[0];

                    assert(error instanceof PalindromConnectionError);
                    assert.equal(
                        error.message,
                        'Server error\n\tSome error message from the server'
                    );

                    server.stop();
                });
            });
            describe('After connection is established', () => {
                it('should send new changes over WebSocket', async () => {
                    const server = new MockSocketServer(
                        'ws://localhost/test/this_is_a_nicer_url'
                    );

                    const remoteUrl = 'http://localhost/testURL/koko';

                    fetchMock.mock(remoteUrl, {
                        status: 200,
                        headers: { location: '/test/this_is_a_nicer_url' },
                        body: '{"hello": "world"}'
                    });

                    const messages = [];

                    server.on('message', patches => {
                        let patchesParsed = JSON.parse(patches);
                        messages.push(...patchesParsed);
                    });

                    var palindrom = new Palindrom({
                        remoteUrl,
                        useWebSocket: true
                    });

                    await sleep(20);
                    palindrom.obj.firstName = 'Omar';
                    await sleep();
                    assert(messages.length === 1);
                    assert.deepEqual(messages[0], {
                        op: 'add',
                        path: '/firstName',
                        value: 'Omar'
                    });
                    server.stop();
                });

                it('should send patches over HTTP before ws.readyState is OPENED, and over WebSocket after ws.readyState is OPENED', async () => {
                    const server = new MockSocketServer(
                        'ws://localhost/test/this_is_a_fast_url'
                    );

                    const remoteUrl = 'http://localhost/testURL/koko';

                    fetchMock.mock(remoteUrl, {
                        status: 200,
                        headers: { location: '/test/this_is_a_fast_url' },
                        body: '{"hello": "world"}'
                    });

                    const messages = [];

                    server.on('message', patches => {
                        let patchesParsed = JSON.parse(patches);
                        messages.push(...patchesParsed);
                    });

                    var palindrom = new Palindrom({
                        remoteUrl,
                        useWebSocket: true
                    });
                    let obj;
                    palindrom.addEventListener('state-reset', ev => {
                        obj = ev.detail;
                    });
                    
                    fetchMock.mock(
                        'http://localhost/test/this_is_a_fast_url',
                        {
                            status: 200,
                            body: '[]'
                        }
                    );
                    await sleep();
                    /* here, socket connection isn't established yet, let's issue a change */
                    obj.name = 'Mark';

                    await sleep();
                    assert.equal(
                        '[{"op":"add","path":"/name","value":"Mark"}]',
                        moxios.requests.mostRecent().config.data
                    );

                    /* make sure there is no socket messages */
                    assert(messages.length === 0);

                    /* now socket is connected, let's issue a change */
                    await sleep(30);
                    palindrom.obj.firstName = 'Omar';

                    assert(messages.length === 1);
                    assert(
                        JSON.stringify(messages[0]) ===
                            '{"op":"add","path":"/firstName","value":"Omar"}'
                    );

                    /* now socket is connected, let's issue another change */
                    await sleep();
                    palindrom.obj.firstName = 'Hanan';

                    assert(messages.length === 2);
                    assert(
                        JSON.stringify(messages[1]) ===
                            '{"op":"replace","path":"/firstName","value":"Hanan"}'
                    );
                    server.stop();
                });
            });
        });
    });
});
