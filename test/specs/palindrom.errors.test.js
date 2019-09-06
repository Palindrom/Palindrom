import { Palindrom } from '../../src/palindrom.js';
import { PalindromError } from '../../src/palindrom-errors.js';
import assert from 'assert';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { Server as MockSocketServer } from 'mock-socket';
import { sleep, getTestURL } from '../utils/index.js';

describe('Palindrom', () => {
    let palindrom;
    afterEach(() => {
        fetchMock.restore();
        // stop all networking and DOM activity of abandoned instance
        palindrom.stop();
    });
    describe('#error responses', () => {
        context('Network', function() {
            it('should NOT dispatch connection-error event on HTTP 400 response, containing JSON', async () => {
                const spy = sinon.spy();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 400,
                    body: '{"hello": "world"}'
                });

                palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    onConnectionError: spy
                });

                await sleep(200);

                assert.equal(spy.callCount, 0);
            });

            it('should dispatch connection-error event on HTTP 400 response, without JSON', async () => {
                const spy = sinon.spy();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 400,
                    body: 'Bad Request'
                });

                palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    onConnectionError: spy
                });

                /* connection-error should be dispatched once now */
                await sleep(50);

                assert.equal(spy.callCount, 1);
            });

            it('should call onConnectionError event on HTTP 599 response, containing JSON', async () => {
                const spy = sinon.spy();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 599,
                    body: '{"hello": "world"}'
                });

                palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    onConnectionError: spy
                });

                /* onConnectionError should be called once now */
                await sleep(50);
                assert(spy.calledOnce);
            });

            it('should call onConnectionError event on HTTP 599 response, without JSON', async () => {
                const spy = sinon.spy();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 599,
                    body: 'Server Error'
                });

                palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    onConnectionError: spy
                });

                /* onConnectionError should be called once now */
                await sleep(50);
                assert(spy.calledOnce);
            });

            it('should call onError with a clear message about errors inside onStateReset', async function() {
                const spy = sinon.spy();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 200,
                    headers: { contentType: 'application/json' },
                    body: '{"hello": "world"}'
                });

                palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    onStateReset: () => { throw new Error(); },
                    onError: spy
                });

                await sleep(50);

                assert(spy.calledOnce, 'Expected `onError` to be called once');

                const errorPassed = spy.getCall(0).args[0];
                assert(errorPassed instanceof PalindromError, 'Passed argument should be `PalindromError`');
                assert(errorPassed.message.includes(`Error inside onStateReset callback:`), 'Error Message should include `Error inside onStateReset callback:`')
            });


            it('should call onConnectionError event on HTTP 500 response (patch)', async () => {
                const spy = sinon.spy();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 200,
                    headers: { contentType: 'application/json' },
                    body: '{"hello": "world"}'
                });

                palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    onConnectionError: spy
                });

                fetchMock.restore();

                await sleep();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 500,
                    headers: { contentType: 'application/json' },
                    body: `[{"op": "replace", "path": "/", "value": "Custom message"}]`
                });

                //issue a patch
                palindrom.obj.hello = 'galaxy';

                await sleep();

                assert.equal(spy.callCount, 1, 'onConnectionError should be called once now');
            });

            it('should NOT call onConnectionError on HTTP 400 response (patch)', async () => {
                const spy = sinon.spy();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 200,
                    headers: { contentType: 'application/json' },
                    body: '{"hello": "world"}'
                });

                palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    onConnectionError: spy
                });

                fetchMock.restore();

                // let Palindrom issue a request
                await sleep();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 400,
                    headers: { contentType: 'application/json-patch+json' },
                    body: `{"op": "replace", "path": "/", "value": "Custom message"}`
                });

                //issue a patch
                palindrom.obj.hello = 'galaxy';

                await sleep(10);

                assert.equal(spy.callCount, 0, 'onConnectionError should NOT be called now');
            });
            it('should call onConnectionError event on HTTP 599 response (patch)', async () => {
                const spy = sinon.spy();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 200,
                    headers: { contentType: 'application/json' },
                    body: '{"hello": "world"}'
                });

                palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    onConnectionError: spy
                });

                await sleep(10);

                fetchMock.restore();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 599,
                    headers: { contentType: 'application/json-patch+json' },
                    body: `[{"op": "replace", "path": "/", "value": "Custom message"}]`
                });

                //issue a patch
                palindrom.obj.hello = 'galaxy';

                await sleep(10);

                /* onConnectionError should be called once now */
                assert(spy.calledOnce);
            });
        });
        context('Numbers Validation', function() {
            const remoteUrl = getTestURL('testURL');
            beforeEach(() => {
                fetchMock.mock(remoteUrl, {
                    status: 200,
                    body: `{"amount": ${Number.MAX_SAFE_INTEGER + 1}}`
                });
            });
            afterEach(() => {
                fetchMock.restore();
            });
            context('HTTP', () => {
                it('Initial response: out of range numbers should call onIncomingPatchValidationError event with a RangeError', async () => {
                    const onIncomingPatchValidationError = sinon.spy().named('onIncomingPatchValidationError');
                    palindrom = new Palindrom({
                        remoteUrl,
                        onIncomingPatchValidationError
                    });
    
                    await sleep();
                    assert(onIncomingPatchValidationError.calledOnce);
                    const errorPassed = onIncomingPatchValidationError.getCall(0).args[0];
                    assert(errorPassed instanceof RangeError);
                    assert.equal(
                        errorPassed.message,
                        `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${Number.MAX_SAFE_INTEGER +
                            1}, variable path is: /amount`
                    );
                });
                it('Outgoing patch: out of range numbers should not call onOutgoingPatchValidationError callback', async () => {
                    const onOutgoingPatchValidationError = sinon.spy().named('onOutgoingPatchValidationError');
    
                    palindrom = new Palindrom({
                        remoteUrl,
                        onStateReset: obj =>
                            obj.amount = Number.MAX_SAFE_INTEGER + 1
                        ,
                        onOutgoingPatchValidationError
                    });
    
                    await sleep(20);
    
                    assert(onOutgoingPatchValidationError.notCalled, `Expected \`onOutgoingPatchValidationError\` not to be called, but was called ${onOutgoingPatchValidationError.callCount} times`);
                });
            });
            context('WebSocket', () => {
                let mockSocketServer;
                beforeEach(() => {
                    mockSocketServer = new MockSocketServer(getTestURL('testURL', false, true));
                });
                afterEach(() => {
                    mockSocketServer.stop();
                });
                it('Incoming patch: out of range numbers should call onIncomingPatchValidationError event with a RangeError', async () => {    
                    const onIncomingPatchValidationError = sinon.spy().named('onIncomingPatchValidationError');

                    mockSocketServer.on('connection', socket => {
                        /* prepare response */
                        socket.on('message', function(){
                            // socketMessageSpy(...arguments);
                            /* respond */
                            socket.send(
                                `[{"op": "replace", "path": "/amount", "value": ${Number.MAX_SAFE_INTEGER +
                                    1}}]`
                            );
                        });
                    });
    
                    palindrom = new Palindrom({
                        remoteUrl,
                        useWebSocket: true,
                        onIncomingPatchValidationError
                    });
    
                    await sleep();
                    assert(onIncomingPatchValidationError.calledOnce);
                    const errorPassed = onIncomingPatchValidationError.getCall(0).args[0];
                    assert(errorPassed instanceof RangeError);
                    assert.equal(
                        errorPassed.message,
                        `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${Number.MAX_SAFE_INTEGER +
                            1}, variable path is: /amount`
                    );
                });
                it('Outgoing patch: out of range numbers should not call onOutgoingPatchValidationError callback', async () => {    
                    const onOutgoingPatchValidationError = sinon.spy().named('onOutgoingPatchValidationError');
    
                    palindrom = new Palindrom({
                        remoteUrl,
                        useWebSocket: true,
                        onOutgoingPatchValidationError,
                        onStateReset: obj => obj.amount = Number.MAX_SAFE_INTEGER + 1,
                    });
    
                    await sleep();
    
                    // make sure WS is up
                    assert.equal(palindrom.network._ws.readyState, 1, 'Web Socket should be ready');
    
                    assert(onOutgoingPatchValidationError.notCalled, `Expected \`onOutgoingPatchValidationError\` not to be called, but was called ${onOutgoingPatchValidationError.callCount} times`);
                });
            });
        });
    });
});
