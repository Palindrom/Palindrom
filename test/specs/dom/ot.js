/** only run DOM tests in browsers */
if (typeof window !== 'undefined') {
  if (!global.WebSocket) {
    global.WebSocket = require('mock-socket').WebSocket;
  }
  const MockSocketServer = require('mock-socket').Server;

  const initialResponse = {
    '_ver#c$': 0,
    '_ver#s': 0,
    children: ['a', 'b', 'c']
  };

  const patch1 = [
    { op: 'replace', path: '/_ver#s', value: 1 },
    { op: 'test', path: '/_ver#c$', value: 0 },
    {
      op: 'replace',
      path: '',
      value: {
        '_ver#c$': 0,
        '_ver#s': 1,
        children: [1, 2, 3, 4]
      }
    }
  ];

  const patch2 = [
    { op: 'replace', path: '/_ver#s', value: 2 },
    { op: 'test', path: '/_ver#c$', value: 0 },
    {
      op: 'add',
      path: '/newChildren',
      value: { Name$: 'XXX' }
    }
  ];

  const patch3 = [
    { op: 'replace', path: '/_ver#s', value: 3 },
    { op: 'test', path: '/_ver#c$', value: 0 },
    {
      op: 'remove',
      path: '/newChildren/Name$'
    }
  ];

  const PalindromDOM = require('../../../src/palindrom-dom');
  const assert = require('assert');
  const moxios = require('moxios');

  describe('PalindromDOM OT', function() {
    let currLoc;

    beforeEach(function() {
      currLoc = window.location.href;
      moxios.install();
    });

    afterEach(function() {
      history.pushState(null, null, currLoc);
      moxios.uninstall();
    });

    it('should patch a mix of XHR and WS incoming patches in the correct order', function(
      done
    ) {
      const baseUrl = window.location;
      const url = new URL('/testURL', baseUrl).toString();
      const server = new MockSocketServer(url.replace('http', 'ws'));
      moxios.stubRequest(url, {
        status: 200,
        headers: {
          contentType: 'application/json'
        },
        responseText: JSON.stringify(initialResponse)
      });
      let tempObject;
      const palindrom = new PalindromDOM({
        remoteUrl: url,
        onStateReset: function(obj) {
          tempObject = obj;
        },
        localVersionPath: '/_ver#c$',
        remoteVersionPath: '/_ver#s',
        ot: true,
        useWebSocket: true
      });
      setTimeout(() => {
        // make sure initial request is applied to `palindrom.obj`.
        assert.equal(palindrom.obj.children.length, 3);

        // respond with patch2, BEFORE patch1
        setTimeout(() => {
          server.send(JSON.stringify(patch2));
        }, 11);

        setTimeout(() => {
          // make sure patch2 has NOT been applied (because patch1 didn't arrive yet)
          assert.equal(palindrom.obj.children.length, 3);
          assert.equal(palindrom.obj.newChildren, null);

          const url2 = new URL('/testURL2', baseUrl).toString();
          moxios.stubRequest(url2, {
            status: 200,
            headers: {
              contentType: 'application/json-patch+json'
            },
            responseText: JSON.stringify(patch1)
          });
          palindrom.morphUrl(url2);
        }, 11);

        setTimeout(() => {
          // by now, patch1 should have been applied, and pending patch2 should be applied, too.

          // verify patch1
          assert.equal(palindrom.obj.children.length, 4);
          assert.deepEqual(palindrom.obj.children, [1, 2, 3, 4]);
          // verify patch2
          assert.equal(palindrom.obj.newChildren.Name$, 'XXX');

          // OK send patch3
          server.send(JSON.stringify(patch3));
        }, 12);

        setTimeout(() => {
          // newChildren should be `null` again
          assert.equal(palindrom.obj.newChildren.Name$, null);
          assert.deepEqual(palindrom.obj.newChildren, {});

          palindrom.unobserve();
          palindrom.unlisten();
          server.stop(done);
        }, 13);
      }, 10);
    });

    it('should bump the localVersion of the queue when morphUrl is called', function(
      done
    ) {
      const baseUrl = window.location;
      const url = new URL('/testURL', baseUrl).toString();
      moxios.stubRequest(url, {
        status: 200,
        headers: {
          contentType: 'application/json'
        },
        responseText: JSON.stringify(initialResponse)
      });
      const palindrom = new PalindromDOM({
        remoteUrl: url,
        localVersionPath: '/_ver#c$',
        remoteVersionPath: '/_ver#s',
        ot: true,
      });
      setTimeout(() => {
        // make sure initial request is applied to `palindrom.obj`.
        assert.equal(palindrom.obj.children.length, 3);

        // make sure the version is not bumped yet
        assert.equal(palindrom.queue.localVersion, 0);

        const url2 = new URL('/testURL2', baseUrl).toString();
        moxios.stubRequest(url2, {
          status: 200,
          headers: {
            contentType: 'application/json-patch+json'
          },
          responseText: JSON.stringify(patch1)
        });
        
        palindrom.morphUrl(url2);

        setTimeout(() => {
          // make sure the version is bumped now
          assert.equal(palindrom.queue.localVersion, 1);
          done();
        }, 13);
      }, 10);
    });
  });
}
