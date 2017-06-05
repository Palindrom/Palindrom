global.WebSocket = require('mock-socket').WebSocket;

const Palindrom = require('../../src/palindrom');
const assert = require('assert');
const moxios = require('moxios');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('Palindrom', () => {
  describe('#error responses', () => {
    beforeEach(() => {
      moxios.install();
    });
    afterEach(() => {
      moxios.uninstall();
    });
    it('should call onConnectionError on HTTP 400 response', function(done) {
      const spy = sinon.spy();

      moxios.stubRequest('http://localhost/testURL', {
        status: 400,
        headers: { contentType: 'application/json' },
        responseText: 'Custom message'
      });

      let tempObject;
      const that = this;

      const palindrom = new Palindrom({
        remoteUrl: 'http://localhost/testURL',
        onConnectionError: spy
      });

      /* onConnectionError should be called once now */
      setTimeout(() => {
        assert(spy.calledOnce);
        done();
      }, 5);
    });

    it('should call onConnectionError on HTTP 599 response', function(done) {
      const spy = sinon.spy();

      moxios.stubRequest('http://localhost/testURL', {
        status: 599,
        headers: { contentType: 'application/json' },
        responseText: 'Custom message'
      });

      let tempObject;
      const that = this;

      const palindrom = new Palindrom({
        remoteUrl: 'http://localhost/testURL',
        onConnectionError: spy
      });

      /* onConnectionError should be called once now */
      setTimeout(() => {
        assert(spy.calledOnce);
        done();
      }, 5);
    });

    it('should call onConnectionError on HTTP 400 response (patch)', function(
      done
    ) {
      const spy = sinon.spy();

      const palindrom = new Palindrom({
        remoteUrl: 'http://localhost/testURL',
        onConnectionError: spy
      });

      // let Palindrom issue a request
      setTimeout(() => {
        // respond to it
        let request = moxios.requests.mostRecent();
        request.respondWith({
          status: 200,
          headers: { contentType: 'application/json' },
          responseText: '{"hello": "world"}'
        });
        setTimeout(() => {
          //issue a patch
          palindrom.obj.hello = 'galaxy';

          setTimeout(() => {
            let request = moxios.requests.mostRecent();
            //respond with an error
            request.respondWith({
              status: 400,
              responseText: 'error'
            });
            setTimeout(() => {
              /* onConnectionError should be called once now */
              assert(spy.calledOnce);
              done();
            }, 5);
          }, 5);
        }, 100);
      }, 5);
    });
    it('should call onConnectionError on HTTP 599 response (patch)', function(
      done
    ) {
      const spy = sinon.spy();

      const palindrom = new Palindrom({
        remoteUrl: 'http://localhost/testURL',
        onConnectionError: spy
      });

      // let Palindrom issue a request
      setTimeout(() => {
        // respond to it
        let request = moxios.requests.mostRecent();
        request.respondWith({
          status: 200,
          headers: { contentType: 'application/json' },
          responseText: '{"hello": "world"}'
        });
        setTimeout(() => {
          //issue a patch
          palindrom.obj.hello = 'galaxy';

          setTimeout(() => {
            let request = moxios.requests.mostRecent();
            //respond with an error
            request.respondWith({
              status: 599,
              responseText: 'error'
            });
            setTimeout(() => {
              /* onConnectionError should be called once now */
              assert(spy.calledOnce);
              done();
            }, 5);
          }, 5);
        }, 50);
      }, 5);
    });
  });
});
