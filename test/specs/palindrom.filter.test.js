import { Palindrom } from '../../src/palindrom.js';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import assert from 'assert';
import { sleep, getTestURL } from '../utils/index.js';

describe('Palindrom', () => {
    let palindrom;
    afterEach(() => {
        fetchMock.restore();
        // stop all networking and DOM activity of abandoned instance
        palindrom.stop();
    });
    describe('#filterLocalChange', () => {
        it('Should use options.filterLocalChange function when local changes occur', async () => {
            const spy = sinon.spy();

            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                headers: { contentType: 'application/json' },
                body: '{"hello": "world"}'
            });
            palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL'),
                filterLocalChange: op => {
                    spy();
                    return op;
                },
                onStateReset: obj => obj.newProp = 'name'
            });

            // wait for ajax
            await sleep();

            assert(spy.calledOnce);
        });
        it('Should use options.filter function when local changes occur', async () => {
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                location: 'http://localhost/testURL/patch-server',
                headers: { contentType: 'application/json' },
                body: '{"hello": "world"}'
            });
            let tempObj;
            palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL'),
                filterLocalChange: operation =>
                    !operation.path.startsWith('/$$') && operation,
                    onStateReset: obj => (tempObj = obj)
            });

            await sleep();
            assert(fetchMock.calls().length === 1);
            // a change that passes the filter
            tempObj.newProp = 'name';

            // wait for ajax
            await sleep();
            assert(fetchMock.calls().length === 2);

            // a change that does not pass the filter
            tempObj.$$ignored = 'name';

            // wait for ajax
            await sleep();
            assert(fetchMock.calls().length === 2);
        });
    });
});
