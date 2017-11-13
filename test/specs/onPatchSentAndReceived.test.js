global.WebSocket = require("mock-socket").WebSocket;

const MockSocketServer = require("mock-socket").Server;
const Palindrom = require("../../src/palindrom");
const assert = require("assert");
const moxios = require("moxios");
const sinon = require("sinon");

describe("Callbacks, onPatchSent and onPatchReceived", () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });

  describe("XHR", function() {
    it("should call onPatchSent and onPatchReceived callbacks when a patch is sent and received", done => {
      moxios.stubRequest("http://house.of.cards/testURL", {
        status: 200,
        headers: { location: "http://house.of.cards/testURL2" },
        responseText: '{"hello": "world"}'
      });

      const onPatchReceived = sinon.spy();
      const onPatchSent = sinon.spy();
      let tempObj;

      const palindrom = new Palindrom({
        remoteUrl: "http://house.of.cards/testURL",
        onStateReset: function(obj) {
          tempObj = obj;
        },
        onPatchReceived,
        onPatchSent
      });

      setTimeout(
        () => {
          /* onPatchReceived, shouldn't be called now */
          assert(onPatchReceived.notCalled);

          /* onPatchSent, shouldn be called once now, the initial request */
          assert(onPatchSent.calledOnce);

          /* prepare response */
          moxios.stubRequest("http://house.of.cards/testURL2", {
            status: 200,
            headers: { Location: "http://house.of.cards/testURL" },
            responseText: '[{"op":"replace", "path":"/hello", "value":"onPatchReceived callback"}]'
          });

          /* issue a change */
          tempObj.hello = "onPatchSent callback";
          assert(onPatchSent.calledTwice);

          /* wait for XHR */
          setTimeout(
            () => {
              assert(onPatchReceived.calledOnce);
              assert.deepEqual(onPatchReceived.lastCall.args[0], [
                {
                  op: "replace",
                  path: "/hello",
                  value: "onPatchReceived callback"
                }
              ]);
              done();
            },
            10
          );
        },
        30
      );
    });
  });

  describe("WebSockets", function() {
    it("should call onPatchSent and onPatchReceived callbacks when a patch is sent and received", done => {
      const server = new MockSocketServer(
        "ws://house.of.cards/default/this_is_a_nice_url"
      );

      moxios.stubRequest("http://house.of.cards/testURL", {
        status: 200,
        headers: { location: "/default/this_is_a_nice_url" },
        responseText: '{"hello": "world"}'
      });

      /* prepare response */
      server.on("message", patches => {
        /* make sure a correct patch is sent to server */
        assert.deepEqual(JSON.parse(patches), [
          { op: "replace", path: "/hello", value: "onPatchSent callback" }
        ]);

        /* respond */
        server.send(
          '[{"op":"replace", "path":"/hello", "value":"onPatchReceived callback"}]'
        );
      });

      const onPatchReceived = sinon.spy();
      const onPatchSent = sinon.spy();
      let tempObj;

      const palindrom = new Palindrom({
        remoteUrl: "http://house.of.cards/testURL",
        onStateReset: function(obj) {
          tempObj = obj;
        },
        useWebSocket: true,
        onPatchReceived,
        onPatchSent
      });

      setTimeout(
        () => {
          /* onPatchReceived, shouldn't be called now */
          assert(onPatchReceived.notCalled);

          /* onPatchSent, should be called once now, the initial request */
          assert(onPatchSent.calledOnce);

          /* issue a change */
          tempObj.hello = "onPatchSent callback";
          assert(onPatchSent.calledTwice);

          /* wait for XHR */
          setTimeout(
            () => {
              assert(onPatchReceived.calledOnce);
              assert.deepEqual(onPatchReceived.lastCall.args[0], [
                {
                  op: "replace",
                  path: "/hello",
                  value: "onPatchReceived callback"
                }
              ]);
              done();
            },
            10
          );
        },
        50
      );
    });
  });
});