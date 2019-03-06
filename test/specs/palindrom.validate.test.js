import Palindrom from '../../src/palindrom';
import assert from 'assert';
import moxios from 'moxios';
import sinon from 'sinon';
import { validate, JsonPatchError } from 'fast-json-patch';
import { sleep } from '../utils';

describe('Palindrom', () => {
    describe('#ValidatePatches', () => {
        beforeEach(() => {
            moxios.install();
        });
        afterEach(() => {
            moxios.uninstall();
        });
        it('should pass empty sequence', async () => {
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
                remoteUrl: '/testURL'
            });

            palindrom.addEventListener(
                'incoming-patch-validation-error',
                ev => {
                    spy();
                }
            );

            palindrom.validateAndApplySequence(tree, sequence);

            await sleep();
            assert(spy.notCalled);
        });

        it('replacing a nonexisting property should cause OPERATION_PATH_UNRESOLVABLE (test built into Fast-JSON-Patch)', async () => {
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
                remoteUrl: '/testURL'
            });

            palindrom.addEventListener(
                'incoming-patch-validation-error',
                ev => {
                    spy(ev.detail);
                }
            );

            palindrom.validateAndApplySequence(tree, sequence);

            await sleep();
            assert(spy.calledOnce, spy.callCount);
            assert.equal(
                'OPERATION_PATH_UNRESOLVABLE',
                spy.lastCall.args[0].name
            );
        });

        it('undefined value should cause OPERATION_VALUE_REQUIRED (test built into Fast-JSON-Patch)', async () => {
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
                { op: 'replace', path: '/address$', value: undefined }
            ];
            const spy = sinon.spy();

            const palindrom = new Palindrom({
                remoteUrl: '/testURL'
            });

            palindrom.addEventListener(
                'incoming-patch-validation-error',
                ev => {
                    spy(ev.detail);
                }
            );

            palindrom.validateAndApplySequence(tree, sequence);

            await sleep();
            assert(spy.calledOnce);
            assert.equal('OPERATION_VALUE_REQUIRED', spy.lastCall.args[0].name);
        });

        it('no value should cause OPERATION_VALUE_REQUIRED (test built into Fast-JSON-Patch)', async () => {
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
                remoteUrl: '/testURL'
            });
            palindrom.addEventListener(
                'incoming-patch-validation-error',
                ev => {
                    spy(ev.detail);
                }
            );

            palindrom.validateAndApplySequence(tree, sequence);

            await sleep();
            assert(spy.calledOnce);
            assert.equal('OPERATION_VALUE_REQUIRED', spy.lastCall.args[0].name);
        });

        it('object with undefined value should cause OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED (test built into Fast-JSON-Patch)', async () => {
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
                remoteUrl: '/testURL'
            });
            palindrom.addEventListener(
                'incoming-patch-validation-error',
                ev => {
                    spy(ev.detail);
                }
            );

            palindrom.validateAndApplySequence(tree, sequence);

            await sleep();
            assert(spy.calledOnce);
            assert.equal(
                'OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED',
                spy.lastCall.args[0].name
            );
        });
    });
    describe('Overriding validation logic', function() {
        it('should be possible to override validatePatches to add custom validation', async () => {
            var tree = {
                name: {
                    first: 'Elvis',
                    last: 'Presley'
                }
            };
            var sequence = [
                { op: 'replace', path: '/name/first', value: 'Albert' }
            ];

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
                    if (
                        operation.path.substr(operation.path.length - 1, 1) !==
                        '$'
                    ) {
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
            customPalindrom.prototype.validateSequence = function(
                tree,
                sequence
            ) {
                var error = validate(sequence, tree, validator.bind(this));
                if (error) {
                    this.onOutgoingPatchValidationError(error);
                }
            };

            var palindromMock = Object.create(customPalindrom.prototype);
            palindromMock.debug = true;
            let validatorWasCalled = false;
            palindromMock.onOutgoingPatchValidationError = function(error) {
                assert(error.name === 'Palindrom_CANNOT_REPLACE_READONLY');
                validatorWasCalled = true;
            };

            palindromMock.validateSequence(tree, sequence);
            await sleep();
            assert(validatorWasCalled, 'validator should be called');
        });
    });
});
