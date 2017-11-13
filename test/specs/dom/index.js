/** only run DOM tests in browsers */
if (typeof window !== 'undefined') {
  const PalindromDOM = require('../../../src/palindrom-dom');
  const assert = require('assert');
  const moxios = require('moxios');
  const sinon = require('sinon');
  const expect = require('chai').expect;

  function createAndClickOnLinkWithoutPrevention(href, parent, target) {
    parent = parent || document.body;
    const a = document.createElement('A');
    a.innerHTML = 'Link';
    a.href = href;
    (target || target === '') && (a.target = target);
    parent.appendChild(a);
    clickElement(a);
    parent.removeChild(a);
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
      describe('when attached to default node - `document.body`', function() {
        let palindrom;
        let historySpy;

        beforeEach('PalindromDOM - Links', function(done) {
          historySpy = sinon.spy(window.history, 'pushState');

          moxios.install();
          moxios.stubRequest('http://localhost/testURL', {
            status: 200,
            headers: { location: 'http://localhost/testURLNew' },
            responseText: '{"hello": "world"}'
          });

          palindrom = new PalindromDOM({
            remoteUrl: 'http://localhost/testURL'
          });

          setTimeout(done, 1);
        });
        afterEach(function() {
          window.history.pushState.restore();
          historySpy = null;
          palindrom.unobserve();
          palindrom.unlisten();
          moxios.uninstall();
        });

        it('its `.element` should point to `document.body`', function() {
          assert(palindrom.element === document.body);
        });
        describe('should intercept links to use History API', function() {
          it('relative path', function() {
            const href = 'test_a';

            createAndClickOnLink(href);
            expect(historySpy.callCount).to.equal(1);
          });

          it('relative path (nested)', function() {
            const href = 'test_b';

            createAndClickOnLinkNested(href);
            expect(historySpy.callCount).to.equal(1);
          });
          it('relative path (nested, Shadow DOM)', function() {
            const href = 'test_c';

            createAndClickOnLinkNestedShadowDOM(href);
            expect(historySpy.callCount).to.equal(1);
          });
          it('relative path (nested, Shadow DOM content)', function(done) {
            setTimeout(() => {
              createAndClickOnLinkNestedShadowDOMContent();

              setTimeout(function() {
                expect(historySpy.callCount).to.equal(1);
                done();
              }, 5);
            }, 5);
          });

          it('absolute path', function() {
            const href = '/test';
            createAndClickOnLink(href);
            expect(historySpy.callCount).to.equal(1);
          });

          it('full URL in the same host, same port', function() {
            const href =
              window.location.protocol + '//' + window.location.host + '/test'; //http://localhost:8888/test
            createAndClickOnLink(href);
            expect(historySpy.callCount).to.equal(1);
          });
        });
        describe('Links with targets', function() {
          it('should not intercept links with a set target', function() {
            const href = '/components/Palindrom/test/PopupPage.html';

            // needed for Sauce labs, they allow pop ups, and this means we lose focus here
            const popup = window.open('', '_popup')
            createAndClickOnLinkWithoutPrevention(href, null, '_popup');
            // focus again
            popup && popup.close();

            expect(historySpy.callCount).to.equal(0);
          });
          it('should intercept links with target _self', function() {
            const href = '/components/Palindrom/test/PopupPage.html';
            createAndClickOnLinkWithoutPrevention(href, null, '_self');

            expect(historySpy.callCount).to.equal(1);
          });
          it('should intercept links with an empty target', function() {
            const href = '/components/Palindrom/test/PopupPage.html';
            createAndClickOnLinkWithoutPrevention(href, null, '');

            expect(historySpy.callCount).to.equal(1);
          });
          it('should intercept links without a target', function() {
            const href = '/components/Palindrom/test/PopupPage.html';
            createAndClickOnLinkWithoutPrevention(href, null);

            expect(historySpy.callCount).to.equal(1);
          });
        });
        describe('should not intercept external links', function() {
          it('full URL in the same host, different port', function() {
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

            expect(historySpy.callCount).to.equal(0);
          });

          it('full URL in the same host, different schema', function(done) {
            const protocol =
              window.location.protocol === 'http:' ? 'https:' : 'http:';
            const href = protocol + '//' + window.location.host + '/test'; //https://localhost:8888/test
            createAndClickOnLink(href);
            expect(historySpy.callCount).to.equal(0);
            setTimeout(done, 2);
          });
        });

        describe('should be accessible via API', function() {
          it('should change history state programmatically', function(done) {
            setTimeout(function() {
              palindrom.morphUrl('/page2');

              setTimeout(function() {
                expect(historySpy.callCount).to.equal(1);
                setTimeout(done, 2);
              }, 5);
            }, 5);
          });
        });

        it('should stop listening to DOM changes after `.unlisten()` was called', function(
          done
        ) {
          palindrom.unlisten();
          createAndClickOnLink('#will_not_get_caught_by_palindrom');
          expect(historySpy.callCount).to.equal(0);
          setTimeout(done, 5);
        });

        it('should start listening to DOM changes after `.listen()` was called', function(
          done
        ) {
          palindrom.unlisten();
          palindrom.listen();
          createAndClickOnLink('#will_get_caught_by_palindrom');
          expect(historySpy.callCount).to.equal(1);
          setTimeout(done, 5);
        });
      });
    });

    describe('when attached to specific node', function() {
      let palindrom, palindromB, palindromNode, nodeB, historySpy, currLoc;
      currScrollY;

      before(function() {
        currLoc = window.location.href;
        currScrollY = document.documentElement.scrollTop;
      });
      after(function() {
        history.pushState(null, null, currLoc);
        window.scrollTo(0, currScrollY);
      });

      beforeEach('when attached to specific node', function(done) {
        historySpy = sinon.spy(window.history, 'pushState');

        moxios.install();
        moxios.stubRequest('http://localhost/testURL', {
          status: 200,
          headers: { Location: 'http://localhost/testURL' },
          responseText: '{"hello": "world"}'
        });

        palindromNode = document.createElement('DIV');
        document.body.appendChild(palindromNode);
        nodeB = document.createElement('DIV');
        document.body.appendChild(nodeB);
        palindrom = new PalindromDOM({
          remoteUrl: 'http://localhost/testURL',
          listenTo: palindromNode
        });

        setTimeout(done, 5);
      });

      afterEach(function() {
        window.history.pushState.reset();
        window.history.pushState.restore();
        palindrom.unobserve();
        palindrom.unlisten();
        historySpy = null;
      });
      describe('should intercept child links to use History API', function() {
        it('relative path', function() {
          const href = 'test_a';

          createAndClickOnLink(href, palindromNode);
          expect(historySpy.callCount).to.equal(1);
        });

        it('relative path (nested)', function() {
          const href = 'test_b';
          createAndClickOnLinkNested(href, palindromNode);
          expect(historySpy.callCount).to.equal(1);
        });
        it('relative path (nested, Shadow DOM)', function() {
          const href = 'test_c';

          createAndClickOnLinkNestedShadowDOM(href, palindromNode);
          expect(historySpy.callCount).to.equal(1);
        });
        it('absolute path', function() {
          const href = '/test';
          createAndClickOnLink(href, palindromNode);
          expect(historySpy.callCount).to.equal(1);
        });

        it('full URL in the same host, same port', function() {
          const href =
            window.location.protocol + '//' + window.location.host + '/test'; //http://localhost:8888/test

          createAndClickOnLink(href, palindromNode);
          expect(historySpy.callCount).to.equal(1);
        });
      });

      describe('should not intercept links from outside of `.element` tree to use History API', function() {
        it('relative path', function() {
          const href = 'test_a';
          createAndClickOnLink(href, nodeB);
          expect(historySpy.callCount).to.equal(0);
        });

        it('relative path (nested)', function() {
          const href = 'test_b';
          createAndClickOnLinkNested(href, nodeB);
          expect(historySpy.callCount).to.equal(0);
        });
        it('relative path (nested, Shadow DOM)', function() {
          const href = 'test_c';
          createAndClickOnLinkNestedShadowDOM(href, nodeB);
          expect(historySpy.callCount).to.equal(0);
        });
        it('absolute path', function() {
          const href = '/test';
          createAndClickOnLink(href, nodeB);
          expect(historySpy.callCount).to.equal(0);
        });

        it('full URL in the same host, same port', function() {
          const href =
            window.location.protocol + '//' + window.location.host + '/test';

          createAndClickOnLink(href, nodeB);
          expect(historySpy.callCount).to.equal(0);
        });
      });

      describe('should not intercept external links', function() {
        it('full URL in the same host, different port', function() {
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

          createAndClickOnLink(href, palindromNode);
          assert(historySpy.callCount === 0);
        });

        it('full URL in the same host, different schema', function() {
          const protocol =
            window.location.protocol === 'http:' ? 'https:' : 'http:';
          const href = protocol + '//' + window.location.host + '/test'; //https://localhost:8888/test
          createAndClickOnLink(href, palindromNode);
          assert(historySpy.callCount === 0);
        });
      });

      describe('should be accessible via API', function() {
        it('should change history state programmatically', function(done) {
          setTimeout(function() {
            palindrom.morphUrl('/page2');

            setTimeout(function() {
              assert(historySpy.callCount === 1);

              done();
            }, 5);
          }, 5);
        });
      });

      it('should stop listening to DOM changes after `.unlisten()` was called', function(
        done
      ) {
        setTimeout(function() {
          palindrom.unlisten();
          setTimeout(function() {
            createAndClickOnLink(
              '#will_not_get_caught_by_palindrom',
              palindromNode
            );
            setTimeout(function() {
              expect(historySpy.callCount).to.equal(0);
              done();
            }, 5);
          }, 5);
        }, 5);
      });

      it('should start listening to DOM changes after `.listen()` was called', function() {
        palindrom.unlisten();
        palindrom.listen();

        createAndClickOnLink(
          '#will_not_get_caught_by_palindrom',
          palindromNode
        );
        expect(historySpy.callCount).to.equal(1);
      });
    });
  });

  describe('History', function() {
    let wsSpy, palindrom, currLoc, currScrollY;

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
      moxios.stubRequest('http://localhost/testURL', {
        status: 200,
        headers: { location: 'http://localhost/testURL' },
        responseText: '{"hello": "world"}'
      });

      palindrom = new PalindromDOM({ remoteUrl: 'http://localhost/testURL' });
    });
    afterEach(function() {
      palindrom.unobserve();
      moxios.uninstall();
    });

    /// init
    describe('should send JSON Patch HTTP request once history state get changed', function() {
      it('by `palindrom.morphURL(url)` method', function(done) {
        palindrom.morphUrl('/newUrl');
        setTimeout(function() {
          const request = moxios.requests.mostRecent();
          expect(request.url).to.equal('/newUrl');
          expect(window.location.pathname).to.equal('/newUrl');
          done();
        }, 5);
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
        moxios.stubRequest('http://localhost/testURL', {
          status: 200,
          headers: { location: 'http://localhost/testURL' },
          responseText: '{"hello": "world"}'
        });

        palindrom = new PalindromDOM({ remoteUrl: 'http://localhost/testURL' });
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
          headers: { location: 'http://localhost/testURL' },
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
        moxios.stubRequest('http://localhost/testURL', {
          status: 200,
          headers: { location: 'http://localhost/testURL' },
          responseText: '{"hello": "world"}'
        });

        palindrom = new PalindromDOM({ remoteUrl: 'http://localhost/testURL' });
      });
      afterEach(function() {
        palindrom.unobserve();
        moxios.uninstall();
      });

      it('by dispatching `palindrom-redirect-pushstate` event', function(done) {
        history.pushState(null, null, '/newUrl-palindrom');

        moxios.stubRequest(/.+/, {
          status: 200,
          headers: { location: 'http://localhost/testURL' },
          responseText: '[]'
        });

        document.body.dispatchEvent(
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
