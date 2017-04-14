global.WebSocket = require("mock-socket").WebSocket;

const Palindrom = require("../../src/palindrom");
const assert = require("assert");
const moxios = require("moxios");
const sinon = require("sinon");

describe('Palindrom', () => {
    describe('#ValidatePatches', () => {
        beforeEach(() => {
            moxios.install();
        })
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
                    first$: "Elvis",
                    last$: "Presley"
                }
            };
            const sequence = [];
            const spy = sinon.spy();

            const palindrom = new Palindrom({ remoteUrl: '/testURL', onIncomingPatchValidationError: spy });

            palindrom.validateAndApplySequence(tree, sequence);

            setTimeout(() => {
                assert(spy.notCalled);
                done();
            }, 10);
        });

        it('replacing a nonexisting property should cause OPERATION_PATH_UNRESOLVABLE (test built into Fast-JSON-Patch)', done => {

            moxios.stubRequest('http://localhost/testURL', {
                status: 200,
                headers: { Location: 'http://localhost/testURL' },
                responseText: '{"hello": "world"}'
            });
            const tree = {
                name: {
                    first$: "Elvis",
                    last$: "Presley"
                }
            };
            const sequence = [{ op: "replace", path: "/address$", value: "" }];
            const spy = sinon.spy();

            const palindrom = new Palindrom({ remoteUrl: '/testURL', onIncomingPatchValidationError: spy });

            palindrom.validateAndApplySequence(tree, sequence);

            setTimeout(() => {
                assert(spy.calledOnce);
                assert.equal('OPERATION_PATH_UNRESOLVABLE', spy.lastCall.args[0].name);
                done();
            }, 10);
        });

        it('undefined value should cause OPERATION_VALUE_REQUIRED (test built into Fast-JSON-Patch)', done => {

            moxios.stubRequest('http://localhost/testURL', {
                status: 200,
                headers: { Location: 'http://localhost/testURL' },
                responseText: '{"hello": "world"}'
            });
            const tree = {
                name: {
                    first$: "Elvis",
                    last$: "Presley"
                }
            };
            const sequence = [{ op: "replace", path: "/address$", value: undefined }];
            const spy = sinon.spy();

            const palindrom = new Palindrom({ remoteUrl: '/testURL', onIncomingPatchValidationError: spy});

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
                    first$: "Elvis",
                    last$: "Presley"
                }
            };
            const sequence = [{ op: "replace", path: "/address$" }];
            const spy = sinon.spy();

            const palindrom = new Palindrom({ remoteUrl: '/testURL', onIncomingPatchValidationError: spy });

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
                    first$: "Elvis",
                    last$: "Presley"
                }
            };
            const sequence = [{ op: "replace", path: "/name", value: { first$: [undefined], last$: "Presley" } }];
            const spy = sinon.spy();

            const palindrom = new Palindrom({ remoteUrl: '/testURL', onIncomingPatchValidationError: spy});

            palindrom.validateAndApplySequence(tree, sequence);

            setTimeout(() => {
                assert(spy.calledOnce);
                assert.equal('OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED', spy.lastCall.args[0].name);
                done();
            }, 10);
        });
    })
});