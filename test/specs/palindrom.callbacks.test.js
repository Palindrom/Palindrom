import Palindrom from '../../src/palindrom';
import assert from 'assert';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { sleep, getTestURL } from '../utils';

describe('Callbacks', () => {
    beforeEach(() => {
        fetchMock.mock(getTestURL('testURL'), {
            status: 200,
            headers: { Location: getTestURL('testURL') },
            body: '{"hello": "world"}'
        });
    });
    afterEach(function() {
        fetchMock.restore();
    });

    it('should dispatch local-change event for outgoing patches', async () => {
        const sentSpy = sinon.spy();
        let tempObj;

        const palindrom = new Palindrom({
            remoteUrl: getTestURL('testURL')
        });
        palindrom.addEventListener('state-reset', ev => (tempObj = ev.detail));
        palindrom.addEventListener('local-change', ev => sentSpy(ev.detail));

        await sleep();
        /* onLocalChange shouldn't be called now */
        assert(sentSpy.notCalled);

        /* issue a change */
        tempObj.hello = 'onLocalChange callback';

        assert(sentSpy.calledOnce);
        assert.deepEqual(sentSpy.lastCall.args[0], [
            { op: 'replace', path: '/hello', value: 'onLocalChange callback' }
        ]);
    });

    it('should dispatch state-reset event for applied patches on root (initial state)', async () => {
        const palindrom = new Palindrom({
            remoteUrl: getTestURL('testURL')
        });
        let stateWasReset = false;
        palindrom.addEventListener('state-reset', ev => {
            stateWasReset = true;
        });
        await sleep(30);
        assert.equal(stateWasReset, true, 'stateWasReset should be called');
    });
});
