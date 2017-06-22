global.WebSocket = require('mock-socket').WebSocket;

const Palindrom = require('../../src/palindrom');
const moxios = require('moxios');
const sinon = require('sinon');
const assert = require('assert');

describe('Palindrom', () => {
  describe('#IgnoreAdd', () => {
    beforeEach(() => {
      moxios.install();
    });
    afterEach(() => {
      moxios.uninstall();
    });
    it('Should throw an error when ignoreAdd is set in options', function() {
      const spy = sinon.spy();

      moxios.stubRequest('http://localhost/testURL', {
        status: 200,
        headers: { contentType: 'application/json' },
        responseText: '{"hello": "world"}'
      });

      assert.throws(() => {
        const palindrom = new Palindrom({
          remoteUrl: 'http://localhost/testURL',
          onConnectionError: spy,
          ignoreAdd: /.+/
        });
      }, 'Palindrom: `ignoreAdd` is removed in favour of local state objects. see https://github.com/Palindrom/Palindrom/issues/136');
    });
    it('Should throw an error when ignoreAdd is set in runtime', function() {
      const spy = sinon.spy();

      moxios.stubRequest('http://localhost/testURL', {
        status: 200,
        headers: { contentType: 'application/json' },
        responseText: '{"hello": "world"}'
      });

      const palindrom = new Palindrom({
        remoteUrl: 'http://localhost/testURL',
        onConnectionError: spy
      });

      assert.throws(() => (palindrom.ignoreAdd = /\/\$.+/), 'Palindrom: Can\'t set `ignoreAdd`, it is removed in favour of local state objects. see https://github.com/Palindrom/Palindrom/issues/136');
    });
  });
});
