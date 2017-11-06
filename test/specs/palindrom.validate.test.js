global.WebSocket = require('mock-socket').WebSocket;

const Palindrom = require('../../src/palindrom');
const assert = require('assert');
const moxios = require('moxios');
const sinon = require('sinon');
const {
  validate,
  JsonPatchError
} = require('fast-json-patch'); /* include only apply and validate */

describe('Palindrom', () => {
  describe('#ValidatePatches', () => {
    beforeEach(() => {
      moxios.install();
    });
    afterEach(() => {
      moxios.uninstall();
    });
    it('should pass empty sequence', done => {
      moxios.stubRequest('http://localhost/testURL', {
        status: 200,
        headers: { Location: 'http://localhost/testURL' },
        responseText: '{"hello": "world"}'
      });
      const tree = {
        name: {
          first$: 'Elvis',
          last$: 'Presley'
        }
      };
      const sequence = [];
      const spy = sinon.spy();

      const palindrom = new Palindrom({
        remoteUrl: '/testURL',
        onIncomingPatchValidationError: spy
      });

      palindrom.validateAndApplySequence(tree, sequence);

      setTimeout(() => {
        assert(spy.notCalled);
        done();
      }, 1);
    });

    it('replacing a nonexisting property should cause OPERATION_PATH_UNRESOLVABLE (test built into Fast-JSON-Patch)', done => {
      moxios.stubRequest('http://localhost/testURL', {
        status: 200,
        headers: { Location: 'http://localhost/testURL' },
        responseText: '{"hello": "world"}'
      });
      const tree = {
        name: {
          first$: 'Elvis',
          last$: 'Presley'
        }
      };
      const sequence = [{ op: 'replace', path: '/address$', value: '' }];
      const spy = sinon.spy();

      const palindrom = new Palindrom({
        remoteUrl: '/testURL',
        onIncomingPatchValidationError: spy
      });

      palindrom.validateAndApplySequence(tree, sequence);

      setTimeout(() => {
        assert(spy.calledOnce);
        assert.equal('OPERATION_PATH_UNRESOLVABLE', spy.lastCall.args[0].name);
        done();
      }, 1);
    });

    it('undefined value should cause OPERATION_VALUE_REQUIRED (test built into Fast-JSON-Patch)', done => {
      moxios.stubRequest('http://localhost/testURL', {
        status: 200,
        headers: { Location: 'http://localhost/testURL' },
        responseText: '{"hello": "world"}'
      });
      const tree = {
        name: {
          first$: 'Elvis',
          last$: 'Presley'
        }
      };
      const sequence = [{ op: 'replace', path: '/address$', value: undefined }];
      const spy = sinon.spy();

      const palindrom = new Palindrom({
        remoteUrl: '/testURL',
        onIncomingPatchValidationError: spy
      });

      palindrom.validateAndApplySequence(tree, sequence);

      setTimeout(() => {
        assert(spy.calledOnce);
        assert.equal('OPERATION_VALUE_REQUIRED', spy.lastCall.args[0].name);
        done();
      }, 10);
    });

    it('no value should cause OPERATION_VALUE_REQUIRED (test built into Fast-JSON-Patch)', done => {
      moxios.stubRequest('http://localhost/testURL', {
        status: 200,
        headers: { Location: 'http://localhost/testURL' },
        responseText: '{"hello": "world"}'
      });
      const tree = {
        name: {
          first$: 'Elvis',
          last$: 'Presley'
        }
      };
      const sequence = [{ op: 'replace', path: '/address$' }];
      const spy = sinon.spy();

      const palindrom = new Palindrom({
        remoteUrl: '/testURL',
        onIncomingPatchValidationError: spy
      });

      palindrom.validateAndApplySequence(tree, sequence);

      setTimeout(() => {
        assert(spy.calledOnce);
        assert.equal('OPERATION_VALUE_REQUIRED', spy.lastCall.args[0].name);
        done();
      }, 10);
    });

    it('object with undefined value should cause OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED (test built into Fast-JSON-Patch)', done => {
      moxios.stubRequest('http://localhost/testURL', {
        status: 200,
        headers: { Location: 'http://localhost/testURL' },
        responseText: '{"hello": "world"}'
      });
      const tree = {
        name: {
          first$: 'Elvis',
          last$: 'Presley'
        }
      };
      const sequence = [
        {
          op: 'replace',
          path: '/name',
          value: { first$: [undefined], last$: 'Presley' }
        }
      ];
      const spy = sinon.spy();

      const palindrom = new Palindrom({
        remoteUrl: '/testURL',
        onIncomingPatchValidationError: spy
      });

      palindrom.validateAndApplySequence(tree, sequence);

      setTimeout(() => {
        assert(spy.calledOnce);
        assert.equal(
          'OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED',
          spy.lastCall.args[0].name
        );
        done();
      }, 10);
    });
  });
  describe('Overriding validation logic', function() {
    it('should be possible to override validatePatches to add custom validation', function(
      done
    ) {
      var tree = {
        name: {
          first: 'Elvis',
          last: 'Presley'
        }
      };
      var sequence = [{ op: 'replace', path: '/name/first', value: 'Albert' }];

      var customPalindrom = function() {
        Palindrom.apply(this, arguments);
      };

      const validator = function polyjuicePatchValidator(
        operation,
        index,
        tree,
        existingPathFragment
      ) {
        if (operation.op === 'replace') {
          if (operation.path.substr(operation.path.length - 1, 1) !== '$') {
            throw new JsonPatchError(
              'Cannot replace a property which name finishes with $ character',
              'Palindrom_CANNOT_REPLACE_READONLY',
              index,
              operation,
              tree
            );
          }
        }
      };
      customPalindrom.prototype = Object.create(Palindrom.prototype);
      customPalindrom.prototype.validateSequence = function(tree, sequence) {
        var error = validate(sequence, tree, validator.bind(this));
        if (error) {
          this.onOutgoingPatchValidationError(error);
        }
      };

      var palindromMock = Object.create(customPalindrom.prototype);
      palindromMock.debug = true;
      palindromMock.onOutgoingPatchValidationError = function(error) {
        assert(error.name === 'Palindrom_CANNOT_REPLACE_READONLY');
        done();
      };

      palindromMock.validateSequence(tree, sequence);
    });
  });
});
