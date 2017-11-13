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
        onStateReset: spy
      });
      setTimeout(
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
        onStateReset: spy
      });
      setTimeout(
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

      setTimeout(() => {
        /* setting the object should throw an error */
        assert.throws(() => palindrom.obj = {}, Error, "palindrom.obj is readonly");
        done();
      }, 1);
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
        onStateReset: function(tempObject) {
          assert.equal(tempObject.hello, "world");
          tempObject.hello = "galaxy";

          /* now two ajax requests should had happened,
                    the initial one, and the patch one (hello = world => hello = galaxy)*/
          setTimeout(
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
        onStateReset: function(obj) {
          tempObject = obj;
        }
      });
      setTimeout(
        () => {
          assert.equal(1, moxios.requests.count());
          assert.equal(tempObject.unwatched, "object");
          tempObject.unwatched = "objecto";
        },
        5
      );

      /* now two ajax requests should have happened, 
            the initial one, and the patch one */
      setTimeout(
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
      setTimeout(
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
        onStateReset: function(obj) {
          tempObject = obj;
        }
      });
      setTimeout(
        () => {
          assert.equal(tempObject.unwatched, "object");
          assert.equal(1, moxios.requests.count());
          tempObject.unwatched = "objecto";
        },
        13
      );

      /* now two ajax requests should had happened, 
            the initial one, and the patch one */
      setTimeout(
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
      setTimeout(
        () => {
          assert.equal(2, moxios.requests.count());

          /* let's observe again */
          palindrom.observe();
          tempObject.unwatched = "a change that SHOULD be considered";
        },
        15
      );

      /* now palindrom is observed, requests should become 3  */
      setTimeout(
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