global.WebSocket = require("mock-socket").WebSocket;

const Palindrom = require("../../src/palindrom");
const assert = require("assert");
const moxios = require("moxios");
const sinon = require("sinon");
const expect = require("chai").expect;

describe("Palindrom", () => {
  describe("#constructor", () => {
    beforeEach(() => {
      moxios.install();
    });
    afterEach(() => {
      moxios.uninstall();
    });
    it("should initiate an ajax request when initiated, and call the callback function", function(done) {
      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { Location: "http://localhost/testURL" },
        responseText: '{"hello": "world"}'
      });
      const spy = sinon.spy();
      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        callback: spy
      });
      moxios.wait(
        () => {
          assert(spy.called);
          assert.deepEqual(spy.getCall(0).args[0], { hello: "world" });
          done();
        },
        5
      );
    });
    it("should accept a JSON that has an empty string as a key", function(done) {
      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { Location: "http://localhost/testURL" },
        responseText: '{"hello": "world","": {"hola": "mundo"}}'
      });
      const spy = sinon.spy();
      let palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        callback: spy
      });
      moxios.wait(
        () => {
          assert.deepEqual(spy.getCall(0).args[0], {
            hello: "world",
            "": { hola: "mundo" }
          });
          assert.equal("mundo", palindrom.obj[""].hola);
          done();
        },
        5
      );
    });
  });
});
describe("Palindrom", () => {
  describe("obj", () => {
    beforeEach(() => {
      moxios.install();
    });
    afterEach(() => {
      moxios.uninstall();
    });
    it("palindrom.obj should be readonly", function(done) {
      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"hello": "world"}'
      });

      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL"
      });

      moxios.wait(() => {
        /* setting the object should throw an error */
        assert.throws(() => palindrom.obj = {}, Error, "palindrom.obj is readonly");
        done();
      }, 10);
    });
  });
});
describe("Palindrom", () => {
  describe("#patching", () => {
    beforeEach(() => {
      moxios.install();
    });
    afterEach(() => {
      moxios.uninstall();
    });
    it("should patch changes", function(done) {
      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"hello": "world"}'
      });

      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        callback: function(tempObject) {
          assert.equal(tempObject.hello, "world");
          tempObject.hello = "galaxy";

          /* now two ajax requests should had happened,
                    the initial one, and the patch one (hello = world => hello = galaxy)*/
          moxios.wait(
            () => {
              assert.equal(2, moxios.requests.count());
              let request = moxios.requests.mostRecent();

              assert.equal(
                '[{"op":"replace","path":"/hello","value":"galaxy"}]',
                request.config.data
              );
              done();
            },
            5
          );
        }
      });
    });
    it("should not patch changes after unobserve() was called", function(done) {
      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"unwatched": "object"}'
      });
      let tempObject;
      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        callback: function(obj) {
          tempObject = obj;
        }
      });
      moxios.wait(
        () => {
          assert.equal(1, moxios.requests.count());
          assert.equal(tempObject.unwatched, "object");
          tempObject.unwatched = "objecto";
        },
        5
      );

      /* now two ajax requests should have happened, 
            the initial one, and the patch one */
      moxios.wait(
        () => {
          assert.equal(2, moxios.requests.count());
          let request = moxios.requests.mostRecent();
          assert.equal(
            '[{"op":"replace","path":"/unwatched","value":"objecto"}]',
            request.config.data
          );
          palindrom.unobserve();
          tempObject.hello = "a change that shouldn't be considered";
        },
        10
      );

      /* now palindrom is unobserved, requests should stay 2 */
      moxios.wait(
        () => {
          assert.equal(2, moxios.requests.count());
          done();
        },
        15
      );
    });
    it("should patch changes after observe() was called", function(done) {
      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"unwatched": "object"}'
      });
      let tempObject;
      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        callback: function(obj) {
          tempObject = obj;
        }
      });
      moxios.wait(
        () => {
          assert.equal(tempObject.unwatched, "object");
          assert.equal(1, moxios.requests.count());
          tempObject.unwatched = "objecto";
        },
        13
      );

      /* now two ajax requests should had happened, 
            the initial one, and the patch one */
      moxios.wait(
        () => {
          assert.equal(2, moxios.requests.count());
          let request = moxios.requests.mostRecent();
          assert.equal(
            '[{"op":"replace","path":"/unwatched","value":"objecto"}]',
            request.config.data
          );
          palindrom.unobserve();
          tempObject.unwatched = "a change that should NOT be considered";
        },
        14
      );

      /* now palindrom is unobserved, requests should stay 2 */
      moxios.wait(
        () => {
          assert.equal(2, moxios.requests.count());

          /* let's observe again */
          palindrom.observe();
          tempObject.unwatched = "a change that SHOULD be considered";
        },
        15
      );

      /* now palindrom is observed, requests should become 3  */
      moxios.wait(
        () => {
          let request = moxios.requests.mostRecent();
          assert.equal(3, moxios.requests.count());
          assert.equal(
            '[{"op":"replace","path":"/unwatched","value":"a change that SHOULD be considered"}]',
            request.config.data
          );
          done();
        },
        16
      );
    });
  });
});
describe("Palindrom", () => {
  describe("#error responses", () => {
    beforeEach(() => {
      moxios.install();
    });
    afterEach(() => {
      moxios.uninstall();
    });
    it("should call onConnectionError on HTTP 400 response", function(done) {
      const spy = sinon.spy();

      moxios.stubRequest("http://localhost/testURL", {
        status: 400,
        headers: { contentType: "application/json" },
        responseText: "Custom message"
      });

      let tempObject;
      const that = this;

      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        onConnectionError: spy
      });

      /* onConnectionError should be called once now */
      moxios.wait(
        () => {
          assert(spy.calledOnce);
          done();
        },
        5
      );
    });

    it("should call onConnectionError on HTTP 599 response", function(done) {
      const spy = sinon.spy();

      moxios.stubRequest("http://localhost/testURL", {
        status: 599,
        headers: { contentType: "application/json" },
        responseText: "Custom message"
      });

      let tempObject;
      const that = this;

      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        onConnectionError: spy
      });

      /* onConnectionError should be called once now */
      moxios.wait(
        () => {
          assert(spy.calledOnce);
          done();
        },
        5
      );
    });

    it("should call onConnectionError on HTTP 400 response (patch)", function(done) {
      const spy = sinon.spy();

      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"hello": "world"}'
      });

      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        onConnectionError: spy
      });

      moxios.withMock(() => {
        moxios.wait(
          () => {
            palindrom.obj.hello = "galaxy";
            let request = moxios.requests.mostRecent();
            request
              .respondWith({
                status: 400,
                headers: { contentType: "application/json" },
                response: "Custom message"
              })
              .then(() => {
                /* onConnectionError should be called once now */
                assert(spy.calledOnce);
                done();
              });
          },
          5
        );
      });
    });
    it("should call onConnectionError on HTTP 599 response (patch)", function(done) {
      const spy = sinon.spy();

      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"hello": "world"}'
      });

      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        onConnectionError: spy
      });

      moxios.withMock(() => {
        moxios.wait(
          () => {
            palindrom.obj.hello = "galaxy";
            let request = moxios.requests.mostRecent();
            request
              .respondWith({
                status: 599,
                headers: { contentType: "application/json" },
                response: "Custom message"
              })
              .then(() => {
                assert(spy.calledOnce);
                done();
              });
          },
          5
        );
      });
    });
  });
});
describe("Palindrom", () => {
  describe("#IgnoreAdd", () => {
    beforeEach(() => {
      moxios.install();
    });
    afterEach(() => {
      moxios.uninstall();
    });
    it("should not send add patch to an ignored property", function(done) {
      const spy = sinon.spy();

      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"hello": "world"}'
      });

      let tempObject;
      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        onConnectionError: spy,
        callback: function(myObj) {
          tempObject = myObj;
        }
      });

      palindrom.ignoreAdd = /\/\$.+/;

      /* before adding an ignored variable, we should have one ajax request */
      moxios.wait(
        () => {
          assert.equal(1, moxios.requests.count());

          /* now we add an ignored variable */
          tempObject.$privateProp = 1;
        },
        5
      );

      /* after adding an ignored variable, we should still have one ajax request */
      moxios.wait(
        () => {
          assert.equal(1, moxios.requests.count());

          /* now added a NOT ignored variable */
          tempObject.publicProb = 1;
        },
        10
      );

      /* after adding a NOT ignored variable, we should have TWO ajax requests */
      moxios.wait(
        () => {
          assert.equal(2, moxios.requests.count());
          let request = moxios.requests.mostRecent();

          /* and the mostRecent of them should be the following patch */
          assert.equal(
            '[{"op":"add","path":"/publicProb","value":1}]',
            request.config.data
          );
          done();
        },
        15
      );
    });
    it("should not send replace patch to an ignored property", function(done) {
      const spy = sinon.spy();

      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"hello": "world"}'
      });

      let tempObject;
      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        onConnectionError: spy,
        callback: function(myObj) {
          tempObject = myObj;
        }
      });

      palindrom.ignoreAdd = /\/\$.+/;

      /* before adding an ignored variable, we should have one ajax request */
      moxios.wait(
        () => {
          assert.equal(1, moxios.requests.count());

          /* add an ignored variable */
          tempObject.$privateProp = 1;
        },
        5
      );

      /* let's change the ignored variable */
      moxios.wait(
        () => {
          tempObject.$privateProp = 2;
        },
        10
      );

      /* after changing an ignored variable, we should still have one ajax request */
      moxios.wait(
        () => {
          assert.equal(1, moxios.requests.count());
          done();
        },
        15
      );
    });

    it("should not send replace patch to an ignored deep object", function(done) {
      const spy = sinon.spy();

      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"hello": 0}'
      });

      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        onConnectionError: spy,
        callback: function(tempObject) {
          tempObject.publicProp = [1, 2, 3];

          moxios.wait(
            () => {
              /* initial request and `add` publicProb */
              assert.equal(2, moxios.requests.count());

              tempObject.$privateProp = [1, 2, 3];

              /* we should have two requests, initial and publicProb add */
              moxios.wait(
                () => {
                  assert.equal(2, moxios.requests.count());
                },
                5
              );

              /* change ignored property deeply */
              moxios.wait(
                () => {
                  tempObject.$privateProp[1] = 32;
                },
                10
              );

              /* we should STILL have two requests, initial and publicProb add only */
              moxios.wait(
                () => {
                  assert.equal(2, moxios.requests.count());
                  done();
                },
                15
              );
            },
            5
          );
        }
      });

      palindrom.ignoreAdd = /\/\$.+/;
    });

    it("should not send any patch if all changes were ignored", function(done) {
      const spy = sinon.spy();

      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"hello": 0}'
      });

      let tempObject;
      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        onConnectionError: spy,
        callback: function(myObj) {
          tempObject = myObj;

          tempObject.$privateProp = 1;
        }
      });

      palindrom.ignoreAdd = /\/\$.+/;

      /* we should have two requests, initial and publicProb add */
      moxios.wait(
        () => {
          assert.equal(1, moxios.requests.count());

          tempObject.$privateProp = 22;
        },
        5
      );

      /* change ignored property deeply */
      moxios.wait(
        () => {
          assert.equal(1, moxios.requests.count());
          done();
        },
        100
      );
    });

    it("should not send a patch when added property is replaced", function(done) {
      const spy = sinon.spy();

      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"hello": 0}'
      });

      let tempObject;
      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        onConnectionError: spy,
        callback: function(myObj) {
          tempObject = myObj;
        }
      });

      palindrom.ignoreAdd = /\/\$.+/;

      /* we should have one request, initial connection */
      moxios.wait(
        () => {
          assert.equal(1, moxios.requests.count());

          /* change ignored properties */
          tempObject.$privateProp = 1;
          tempObject.$privateProp = 2;
        },
        5
      );

      /*  we should still have one request, initial connection */
      moxios.wait(
        () => {
          assert.equal(1, moxios.requests.count());
          done();
        },
        100
      );
    });
  });
});
