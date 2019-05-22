import { Server as MockSocketServer } from 'mock-socket';
import Palindrom from '../../src/palindrom';
import assert from 'assert';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { sleep, getTestURL } from '../utils';

describe('Callbacks, onPatchSent and onPatchReceived', () => {
    describe('XHR', function() {
        it('should call onPatchSent and onPatchReceived callbacks when a patch is sent and received', async () => {
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                body: '{"hello": "world"}'
            });

            const onPatchReceived = sinon.spy();
            const onPatchSent = sinon.spy();
            let tempObj;

            new Palindrom({
                remoteUrl: getTestURL('testURL'),
                onStateReset: function(obj) {
                    tempObj = obj;
                },
                onPatchReceived,
                onPatchSent
            });

            await sleep(10);

            /* onPatchReceived, shouldn't be called now */
            assert(
                onPatchReceived.notCalled,
                'onPatchReceived should not be called'
            );

            /* onPatchSent, should be called now, the initial request  */
            assert(onPatchSent.calledOnce, 'onPatchSent should be calledOnce');

            fetchMock.restore();

            /* prepare response */
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                body:
                    '[{"op":"replace", "path":"/hello", "value":"onPatchReceived callback"}]'
            });

            /* issue a change */
            tempObj.hello = 'onPatchSent callback';

            assert(onPatchSent.calledTwice);

            /* wait for XHR */
            await sleep();
            assert(onPatchReceived.calledOnce);

            assert.deepEqual(onPatchReceived.lastCall.args[0], [
                {
                    op: 'replace',
                    path: '/hello',
                    value: 'onPatchReceived callback'
                }
            ]);

            fetchMock.restore();
        });
        it('should call onPatchReceived even if the patch was bad', async () => {
            const onPatchReceived = sinon.spy();
            let tempObj;

            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                body: '{"hello": "world"}'
            });

            new Palindrom({
                remoteUrl: getTestURL('testURL'),
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
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                body:
                    '[{"op":"replace", "path":"/hello", "value":' +
                    (Number.MAX_SAFE_INTEGER + 1) +
                    '}]'
            });

            /* issue a change */
            tempObj.hello = 'onPatchSent callback';

            /* wait for XHR */
            await sleep(10);

            assert.equal(
                onPatchReceived.callCount,
                1,
                `onPatchReceived should be called once now`
            );
            fetchMock.restore();
        });
    });

    describe('WebSockets', function() {
        it('should call onPatchSent and onPatchReceived callbacks when a patch is sent and received', async () => {
            const server = new MockSocketServer(
                getTestURL('testURL', false, true)
            );

            /* prepare response */
            server.on('message', patch => {
                /* make sure a correct patch is sent to server */
                assert.deepEqual(JSON.parse(patch), [
                    {
                        op: 'replace',
                        path: '/hello',
                        value: 'onPatchSent callback'
                    }
                ]);
                /* respond */
                server.send(
                    '[{"op":"replace", "path":"/hello", "value":"onPatchReceived callback"}]'
                );
            });

            const onPatchReceived = sinon.spy();
            const onPatchSent = sinon.spy();
            let tempObj;

            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                body: '{"hello": "world"}'
            });

            new Palindrom({
                useWebSocket: true,
                remoteUrl: getTestURL('testURL'),
                onStateReset: function(obj) {
                    tempObj = obj;
                },
                onPatchReceived,
                onPatchSent
            });

            /* wait for XHR */
            await sleep();

            assert.equal(
                onPatchReceived.callCount,
                0,
                `onPatchReceived shouldn't be called now`
            );

            /* onPatchSent, should be called now, for the initial request */
            assert.equal(
                onPatchSent.callCount,
                1,
                `onPatchSent should be called once`
            );

            tempObj.hello = 'onPatchSent callback';

            assert.equal(
                onPatchSent.callCount,
                2,
                'onPatchSent should be called twice'
            );

            await sleep(10);

            assert.equal(
                onPatchReceived.callCount,
                1,
                'onPatchReceived should be called once'
            );


            assert.deepEqual(onPatchReceived.lastCall.args[0], [
                {
                    op: 'replace',
                    path: '/hello',
                    value: 'onPatchReceived callback'
                }
            ]);
            server.stop();
            fetchMock.restore();
        });
    });

    it('WebSocket - should call onPatchReceived even if the patch was bad', async () => {
        const server = new MockSocketServer(getTestURL('testURL', false, true));
        /* prepare response */
        server.on('message', patch => {
            /* make sure a correct patch is sent to server */
            assert.deepEqual(JSON.parse(patch), [
                { op: 'replace', path: '/hello', value: 'onPatchSent callback' }
            ]);

            /* respond */
            server.send(
                '[{"op":"replace", "path":"/hello", "value":' +
                    (Number.MAX_SAFE_INTEGER + 1) +
                    '}]'
            );
        });

        fetchMock.mock(getTestURL('testURL'), {
            status: 200,
            body: '{"hello": "Obj"}'
        });

        const onPatchReceived = sinon.spy();
        let tempObj;

        new Palindrom({
            remoteUrl: getTestURL('testURL'),
            onStateReset: function(obj) {
                tempObj = obj;
            },
            useWebSocket: true,
            onPatchReceived
        });

        /* wait for XHR */
        await sleep(10);

        assert.equal(
            onPatchReceived.callCount,
            0,
            `onPatchReceived shouldn't be called now`
        );

        /* issue a change */
        tempObj.hello = 'onPatchSent callback';

        await sleep();

        assert.equal(
            onPatchReceived.callCount,
            1,
            `onPatchReceived should be called once now`
        );
        server.stop();
        fetchMock.restore();
    });
});
