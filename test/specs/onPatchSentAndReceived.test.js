import { Server as MockSocketServer } from 'mock-socket';
import Palindrom from '../../src/palindrom';
import assert from 'assert';
import moxios from 'moxios';
import sinon from 'sinon';

describe('Callbacks, onPatchSent and onPatchReceived', () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });

  describe('XHR', function() {
    it('should dispatch patch-sent and patch-received events when a patch is sent and received', done => {
      moxios.stubRequest('http://house.of.cards/testURL', {
        status: 200,
        headers: { location: 'http://house.of.cards/testURL2' },
        responseText: '{"hello": "world"}'
      });

      const onPatchReceived = sinon.spy();
      const onPatchSent = sinon.spy();
      let tempObj;

      const palindrom = new Palindrom({
        remoteUrl: 'http://house.of.cards/testURL',
      });

      palindrom.addEventListener('state-reset', ev => {
        tempObj = ev.detail;
      });

      palindrom.addEventListener('patch-received', ev => {
        onPatchReceived(ev.detail.data)
      });

      palindrom.addEventListener('patch-sent', ev => {
        onPatchSent(ev.detail.data)
      });

      setTimeout(() => {
        /* onPatchReceived, shouldn't be called now */
        assert(onPatchReceived.notCalled, 'onPatchReceived should not be called');

        /* onPatchSent, shouldnt be called now, the initial request doesnt count since you can't addEventLister before it occurs */
        assert(onPatchSent.notCalled, 'onPatchSent should not be called');

        /* prepare response */
        moxios.stubRequest('http://house.of.cards/testURL2', {
          status: 200,
          headers: { Location: 'http://house.of.cards/testURL' },
          responseText:
            '[{"op":"replace", "path":"/hello", "value":"onPatchReceived callback"}]'
        });

        /* issue a change */
        tempObj.hello = 'onPatchSent callback';
        assert(onPatchSent.calledOnce);

        /* wait for XHR */
        setTimeout(() => {
          assert(onPatchReceived.calledOnce);
          assert.deepEqual(onPatchReceived.lastCall.args[0], [
            {
              op: 'replace',
              path: '/hello',
              value: 'onPatchReceived callback'
            }
          ]);
          done();
        }, 10);
      }, 30);
    });
    it('should dispatch patch-received event even if the patch was bad', done => {
      moxios.stubRequest('http://house.of.cards/testURL', {
        status: 200,
        headers: { location: 'http://house.of.cards/testURL2' },
        responseText: '{"hello": "world"}'
      });

      const onPatchReceived = sinon.spy();
      let tempObj;

      const palindrom = new Palindrom({
        remoteUrl: 'http://house.of.cards/testURL',
      });

      palindrom.addEventListener('state-reset', ev => {
        tempObj = ev.detail;
      });

      palindrom.addEventListener('patch-received', ev => {
        onPatchReceived(ev.detail)
      });

      setTimeout(() => {
        /* onPatchReceived, shouldn't be called now */
        assert(onPatchReceived.notCalled);

        /* prepare response */
        moxios.stubRequest('http://house.of.cards/testURL2', {
          status: 200,
          headers: { Location: 'http://house.of.cards/testURL' },
          responseText:
            '[{"op":"replace", "path":"/hello", "value":' +
            (Number.MAX_SAFE_INTEGER + 1) +
            '}]'
        });

        /* issue a change */
        tempObj.hello = 'onPatchSent callback';

        /* wait for XHR */
        setTimeout(() => {
          assert(onPatchReceived.calledOnce);
          done();
        });
      });
    });
  });

  describe('WebSockets', function() {
    it('should dispatch patch-sent and dispatch patch-received events when a patch is sent and received', done => {
      const server = new MockSocketServer(
        'ws://house.of.cards/default/this_is_a_nice_url'
      );

      moxios.stubRequest('http://house.of.cards/testURL', {
        status: 200,
        headers: { location: '/default/this_is_a_nice_url' },
        responseText: '{"hello": "world"}'
      });

      /* prepare response */
      server.on('message', patches => {
        /* make sure a correct patch is sent to server */
        assert.deepEqual(JSON.parse(patches), [
          { op: 'replace', path: '/hello', value: 'onPatchSent callback' }
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
        remoteUrl: 'http://house.of.cards/testURL',
        useWebSocket: true
      });
      
      palindrom.addEventListener('state-reset', ev => {
        tempObj = ev.detail;
      });

      palindrom.addEventListener('patch-received', ev => {
        onPatchReceived(ev.detail.data)
      });

      palindrom.addEventListener('patch-sent', ev => {
        onPatchSent(ev.detail.data)
      });

      setTimeout(() => {
        /* onPatchReceived, shouldn't be called now */
        assert(onPatchReceived.notCalled);

        /* onPatchSent, shouldnt be called now, the initial request doesnt count since you can't addEventLister before it occurs */
        assert(onPatchSent.notCalled);

        /* issue a change */
        tempObj.hello = 'onPatchSent callback';
        assert(onPatchSent.calledOnce);

        /* wait for XHR */
        setTimeout(() => {
          assert(onPatchReceived.calledOnce);
          assert.deepEqual(onPatchReceived.lastCall.args[0], [
            {
              op: 'replace',
              path: '/hello',
              value: 'onPatchReceived callback'
            }
          ]);
          server.stop(done);
        }, 10);
      }, 10);
    });
  });

  it('should dispatch patch-received event even if the patch was bad', done => {
    const server = new MockSocketServer(
      'ws://house.of.cards/default/this_is_a_nice_url'
    );

    moxios.stubRequest('http://house.of.cards/testURL', {
      status: 200,
      headers: { location: '/default/this_is_a_nice_url' },
      responseText: '{"hello": "world"}'
    });

    /* prepare response */
    server.on('message', patches => {
      /* make sure a correct patch is sent to server */
      assert.deepEqual(JSON.parse(patches), [
        { op: 'replace', path: '/hello', value: 'onPatchSent callback' }
      ]);

      /* respond */
      server.send(
        '[{"op":"replace", "path":"/hello", "value":' +
          (Number.MAX_SAFE_INTEGER + 1) +
          '}]'
      );
    });

    const onPatchReceived = sinon.spy();
    let tempObj;

    const palindrom = new Palindrom({
      remoteUrl: 'http://house.of.cards/testURL',
      useWebSocket: true
    });

    palindrom.addEventListener('state-reset', ev => {
      tempObj = ev.detail;
    });

    palindrom.addEventListener('patch-received', ev => {
      onPatchReceived(ev.detail)
    });

    setTimeout(() => {
      /* onPatchReceived, shouldn't be called now */
      assert(onPatchReceived.notCalled);

      /* issue a change */
      tempObj.hello = 'onPatchSent callback';

      /* wait for XHR */
      setTimeout(() => {
        assert(onPatchReceived.calledOnce);
        server.stop(done);
      }, 10);
    }, 10);
  });
});
