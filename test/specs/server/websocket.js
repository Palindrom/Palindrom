import { Palindrom as PalindromServer } from '../../../src/palindrom';
import { HttpMock } from '../../utils/http-mock';
import { WSServerMock, WSServerMockConnection } from '../../utils/ws-server-mock';
import { assert } from 'chai';
import sinon from 'sinon';

const server = new HttpMock();
const wsServer = new WSServerMock();
const localVersion = '_ver#s';
const remoteVersion = '_ver#c$';
const localVersionPath = `/${localVersion}`;
const remoteVersionPath = `/${remoteVersion}`;

describe('Server', () => {
    describe('WebSocket', function () {
        it('should apply a patch from the client', function (done) {
            const data = {};
            data[localVersion] = 0;
            data[remoteVersion] = 0;

            const onPatchReceived = sinon.spy();
            const palindrom = new PalindromServer({
                runAsServer: true,
                obj: data,
                wsServer,
                server,
                onPatchReceived,
                useWebSocket: true,
                ot: true,
                localVersionPath,
                remoteVersionPath,
                onStateReset: () => {
                    const client = new WSServerMockConnection();
                    wsServer.simulate('connection', client);
                    assert(onPatchReceived.notCalled, 'onPatchReceived should not be called');
                    const patch = [{
                        op: "replace",
                        path: remoteVersionPath,
                        value: 1
                    }, {
                        op: "test",
                        path: localVersionPath,
                        value: 0
                    }, {
                        op: 'add',
                        path: '/foo',
                        value: 'bar'
                    }];
                    client.onmessage({ data: JSON.stringify(patch) });
                    assert(data.foo, 'bar');
                    assert(onPatchReceived.calledOnce, 'onPatchReceived should be calledOnce');
                    done();
                }
            });
        });
        it('should send a patch to the client', function (done) {
            const data = {};
            data[localVersion] = 0;
            data[remoteVersion] = 0;

            const onPatchReceived = sinon.spy();
            const palindrom = new PalindromServer({
                runAsServer: true,
                obj: data,
                wsServer,
                server,
                onPatchReceived,
                useWebSocket: true,
                ot: true,
                localVersionPath,
                remoteVersionPath,
                onStateReset: () => {
                    const client = new WSServerMockConnection();
                    client.send = sinon.spy();
                    wsServer.simulate('connection', client);
                    debugger;
                    palindrom.obj.foo = "bar";
                    const expectedPatch = [{
                        op: "replace",
                        path: localVersionPath,
                        value: 1
                    }, {
                        op: "test",
                        path: remoteVersionPath,
                        value: 0
                    }, {
                        op: 'add',
                        path: '/foo',
                        value: 'bar'
                    }];
                    assert.deepEqual(client.send.lastCall.args[0], JSON.stringify(expectedPatch));
                    done();
                }
            });
        });
    });
});