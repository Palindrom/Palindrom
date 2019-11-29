import { Palindrom } from '../../src/palindrom.js';
import chai from 'chai';
const { assert } = chai;
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { sleep, getTestURL } from '../utils/index.js';

describe('Callbacks', () => {
    let palindrom;
    beforeEach(() => {
        fetchMock.mock(getTestURL('testURL'), {
            status: 200,
            body: '{"hello": "world"}'
        });
    });
    afterEach(function() {
        fetchMock.restore();
        // stop all networking and DOM activity of abandoned instance
        palindrom.stop();
    });

    it('should call onLocalChange callback for an outgoing patch', async () => {
        const sentSpy = sinon.spy();
        let tempObj;

        palindrom = new Palindrom({
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

    it('should call onStateReset callback for an applied patch on root (initial state)', async () => {
        let stateWasReset = false;
        palindrom = new Palindrom({
            remoteUrl: getTestURL('testURL'),
            onStateReset: () => (stateWasReset = true)
        });

        await sleep();
        assert.equal(stateWasReset, true, 'stateWasReset should be called');
    });
});
