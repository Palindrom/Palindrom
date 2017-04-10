global.WebSocket = require("mock-socket").WebSocket;

const Palindrom = require("../../src/palindrom");
const assert = require("assert");
const moxios = require("moxios");
const sinon = require("sinon");

describe("Callbacks", () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });

  it("should call onLocalChange callback for outgoing patches", done => {
    moxios.stubRequest("http://house.of.cards/testURL", {
      status: 200,
      headers: { Location: "http://house.of.cards/testURL" },
      responseText: '{"hello": "world"}'
    });

    const sentSpy = sinon.spy();
    let tempObj;

    const palindrom = new Palindrom({
      remoteUrl: "http://house.of.cards/testURL",
      onLocalChange: sentSpy,
      callback: function(obj) {
        tempObj = obj;
      }
    });

    moxios.wait(
      () => {
        /* onLocalChange shouldn't be called now */
        assert(sentSpy.notCalled);

        /* issue a change */
        tempObj.hello = "onLocalChange callback";

        assert(sentSpy.calledOnce);
        assert.deepEqual(sentSpy.lastCall.args[0], [
          { op: "replace", path: "/hello", value: "onLocalChange callback" }
        ]);
        done();
      },
      30
    );
  });

  it("should call onRemoteChange callback for applied patches", done => {
    moxios.stubRequest("http://house.of.cards/testURL", {
      status: 200,
      headers: { Location: "http://house.of.cards/testURL" },
      responseText: '{"hello": "world"}'
    });

    const receivedSpy = sinon.spy();
    let tempObj;

    const palindrom = new Palindrom({
      remoteUrl: "http://house.of.cards/testURL",
      callback: function(obj) {
        tempObj = obj;
      },
      onRemoteChange: receivedSpy
    });

    moxios.wait(
      () => {
        assert(receivedSpy.calledOnce);

        tempObj.hello = "onRemoteChange callback";
        done();
      },
      10
    );
  });
});
