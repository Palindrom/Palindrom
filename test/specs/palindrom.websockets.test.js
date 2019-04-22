import { Server as MockSocketServer } from 'mock-socket';
import Palindrom from '../../src/palindrom';
import assert from 'assert';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { PalindromConnectionError } from '../../src/palindrom-errors';
import { sleep, getTestURL } from '../utils';

describe('Sockets - if `useWebSocket` flag is provided', () => {
    let server;
    afterEach(() => {
        fetchMock.restore();
        server.stop();
    });
    it('should try to open WebSocket connection', async () => {
        server = new MockSocketServer(getTestURL('testURL', false, true));

        fetchMock.mock(getTestURL('testURL'), {
            status: 200,
            headers: { location: getTestURL('testURL') },
            body: '{"hello": "world"}'
        });

        var palindrom = new Palindrom({
            remoteUrl: getTestURL('testURL'),
            useWebSocket: true
        });
        /* socket should be undefined before XHR delay */
        assert(typeof palindrom.network._ws === 'undefined');

        await sleep();
        /* socket should NOT be undefined after XHR delay */
        assert(typeof palindrom.network._ws !== 'undefined');
    });

    it('should calculate WebSocket URL correctly', async () => {
        server = new MockSocketServer(getTestURL('testURL', false, true));

        fetchMock.mock(getTestURL('testURL'), {
            status: 200,
            headers: { location: getTestURL('testURL') },
            body: '{"hello": "world"}'
        });

        var palindrom = new Palindrom({
            remoteUrl: getTestURL('testURL'),
            useWebSocket: true
        });

        await sleep();
        assert.equal(
            palindrom.network._ws.url,
            getTestURL('testURL', false, true)
        );
    });

    it('should resolve to correct WebSocket URL from location header, with root slash /', async () => {
        server = new MockSocketServer(
            getTestURL('default/this_is_a_nice_url', false, true)
        );

        fetchMock.mock(getTestURL('testURL'), {
            status: 200,
            headers: { location: '/default/this_is_a_nice_url' },
            body: '{"hello": "world"}'
        });

        var palindrom = new Palindrom({
            remoteUrl: getTestURL('testURL'),
            useWebSocket: true
        });

        await sleep();
        assert.equal(
            palindrom.network._ws.url,
            getTestURL('default/this_is_a_nice_url', false, true)
        );
    });

    it('should resolve to correct WebSocket URL from location header, relatively', async () => {
        server = new MockSocketServer(
            getTestURL('default/this_is_a_nice_url', false, true)
        );

        fetchMock.mock(getTestURL('testURL'), {
            status: 200,
            headers: { location: 'default/this_is_a_nice_url' },
            body: '{"hello": "world"}'
        });

        var palindrom = new Palindrom({
            remoteUrl: getTestURL('testURL'),
            useWebSocket: true
        });

        await sleep();
        assert.equal(
            palindrom.network._ws.url,
            getTestURL('default/this_is_a_nice_url', false, true)
        );
    });

    it('should resolve to correct WebSocket URL from location header, with root slash and extra pathname', async () => {
        server = new MockSocketServer(
            getTestURL('default/this_is_a_nice_url', false, true)
        );

        fetchMock.mock(getTestURL('testURL/koko'), {
            status: 200,
            headers: { location: '/default/this_is_a_nice_url' },
            body: '{"hello": "world"}'
        });

        var palindrom = new Palindrom({
            remoteUrl: getTestURL('testURL/koko'),
            useWebSocket: true
        });

        await sleep();
        assert.equal(
            palindrom.network._ws.url,
            getTestURL('default/this_is_a_nice_url', false, true)
        );
    });

    it('should resolve to correct WebSocket URL from location header, without root slash and extra pathname', async () => {
        server = new MockSocketServer(
            getTestURL('testURL/default/this_is_a_nice_url', false, true)
        );

        fetchMock.mock(getTestURL('testURL/koko'), {
            status: 200,
            headers: { location: 'default/this_is_a_nice_url' },
            body: '{"hello": "world"}'
        });

        var palindrom = new Palindrom({
            remoteUrl: getTestURL('testURL/koko'),
            useWebSocket: true
        });

        await sleep();
        assert.equal(
            palindrom.network._ws.url,
            getTestURL('testURL/default/this_is_a_nice_url', false, true)
        );
    });
    it('should use wss for https remote URL', async () => {
        server = new MockSocketServer(
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
    });

    it('should use same host, port, username, and password as provided in remoteUrl', async () => {
        server = new MockSocketServer(
            getTestURL('test/this_is_a_nice_url', false, true)
        );

        const remoteUrl = getTestURL('testURL/koko');

        fetchMock.mock(remoteUrl, {
            status: 200,
            headers: { location: getTestURL('test/this_is_a_nice_url') },
            body: '{"hello": "world"}'
        });

        var palindrom = new Palindrom({
            remoteUrl,
            useWebSocket: true
        });

        await sleep();
        assert(
            palindrom.network._ws.url ===
                getTestURL('test/this_is_a_nice_url', false, true)
        );
    });
});
describe('Before XHR connection is established', () => {
    let server;
    afterEach(() => {
        fetchMock.restore();
        server.stop();
    });
    it("shouldn't start a socket connection", async () => {
        server = new MockSocketServer(getTestURL('testURL/koko', false, true));

        const remoteUrl = getTestURL('testURL/koko');
        let everConnected = false;

        fetchMock.mock(remoteUrl, {
            status: 200,
            body: '{"hello": "world"}'
        });

        var palindrom = new Palindrom({
            remoteUrl,
            useWebSocket: true,
            onStateReset: () =>
                assert(everConnected === false, `shouldn't connect before XHR`),
            onSocketOpened: () => (everConnected = true)
        });

        await sleep(30);

        assert.equal(everConnected, true, 'should connect after XHR');
    });

    it("shouldn't send any change patches using WebSocket", async () => {
        server = new MockSocketServer(getTestURL('testURL/koko', false, true));
        const messages = [];

        const remoteUrl = getTestURL('testURL/koko');

        fetchMock.mock(remoteUrl, {
            status: 200,
            body: '{"hello": "world"}'
        });

        server.on('message', patches => {
            let patchesParsed = JSON.parse(patches);
            messages.push(...patchesParsed);
        });

        new Palindrom({
            remoteUrl,
            useWebSocket: true,
            onStateReset: obj => (obj.firstName = 'Omar')
        });

        // Wait for XHR to finish
        await sleep(15);

        assert(messages.length === 0);
    });
});
describe('Sockets events', () => {
    let server;
    afterEach(() => {
        fetchMock.restore();
        server.stop();
    });
    it('socket-opened event should be called', async () => {
        server = new MockSocketServer(getTestURL('testURL', false, true));

        fetchMock.mock(getTestURL('testURL'), {
            status: 200,
            body: '{"hello": "world"}'
        });

        var spy = sinon.spy();
        new Palindrom({
            remoteUrl: getTestURL('testURL'),
            useWebSocket: true,
            onSocketOpened: spy
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
    });

    it('Should call onConnectionError even when a non-JSON message is sent', async () => {
        server = new MockSocketServer(getTestURL('testURL', false, true));

        fetchMock.mock(getTestURL('testURL'), {
            status: 200,
            body: '{"hello": "world"}'
        });

        var spy = sinon.spy();
        var palindrom = new Palindrom({
            remoteUrl: getTestURL('testURL'),
            useWebSocket: true,
            onConnectionError: spy
        });

        /* no issues so far */
        assert(spy.notCalled);

        await sleep();

        server.send(`[{"op": "replace", "path": "/hello", "value": "bye"}]`);

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
    });

    context('After connection is established', () => {
        it('should send new changes over WebSocket', async () => {
            server = new MockSocketServer(
                getTestURL('testURL/koko', false, true)
            );

            const remoteUrl = getTestURL('testURL/koko');

            fetchMock.mock(remoteUrl, {
                status: 200,
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

            /* wait for XHR */
            await sleep(30);

            palindrom.obj.firstName = 'Omar';

            await sleep();

            assert.equal(messages.length, 1);

            assert.deepEqual(messages[0], {
                op: 'add',
                path: '/firstName',
                value: 'Omar'
            });
        });

        it('should send patches over HTTP before ws.readyState is OPENED, and over WebSocket after ws.readyState is OPENED', async () => {
            server = new MockSocketServer(
                getTestURL('testURL/koko3', false, true)
            );

            const remoteUrl = getTestURL('testURL/koko3');

            fetchMock.mock(remoteUrl, {
                status: 200,
                body: '{"hello": "world"}'
            });

            const messages = [];

            server.on('message', patches => {
                let patchesParsed = JSON.parse(patches);
                messages.push(...patchesParsed);
            });

            let tempObj;
            new Palindrom({
                remoteUrl,
                useWebSocket: true,
                onStateReset: obj => {
                    fetchMock.restore();

                    // prepare a response for the patch
                    fetchMock.mock(remoteUrl, {
                        status: 200,
                        headers: { contentType: 'application/json-patch+json' },
                        body: `[]`
                    });

                    /* here, socket connection isn't established yet, let's issue a change */
                    obj.name = 'Mark';

                    assert.equal(
                        '[{"op":"add","path":"/name","value":"Mark"}]',
                        JSON.parse(fetchMock.lastOptions().body)
                    );

                    tempObj = obj;
                }
            });

            /* make sure there is no socket messages */
            assert.equal(messages.length, 0);

            /* now socket is connected, let's issue a change */
            await sleep(30);

            tempObj.firstName = 'Omar';

            await sleep();

            assert.equal(messages.length, 1);
            assert.equal(
                JSON.stringify(messages[0]),
                '{"op":"add","path":"/firstName","value":"Omar"}'
            );

            /* now socket is connected, let's issue another change */
            await sleep();
            tempObj.firstName = 'Hanan';

            assert.equal(messages.length, 2);
            assert.equal(
                JSON.stringify(messages[1]),
                '{"op":"replace","path":"/firstName","value":"Hanan"}'
            );
        });
    });
});
