import { Server as MockSocketServer } from 'mock-socket';
import { Palindrom } from '../../src/palindrom';
import chai, { expect, assert } from 'chai';
import sinonChai  from "sinon-chai";
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { PalindromConnectionError } from '../../src/palindrom-errors';
import { sleep, getTestURL } from '../utils';

chai.use(sinonChai);

describe('Sockets - if `useWebSocket` flag is provided', () => {
    let mockSocketServer;
    const remoteUrl = getTestURL('testURL/koko');
    const wsUrl = getTestURL('testURL/koko', false, true);
    let palindrom;
    let webSocketConnection;
    beforeEach(() => {
        webSocketConnection = sinon.spy().named('Web Socket connection');
    });
    afterEach(() => {
        fetchMock.restore();
        mockSocketServer.stop();
        // stop all networking and DOM activity of abandoned instance
        palindrom.stop();
        palindrom = undefined;
    });

    describe('Before HTTP connection is established', () => {
        const remoteUrl = getTestURL('testURL/koko');
        beforeEach(() => {
            mockSocketServer = new MockSocketServer(getTestURL('testURL/koko', false, true));
            fetchMock.mock(remoteUrl, {
                status: 200,
                body: '{"hello": "world"}'
            });
        });
        it("shouldn't start a Web Socket connection", async () => {
            mockSocketServer.on('connection', webSocketConnection);
    
    
            palindrom = new Palindrom({
                remoteUrl,
                useWebSocket: true,
                onStateReset: () =>
                    expect(webSocketConnection).not.to.be.called
            });
            expect(webSocketConnection).not.to.be.called;
            // wait for onStateReset expectation
            await sleep();    
        });
    
        it("shouldn't call `onSocketOpened` callback", async () => {
            const onSocketOpened = sinon.spy().named('onSocketOpened');
    
            palindrom = new Palindrom({
                remoteUrl,
                useWebSocket: true,
                onStateReset: () =>
                    expect(onSocketOpened).not.to.be.called,
                onSocketOpened
            });
            expect(onSocketOpened).not.to.be.called;
            // wait for onStateReset expectation
            await sleep();
        });
    
        it("shouldn't send any change a patch using WebSocket", async () => {
            const messages = [];
    
            mockSocketServer.on('message', patch => {
                let patchParsed = JSON.parse(patch);
                messages.push(...patchParsed);
            });
    
            palindrom = new Palindrom({
                remoteUrl,
                useWebSocket: true,
                onStateReset: obj => (obj.firstName = 'Omar')
            });
    
            // Wait for HTTP to finish
            await sleep(15);
    
            assert(messages.length === 0);
        });
    });
    
    describe('After HTTP connection is established', () => {
        it("should start a Web Socket connection", async () => {
            mockSocketServer = new MockSocketServer(getTestURL('testURL/koko', false, true));
            mockSocketServer.on('connection', webSocketConnection);
            fetchMock.mock(remoteUrl, {
                status: 200,
                body: '{"hello": "world"}'
            });
            palindrom = new Palindrom({
                remoteUrl,
                useWebSocket: true
            });
            await sleep(50);

            expect(webSocketConnection).to.be.calledOnce;
        });
        
        it('should calculate WebSocket URL correctly', async () => {
            mockSocketServer = new MockSocketServer(wsUrl);
            mockSocketServer.on('connection', webSocketConnection);
                
            fetchMock.mock(remoteUrl, {
                status: 200,
                headers: { location: remoteUrl },
                body: '{"hello": "world"}'
            });

            palindrom = new Palindrom({
                remoteUrl,
                useWebSocket: true
            });

            await sleep();

            const websocket = webSocketConnection.lastCall.args[0];
            expect(websocket, "Web Socket").to.have.property('url', 
                getTestURL('testURL/koko', false, true)
            );
        });

        it('should resolve to correct WebSocket URL from location header, with root slash /', async () => {
            mockSocketServer = new MockSocketServer(
                getTestURL('default/this_is_a_nice_url', false, true)
            );
            mockSocketServer.on('connection', webSocketConnection);

            fetchMock.mock(remoteUrl, {
                status: 200,
                headers: { location: '/default/this_is_a_nice_url' },
                body: '{"hello": "world"}'
            });

            palindrom = new Palindrom({
                remoteUrl,
                useWebSocket: true
            });

            await sleep();
            
            const websocket = webSocketConnection.lastCall.args[0];
            expect(websocket, "Web Socket").to.have.property('url', 
                getTestURL('default/this_is_a_nice_url', false, true)
            );
        });

        it('should resolve to correct WebSocket URL from location header, relatively', async () => {
            mockSocketServer = new MockSocketServer(
                getTestURL('testURL/default/this_is_a_nice_url', false, true)
            );
            mockSocketServer.on('connection', webSocketConnection);

            fetchMock.mock(remoteUrl, {
                status: 200,
                headers: { location: 'default/this_is_a_nice_url' },
                body: '{"hello": "world"}'
            });

            palindrom = new Palindrom({
                remoteUrl,
                useWebSocket: true
            });

            await sleep();
            const websocket = webSocketConnection.lastCall.args[0];
            expect(websocket, "Web Socket").to.have.property('url', 
                getTestURL('testURL/default/this_is_a_nice_url', false, true)
            );
        });

        it('should resolve to correct WebSocket URL from location header, with root slash and extra pathname', async () => {
            mockSocketServer = new MockSocketServer(
                getTestURL('default/this_is_a_nice_url', false, true)
            );
            mockSocketServer.on('connection', webSocketConnection);

            fetchMock.mock(getTestURL('testURL/koko'), {
                status: 200,
                headers: { location: '/default/this_is_a_nice_url' },
                body: '{"hello": "world"}'
            });

            palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL/koko'),
                useWebSocket: true
            });

            await sleep();
            const websocket = webSocketConnection.lastCall.args[0];
            expect(websocket, "Web Socket").to.have.property('url', 
                getTestURL('default/this_is_a_nice_url', false, true)
            );
        });

        it('should resolve to correct WebSocket URL from location header, without root slash and extra pathname', async () => {
            mockSocketServer = new MockSocketServer(
                getTestURL('testURL/default/this_is_a_nice_url', false, true)
            );
            mockSocketServer.on('connection', webSocketConnection);

            fetchMock.mock(getTestURL('testURL/koko'), {
                status: 200,
                headers: { location: 'default/this_is_a_nice_url' },
                body: '{"hello": "world"}'
            });

            palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL/koko'),
                useWebSocket: true
            });

            await sleep();
            const websocket = webSocketConnection.lastCall.args[0];
            expect(websocket, "Web Socket").to.have.property('url', 
                getTestURL('testURL/default/this_is_a_nice_url', false, true)
            );
        });
        it('should use wss for https remote URL', async () => {
            mockSocketServer = new MockSocketServer(
                'wss://localhost/testURL/default/this_is_a_nice_url'
            );
            mockSocketServer.on('connection', webSocketConnection);

            fetchMock.mock('https://localhost/testURL/koko', {
                status: 200,
                headers: { location: 'default/this_is_a_nice_url' },
                body: '{"hello": "world"}'
            });

            palindrom = new Palindrom({
                remoteUrl: 'https://localhost/testURL/koko',
                useWebSocket: true
            });

            await sleep();
            const websocket = webSocketConnection.lastCall.args[0];
            expect(websocket, "Web Socket").to.have.property('url', 
                'wss://localhost/testURL/default/this_is_a_nice_url'
            );
        });

        it('should use same host, port, username, and password as provided in remoteUrl', async () => {
            mockSocketServer = new MockSocketServer(
                getTestURL('test/this_is_a_nice_url', false, true)
            );
            mockSocketServer.on('connection', webSocketConnection);

            const remoteUrl = getTestURL('testURL/koko');

            fetchMock.mock(remoteUrl, {
                status: 200,
                headers: { location: getTestURL('test/this_is_a_nice_url') },
                body: '{"hello": "world"}'
            });

            palindrom = new Palindrom({
                remoteUrl,
                useWebSocket: true
            });

            await sleep();
            const websocket = webSocketConnection.lastCall.args[0];
            expect(websocket, "Web Socket").to.have.property('url', 
                getTestURL('test/this_is_a_nice_url', false, true)
            );
        });
        describe('', () => {
            
            const remoteUrl = getTestURL('testURL/koko');
            beforeEach(() => {
                mockSocketServer = new MockSocketServer(getTestURL('testURL/koko', false, true));
                mockSocketServer.on('connection', webSocketConnection);
                fetchMock.mock(remoteUrl, {
                    status: 200,
                    body: '{"hello": "world"}'
                });
            });

            it("should call `onSocketOpened` callback", async () => {
                const onSocketOpened = sinon.spy().named('onSocketOpened');

                palindrom = new Palindrom({
                    remoteUrl,
                    useWebSocket: true,
                    onSocketOpened
                });
                await sleep(50);
                expect(onSocketOpened).to.be.calledOnce;
            });
            it('should call `onConnectionError` when a non-JSON message is received from the server', async () => {
                const onConnectionError = sinon.spy().named('onConnectionError');
                const socketMessageSpy = sinon.spy().named('socket message');

                let mockSocket;
                mockSocketServer.on('connection', socket => {
                    mockSocket = socket;
                    socket.on('message', socketMessageSpy);
                });

                palindrom = new Palindrom({
                    remoteUrl,
                    useWebSocket: true,
                    onConnectionError
                });
        
                await sleep();
        
                mockSocket.send(`[{"op": "replace", "path": "/hello", "value": "bye"}]`);
                // make sure the change is applied
                assert.equal(palindrom.obj.hello, 'bye');
        
                /* no issues so far */
                expect(onConnectionError).not.to.be.called;

                // send a non-JSON message from the server
                mockSocket.send(`Some error message from the server`);
        
                /* atual test */
                expect(onConnectionError).to.be.calledOnce;
        
                const error = onConnectionError.lastCall.args[0];
        
                expect(error).to.be.instanceof(PalindromConnectionError);
                expect(error).to.have.property('message',
                    'Server error\n\tSome error message from the server'
                );
            });
            
            it('should send new changes over WebSocket', async () => {
                const socketMessageSpy = sinon.spy().named('socket message');
                mockSocketServer.on('connection', socket => {
                    socket.on('message', socketMessageSpy);
                });
                palindrom = new Palindrom({
                    remoteUrl,
                    useWebSocket: true
                });

                /* wait for HTTP */
                await sleep();

                palindrom.obj.firstName = 'Omar';

                await sleep();

                expect(socketMessageSpy).to.have.been.calledOnceWithExactly(JSON.stringify([{
                    op: 'add',
                    path: '/firstName',
                    value: 'Omar'
                }]));
            });
            
            it('should call `onConnectionError` callback if there is no response after `pingIntervalS`', async () => {
                const onConnectionError = sinon.spy().named('onConnectionError');
                palindrom = new Palindrom({
                    remoteUrl,
                    useWebSocket: true,
                    onConnectionError,
                    pingIntervalS: 0.5
                });

                /* wait for HTTP & heartbeat */
                
                await sleep(1200);

                /* onConnectionError should be called once now */
                expect(onConnectionError).to.have.been.calledOnce;
                const argument = onConnectionError.getCall(0).args[0];
                expect(argument).to.be.an.instanceof(PalindromConnectionError);
                expect(argument).to.have.property('message').that.match(/timeout/i);
                expect(argument).to.have.property('side', "Client");
            });
        });
    });

    
    it('should send a patch over HTTP before ws.readyState is OPENED, and over WebSocket after ws.readyState is OPENED', async () => {
        const socketMessageSpy = sinon.spy().named('socket message');
        mockSocketServer = new MockSocketServer(getTestURL('testURL/koko', false, true));
        mockSocketServer.on('connection', socket => {
            socket.on('message', socketMessageSpy);
        });
        
        fetchMock.mock(remoteUrl, {
            status: 200,
            body: '{"hello": "world"}'
        });

        let tempObj;
        palindrom = new Palindrom({
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
                    fetchMock.lastOptions().body
                );

                tempObj = obj;
            }
        });

        /* make sure there is no socket messages */
        expect(socketMessageSpy).not.to.be.called;

        /* now socket is connected, let's issue a change */
        await sleep();

        tempObj.firstName = 'Omar';

        await sleep();

        expect(socketMessageSpy).to.have.been.calledOnceWithExactly('[{"op":"add","path":"/firstName","value":"Omar"}]');
        
        /* now socket is connected, let's issue another change */
        await sleep();
        tempObj.firstName = 'Hanan';
        // mock-socket is asynchronous, so let's wait for it to propagate event
        await sleep(10);

        expect(socketMessageSpy).to.have.been.calledTwice;
        expect(socketMessageSpy).to.have.been.calledWithExactly('[{"op":"replace","path":"/firstName","value":"Hanan"}]');
    });
});
