import Palindrom from '../../src/palindrom';
import assert from 'assert';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { sleep, getTestURL } from '../utils';

describe('Callbacks', () => {
    beforeEach(() => {
        fetchMock.mock(getTestURL('testURL'), {
            status: 200,
            body: '{"hello": "world"}'
        });
    });
    afterEach(function() {
        fetchMock.restore();
    });

    it('should call onLocalChange callback for outgoing patches', async () => {
        const sentSpy = sinon.spy();
        let tempObj;

        new Palindrom({
            remoteUrl: getTestURL('testURL'),
            onLocalChange: sentSpy,
            onStateReset: function(obj) {
                tempObj = obj;
            }
        });
       
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
        let stateWasReset = false;
        const palindrom = new Palindrom({
            remoteUrl: getTestURL('testURL'),
            onStateReset: () => (stateWasReset = true)
        });

        await sleep();
        assert.equal(stateWasReset, true, 'stateWasReset should be called');
    });
});
