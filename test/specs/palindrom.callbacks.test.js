import Palindrom from '../../src/palindrom';
import assert from 'assert';
import moxios from 'moxios';
import sinon from 'sinon';

describe("Callbacks", () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });

  it("should dispatch local-change event for outgoing patches", done => {
    moxios.stubRequest("http://house.of.cards/testURL", {
      status: 200,
      headers: { Location: "http://house.of.cards/testURL" },
      responseText: '{"hello": "world"}'
    });

    const sentSpy = sinon.spy();
    let tempObj;

    const palindrom = new Palindrom({
        remoteUrl: "http://house.of.cards/testURL",
    });
    palindrom.addEventListener('state-reset', ev => tempObj = ev.detail);
    palindrom.addEventListener('local-change', ev => sentSpy(ev.detail));

    setTimeout(
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

  it("should dispatch state-reset event for applied patches on root (initial state)", done => {
    moxios.stubRequest("http://house.of.cards/testURL", {
      status: 200,
      headers: { Location: "http://house.of.cards/testURL" },
      responseText: '{"hello": "world"}'
    });

    const palindrom = new Palindrom({
      remoteUrl: "http://house.of.cards/testURL",
    });

    palindrom.addEventListener('state-reset', ev => {
      done()
    });
  });
});
