import PalindromDOM from '../../../src/palindrom-dom';
import assert from 'assert';
import moxios from 'moxios';
import sinon from 'sinon';
import { expect } from 'chai';
import { sleep } from '../../utils';
/** only run DOM tests in browsers */
if (typeof window !== 'undefined') {
    function createAndClickOnLinkWithoutPrevention(
        href,
        parent,
        target,
        download
    ) {
        parent = parent || document.body;
        const a = document.createElement('A');
        a.innerHTML = 'Link';
        a.href = href;
        (target || target === '') && a.setAttribute('target', target);
        (download || download === '') && a.setAttribute('download', download);
        parent.appendChild(a);
        clickElement(a);
        parent.removeChild(a);
    }

    function getTestURL(pathname, isRelative) {
        if (isRelative) {
            return `/${pathname}`;
        }
        return (
            window.location.protocol +
            '//' +
            window.location.host +
            `/${pathname}`
        );
    }
    function createAndClickOnLink(href, parent, target) {
        parent = parent || document.body;
        const a = document.createElement('A');
        a.innerHTML = 'Link';
        a.href = href;
        target && (a.target = target);
        parent.appendChild(a);
        parent.addEventListener('click', clickHandler);
        clickElement(a);
        parent.removeEventListener('click', clickHandler);
        parent.removeChild(a);
    }
    function createAndClickOnLinkNested(href, parent) {
        parent = parent || document.body;
        const a = document.createElement('A');
        a.innerHTML = '<strong>Link</strong>';
        a.href = href;
        parent.appendChild(a);
        parent.addEventListener('click', clickHandler);
        clickElement(a.firstChild);
        parent.removeEventListener('click', clickHandler);
        parent.removeChild(a);
    }

    function clickElement(element) {
        if (window.MouseEvent) {
            const event = new window.MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event);
        }
    }

    function createAndClickOnLinkNestedShadowDOM(href, parent) {
        parent = parent || document.body;
        const div = document.createElement('DIV');
        parent.appendChild(div);

        const a = document.createElement('A');
        a.innerHTML = '<strong>Link</strong>';
        a.href = href;
        div.createShadowRoot().appendChild(a);
        parent.addEventListener('click', clickHandler);
        clickElement(a.firstChild);

        parent.removeEventListener('click', clickHandler);
        parent.removeChild(div);
    }
    function createAndClickOnLinkNestedShadowDOMContent() {
        const btn = document.querySelector('my-menu-button strong');
        btn.click();
    }

    function clickHandler(event) {
        event.preventDefault();
    }

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

        describe('PalindromDOM - Links - ', function() {
            ['default', 'specific'].forEach(mode => {
                describe(`when attached to ${mode} node`, function() {
                    let palindrom;
                    let historySpy;

                    beforeEach('PalindromDOM - Links', async () => {
                        historySpy = sinon.spy(window.history, 'pushState');

                        moxios.install();
                        moxios.stubRequest(getTestURL('testURL'), {
                            status: 200,
                            headers: { location: getTestURL('testURL') },
                            responseText: '{"hello": "world"}'
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
                        moxios.uninstall();
                    });

                    it(`its .element should point to ${mode} node`, function() {
                        const node =
                            mode === 'specific' ? palindromNode : document;
                        assert(palindrom.element === node);
                    });
                    describe('should intercept links to use History API', function() {
                        it('relative path', async () => {
                            const relative = getTestURL('test_a', true);
                            const abs = getTestURL('test_a');

                            moxios.stubRequest(abs, {
                                status: 200,
                                responseText: '{"hello": "world"}'
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

                            moxios.stubRequest(abs, {
                                status: 200,
                                responseText: '{"hello": "world"}'
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

                            moxios.stubRequest(abs, {
                                status: 200,
                                responseText: '{"hello": "world"}'
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

                                moxios.stubRequest(url, {
                                    status: 200,
                                    responseText: '{"hello": "world"}'
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

                            moxios.stubRequest(href, {
                                status: 200,
                                responseText: '{"hello": "world"}'
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

                            moxios.stubRequest(href, {
                                status: 200,
                                responseText: '{"hello": "world"}'
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

                            moxios.stubRequest(href, {
                                status: 200,
                                responseText: '{"hello": "world"}'
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
                            const protocol = window.location.protocol;
                            const href =
                                protocol +
                                '//' +
                                window.location.host +
                                '/test'; //https://localhost:8888/test
                            createAndClickOnLink(href);
                            expect(historySpy.callCount).to.equal(0);
                            await sleep();
                        });
                    });

                    describe('should be accessible via API', function() {
                        it('should change history state programmatically', async () => {
                            await sleep(5);
                            moxios.stubRequest('/page2', {
                                status: 200,
                                responseText: '{"hello": "world"}'
                            });

                            palindrom.morphUrl('/page2');

                            await sleep(5);
                            expect(historySpy.callCount).to.equal(1);
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

                        const protocol = window.location.protocol;

                        const href =
                            protocol + '//' + window.location.host + '/test2'; //https://localhost:8888/test

                        moxios.stubRequest(href, {
                            status: 200,
                            headers: { Location: href },
                            responseText: '{"hello": "world"}'
                        });

                        createAndClickOnLink(
                            href,
                            mode === 'specific' ? palindromNode : null
                        );
                        await sleep();
                        expect(historySpy.callCount).to.equal(1);
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
                    moxios.install();
                    moxios.stubRequest(getTestURL('testURL'), {
                        status: 200,
                        responseText: '{"hello": "world"}'
                    });

                    palindrom = new PalindromDOM({
                        remoteUrl: getTestURL('testURL')
                    });
                });

                afterEach(function() {
                    palindrom.unobserve();
                    moxios.uninstall();
                });

                describe('should send JSON Patch HTTP request once history state get changed', function() {
                    it('by `palindrom.morphURL(url)` method', async () => {
                        moxios.stubRequest('/newUrl', {
                            status: 200,
                            responseText: '{"hello": "world"}'
                        });

                        palindrom.morphUrl('/newUrl');
                        await sleep();
                        const request = moxios.requests.mostRecent();
                        expect(request.url).to.equal('/newUrl');
                        expect(window.location.pathname).to.equal('/newUrl');
                        request.respondWith({
                            status: 200,
                            responseText: '{"hello": "world"}'
                        });
                    });
                });

                describe('palindrom-morph-url event', function() {
                    beforeEach(async () => {
                        // wait for Palindrom to call .listen (after finishing the ajax request)
                        await sleep(30);
                    });
                    it('Dispatching it should call PalindromDOM.morphUrl and issue a request', async () => {
                        const morphUrlStub = sinon.spy(palindrom, 'morphUrl');

                        moxios.stubRequest('/new-palindrom-url', {
                            status: 200,
                            responseText: '{"hello": "world"}'
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
                        const request = moxios.requests.mostRecent();
                        expect(request.url).to.equal('/new-palindrom-url');
                        expect(
                            window.location.pathname + location.hash
                        ).to.equal('/new-palindrom-url');
                    });
                });
                describe('palindrom-before-redirect event', function() {
                    beforeEach(async () => {
                        // wait for Palindrom to call .listen (after finishing the ajax request)
                        await sleep(300);
                    });
                    it('Morphing to a URL should dispatch the event and issue a request', async () => {
                        const handler = async event => {
                            assert.equal(event.detail.href, '/newUrl');

                            await sleep();
                            const request = moxios.requests.mostRecent();
                            expect(request.url).to.equal('/newUrl');

                            request.respondWith({
                                status: 200,
                                responseText: '{"hello": "world"}'
                            });
                            await sleep();
                            expect(window.location.pathname).to.equal(
                                '/newUrl'
                            );

                            window.removeEventListener(
                                'palindrom-before-redirect',
                                handler
                            );
                        };
                        window.addEventListener(
                            'palindrom-before-redirect',
                            handler
                        );
                        palindrom.morphUrl('/newUrl');
                    });
                    it('Morphing to a URL should NOT issue a request after a canceled event', async () => {
                        let originalRequestCount = moxios.requests.count;

                        const handler = async event => {
                            assert.equal(event.detail.href, '/newUrl2');
                            event.preventDefault();

                            await sleep();
                            expect(originalRequestCount).to.equal(
                                moxios.requests.count
                            );

                            window.removeEventListener(
                                'palindrom-before-redirect',
                                handler
                            );
                        };
                        window.addEventListener(
                            'palindrom-before-redirect',
                            handler
                        );
                        palindrom.morphUrl('/newUrl2');
                    });
                });
                describe('palindrom-after-redirect event', function() {
                    beforeEach(async () => {
                        // wait for Palindrom to call .listen (after finishing the ajax request)
                        await sleep(300);
                    });
                    it('Morphing to a URL should dispatch the event after a successful request', async () => {
                        moxios.stubRequest('/newUrl', {
                            status: 200,
                            responseText: '{"hello": "world"}'
                        });

                        const handler = event => {
                            assert.equal(event.detail.href, '/newUrl');
                            assert.equal(event.detail.successful, true);

                            expect(window.location.pathname).to.equal(
                                '/newUrl'
                            );

                            window.removeEventListener(
                                'palindrom-after-redirect',
                                handler
                            );
                        };
                        window.addEventListener(
                            'palindrom-after-redirect',
                            handler
                        );
                        palindrom.morphUrl('/newUrl');
                    });

                    it('Morphing to a URL should dispatch the event after a failed request', async () => {
                        moxios.stubRequest('/newUrl2', {
                            status: 509,
                            responseText: '{"hello": "world"}'
                        });

                        const handler = event => {
                            assert.equal(event.detail.href, '/newUrl2');
                            assert.equal(event.detail.successful, false);
                            assert.equal(
                                event.detail.error.message,
                                'Request failed with status code 509'
                            );

                            window.removeEventListener(
                                'palindrom-after-redirect',
                                handler
                            );
                        };
                        window.addEventListener(
                            'palindrom-after-redirect',
                            handler
                        );
                        palindrom.morphUrl('/newUrl2');
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
                        moxios.install();
                        moxios.stubRequest(getTestURL('testURL'), {
                            status: 200,
                            responseText: '{"hello": "world"}'
                        });

                        palindrom = new PalindromDOM({
                            remoteUrl: getTestURL('testURL')
                        });
                    });
                    afterEach(function() {
                        palindrom.unobserve();
                        moxios.uninstall();
                    });
                    it('should scroll to top', async () => {
                        window.scrollTo(0, document.body.scrollHeight); // scroll to bottom
                        const currScrollY = window.scrollY;

                        moxios.stubRequest('/newUrl-palindrom-scroll-2', {
                            status: 200,
                            responseText: '[]'
                        });

                        palindrom.morphUrl('/newUrl-palindrom-scroll-2');

                        await sleep();
                        const request = moxios.requests.mostRecent();
                        expect(request.url).to.equal(
                            '/newUrl-palindrom-scroll-2'
                        );
                        expect(
                            window.location.pathname + location.hash
                        ).to.equal('/newUrl-palindrom-scroll-2');
                        const newCurrScrollY = window.scrollY;
                        expect(newCurrScrollY).to.not.equal(currScrollY);
                        expect(currScrollY).to.not.equal(0);
                    });
                    it('should scroll back when back button is hit', async () => {
                        window.scrollTo(0, 0); // scroll to top

                        // prepare for "back" request
                        moxios.stubRequest(location.href, {
                            status: 200,
                            responseText: '{}'
                        });

                        moxios.stubRequest('/newUrl-palindrom-scroll-2', {
                            status: 200,
                            responseText: '{}'
                        });

                        await palindrom.morphUrl('/newUrl-palindrom-scroll-2');
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

                        // prepare for "back" request
                        moxios.stubRequest(getTestURL('testURL'), {
                            status: 200,
                            responseText: '[]'
                        });

                        moxios.stubRequest('/newUrl-palindrom-scroll-2', {
                            status: 200,
                            responseText: '[]'
                        });

                        await palindrom.morphUrl('/newUrl-palindrom-scroll-2');
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
                        beforeEach(function() {
                            moxios.install();
                            moxios.stubRequest(getTestURL('testURL'), {
                                status: 200,
                                headers: { location: getTestURL('testURL') },
                                responseText: '{"hello": "world"}'
                            });

                            palindrom = new PalindromDOM({
                                remoteUrl: getTestURL('testURL')
                            });
                        });
                        afterEach(function() {
                            palindrom.unobserve();
                            moxios.uninstall();
                        });

                        it('by dispatching `palindrom-redirect-pushstate` event', async () => {
                            history.pushState(null, null, '/newUrl-palindrom');

                            moxios.stubRequest(/.+/, {
                                status: 200,
                                headers: { location: getTestURL('testURL') },
                                responseText: '[]'
                            });

                            document.dispatchEvent(
                                new CustomEvent(
                                    'palindrom-redirect-pushstate',
                                    {
                                        detail: { url: '/newUrl-palindrom' },
                                        bubbles: true
                                    }
                                )
                            );

                            await sleep();
                            const request = moxios.requests.mostRecent();

                            expect(new URL(request.url).pathname).to.equal(
                                '/newUrl-palindrom'
                            );
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
