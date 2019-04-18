import PalindromDOM from '../../../src/palindrom-dom';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import chai, { expect, assert } from 'chai';
import { sleep, getTestURL, createAndClickOnLinkNested, createAndClickOnLinkNestedShadowDOM, createAndClickOnLinkNestedShadowDOMContent, createAndClickOnLink, createAndClickOnLinkWithoutPrevention } from '../../utils';
import chaiAsPromised from "chai-as-promised";
fetchMock.config.overwriteRoutes = true;
chai.use(chaiAsPromised);

/** only run DOM tests in browsers */
if (typeof window !== 'undefined') {
    

    describe('Links', function() {
        let currLoc, currScrollY, palindromNode, nodeB;
        before(function() {
            currLoc = window.location.href;
            currScrollY = document.documentElement.scrollTop;
        });
        after(function() {
            history.pushState(null, null, currLoc);
            window.scrollTo(0, currScrollY);
        });

        describe('PalindromDOM - Links', function() {
            ['default', 'specific'].forEach(mode => {
                describe(`when attached to ${mode} node`, function() {
                    let palindrom;
                    let historySpy;

                    beforeEach('PalindromDOM - Links', async () => {
                        historySpy = sinon.spy(window.history, 'pushState');

                        fetchMock.mock(getTestURL('testURL'), {
                            status: 200,
                            headers: { location: getTestURL('testURL') },
                            body: '{"hello": "world"}'
                        });

                        if (mode === 'default') {
                            palindrom = new PalindromDOM({
                                remoteUrl: getTestURL('testURL')
                            });
                        } else if (mode === 'specific') {
                            palindromNode = document.createElement('DIV');
                            document.body.appendChild(palindromNode);
                            nodeB = document.createElement('DIV');
                            document.body.appendChild(nodeB);
                            palindrom = new PalindromDOM({
                                remoteUrl: getTestURL('testURL'),
                                listenTo: palindromNode
                            });
                        }
                        await sleep();
                    });
                    afterEach(function() {
                        window.history.pushState.restore();
                        historySpy = null;
                        palindrom.unobserve();
                        palindrom.unlisten();
                        fetchMock.restore();
                    });

                    it(`its .element should point to ${mode} node`, function() {
                        const node =
                            mode === 'specific' ? palindromNode : document;
                        assert(palindrom.element === node);
                    });
                    describe('should intercept links to use History API', function() {
                        afterEach(function() {
                            fetchMock.restore();
                        });
                        it('relative path', async () => {
                            const relative = getTestURL('test_a', true);
                            const abs = getTestURL('test_a');

                            fetchMock.mock(abs, {
                                status: 200,
                                body: '{"hello": "world"}'
                            });

                            createAndClickOnLink(
                                relative,
                                mode === 'specific' ? palindromNode : undefined
                            );

                            await sleep(50);
                            expect(historySpy.callCount).to.equal(1);
                        });

                        it('relative path (nested)', async () => {
                            const relative = getTestURL('test_b', true);
                            const abs = getTestURL('test_b');

                            fetchMock.mock(abs, {
                                status: 200,
                                body: '{"hello": "world"}'
                            });

                            createAndClickOnLinkNested(
                                relative,
                                mode === 'specific' ? palindromNode : undefined
                            );
                            await sleep();
                            expect(historySpy.callCount).to.equal(1);
                        });
                        it('relative path (nested, Shadow DOM)', async () => {
                            const relative = getTestURL('test_c', true);
                            const abs = getTestURL('test_c');

                            fetchMock.mock(abs, {
                                status: 200,
                                body: '{"hello": "world"}'
                            });

                            createAndClickOnLinkNestedShadowDOM(
                                relative,
                                mode === 'specific' ? palindromNode : undefined
                            );
                            await sleep();
                            expect(historySpy.callCount).to.equal(1);
                        });
                        if (mode === 'default') {
                            it('relative path (nested, Shadow DOM content)', async () => {
                                const url = getTestURL('subpage.html');

                                fetchMock.mock(url, {
                                    status: 200,
                                    body: '{"hello": "world"}'
                                });
                                

                                createAndClickOnLinkNestedShadowDOMContent();

                                await sleep();

                                expect(historySpy.callCount).to.equal(1);
                            });
                        }

                        it('absolute path', async () => {
                            const href = getTestURL('testURL');
                            createAndClickOnLink(
                                href,
                                mode === 'specific' ? palindromNode : null
                            );
                            await sleep();
                            expect(historySpy.callCount).to.equal(1);
                        });
                    });

                    describe('Links with download attribute', function() {
                        it('should not intercept links with download attribute', async () => {
                            const href = getTestURL(
                                'components/Palindrom/test/tests-logo.png'
                            );

                            createAndClickOnLinkWithoutPrevention(
                                href,
                                mode === 'specific' ? palindromNode : null,
                                false,
                                'tests-logo.png'
                            );

                            await sleep();
                            expect(historySpy.callCount).to.equal(0);
                        });
                    });
                    describe('Links with targets', function() {
                        it('should not intercept links with a set target', async () => {
                            const href = getTestURL(
                                'components/Palindrom/test/PopupPage.html'
                            );

                            // needed for Sauce labs, they allow pop ups, and this means we lose focus here
                            const popup = window.open('', '_popup');
                            createAndClickOnLinkWithoutPrevention(
                                href,
                                mode === 'specific' ? palindromNode : null,
                                '_popup'
                            );
                            // focus again
                            popup && popup.close();

                            await sleep();
                            expect(historySpy.callCount).to.equal(0);
                        });
                        it('should intercept links with target _self', async () => {
                            const href = getTestURL(
                                'components/Palindrom/test/PopupPage.html'
                            );

                            fetchMock.mock(href, {
                                status: 200,
                                body: '{"hello": "world"}'
                            });

                            createAndClickOnLinkWithoutPrevention(
                                href,
                                mode === 'specific' ? palindromNode : null,
                                '_self'
                            );

                            await sleep();
                            expect(historySpy.callCount).to.equal(1);
                        });
                        it('should intercept links with an empty target', async () => {
                            const href = getTestURL(
                                'components/Palindrom/test/PopupPage.html'
                            );

                            fetchMock.mock(href, {
                                status: 200,
                                body: '{"hello": "world"}'
                            });

                            createAndClickOnLinkWithoutPrevention(
                                href,
                                mode === 'specific' ? palindromNode : null,
                                ''
                            );

                            await sleep();
                            expect(historySpy.callCount).to.equal(1);
                        });
                        it('should intercept links without a target', async () => {
                            const href = getTestURL(
                                'components/Palindrom/test/PopupPage.html'
                            );

                            fetchMock.mock(href, {
                                status: 200,
                                body: '{"hello": "world"}'
                            });

                            createAndClickOnLinkWithoutPrevention(
                                href,
                                mode === 'specific' ? palindromNode : null
                            );

                            await sleep();
                            expect(historySpy.callCount).to.equal(1);
                        });
                        describe('should not intercept external links', function() {
                            it('full URL in the same host, different port', async () => {
                                const port =
                                    window.location.port === '80' ||
                                    window.location.port === ''
                                        ? '8080'
                                        : '80';
                                const href =
                                    window.location.protocol +
                                    '//' +
                                    window.location.hostname +
                                    ':' +
                                    port +
                                    '/test'; //http://localhost:88881/test
                                createAndClickOnLink(href);

                                await sleep();
                                expect(historySpy.callCount).to.equal(0);
                            });
                        });

                        it('full URL in the same host, different schema', async () => {
                            const href = getTestURL('test').replace('http:', 'https:');

                            fetchMock.mock(href, {
                                status: 200,
                                body: '{"hello": "world"}'
                            });

                            createAndClickOnLink(href);
                            expect(historySpy.callCount).to.equal(0);
                            await sleep();
                        });
                    });

                    describe('should be accessible via API', function() {
                        it('should change history state programmatically', async () => {
                            await sleep(5);
                            fetchMock.mock('/page2', {
                                status: 200,
                                body: '{"hello": "world"}'
                            });

                            await palindrom.morphUrl('/page2');

                            expect(historySpy.callCount).to.equal(1);
                            fetchMock.restore();
                        });
                    });

                    it('should stop listening to DOM changes after `.unlisten()` was called', async () => {
                        palindrom.unlisten();
                        createAndClickOnLink(
                            '#will_not_get_caught_by_palindrom',
                            mode === 'specific' ? palindromNode : null
                        );
                        expect(historySpy.callCount).to.equal(0);
                        await sleep(5);
                    });

                    it('should start listening to DOM changes after `.listen()` was called', async () => {
                        palindrom.unlisten();
                        palindrom.listen();

                        const href = getTestURL('testURL');

                        fetchMock.mock(href, {
                            status: 200,
                            body: '{"hello": "world"}'
                        });

                        createAndClickOnLink(
                            href,
                            mode === 'specific' ? palindromNode : null
                        );

                        await sleep();
                        expect(historySpy.callCount).to.equal(1);
                        fetchMock.restore();
                    });
                });
            });

            describe('History', function() {
                let palindrom, currLoc, currScrollY;

                before(function() {
                    currLoc = window.location.href;
                    currScrollY = document.documentElement.scrollTop;
                });
                after(function() {
                    history.pushState(null, null, currLoc);
                    window.scrollTo(0, currScrollY);
                });

                beforeEach(function() {   
                    fetchMock.mock(getTestURL('testURL'), {
                        status: 200,
                        body: '{"hello": "world"}'
                    });

                    palindrom = new PalindromDOM({
                        remoteUrl: getTestURL('testURL')
                    });
                });

                afterEach(function() {
                    palindrom.unobserve();
                    fetchMock.restore();
                });

                describe('should send JSON Patch HTTP request once history state get changed', function() {
                    it('by `palindrom.morphURL(url)` method', async () => {
                        fetchMock.mock('/newUrl', {
                            status: 200,
                            body: '{"hello": "world"}'
                        });

                        await palindrom.morphUrl('/newUrl');
                        expect(fetchMock.lastUrl()).to.equal('/newUrl');
                        expect(window.location.pathname).to.equal('/newUrl');
                        fetchMock.restore();
                    });
                });

                describe('palindrom-morph-url event', function() {
                    beforeEach(async () => {
                        // wait for Palindrom to call .listen (after finishing the ajax request)
                        await sleep(30);
                    });
                    it('Dispatching it should call PalindromDOM.morphUrl and issue a request', async () => {
                        const morphUrlStub = sinon.spy(palindrom, 'morphUrl');

                        fetchMock.mock('/new-palindrom-url', {
                            status: 200,
                            body: '{"hello": "world"}'
                        });

                        document.dispatchEvent(
                            new CustomEvent('palindrom-morph-url', {
                                detail: { url: '/new-palindrom-url' }
                            })
                        );

                        assert(
                            morphUrlStub.calledOnce,
                            `morphUrlStub should be called once, it was called ${
                                morphUrlStub.callCount
                            } times`
                        );

                        await sleep();
                        expect(fetchMock.lastUrl()).to.equal('/new-palindrom-url');
                        expect(
                            window.location.pathname + location.hash
                        ).to.equal('/new-palindrom-url');
                        fetchMock.restore();
                    });
                });
                describe('palindrom-before-redirect event', function() {
                    beforeEach(async () => {
                        // wait for Palindrom to call .listen (after finishing the ajax request)
                        await sleep(300);
                    });
                    afterEach(fetchMock.restore)
                    it('Morphing to a URL should dispatch the event and issue a request', async () => {
                        let firedEvent;
                        const handler = async event => {
                            firedEvent = event;
                            window.removeEventListener(
                                'palindrom-before-redirect',
                                handler
                            );
                        };
                        window.addEventListener(
                            'palindrom-before-redirect',
                            handler
                        );

                        fetchMock.mock('/newUrl', {
                            status: 200,
                            body: '{"hello": "world"}'
                        });

                        await palindrom.morphUrl('/newUrl');

                        await sleep();

                        assert.equal(firedEvent.detail.href, '/newUrl');
                        expect(fetchMock.lastUrl()).to.equal('/newUrl');
                        expect(window.location.pathname).to.equal(
                            '/newUrl'
                        );
                    });
                    it('Morphing to a URL should NOT issue a request after a canceled event', async () => {
                        let originalRequestCount = fetchMock.calls().length;
                        let firedEvent;

                        const handler = async event => {
                            firedEvent = event;
                            event.preventDefault();

                            window.removeEventListener(
                                'palindrom-before-redirect',
                                handler
                            );
                        };

                        window.addEventListener(
                            'palindrom-before-redirect',
                            handler
                        );

                        await palindrom.morphUrl('/testURL');

                        assert.equal(firedEvent.detail.href, '/testURL');
                        
                        await sleep();

                        expect(originalRequestCount).to.equal(
                            fetchMock.calls().length
                        );
                    });
                });
                describe('palindrom-after-redirect event', function() {
                    beforeEach(async () => {
                        // wait for Palindrom to call .listen (after finishing the ajax request)
                        await sleep(300);
                    });
                    afterEach(fetchMock.reset);
                    it('Morphing to a URL should dispatch the event after a successful request', async () => {
                        const rel = getTestURL('newUrl', true);

                        fetchMock.mock(rel, {
                            status: 200,
                            body: '{"hello": "world"}'
                        });

                        let firedEvent;

                        const handler = event => {
                            firedEvent = event;

                            window.removeEventListener(
                                'palindrom-after-redirect',
                                handler
                            );
                        };

                        window.addEventListener(
                            'palindrom-after-redirect',
                            handler
                        );

                        await palindrom.morphUrl(rel);
                        await sleep()
                        
                        assert.equal(firedEvent.detail.href, rel);

                        expect(window.location.pathname).to.equal(
                            '/newUrl'
                        );
                    });

                    it('Morphing to a URL should not dispatch the event after a failed request but should reject morphUrl call', async () => {
                        fetchMock.mock(getTestURL('testURL-599'), {
                            status: 509,
                            body: '{"hello": "world"}'
                        });

                        let hasFiredEvent = false;

                        const handler = event => {
                            hasFiredEvent = true;

                            window.removeEventListener(
                                'palindrom-after-redirect',
                                handler
                            );
                        };

                        window.addEventListener(
                            'palindrom-after-redirect',
                            handler
                        );
                        
                        await assert.isRejected(palindrom.morphUrl(getTestURL('testURL-599')));
                        assert.equal(hasFiredEvent, false);
                    });
                });

                describe('Scroll When navigation occurs', function() {
                    let currLoc, currScrollY;
                    before(function() {
                        currLoc = window.location.href;
                        currScrollY = document.documentElement.scrollTop;
                    });
                    after(function() {
                        history.pushState(null, null, currLoc);
                        window.scrollTo(0, currScrollY);
                    });

                    beforeEach(function() {
                        fetchMock.mock(getTestURL('testURL'), {
                            status: 200,
                            body: '{"hello": "world"}'
                        });

                        palindrom = new PalindromDOM({
                            remoteUrl: getTestURL('testURL')
                        });
                    });
                    afterEach(function() {
                        palindrom.unobserve();
                        fetchMock.restore();
                    });
                    it('should scroll to top', async () => {
                        window.scrollTo(0, document.body.scrollHeight); // scroll to bottom
                        const currScrollY = window.scrollY;

                        fetchMock.mock('/newUrl-palindrom-scroll-3', {
                            status: 200,
                            body: '[]'
                        });

                        palindrom.morphUrl('/newUrl-palindrom-scroll-3');

                        await sleep();
                        expect(fetchMock.lastUrl()).to.equal(
                            '/newUrl-palindrom-scroll-3'
                        );
                        expect(
                            window.location.pathname + location.hash
                        ).to.equal('/newUrl-palindrom-scroll-3');
                        
                        const newCurrScrollY = window.scrollY;
                        expect(newCurrScrollY).to.not.equal(currScrollY);
                        expect(currScrollY).to.not.equal(0);
                        fetchMock.restore();
                    });
                    it('should scroll back when back button is hit', async () => {
                        window.scrollTo(0, 0); // scroll to top

                        // prep for back button request
                        fetchMock.mock(window.location.href, {
                            status: 200,
                            body: '{}'
                        });

                        fetchMock.mock('/newUrl-palindrom-scroll-4', {
                            status: 200,
                            body: '{}'
                        });

                        await palindrom.morphUrl('/newUrl-palindrom-scroll-4');

                        // scroll to bottom
                        window.scrollTo(0, document.body.scrollHeight);

                        // wait for rendering
                        await sleep();

                        expect(window.scrollY).to.not.equal(0);

                        // go back
                        history.go(-1);

                        await sleep(30);

                        expect(window.scrollY).to.equal(0);
                    });
                    it('should NOT scroll back when back button is hit and the user scrolled', async () => {
                        window.scrollTo(0, 0); // scroll to top
                        
                        fetchMock.mock('/newUrl-palindrom-scroll-5', {
                            status: 200,
                            body: '[]'
                        });

                        await palindrom.morphUrl('/newUrl-palindrom-scroll-5');
                        // scroll to bottom
                        window.scrollTo(0, document.body.scrollHeight);

                        // wait for rendering
                        await sleep();
                        expect(window.scrollY).to.not.equal(0);

                        
                        // go back
                        history.go(-1);

                        // scroll half way
                        window.scrollTo(
                            0,
                            Math.floor(document.body.scrollHeight / 2)
                        );

                        await sleep();
                        expect(window.scrollY).to.equal(
                            Math.floor(document.body.scrollHeight / 2)
                        );
                    });

                    describe('should send JSON Patch HTTP request once history state get changed', function() {
                          it('by dispatching `palindrom-redirect-pushstate` event', async () => {
   
                            fetchMock.mock(getTestURL('newUrl-palindrom'), {
                                status: 200,
                                headers: { contentType: 'application/json-patch+json' },
                                body: `[{"op": "replace", "path": "/", "value": "Custom message"}]`
                            });
                            
                            document.dispatchEvent(
                                new CustomEvent(
                                    'palindrom-redirect-pushstate',
                                    {
                                        detail: { url: getTestURL('newUrl-palindrom') },
                                        bubbles: true
                                    }
                                )
                            );

                            await sleep(15);

                            expect(new URL(fetchMock.lastUrl()).pathname).to.equal(
                                '/newUrl-palindrom'
                            );

                            await sleep();
                            expect(window.location.pathname).to.equal(
                                '/newUrl-palindrom'
                            );
                        });
                    });
                });
            });
        });
    });
}
