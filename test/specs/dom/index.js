/** only run DOM tests in browsers */
if (typeof window !== 'undefined') {
  const PalindromDOM = require('../../../src/palindrom-dom');
  const assert = require('assert');
  const moxios = require('moxios');
  const sinon = require('sinon');
  const expect = require('chai').expect;

  function createAndClickOnLinkWithoutPrevention(href, parent, target, download) {
    parent = parent || document.body;
    const a = document.createElement('A');
    a.innerHTML = 'Link';
    a.href = href;
    (target || target === '') && (a.setAttribute('target', target));
    (download || download === '') && (a.setAttribute('download', download));
    parent.appendChild(a);
    clickElement(a);
    parent.removeChild(a);
  }

  function getTestURL(pathname, isRelative) {
    if(isRelative) {
      return `/${pathname}`;
    }
    return window.location.protocol + '//' + window.location.host + `/${pathname}`;
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
    let currLoc, currScrollY;
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

          beforeEach('PalindromDOM - Links', function(done) {
            historySpy = sinon.spy(window.history, 'pushState');

            moxios.install();
            moxios.stubRequest(getTestURL('testURL'), {
              status: 200,
              headers: { location: getTestURL('testURL') },
              responseText: '{"hello": "world"}'
            });

            if(mode === 'default') {
              palindrom = new PalindromDOM({
                remoteUrl: getTestURL('testURL')
              }); 
            } else if(mode === 'specific') {
              palindromNode = document.createElement('DIV');
              document.body.appendChild(palindromNode);
              nodeB = document.createElement('DIV');
              document.body.appendChild(nodeB);
              palindrom = new PalindromDOM({
                remoteUrl: getTestURL('testURL'),
                listenTo: palindromNode
              });
            }
            setTimeout(done, 1);
          });
          afterEach(function() {
            window.history.pushState.restore();
            historySpy = null;
            palindrom.unobserve();
            palindrom.unlisten();
            moxios.uninstall();
          });

          it(`its .element should point to ${mode} node`, function() {
            const node = mode === 'specific' ? palindromNode : document;
            assert(palindrom.element === node);
          });          
          describe('should intercept links to use History API', function() {
            it('relative path', function(done) {
              const relative = getTestURL('test_a', true);
              const abs = getTestURL('test_a');

              moxios.stubRequest(abs, {
                status: 200,
                responseText: '{"hello": "world"}'
              });

              createAndClickOnLink(relative, mode === 'specific' ? palindromNode : undefined);
              setTimeout(() => { expect(historySpy.callCount).to.equal(1); done() }, 50);
            });

            it('relative path (nested)', function(done) {
              const relative = getTestURL('test_b', true);
              const abs = getTestURL('test_b');

              moxios.stubRequest(abs, {
                status: 200,
                responseText: '{"hello": "world"}'
              });

              createAndClickOnLinkNested(relative, mode === 'specific' ? palindromNode : undefined);
              setTimeout(() => { expect(historySpy.callCount).to.equal(1); done() });
            });
            it('relative path (nested, Shadow DOM)', function(done) {
              const relative = getTestURL('test_c', true);
              const abs = getTestURL('test_c');

              moxios.stubRequest(abs, {
                status: 200,
                responseText: '{"hello": "world"}'
              });

              createAndClickOnLinkNestedShadowDOM(relative, mode === 'specific' ? palindromNode : undefined);
              setTimeout(() => { expect(historySpy.callCount).to.equal(1); done() });
            });
            if(mode === 'default') {
              it('relative path (nested, Shadow DOM content)', function(done) {
                const url = getTestURL('subpage.html');
                
                moxios.stubRequest(url, {
                  status: 200,
                  responseText: '{"hello": "world"}'
                });

                createAndClickOnLinkNestedShadowDOMContent();

                setTimeout(function() {
                  debugger
                  setTimeout(() => { expect(historySpy.callCount).to.equal(1); done() });
                }, 50);
              });
            }

            it('absolute path', function(done) {
              const href = getTestURL('testURL');
              createAndClickOnLink(href, mode === 'specific' ? palindromNode : null);
              setTimeout(() => { expect(historySpy.callCount).to.equal(1); done() });
            });
          });

          describe('Links with download attribute', function() {
            it('should not intercept links with download attribute', function(done) {
              const href = getTestURL('components/Palindrom/test/tests-logo.png');

              createAndClickOnLinkWithoutPrevention(href, mode === 'specific' ? palindromNode : null, false, 'tests-logo.png');

              setTimeout(() => { expect(historySpy.callCount).to.equal(0); done() });
            });
          });
          describe('Links with targets', function() {
            it('should not intercept links with a set target', function(done) {
              const href = getTestURL('components/Palindrom/test/PopupPage.html');

              // needed for Sauce labs, they allow pop ups, and this means we lose focus here
              const popup = window.open('', '_popup')
              createAndClickOnLinkWithoutPrevention(href, mode === 'specific' ? palindromNode : null, '_popup');
              // focus again
              popup && popup.close();

              setTimeout(() => { expect(historySpy.callCount).to.equal(0); done() });
            });
            it('should intercept links with target _self', function(done) {
              const href = getTestURL('components/Palindrom/test/PopupPage.html');

              moxios.stubRequest(href, {
                status: 200,
                responseText: '{"hello": "world"}'
              });

              createAndClickOnLinkWithoutPrevention(href, mode === 'specific' ? palindromNode : null, '_self');

              setTimeout(() => { expect(historySpy.callCount).to.equal(1); done() });
            });
            it('should intercept links with an empty target', function(done) {
              const href = getTestURL('components/Palindrom/test/PopupPage.html');

              moxios.stubRequest(href, {
                status: 200,
                responseText: '{"hello": "world"}'
              });

              createAndClickOnLinkWithoutPrevention(href, mode === 'specific' ? palindromNode : null, '');

              setTimeout(() => { expect(historySpy.callCount).to.equal(1); done() });
            });
            it('should intercept links without a target', function(done) {
              const href = getTestURL('components/Palindrom/test/PopupPage.html');

              moxios.stubRequest(href, {
                status: 200,
                responseText: '{"hello": "world"}'
              });
              
              createAndClickOnLinkWithoutPrevention(href, mode === 'specific' ? palindromNode : null);

              setTimeout(() => { expect(historySpy.callCount).to.equal(1); done() });
            });
          });
          describe('should not intercept external links', function() {
            it('full URL in the same host, different port', function(done) {
              const port =
                window.location.port === '80' || window.location.port === ''
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

              setTimeout(() => { expect(historySpy.callCount).to.equal(0); done() });
            });

            it('full URL in the same host, different schema', function(done) {
              const protocol =
                window.location.protocol;
              const href = protocol + '//' + window.location.host + '/test'; //https://localhost:8888/test
              createAndClickOnLink(href);
              expect(historySpy.callCount).to.equal(0);
              setTimeout(done, 2);
            });
          });

          describe('should be accessible via API', function() {
            it('should change history state programmatically', function(done) {
              setTimeout(function() {

                moxios.stubRequest('/page2', {
                  status: 200,
                  responseText: '{"hello": "world"}'
                });

                palindrom.morphUrl('/page2');

                setTimeout(function() {
                  expect(historySpy.callCount).to.equal(1);
                  done();
                }, 5);
              }, 5);
            });
          });

          it('should stop listening to DOM changes after `.unlisten()` was called', function(
            done
          ) {
            palindrom.unlisten();
            createAndClickOnLink('#will_not_get_caught_by_palindrom', mode === 'specific' ? palindromNode : null);
            expect(historySpy.callCount).to.equal(0);
            setTimeout(done, 5);
          });

          it('should start listening to DOM changes after `.listen()` was called', function(
            done
          ) {
            palindrom.unlisten();
            palindrom.listen();

            const protocol =
                window.location.protocol;

              const href = protocol + '//' + window.location.host + '/test2'; //https://localhost:8888/test

            moxios.stubRequest(href, {
              status: 200,
              headers: { Location: href },
              responseText: '{"hello": "world"}'
            });

            createAndClickOnLink(href, mode === 'specific' ? palindromNode : null);
            setTimeout(() => {
              expect(historySpy.callCount).to.equal(1);
              done();
            }, 50)
          });
        });
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

      palindrom = new PalindromDOM({ remoteUrl: getTestURL('testURL') });
    });

    afterEach(function() {
      palindrom.unobserve();
      moxios.uninstall();
    });

    describe('should send JSON Patch HTTP request once history state get changed', function() {
      it('by `palindrom.morphURL(url)` method', function(done) {
        moxios.stubRequest('/newUrl', {
          status: 200,
          responseText: '{"hello": "world"}'
        });

        palindrom.morphUrl('/newUrl');
        setTimeout(function() {
          const request = moxios.requests.mostRecent();
          expect(request.url).to.equal('/newUrl');
          expect(window.location.pathname).to.equal('/newUrl');
          request.respondWith({
            status: 200,
            responseText: '{"hello": "world"}'
          })
          done();
        }, 5);
      });
    });

    describe('palindrom-morph-url event', function() {
      beforeEach(function(done) {
        // wait for Palindrom to call .listen (after finishing the ajax request)
        setTimeout(done, 300)
      })
      it('Dispatching it should call PalindromDOM.morphUrl and issue a request', function(done) {
        const morphUrlStub = sinon.spy(palindrom, "morphUrl");
        
        moxios.stubRequest('/new-palindrom-url', {
          status: 200,
          responseText: '{"hello": "world"}'
        });

        document.dispatchEvent(new CustomEvent('palindrom-morph-url', {detail: {url: '/new-palindrom-url'}}));

        assert(morphUrlStub.calledOnce, `morphUrlStub should be called once, it was called ${morphUrlStub.callCount} times`);

        setTimeout(function() {
          const request = moxios.requests.mostRecent();
          expect(request.url).to.equal('/new-palindrom-url');
          expect(window.location.pathname + location.hash).to.equal(
            '/new-palindrom-url'
          );
          done();
        }, 5);
      });
    });
    describe('palindrom-before-redirect event', function() {
      beforeEach(function(done) {
        // wait for Palindrom to call .listen (after finishing the ajax request)
        setTimeout(done, 300)
      })
      it('Morphing to a URL should dispatch the event and issue a request', function(done) {  
        const handler = event => {
          assert.equal(event.detail.href, '/newUrl');

          setTimeout(() => {
            const request = moxios.requests.mostRecent();
            expect(request.url).to.equal('/newUrl');

            request.respondWith({
              status: 200,
              responseText: '{"hello": "world"}'
            });
            setTimeout(() => {
              expect(window.location.pathname).to.equal('/newUrl');
              done();
            });
          });

          window.removeEventListener('palindrom-before-redirect', handler)
        }     
        window.addEventListener('palindrom-before-redirect', handler)
        palindrom.morphUrl('/newUrl');
      });
      it('Morphing to a URL should NOT issue a request after a canceled event', function(done) {
        let originalRequestCount = moxios.requests.count;

        const handler = event => {
          assert.equal(event.detail.href, '/newUrl2');
          event.preventDefault();
          
          setTimeout(() => {
            expect(originalRequestCount).to.equal(moxios.requests.count);
            done();
          })
          window.removeEventListener('palindrom-before-redirect', handler)
        };
        window.addEventListener('palindrom-before-redirect', handler)
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
          headers: { location: getTestURL('testURL') },
          responseText: '{"hello": "world"}'
        });

        palindrom = new PalindromDOM({ remoteUrl: getTestURL('testURL') });
      });
      afterEach(function() {
        palindrom.unobserve();
        moxios.uninstall();
      });
      it('should scroll to top', function(done) {
        window.scrollTo(0, document.body.scrollHeight); // scroll to bottom
        const currScrollY = document.body.scrollTop;

        moxios.stubRequest(/.+/, {
          status: 200,
          headers: { location: getTestURL('testURL') },
          responseText: '[]'
        });

        palindrom.morphUrl('/newUrl-palindrom-scroll');

        setTimeout(function() {
          const request = moxios.requests.mostRecent();
          expect(request.url).to.equal('/newUrl-palindrom-scroll');
          expect(window.location.pathname + location.hash).to.equal(
            '/newUrl-palindrom-scroll'
          );
          const newCurrScrollY = document.body.scrollTop;
          expect(newCurrScrollY).to.not.equal(currScrollY);
          expect(currScrollY).to.not.equal(0);

          done();
        }, 5);
      });
    });

    describe('should send JSON Patch HTTP request once history state get changed', function() {
      beforeEach(function() {
        moxios.install();
        moxios.stubRequest(getTestURL('testURL'), {
          status: 200,
          headers: { location: getTestURL('testURL') },
          responseText: '{"hello": "world"}'
        });

        palindrom = new PalindromDOM({ remoteUrl: getTestURL('testURL') });
      });
      afterEach(function() {
        palindrom.unobserve();
        moxios.uninstall();
      });

      it('by dispatching `palindrom-redirect-pushstate` event', function(done) {
        history.pushState(null, null, '/newUrl-palindrom');

        moxios.stubRequest(/.+/, {
          status: 200,
          headers: { location: getTestURL('testURL') },
          responseText: '[]'
        });

        document.dispatchEvent(
          new CustomEvent('palindrom-redirect-pushstate', {
            detail: { url: '/newUrl-palindrom' },
            bubbles: true
          })
        );

        setTimeout(function() {
          const request = moxios.requests.mostRecent();

          expect(new URL(request.url).pathname).to.equal('/newUrl-palindrom');
          expect(window.location.pathname).to.equal('/newUrl-palindrom');
          done();
        }, 5);
      });
    });
  });
}
