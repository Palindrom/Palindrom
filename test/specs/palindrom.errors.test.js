global.WebSocket = require('mock-socket').WebSocket;

const Palindrom = require('../../src/palindrom');
const assert = require('assert');
const moxios = require('moxios');
const sinon = require('sinon');
const expect = require('chai').expect;
const MockSocketServer = require('mock-socket').Server;

describe('Palindrom', () => {
  describe('#error responses', () => {
    beforeEach(() => {
      moxios.install();
    });
    afterEach(() => {
      moxios.uninstall();
    });
    context('Network', function() {
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
          }, 5);
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
          }, 5);
        }, 5);
      });
    });
    context('Numbers Validation', function() {
      it('Initial HTTP response: out of range numbers should call onIncomingPatchValidationError with a RangeError', done => {
        moxios.stubRequest('http://localhost/testURL', {
          status: 200,
          headers: { Location: 'http://localhost/testURL' },
          responseText: `{"value": ${Number.MAX_SAFE_INTEGER + 1}}`
        });
        const spy = sinon.spy();
        const palindrom = new Palindrom({
          remoteUrl: 'http://localhost/testURL',
          onIncomingPatchValidationError: spy
        });
        setTimeout(() => {
          assert(spy.calledOnce);
          const errorPassed = spy.getCall(0).args[0];
          assert(errorPassed instanceof RangeError);
          assert(
            errorPassed.message ===
              `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in an incoming patch, value is: ${Number.MAX_SAFE_INTEGER +
                1}`
          );
          done();
        }, 2);
      });
      it('Outgoing HTTP patches: out of range numbers should call onOutgoingPatchValidationError with a RangeError', done => {
        moxios.stubRequest('http://localhost/testURL', {
          status: 200,
          headers: { Location: 'http://localhost/testURL' },
          responseText: `{"val": 1}`
        });

        const spy = sinon.spy();

        const palindrom = new Palindrom({
          remoteUrl: 'http://localhost/testURL',
          onOutgoingPatchValidationError: spy,
          onStateReset(obj) {
            obj.val = Number.MAX_SAFE_INTEGER + 1;
          }
        });

        setTimeout(() => {
          assert(spy.calledOnce);
          const errorPassed = spy.getCall(0).args[0];
          assert(errorPassed instanceof RangeError);
          assert(
            errorPassed.message ===
              `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in an outgoing patch, value is ${Number.MAX_SAFE_INTEGER +
                1}`
          );
          done();
        }, 10);
      });
      it('Outgoing socket patches: out of range numbers should call onOutgoingPatchValidationError with a RangeError', function(
        done
      ) {
        const server = new MockSocketServer('ws://localhost/testURL');

        moxios.stubRequest('http://localhost/testURL', {
          status: 200,
          headers: { location: 'http://localhost/testURL' },
          responseText: '{"val": 100}'
        });

        var spy = sinon.spy();

        var palindrom = new Palindrom({
          remoteUrl: 'http://localhost/testURL',
          useWebSocket: true,
          onOutgoingPatchValidationError: spy
        });

        setTimeout(() => {
          palindrom.obj.value = Number.MAX_SAFE_INTEGER + 1;
          // make sure WS is up
          assert(palindrom.network._ws.readyState === 1);
          assert(spy.calledOnce);
          const errorPassed = spy.getCall(0).args[0];
          assert(errorPassed instanceof RangeError);
          assert(
            errorPassed.message ===
              `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in an outgoing patch, value is ${Number.MAX_SAFE_INTEGER +
                1}`
          );
          server.stop(done);
        }, 50);
      });
      it('Incoming socket patches: out of range numbers should call onIncomingPatchValidationError with a RangeError', function(
        done
      ) {
        const server = new MockSocketServer('ws://localhost/testURL');

        moxios.stubRequest('http://localhost/testURL', {
          status: 200,
          headers: { location: 'http://localhost/testURL' },
          responseText: '{"val": 100}'
        });

        var spy = sinon.spy();

        var palindrom = new Palindrom({
          remoteUrl: 'http://localhost/testURL',
          useWebSocket: true,
          onIncomingPatchValidationError: spy
        });

        setTimeout(() => {
          server.send(
            `[{"op": "replace", "path": "/val", "value": ${Number.MAX_SAFE_INTEGER +
              1}}]`
          );
          assert(spy.calledOnce);
          const errorPassed = spy.getCall(0).args[0];
          assert(errorPassed instanceof RangeError);
          assert(
            errorPassed.message ===
              `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in an incoming patch, value is: ${Number.MAX_SAFE_INTEGER +
                1}`
          );
          server.stop(done);
        }, 5);
      });
    });
  });
});
