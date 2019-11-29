import { Palindrom } from '../../src/palindrom.js';
import fetchMock from 'fetch-mock';
import chai from 'chai';
const { assert } = chai;
import { sleep, getTestURL } from '../utils/index.js';

describe('Palindrom', () => {
    describe('#ignore by defineProperty', () => {
        it('Should not send a patch for non-enumerable properties', async () => {
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                location: 'http://localhost/testURL/patch-server',
                headers: { contentType: 'application/json' },
                body: '{"hello": "world"}'
            });
            let tempObj;
            const palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL'),
                onStateReset: obj => (tempObj = obj)
            });

            await sleep();
            assert(fetchMock.calls().length === 1);
            // a change that emits a patch
            tempObj.newProp = 'name';

            // wait for ajax
            await sleep();
            assert(fetchMock.calls().length === 2);

            // a change that does not emit
            Object.defineProperty(tempObj, 'ignored', {
                enumerable: false,
                value: {
                    child: 1
                }
            });

            // a change that does not emit
            tempObj.ignored.child = 2;

            // wait for ajax
            await sleep();
            // no further requests
            assert(fetchMock.calls().length === 2);

            fetchMock.restore();
            // stop all networking and DOM activity of abandoned instance
            palindrom.stop();
        });
    });
});
