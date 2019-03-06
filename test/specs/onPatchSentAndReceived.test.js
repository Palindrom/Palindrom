import { Server as MockSocketServer } from 'mock-socket';
import Palindrom from '../../src/palindrom';
import assert from 'assert';
import moxios from 'moxios';
import sinon from 'sinon';
import { sleep } from '../utils';

describe('Callbacks, onPatchSent and onPatchReceived', () => {
    beforeEach(() => {
        moxios.install();
    });
    afterEach(() => {
        moxios.uninstall();
    });

    describe('XHR', function() {
        it('should dispatch patch-sent and patch-received events when a patch is sent and received', async () => {
            moxios.stubRequest('http://house.of.cards/testURL', {
                status: 200,
                headers: { location: 'http://house.of.cards/testURL2' },
                responseText: '{"hello": "world"}'
            });

            const onPatchReceived = sinon.spy();
            const onPatchSent = sinon.spy();
            let tempObj;

            const palindrom = new Palindrom({
                remoteUrl: 'http://house.of.cards/testURL'
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

            await sleep();

            /* onPatchReceived, shouldn't be called now */
            assert(
                onPatchReceived.notCalled,
                'onPatchReceived should not be called'
            );

            /* onPatchSent, shouldnt be called now, the initial request doesnt count since you can't addEventLister before it occurs */
            assert(onPatchSent.notCalled, 'onPatchSent should not be called');

            /* prepare response */
            moxios.stubRequest('http://house.of.cards/testURL2', {
                status: 200,
                headers: { Location: 'http://house.of.cards/testURL' },
                responseText:
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
        });
        it('should dispatch patch-received event even if the patch was bad', async () => {
            moxios.stubRequest('http://house.of.cards/testURL', {
                status: 200,
                headers: { location: 'http://house.of.cards/testURL2' },
                responseText: '{"hello": "world"}'
            });

            const onPatchReceived = sinon.spy();
            let tempObj;

            const palindrom = new Palindrom({
                remoteUrl: 'http://house.of.cards/testURL'
            });

            palindrom.addEventListener('state-reset', ev => {
                tempObj = ev.detail;
            });

            palindrom.addEventListener('patch-received', ev => {
                onPatchReceived(ev.detail);
            });

            await sleep();
            /* onPatchReceived, shouldn't be called now */
            assert(onPatchReceived.notCalled);

            /* prepare response */
            moxios.stubRequest('http://house.of.cards/testURL2', {
                status: 200,
                headers: { Location: 'http://house.of.cards/testURL' },
                responseText:
                    '[{"op":"replace", "path":"/hello", "value":' +
                    (Number.MAX_SAFE_INTEGER + 1) +
                    '}]'
            });

            /* issue a change */
            tempObj.hello = 'onPatchSent callback';

            /* wait for XHR */
            await sleep();
            assert(onPatchReceived.calledOnce);
        });
    });

    describe('WebSockets', function() {
        it('should dispatch patch-sent and dispatch patch-received events when a patch is sent and received', async () => {
            const server = new MockSocketServer(
                'ws://house.of.cards/default/this_is_a_nice_url'
            );

            moxios.stubRequest('http://house.of.cards/testURL', {
                status: 200,
                headers: { location: '/default/this_is_a_nice_url' },
                responseText: '{"hello": "world"}'
            });

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

            const palindrom = new Palindrom({
                remoteUrl: 'http://house.of.cards/testURL',
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
        });
    });

    it('should dispatch patch-received event even if the patch was bad', async () => {
        const server = new MockSocketServer(
            'ws://house.of.cards/default/this_is_a_nice_url'
        );

        moxios.stubRequest('http://house.of.cards/testURL', {
            status: 200,
            headers: { location: '/default/this_is_a_nice_url' },
            responseText: '{"hello": "world"}'
        });

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

        const onPatchReceived = sinon.spy();
        let tempObj;

        const palindrom = new Palindrom({
            remoteUrl: 'http://house.of.cards/testURL',
            useWebSocket: true
        });

        palindrom.addEventListener('state-reset', ev => {
            tempObj = ev.detail;
        });

        palindrom.addEventListener('patch-received', ev => {
            onPatchReceived(ev.detail);
        });

        await sleep(30);
        /* onPatchReceived, shouldn't be called now */
        assert(onPatchReceived.notCalled);

        /* issue a change */
        tempObj.hello = 'onPatchSent callback';

        /* wait for XHR */
        await sleep(30);
        assert(onPatchReceived.calledOnce);
        server.stop();
    });
});
