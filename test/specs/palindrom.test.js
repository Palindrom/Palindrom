import { Palindrom } from '../../src/palindrom.js';
import chai from 'chai';
const { expect, assert } = chai;
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { sleep, getTestURL } from '../utils/index.js';
// import { version as currentVersion } from '../../package.json';

describe('Palindrom', () => {
    let palindrom;
    let currentVersion;
    before(async ()=>{
        if(typeof require !== 'undefined'){ // in webpack shim JSON modules with its require
            currentVersion = require('../../package.json').version;
        } else if(typeof window === 'undefined'){ // in node shim JSON modules with imported require
            const createRequire = await import('module').then(m=>m.createRequire);
            const require = createRequire(import.meta.url);
            currentVersion = require('../../package.json').version;
        } else {
            currentVersion = await fetch('../../package.json')
                .then(response => response.json())
                .then(json => json.version);
        }
    });
    afterEach(() => {
        fetchMock.restore();
        // stop all networking and DOM activity of abandoned instance
        palindrom && palindrom.stop();
    });
    describe('Expose version', function() {
        it('Palindrom class should contain the version', function() {
            assert.equal(currentVersion, Palindrom.version);
        });
        it('Palindrom instance should contain the version', function() {
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                body: '{"hello": "world"}'
            })
            palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL')
            });
            assert.equal(currentVersion, palindrom.version);
        });
    });
    describe('#constructor', () => {
        it('should initiate an HTTP GET request withot body when initiated, and call the callback function', async () => {
            const mock = fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                headers: { Location: getTestURL('testURL') },
                body: '{"hello": "world"}'
            });
            const spy = sinon.spy();

            palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL'),
                onStateReset: spy
            });

            await sleep(50);
            // check HTTP fetch
            expect(fetchMock.called(/testURL/)).to.be.ok;
            expect(fetchMock.calls()).to.be.lengthOf(1);
            const fetchOptions = fetchMock.lastOptions();
            expect(fetchOptions).to.have.property('method', 'GET');
            expect(fetchOptions).not.to.have.property('body');

            // check callback
            assert(spy.called);
            assert.deepEqual(spy.getCall(0).args[0], { hello: 'world' });
        });
        it('should accept a JSON that has an empty string as a key', async () => {
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                headers: { Location: getTestURL('testURL') },
                body: '{"hello": "world","": {"hola": "mundo"}}'
            });
            const spy = sinon.spy();
            palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL'),
                onStateReset: spy
            });
            await sleep();
            assert.deepEqual(spy.getCall(0).args[0], {
                hello: 'world',
                '': { hola: 'mundo' }
            });
            assert.equal('mundo', palindrom.obj[''].hola);
        });
    });
    describe('obj', () => {
        it('palindrom.obj should be readonly', async () => {
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                headers: { contentType: 'application/json' },
                body: '{"hello": "world"}'
            });

            palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL')
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
    describe('#patching', () => {
        it('should patch changes', async () => {
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                headers: { contentType: 'application/json' },
                body: '{"hello": "world"}'
            });

            let tempObject;

            palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL'),
                onStateReset: obj => (tempObject = obj)
            });

            await sleep();
            assert.equal(tempObject.hello, 'world');
            tempObject.hello = 'galaxy';

            /* now two ajax requests should had happened,
                    the initial one, and the patch one (hello = world => hello = galaxy)*/
            await sleep();
            assert.equal(2, fetchMock.calls().length);
            let request = fetchMock.lastOptions();
            assert.equal(
                '[{"op":"replace","path":"/hello","value":"galaxy"}]',
                request.body
            );
        });
        it('should not patch changes after unobserve() was called', async () => {
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                headers: { contentType: 'application/json' },
                body: '{"unwatched": "object"}'
            });
            assert.equal(0, fetchMock.calls().length, 'asdsad');
            let tempObject;
            palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL'),
                onStateReset: obj => (tempObject = obj)
            })
            ;
            await sleep();
            assert.equal(1, fetchMock.calls().length);
            assert.equal(tempObject.unwatched, 'object');
            tempObject.unwatched = 'objecto';

            /* now two ajax requests should have happened,
            the initial one, and the patch one */
            await sleep();
            assert.equal(2, fetchMock.calls().length);
            let request = fetchMock.lastOptions();
            assert.equal(
                '[{"op":"replace","path":"/unwatched","value":"objecto"}]',
                request.body
            );
            palindrom.unobserve();
            tempObject.hello = "a change that shouldn't be considered";

            /* now palindrom is unobserved, requests should stay 2 */
            await sleep();
            assert.equal(2, fetchMock.calls().length);
        });
        it('should patch changes after observe() was called', async () => {
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                headers: { contentType: 'application/json' },
                body: '{"unwatched": "object"}'
            });
            let tempObject;
            palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL'),
                onStateReset: obj => (tempObject = obj)
            });
            await sleep();
            assert.equal(tempObject.unwatched, 'object');
            assert.equal(1, fetchMock.calls().length);
            tempObject.unwatched = 'objecto';

            /* now two ajax requests should had happened,
            the initial one, and the patch one */
            await sleep();
            assert.equal(2, fetchMock.calls().length);
            let request = fetchMock.lastOptions();
            assert.equal(
                '[{"op":"replace","path":"/unwatched","value":"objecto"}]',
                request.body
            );
            palindrom.unobserve();
            tempObject.unwatched = 'a change that should NOT be considered';

            /* now palindrom is unobserved, requests should stay 2 */
            await sleep();
            assert.equal(2, fetchMock.calls().length);

            /* let's observe again */
            palindrom.observe();
            tempObject.unwatched = 'a change that SHOULD be considered';

            /* now palindrom is observed, requests should become 3  */
            await sleep();
            request = fetchMock.lastOptions();
            assert.equal(3, fetchMock.calls().length);
            assert.equal(
                '[{"op":"replace","path":"/unwatched","value":"a change that SHOULD be considered"}]',
                request.body
            );
        });
        it('should not patch changes after stop() was called', async () => {
            fetchMock.mock(getTestURL('testURL'), {
                status: 200,
                headers: { contentType: 'application/json' },
                body: '{"unwatched": "object"}'
            });
            assert.equal(0, fetchMock.calls().length, 'asdsad');
            let tempObject;
            palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL'),
                onStateReset: obj => (tempObject = obj)
            })
            ;
            await sleep();
            assert.equal(1, fetchMock.calls().length);
            assert.equal(tempObject.unwatched, 'object');
            tempObject.unwatched = 'objecto';

            /* now two ajax requests should have happened,
            the initial one, and the patch one */
            await sleep();
            assert.equal(2, fetchMock.calls().length);
            let request = fetchMock.lastOptions();
            assert.equal(
                '[{"op":"replace","path":"/unwatched","value":"objecto"}]',
                request.body
            );
            palindrom.stop();
            tempObject.hello = "a change that shouldn't be considered";

            /* now palindrom is unobserved, requests should stay 2 */
            await sleep();
            assert.equal(2, fetchMock.calls().length);
        });
    });
});
