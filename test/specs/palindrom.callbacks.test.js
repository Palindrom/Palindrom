import Palindrom from '../../src/palindrom';
import assert from 'assert';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { sleep } from '../utils';

describe('Callbacks', () => {
    beforeEach(() => {
        
    });
    afterEach(function() {
        fetchMock.restore();
    });

    it('should dispatch local-change event for outgoing patches', async () => {
        debugger

        fetchMock.mock('http://house.of.cards/testURL', {
            status: 200,
            headers: { Location: 'http://house.of.cards/testURL' },
            body: '{"hello": "world"}'
        });

        const sentSpy = sinon.spy();
        let tempObj;

        const palindrom = new Palindrom({
            remoteUrl: 'http://house.of.cards/testURL'
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
        fetchMock.mock('http://house.of.cards/testURL', {
            status: 200,
            headers: { Location: 'http://house.of.cards/testURL' },
            body: '{"hello": "world"}'
        });

        const palindrom = new Palindrom({
            remoteUrl: 'http://house.of.cards/testURL'
        });
        let stateWasReset = false;
        palindrom.addEventListener('state-reset', ev => {
            stateWasReset = true;
        });
        await sleep(30);
        assert.equal(stateWasReset, true, 'stateWasReset should be called');
    });
});
