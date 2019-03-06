import Palindrom from '../../src/palindrom';
import assert from 'assert';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { sleep } from '../utils';
const currentVersion = require('../../package.json').version;

describe('Palindrom', () => {
    describe('Expose version', function() {
        it('Palindrom class should contain the version', function() {
            assert.equal(currentVersion, Palindrom.version);
        });
        it('Palindrom instance should contain the version', function() {
            const palindrom = new Palindrom({
                remoteUrl: 'http://localhost/testURL'
            });
            assert.equal(currentVersion, palindrom.version);
        });
    });
    describe('#constructor', () => {
        beforeEach(() => {
            
        });
        afterEach(() => {
            
        });
        it('should initiate an ajax request when initiated, and call the callback function', async () => {
            fetchMock.mock('http://localhost/testURL', {
                status: 200,
                headers: { Location: 'http://localhost/testURL' },
                body: '{"hello": "world"}'
            });
            const spy = sinon.spy();
            const palindrom = new Palindrom({
                remoteUrl: 'http://localhost/testURL'
            });
            palindrom.addEventListener('state-reset', ev => {
                spy(ev.detail);
            });
            await sleep();
            assert(spy.called);
            assert.deepEqual(spy.getCall(0).args[0], { hello: 'world' });
        });
        it('should accept a JSON that has an empty string as a key', async () => {
            fetchMock.mock('http://localhost/testURL', {
                status: 200,
                headers: { Location: 'http://localhost/testURL' },
                body: '{"hello": "world","": {"hola": "mundo"}}'
            });
            const spy = sinon.spy();
            let palindrom = new Palindrom({
                remoteUrl: 'http://localhost/testURL'
            });
            palindrom.addEventListener('state-reset', ev => {
                spy(ev.detail);
            });
            await sleep();
            assert.deepEqual(spy.getCall(0).args[0], {
                hello: 'world',
                '': { hola: 'mundo' }
            });
            assert.equal('mundo', palindrom.obj[''].hola);
        });
    });
});
describe('Palindrom', () => {
    describe('obj', () => {
        beforeEach(() => {
            
        });
        afterEach(() => {
            
        });
        it('palindrom.obj should be readonly', async () => {
            fetchMock.mock('http://localhost/testURL', {
                status: 200,
                headers: { contentType: 'application/json' },
                body: '{"hello": "world"}'
            });

            const palindrom = new Palindrom({
                remoteUrl: 'http://localhost/testURL'
            });

            await sleep();
            /* setting the object should throw an error */
            assert.throws(
                () => (palindrom.obj = {}),
                Error,
                'palindrom.obj is readonly'
            );
        });
    });
});
describe('Palindrom', () => {
    describe('#patching', () => {
        beforeEach(() => {
            
        });
        afterEach(() => {
            
        });
        it('should patch changes', async () => {
            fetchMock.mock('http://localhost/testURL', {
                status: 200,
                headers: { contentType: 'application/json' },
                body: '{"hello": "world"}'
            });

            const palindrom = new Palindrom({
                remoteUrl: 'http://localhost/testURL'
            });
            let tempObject;
            palindrom.addEventListener('state-reset', ev => {
                tempObject = ev.detail;
            });
            await sleep();
            assert.equal(tempObject.hello, 'world');
            tempObject.hello = 'galaxy';

            /* now two ajax requests should had happened,
                    the initial one, and the patch one (hello = world => hello = galaxy)*/
            await sleep();
            assert.equal(2, moxios.requests.count());
            let request = moxios.requests.mostRecent();

            assert.equal(
                '[{"op":"replace","path":"/hello","value":"galaxy"}]',
                request.config.data
            );
        });
        it('should not patch changes after unobserve() was called', async () => {
            fetchMock.mock('http://localhost/testURL', {
                status: 200,
                headers: { contentType: 'application/json' },
                body: '{"unwatched": "object"}'
            });
            let tempObject;
            const palindrom = new Palindrom({
                remoteUrl: 'http://localhost/testURL'
            });
            palindrom.addEventListener('state-reset', ev => {
                tempObject = ev.detail;
            });
            await sleep();
            assert.equal(1, moxios.requests.count());
            assert.equal(tempObject.unwatched, 'object');
            tempObject.unwatched = 'objecto';

            /* now two ajax requests should have happened, 
            the initial one, and the patch one */
            await sleep();
            assert.equal(2, moxios.requests.count());
            let request = moxios.requests.mostRecent();
            assert.equal(
                '[{"op":"replace","path":"/unwatched","value":"objecto"}]',
                request.config.data
            );
            palindrom.unobserve();
            tempObject.hello = "a change that shouldn't be considered";

            /* now palindrom is unobserved, requests should stay 2 */
            await sleep();
            assert.equal(2, moxios.requests.count());
        });
        it('should patch changes after observe() was called', async () => {
            fetchMock.mock('http://localhost/testURL', {
                status: 200,
                headers: { contentType: 'application/json' },
                body: '{"unwatched": "object"}'
            });
            let tempObject;
            const palindrom = new Palindrom({
                remoteUrl: 'http://localhost/testURL'
            });
            palindrom.addEventListener('state-reset', ev => {
                tempObject = ev.detail;
            });
            await sleep();
            assert.equal(tempObject.unwatched, 'object');
            assert.equal(1, moxios.requests.count());
            tempObject.unwatched = 'objecto';

            /* now two ajax requests should had happened, 
            the initial one, and the patch one */
            await sleep();
            assert.equal(2, moxios.requests.count());
            let request = moxios.requests.mostRecent();
            assert.equal(
                '[{"op":"replace","path":"/unwatched","value":"objecto"}]',
                request.config.data
            );
            palindrom.unobserve();
            tempObject.unwatched = 'a change that should NOT be considered';

            /* now palindrom is unobserved, requests should stay 2 */
            await sleep();
            assert.equal(2, moxios.requests.count());

            /* let's observe again */
            palindrom.observe();
            tempObject.unwatched = 'a change that SHOULD be considered';

            /* now palindrom is observed, requests should become 3  */
            await sleep();
            request = moxios.requests.mostRecent();
            assert.equal(3, moxios.requests.count());
            assert.equal(
                '[{"op":"replace","path":"/unwatched","value":"a change that SHOULD be considered"}]',
                request.config.data
            );
        });
    });
});
