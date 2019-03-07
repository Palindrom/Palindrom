import Palindrom from '../../src/palindrom';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import assert from 'assert';
import { sleep, getTestURL } from '../utils';

describe('Palindrom', () => {
    describe('#filterLocalChange', () => {
        beforeEach(() => {
            
        });
        afterEach(() => {
            fetchMock.restore();
        });
        it('Should use options.filterLocalChange function when local changes occur', async () => {
            const spy = sinon.spy();

            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                headers: { contentType: 'application/json' },
                body: '{"hello": "world"}'
            });
            const palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL'),
                filterLocalChange: op => {
                    spy();
                    return op;
                }
            });
            palindrom.addEventListener('state-reset', ev => {
                const obj = ev.detail;
                obj.newProp = 'name';
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
            const palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL'),
                filterLocalChange: operation =>
                    !operation.path.startsWith('/$$') && operation
            });
            let obj;

            palindrom.addEventListener('state-reset', ev => {
                obj = ev.detail;
            });
            await sleep();
            assert(fetchMock.calls().length === 1);
            // a change that passes the filter
            obj.newProp = 'name';

            // wait for ajax
            await sleep();
            assert(fetchMock.calls().length === 2);

            // a change that does not pass the filter
            obj.$$ignored = 'name';

            // wait for ajax
            await sleep();
            assert(fetchMock.calls().length === 2);
        });
    });
});
