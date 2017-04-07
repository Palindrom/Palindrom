/** only run DOM tests in browsers */
if (typeof window !== "undefined") {
  const PalindromDOM = require("../../../src/palindrom-dom");
  const assert = require("assert");
  const moxios = require("moxios");
  const sinon = require("sinon");
  const expect = require("chai").expect;

  function createAndClickOnLink(href, parent) {
    parent = parent || document.body;
    const a = document.createElement("A");
    a.innerHTML = "Link";
    a.href = href;
    parent.appendChild(a);
    parent.addEventListener("click", clickHandler);
    clickElement(a);
    parent.removeEventListener("click", clickHandler);
    parent.removeChild(a);
  }
  function createAndClickOnLinkNested(href, parent) {
    parent = parent || document.body;
    const a = document.createElement("A");
    a.innerHTML = "<strong>Link</strong>";
    a.href = href;
    parent.appendChild(a);
    parent.addEventListener("click", clickHandler);
    clickElement(a.firstChild);
    parent.removeEventListener("click", clickHandler);
    parent.removeChild(a);
  }

  function clickElement(element) {
    if (window.MouseEvent) {
      const event = new window.MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(event);
    }
  }

  function createAndClickOnLinkNestedShadowDOM(href, parent) {
    parent = parent || document.body;
    const div = document.createElement("DIV");
    parent.appendChild(div);

    const a = document.createElement("A");
    a.innerHTML = "<strong>Link</strong>";
    a.href = href;
    div.createShadowRoot().appendChild(a);
    parent.addEventListener("click", clickHandler);
    clickElement(a.firstChild);

    parent.removeEventListener("click", clickHandler);
    parent.removeChild(div);
  }
  function createAndClickOnLinkNestedShadowDOMContent() {
    const btn = document.querySelector("my-menu-button strong");
    btn.click();
  }

  function clickHandler(event) {
    event.preventDefault();
  }

  describe("Links", function() {
    let currLoc;
    before(function() {
      currLoc = window.location.href;
    });
    after(function() {
      history.pushState(null, null, currLoc);
    });

    describe("PalindromDOM - Links - ", function() {
      describe("when attached to default node - `document.body`", function() {
        let palindrom;
        let historySpy;

        beforeEach("PalindromDOM - Links", function(done) {
          historySpy = sinon.spy(window.history, "pushState");

          moxios.install();
          moxios.stubRequest("http://localhost/testURL", {
            status: 200,
            headers: { location: "http://localhost/testURLNew" },
            responseText: '{"hello": "world"}'
          });

          palindrom = new PalindromDOM({
            remoteUrl: "http://localhost/testURL"
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

        it("its `.element` should point to `document.body`", function() {
          assert(palindrom.element === document.body);
        });
        describe("should intercept links to use History API", function() {
          it("relative path", function() {
            const href = "test_a";

            createAndClickOnLink(href);
            expect(historySpy.callCount).to.equal(1);
          });

          it("relative path (nested)", function() {
            const href = "test_b";

            createAndClickOnLinkNested(href);
            expect(historySpy.callCount).to.equal(1);
          });
          it("relative path (nested, Shadow DOM)", function() {
            const href = "test_c";

            createAndClickOnLinkNestedShadowDOM(href);
            expect(historySpy.callCount).to.equal(1);
          });  
          it("relative path (nested, Shadow DOM content)", function(done) {
            moxios.wait(
              () => {
                createAndClickOnLinkNestedShadowDOMContent();

                moxios.wait(
                  function() {
                    expect(historySpy.callCount).to.equal(1);
                    done();
                  },
                  10
                );
              },
              10
            );
          });

          it("absolute path", function() {
            const href = "/test";
            createAndClickOnLink(href);
            expect(historySpy.callCount).to.equal(1);
          });

          it("full URL in the same host, same port", function() {
            const href = window.location.protocol +
              "//" +
              window.location.host +
              "/test"; //http://localhost:8888/test
            createAndClickOnLink(href);
            expect(historySpy.callCount).to.equal(1);
          });
        });

        describe("should not intercept external links", function() {
          it("full URL in the same host, different port", function() {
            const port = window.location.port === "80" ||
              window.location.port === ""
              ? "8080"
              : "80";
            const href = window.location.protocol +
              "//" +
              window.location.hostname +
              ":" +
              port +
              "/test"; //http://localhost:88881/test
            createAndClickOnLink(href);

            expect(historySpy.callCount).to.equal(0);
          });

          it("full URL in the same host, different schema", function() {
            const protocol = window.location.protocol === "http:"
              ? "https:"
              : "http:";
            const href = protocol + "//" + window.location.host + "/test"; //https://localhost:8888/test
            createAndClickOnLink(href);

            expect(historySpy.callCount).to.equal(0);
          });
        });

        describe("should be accessible via API", function() {
          it("should change history state programmatically", function(done) {
            moxios.wait(
              function() {
                palindrom.morphUrl("/page2");

                moxios.wait(
                  function() {
                    expect(historySpy.callCount).to.equal(1);
                    done();
                  },
                  10
                );
              },
              10
            );
          });
        });

        it("should stop listening to DOM changes after `.unlisten()` was called", function() {
          palindrom.unlisten();

          createAndClickOnLink("#will_not_get_caught_by_palindrom");
          expect(historySpy.callCount).to.equal(0);
        });

        it("should start listening to DOM changes after `.listen()` was called", function() {
          palindrom.unlisten();
          palindrom.listen();

          createAndClickOnLink("#will_not_get_caught_by_palindrom");
          expect(historySpy.callCount).to.equal(1);
        });
      });
    });

    describe("when attached to specific node", function() {
      let palindrom, palindromB, palindromNode, nodeB, historySpy, currLoc;

      before(function() {
        currLoc = window.location.href;
      });
      after(function() {
        history.pushState(null, null, currLoc);
      });

      beforeEach("when attached to specific node", function(done) {
        historySpy = sinon.spy(window.history, "pushState");

        moxios.install();
        moxios.stubRequest("http://localhost/testURL", {
          status: 200,
          headers: { Location: "http://localhost/testURL" },
          responseText: '{"hello": "world"}'
        });

        palindromNode = document.createElement("DIV");
        document.body.appendChild(palindromNode);
        nodeB = document.createElement("DIV");
        document.body.appendChild(nodeB);
        palindrom = new PalindromDOM({
          remoteUrl: "http://localhost/testURL",
          listenTo: palindromNode
        });

        setTimeout(done, 1);
      });

      afterEach(function() {
        window.history.pushState.reset();
        window.history.pushState.restore();
        palindrom.unobserve();
        palindrom.unlisten();
        historySpy = null;
      });
      describe("should intercept child links to use History API", function() {
        it("relative path", function() {
          const href = "test_a";

          createAndClickOnLink(href, palindromNode);
          expect(historySpy.callCount).to.equal(1);
        });

        it("relative path (nested)", function() {
          const href = "test_b";
          createAndClickOnLinkNested(href, palindromNode);
          expect(historySpy.callCount).to.equal(1);
        });
        it("relative path (nested, Shadow DOM)", function() {
          const href = "test_c";

          createAndClickOnLinkNestedShadowDOM(href, palindromNode);
          expect(historySpy.callCount).to.equal(1);
        });
        it("absolute path", function() {
          const href = "/test";
          createAndClickOnLink(href, palindromNode);
          expect(historySpy.callCount).to.equal(1);
        });

        it("full URL in the same host, same port", function() {
          const href = window.location.protocol +
            "//" +
            window.location.host +
            "/test"; //http://localhost:8888/test

          createAndClickOnLink(href, palindromNode);
          expect(historySpy.callCount).to.equal(1);
        });
      });

      describe("should not intercept links from outside of `.element` tree to use History API", function() {
        it("relative path", function() {
          const href = "test_a";
          createAndClickOnLink(href, nodeB);
          expect(historySpy.callCount).to.equal(0);
        });

        it("relative path (nested)", function() {
          const href = "test_b";
          createAndClickOnLinkNested(href, nodeB);
          expect(historySpy.callCount).to.equal(0);
        });
        it("relative path (nested, Shadow DOM)", function() {
          const href = "test_c";
          createAndClickOnLinkNestedShadowDOM(href, nodeB);
          expect(historySpy.callCount).to.equal(0);
        });
        it("absolute path", function() {
          const href = "/test";
          createAndClickOnLink(href, nodeB);
          expect(historySpy.callCount).to.equal(0);
        });

        it("full URL in the same host, same port", function() {
          const href = window.location.protocol +
            "//" +
            window.location.host +
            "/test";

          createAndClickOnLink(href, nodeB);
          expect(historySpy.callCount).to.equal(0);
        });
      });

      describe("should not intercept external links", function() {
        it("full URL in the same host, different port", function() {
          const port = window.location.port === "80" ||
            window.location.port === ""
            ? "8080"
            : "80";
          const href = window.location.protocol +
            "//" +
            window.location.hostname +
            ":" +
            port +
            "/test"; //http://localhost:88881/test

          createAndClickOnLink(href, palindromNode);
          assert(historySpy.callCount === 0);
        });

        it("full URL in the same host, different schema", function() {
          const protocol = window.location.protocol === "http:"
            ? "https:"
            : "http:";
          const href = protocol + "//" + window.location.host + "/test"; //https://localhost:8888/test
          createAndClickOnLink(href, palindromNode);
          assert(historySpy.callCount === 0);
        });
      });

      describe("should be accessible via API", function() {
        it("should change history state programmatically", function(done) {
          moxios.wait(
            function() {
              palindrom.morphUrl("/page2");

              moxios.wait(
                function() {
                  assert(historySpy.callCount === 1);

                  done();
                },
                10
              );
            },
            10
          );
        });
      });

      it("should stop listening to DOM changes after `.unlisten()` was called", function(done) {
        moxios.wait(
          function() {
            palindrom.unlisten();
            moxios.wait(
              function() {
                createAndClickOnLink(
                  "#will_not_get_caught_by_palindrom",
                  palindromNode
                );
                moxios.wait(
                  function() {
                    expect(historySpy.callCount).to.equal(0);
                    done();
                  },
                  10
                );
              },
              10
            );
          },
          10
        );
      });

      it("should start listening to DOM changes after `.listen()` was called", function() {
        palindrom.unlisten();
        palindrom.listen();

        createAndClickOnLink("#will_not_get_caught_by_palindrom", palindromNode);
        expect(historySpy.callCount).to.equal(1);
      });
    });
  });

  describe("History", function() {
    let wsSpy, palindrom, currLoc;

    before(function() {
      currLoc = window.location.href;
    });
    after(function() {
      history.pushState(null, null, currLoc);
    });

    beforeEach(function() {
      moxios.install();
      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { location: "http://localhost/testURL" },
        responseText: '{"hello": "world"}'
      });

      palindrom = new PalindromDOM({ remoteUrl: "http://localhost/testURL" });
    });
    afterEach(function() {
      palindrom.unobserve();
      moxios.uninstall();
    });

    /// init
    describe("should send JSON Patch HTTP request once history state get changed", function() {
      it("by `palindrom.morphURL(url)` method", function(done) {
        palindrom.morphUrl("/newUrl");
        moxios.wait(
          function() {
            const request = moxios.requests.mostRecent();
            expect(request.url).to.equal("/newUrl");
            expect(window.location.pathname).to.equal("/newUrl");

            done();
          },
          10
        );
      });
    });
    describe("should send JSON Patch HTTP request once history state get changed", function() {
      beforeEach(function() {
        moxios.install();
        moxios.stubRequest("http://localhost/testURL", {
          status: 200,
          headers: { location: "http://localhost/testURL" },
          responseText: '{"hello": "world"}'
        });

        palindrom = new PalindromDOM({ remoteUrl: "http://localhost/testURL" });
      });
      afterEach(function() {
        palindrom.unobserve();
        moxios.uninstall();
      });

      it("by dispatching `palindrom-redirect-pushstate` event", function(done) {
        history.pushState(null, null, "/newUrl-palindrom");

        moxios.stubRequest(/.+/, {
          status: 200,
          headers: { location: "http://localhost/testURL" },
          responseText: "[]"
        });

        document.body.dispatchEvent(
          new CustomEvent("palindrom-redirect-pushstate", {
            detail: { url: "/newUrl-palindrom" },
            bubbles: true
          })
        );

        moxios.wait(
          function() {
            const request = moxios.requests.mostRecent();

            expect(new URL(request.url).pathname).to.equal("/newUrl-palindrom");
            expect(window.location.pathname).to.equal("/newUrl-palindrom");
            done();
          },
          10
        );
      });
    });
  });
}
