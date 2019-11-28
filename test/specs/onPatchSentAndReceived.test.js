import * as MockSocket from 'mock-socket';
const MockSocketServer = (MockSocket.default || MockSocket).Server
import { Palindrom } from '../../src/palindrom.js';
import chai from 'chai';
const { expect, assert } = chai;
import sinonChai  from "sinon-chai";
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { sleep, getTestURL } from '../utils/index.js';

sinonChai && chai.use(sinonChai);

describe('Callbacks, onPatchSent and onPatchReceived', () => {
    const remoteUrl = getTestURL('testURL');
    let onPatchReceived;
    let onPatchSent;
    let palindrom;

    beforeEach(() => {
        onPatchReceived = sinon.spy().named('onPatchReceived');
        onPatchSent = sinon.spy().named('onPatchSent');
        fetchMock.mock(remoteUrl, {
            status: 200,
            body: '{"hello": "world"}'
        });
    });
    afterEach(() => {
        fetchMock.restore();
        // stop all networking and DOM activity of abandoned instance
        palindrom.stop();
    });
    describe('HTTP', function() {
        it('should call onPatchSent and onPatchReceived callbacks when a patch is sent and received', async () => {
            let tempObj;

            palindrom = new Palindrom({
                remoteUrl,
                onStateReset: function(obj) {
                    tempObj = obj;
                },
                onPatchReceived,
                onPatchSent,
                useWebSocket: false // force HTTP for sending messages
            });

            await sleep(100);

            /* onPatchReceived, shouldn't be called now */
            assert(
                onPatchReceived.notCalled,
                'onPatchReceived should not be called'
            );

            /* onPatchSent, should be called now, the initial request  */
            assert(onPatchSent.calledOnce, 'onPatchSent should be calledOnce');

            fetchMock.restore();

            /* prepare response */
            fetchMock.mock(remoteUrl, {
                status: 200,
                body:
                    '[{"op":"replace", "path":"/hello", "value":"onPatchReceived callback"}]'
            });

            /* issue a change */
            tempObj.hello = 'onPatchSent callback';

            assert(onPatchSent.calledTwice);

            /* wait for HTTP */
            await sleep();
            assert(onPatchReceived.calledOnce);

            assert.deepEqual(onPatchReceived.lastCall.args[0], [
                {
                    op: 'replace',
                    path: '/hello',
                    value: 'onPatchReceived callback'
                }
            ]);

        });
        it('should call onPatchReceived even if the patch was bad', async () => {
            let tempObj;

            palindrom = new Palindrom({
                remoteUrl,
                onStateReset: function(obj) {
                    tempObj = obj;
                },
                onPatchReceived
            });

            await sleep();

            assert.equal(
                onPatchReceived.callCount,
                0,
                `onPatchReceived shouldn't be called now`
            );

            fetchMock.restore();

            /* prepare response */
            fetchMock.mock(remoteUrl, {
                status: 200,
                body:
                    '[{"op":"replace", "path":"/hello", "value":' +
                    (Number.MAX_SAFE_INTEGER + 1) +
                    '}]'
            });
        
            /* issue a change */
            tempObj.hello = 'onPatchSent callback';

            /* wait for HTTP */
            await sleep(100);

            assert.equal(
                onPatchReceived.callCount,
                1,
                `onPatchReceived should be called once now`
            );
        });
    });

    describe('WebSockets', function() {
        const remoteUrl = getTestURL('testURL');
        let mockSocketServer, socketMessageSpy;
        beforeEach(function(){
            socketMessageSpy = sinon.spy().named('socketMessageSpy');
            mockSocketServer = new MockSocketServer(getTestURL('testURL', false, true));
        })
        afterEach(()=>{
            mockSocketServer.stop();
        });
        it('should call onPatchSent and onPatchReceived callbacks when a patch is sent and received', async () => {
            mockSocketServer.on('connection', socket => {
                /* prepare response */
                socket.on('message', function(){
                    socketMessageSpy(...arguments);
                    /* respond */
                    socket.send(
                        '[{"op":"replace", "path":"/hello", "value":"onPatchReceived callback"}]'
                    );
                });
            });
            let tempObj;

            palindrom = new Palindrom({
                useWebSocket: true,
                remoteUrl,
                onStateReset: function(obj) {
                    tempObj = obj;
                },
                onPatchReceived,
                onPatchSent
            });

            /* wait for HTTP */
            await sleep(50);

            expect(onPatchReceived).not.to.be.called;
            
            /* onPatchSent, should be called now, for the initial request */
            expect(onPatchSent).to.be.calledOnce;
            
            tempObj.hello = 'onPatchSent callback';
            
            expect(onPatchSent).to.be.calledTwice;
            expect(onPatchSent).to.be.calledWithExactly(JSON.stringify([
                {
                    op: 'replace',
                    path: '/hello',
                    value: 'onPatchSent callback'
                }
            ]), remoteUrl.replace(/^http/, 'ws'), 'WS');
            // wait for async mock-socket callbacks execution
            await sleep();
            expect(socketMessageSpy).to.be.calledOnceWithExactly(JSON.stringify([
                    {
                        op: 'replace',
                        path: '/hello',
                        value: 'onPatchSent callback'
                    }
            ]));

            expect(onPatchReceived).to.be.calledOnce;
            expect(onPatchReceived).to.be.calledOnceWithExactly([
                {
                    op: 'replace',
                    path: '/hello',
                    value: 'onPatchReceived callback'
                }
            ], remoteUrl.replace(/^http/, 'ws'), 'WS');
        });
        it('should call onPatchReceived even if the patch was bad', async () => {
            mockSocketServer.on('connection', socket => {
                /* prepare response */
                socket.on('message', function(){
                    socketMessageSpy(...arguments);
                    /* respond */
                    socket.send(
                        '[{"op":"replace", "path":"/hello", "value":' +
                            (Number.MAX_SAFE_INTEGER + 1) +
                            '}]'
                    );
                });
            });
    
            let tempObj;
    
            palindrom = new Palindrom({
                remoteUrl: remoteUrl,
                onStateReset: function(obj) {
                    tempObj = obj;
                },
                useWebSocket: true,
                onPatchReceived
            });
    
            /* wait for HTTP */
            await sleep(50);
    
            expect(onPatchReceived).not.to.be.called;
    
            /* issue a change */
            tempObj.hello = 'onPatchSent callback';
            // wait for async mock-socket callbacks execution
            await sleep();
            expect(socketMessageSpy).to.be.calledOnceWithExactly(JSON.stringify([
                    {
                        op: 'replace',
                        path: '/hello',
                        value: 'onPatchSent callback'
                    }
            ]));
    
    
            expect(onPatchReceived).to.be.calledOnce;
            expect(onPatchReceived).to.be.calledOnceWithExactly([
                {
                    op: 'replace',
                    path: '/hello',
                    value: 9007199254740992
                }
            ], remoteUrl.replace(/^http/, 'ws'), 'WS');
        });
    });

});
