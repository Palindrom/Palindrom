import Palindrom from '../../src/palindrom';
import { PalindromError } from '../../src/palindrom-errors';
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
            it('should NOT dispatch connection-error event on HTTP 400 response, containing JSON', async () => {
                const spy = sinon.spy();

                fetchMock.mock(getTestURL('testURL'), {
                    status: 400,
                    body: '{"hello": "world"}'
                });

                const palindrom = new Palindrom({
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

                const palindrom = new Palindrom({
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

                new Palindrom({
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

                new Palindrom({
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

                new Palindrom({
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

                const palindrom = new Palindrom({
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

                const palindrom = new Palindrom({
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

                const palindrom = new Palindrom({
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
            it('Initial HTTP response: out of range numbers should call onIncomingPatchValidationError event with a RangeError', async () => {
                fetchMock.mock(getTestURL('testURL'), {
                    status: 200,
                    body: `{"value": ${Number.MAX_SAFE_INTEGER + 1}}`
                });
                const spy = sinon.spy();
                const palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    onIncomingPatchValidationError: spy
                });

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
            it('Outgoing HTTP patch: out of range numbers should call onOutgoingPatchValidationError event with a RangeError', async () => {
                fetchMock.mock(getTestURL('testURL-range'), {
                    status: 200,
                    body: `{"val": 1}`
                });

                const spy = sinon.spy();

                new Palindrom({
                    remoteUrl: getTestURL('testURL-range'),
                    onStateReset: obj =>
                        obj.val = Number.MAX_SAFE_INTEGER + 1
                    ,
                    onOutgoingPatchValidationError: spy
                });

                await sleep(20);

                assert(spy.calledOnce, `Expected \`onOutgoingPatchValidationError\` to be called once, but was called ${spy.callCount} times`);

                const errorPassed = spy.getCall(0).args[0];

                assert(errorPassed instanceof RangeError);

                assert.equal(
                    errorPassed.message,
                    `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${Number.MAX_SAFE_INTEGER +
                        1}, variable path is: /val`
                );
            });
            it('Outgoing socket patch: out of range numbers should call onOutgoingPatchValidationError event with a RangeError', async () => {
                const server = new MockSocketServer(getTestURL('testURL', false, true));

                fetchMock.mock(getTestURL('testURL'), {
                    status: 200,
                    body: '{"val": 100}'
                });

                var spy = sinon.spy();

                var palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    useWebSocket: true,
                    onOutgoingPatchValidationError: spy,
                    onStateReset: obj => obj.val = Number.MAX_SAFE_INTEGER + 1,
                });

                await sleep();

                // make sure WS is up
                assert.equal(palindrom.network._ws.readyState, 1);

                assert(spy.calledOnce);

                const errorPassed = spy.getCall(0).args[0];

                assert(errorPassed instanceof RangeError);

                assert.equal(
                    errorPassed.message,
                    `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${Number.MAX_SAFE_INTEGER + 1}, variable path is: /val`
                );

                server.stop();
            });
            it('Incoming socket patch: out of range numbers should call onIncomingPatchValidationError event with a RangeError', async () => {
                const server = new MockSocketServer(getTestURL('testURL', false, true));

                fetchMock.mock(getTestURL('testURL'), {
                    status: 200,
                    body: '{"val": 100}'
                });

                var spy = sinon.spy();

                new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    useWebSocket: true,
                    onIncomingPatchValidationError: spy
                });

                await sleep();
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
