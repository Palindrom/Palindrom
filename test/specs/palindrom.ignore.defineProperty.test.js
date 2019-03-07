import Palindrom from '../../src/palindrom';
import fetchMock from 'fetch-mock';
import assert from 'assert';
import { sleep, getTestURL } from '../utils';

describe('Palindrom', () => {
    describe('#ignore by defineProperty', () => {
        it('Should not send patches for non-enumerable properties', async () => {
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                location: 'http://localhost/testURL/patch-server',
                headers: { contentType: 'application/json' },
                body: '{"hello": "world"}'
            });
            const palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL')
            });
            let obj;
            palindrom.addEventListener('state-reset', ev => {
                obj = ev.detail;
            });
            await sleep();
            assert(fetchMock.calls().length === 1);
            // a change that emits a patch
            obj.newProp = 'name';

            // wait for ajax
            await sleep();
            assert(fetchMock.calls().length === 2);

            // a change that does not emit
            Object.defineProperty(obj, 'ignored', {
                enumerable: false,
                value: {
                    child: 1
                }
            });

            // a change that does not emit
            obj.ignored.child = 2;

            // wait for ajax
            await sleep();
            // no further requests
            assert(fetchMock.calls().length === 2);
            
            fetchMock.restore();
        });
    });
});
