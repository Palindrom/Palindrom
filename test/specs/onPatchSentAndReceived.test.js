import { Server as MockSocketServer } from 'mock-socket';
import Palindrom from '../../src/palindrom';
import assert from 'assert';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { sleep, getTestURL } from '../utils';

describe('Callbacks, onPatchSent and onPatchReceived', () => {
    describe('XHR', function() {
        it('should dispatch patch-sent and patch-received events when a patch is sent and received', async () => {
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                body: '{"hello": "world"}'
            });

            const onPatchReceived = sinon.spy();
            const onPatchSent = sinon.spy();
            let tempObj;
            
            const palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL')
            });
            

            palindrom.addEventListener('state-reset', ev => {
                tempObj = ev.detail;
            });

            palindrom.addEventListener('patch-received', ev => {
                onPatchReceived(ev.detail.data);
            });

            palindrom.addEventListener('patch-sent', ev => {
                onPatchSent(ev.detail.data);
            });

            await sleep(10);

            /* onPatchReceived, shouldn't be called now */
            assert(
                onPatchReceived.notCalled,
                'onPatchReceived should not be called'
            );

            /* onPatchSent, shouldnt be called now, the initial request doesnt count since you can't addEventLister before it occurs */
            assert(onPatchSent.notCalled, 'onPatchSent should not be called');

            fetchMock.restore();
            
            /* prepare response */
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                body:
                    '[{"op":"replace", "path":"/hello", "value":"onPatchReceived callback"}]'
            });

            /* issue a change */
            tempObj.hello = 'onPatchSent callback';

            assert(onPatchSent.calledOnce);

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
        it('HTTP - should dispatch patch-received event even if the patch was bad', async () => {
            const onPatchReceived = sinon.spy();
            let tempObj;

            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                body: '{"hello": "world"}'
            });

            const palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL')
            });

            palindrom.addEventListener('state-reset', ev => {
                tempObj = ev.detail;
            });

            palindrom.addEventListener('patch-received', ev => {
                onPatchReceived(ev.detail);
            });

            await sleep();

            assert.equal(onPatchReceived.callCount, 0, `onPatchReceived shouldn't be called now`);

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

            assert.equal(onPatchReceived.callCount, 1, `onPatchReceived should be called once now`);
            fetchMock.restore();
        });
    });

    describe('WebSockets', function() {
        it('should dispatch patch-sent and dispatch patch-received events when a patch is sent and received', async () => {
            const server = new MockSocketServer(
                getTestURL('testURL', false, true)
            );

            /* prepare response */
            server.on('message', patches => {
                /* make sure a correct patch is sent to server */
                assert.deepEqual(JSON.parse(patches), [
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

            const palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL'),
                useWebSocket: true
            });

            palindrom.addEventListener('state-reset', ev => {
                tempObj = ev.detail;
            });

            palindrom.addEventListener('patch-received', ev => {
                onPatchReceived(ev.detail.data);
            });

            palindrom.addEventListener('patch-sent', ev => {
                onPatchSent(ev.detail.data);
            });

            /* wait for XHR */
            await sleep(30);

            assert.equal(
                onPatchReceived.callCount,
                0,
                `onPatchReceived shouldn't be called now`
            );

            /* onPatchSent, shouldnt be called now, the initial request doesnt count since you can't addEventLister before it occurs */
            assert.equal(
                onPatchSent.callCount,
                0,
                `onPatchSent shouldn't be called now`
            );

            tempObj.hello = 'onPatchSent callback';

            assert.equal(
                onPatchSent.callCount,
                1,
                'onPatchSent should be called once'
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

    it('WebSocket - should dispatch patch-received event even if the patch was bad', async () => {
        const server = new MockSocketServer(
            getTestURL('testURL', false, true)
        );
        /* prepare response */
        server.on('message', patches => {
            /* make sure a correct patch is sent to server */
            assert.deepEqual(JSON.parse(patches), [
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

        const palindrom = new Palindrom({
            remoteUrl: getTestURL('testURL'),
            useWebSocket: true
        });

        palindrom.addEventListener('state-reset', ev => {
            tempObj = ev.detail;
        });

        palindrom.addEventListener('patch-received', ev => {
            onPatchReceived(ev.detail);
        });
        
        /* wait for XHR */
        await sleep(10);
        
        assert.equal(onPatchReceived.callCount, 0, `onPatchReceived shouldn't be called now`);

        /* issue a change */
        tempObj.hello = 'onPatchSent callback';

        await sleep();

        assert.equal(onPatchReceived.callCount, 1, `onPatchReceived should be called once now`);
        server.stop();
        fetchMock.restore();
    });
});
