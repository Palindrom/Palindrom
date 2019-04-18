import Palindrom from '../../src/palindrom';
import assert from 'assert';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { Server as MockSocketServer } from 'mock-socket';
import { sleep, getTestURL } from '../utils';

describe('Palindrom', () => {
    describe('#error responses', () => {
        beforeEach(() => {
            
        });
        afterEach(() => {
            fetchMock.restore();
        });
        context('Network', function() {
            it('should not dispatch connection-error event on HTTP 400 response (non-patch responses)', async () => {
                const spy = sinon.spy();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 400,
                    body: '{"hello": "world"}'
                });

                const palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL')
                });

                palindrom.addEventListener('connection-error', ev => {
                    spy(ev.detail);
                });

                /* connection-error should be dispatched once now */
                await sleep(50);
                
                assert.equal(spy.callCount, 0);
            });

            it('should dispatch connection-error event on HTTP 599 response', async () => {
                const spy = sinon.spy();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 599,
                    headers: { contentType: 'application/json' },
                    body: '{"hello": "world"}'
                });

                const palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL')
                });

                palindrom.addEventListener('connection-error', ev => {
                    spy(ev.detail);
                });

                /* onConnectionError should be called once now */
                await sleep(50);
                assert(spy.calledOnce);
            });

            it('should dispatch connection-error event on HTTP 500 response (patch)', async () => {
                const spy = sinon.spy();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 200,
                    headers: { contentType: 'application/json' },
                    body: '{"hello": "world"}'
                });

                const palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL')
                });

                palindrom.addEventListener('connection-error', ev => {
                    spy(ev.detail);
                });

                fetchMock.restore();

                await sleep();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 509,
                    headers: { contentType: 'application/json' },
                    body: `[{"op": "replace", "path": "/", "value": "Custom message"}]`
                });

                //issue a patch
                palindrom.obj.hello = 'galaxy';

                await sleep();

                assert.equal(spy.callCount, 1, 'onConnectionError should be called once now');
                fetchMock.restore();
            });

            it('should NOT call onConnectionError on HTTP 400 response (patch)', async () => {
                const spy = sinon.spy();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 200,
                    headers: { contentType: 'application/json' },
                    body: '{"hello": "world"}'
                });

                const palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL')
                });

                palindrom.addEventListener('connection-error', ev => {
                    spy(ev.detail);
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
            it('should dispatch connection-error event on HTTP 599 response (patch)', async () => {
                const spy = sinon.spy();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 200,
                    headers: { contentType: 'application/json' },
                    body: '{"hello": "world"}'
                });

                const palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL')
                });

                palindrom.addEventListener('connection-error', ev => {
                    spy(ev.detail);
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
            it('Initial HTTP response: out of range numbers should dispatch incoming-patch-validation-error event with a RangeError', async () => {
                fetchMock.mock(getTestURL('testURL'), {
                    status: 200,
                    body: `{"value": ${Number.MAX_SAFE_INTEGER + 1}}`
                });
                const spy = sinon.spy();
                const palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    onIncomingPatchValidationError: spy
                });

                palindrom.addEventListener(
                    'incoming-patch-validation-error',
                    ev => {
                        spy(ev.detail);
                    }
                );

                await sleep();
                assert(spy.calledOnce);
                const errorPassed = spy.getCall(0).args[0];
                assert(errorPassed instanceof RangeError);
                assert.equal(
                    errorPassed.message,
                    `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${Number.MAX_SAFE_INTEGER +
                        1}, variable path is: /value`
                );
            });
            it('Outgoing HTTP patches: out of range numbers should dispatch outgoing-patch-validation-error event with a RangeError', async () => {
                fetchMock.mock(getTestURL('testURL'), {
                    status: 200,
                    body: `{"val": 1}`
                });

                const spy = sinon.spy();

                const palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL')
                });

                palindrom.addEventListener('state-reset', ev => {
                    ev.detail.val = Number.MAX_SAFE_INTEGER + 1;
                });

                palindrom.addEventListener(
                    'outgoing-patch-validation-error',
                    ev => {
                        spy(ev.detail);
                    }
                );

                await sleep();
                assert(spy.calledOnce);
                const errorPassed = spy.getCall(0).args[0];
                assert(errorPassed instanceof RangeError);
                assert.equal(
                    errorPassed.message,
                    `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${Number.MAX_SAFE_INTEGER +
                        1}, variable path is: /val`
                );
            });
            it('Outgoing socket patches: out of range numbers should dispatch outgoing-patch-validation-error event with a RangeError', async () => {
                const server = new MockSocketServer(getTestURL('testURL', false, true));

                fetchMock.mock(getTestURL('testURL'), {
                    status: 200,
                    body: '{"val": 100}'
                });

                var spy = sinon.spy();

                var palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    useWebSocket: true
                });

                palindrom.addEventListener(
                    'outgoing-patch-validation-error',
                    ev => {
                        spy(ev.detail);
                    }
                );

                await sleep(30);
                palindrom.obj.value = Number.MAX_SAFE_INTEGER + 1;
                // make sure WS is up
                assert.equal(palindrom.network._ws.readyState, 1);
                assert(spy.calledOnce);
                const errorPassed = spy.getCall(0).args[0];
                assert(errorPassed instanceof RangeError);
                assert.equal(
                    errorPassed.message,
                    `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${Number.MAX_SAFE_INTEGER +
                        1}, variable path is: /value`
                );
                server.stop();
            });
            it('Incoming socket patches: out of range numbers should dispatch incoming-patch-validation-error event with a RangeError', async () => {
                const server = new MockSocketServer(getTestURL('testURL', false, true));

                fetchMock.mock(getTestURL('testURL'), {
                    status: 200,
                    body: '{"val": 100}'
                });

                var spy = sinon.spy();

                var palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    useWebSocket: true
                });

                palindrom.addEventListener(
                    'incoming-patch-validation-error',
                    ev => {
                        spy(ev.detail);
                    }
                );

                await sleep(30);
                server.send(
                    `[{"op": "replace", "path": "/val", "value": ${Number.MAX_SAFE_INTEGER +
                        1}}]`
                );
                assert(spy.calledOnce);
                const errorPassed = spy.getCall(0).args[0];
                assert(errorPassed instanceof RangeError);
                assert.equal(
                    errorPassed.message,
                    `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${Number.MAX_SAFE_INTEGER +
                        1}, variable path is: /val`
                );
                server.stop();
            });
        });
    });
});
