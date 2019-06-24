import PalindromServer from '../../../src/palindrom';
import { HttpMock } from '../../utils/http-mock';
import { WSServerMock } from '../../utils/ws-server-mock';
import { assert } from 'chai';

const server = new HttpMock();
const wsServer = new WSServerMock();
const localVersion = '_ver#s';
const remoteVersion = '_ver#c$';
const localVersionPath = `/${localVersion}`;
const remoteVersionPath = `/${remoteVersion}`;

describe('Server', () => {
    describe('Initialization', function () {
        it('should initialize with provided object', function () {
            const data = {};
            data[localVersion] = 0;
            data[remoteVersion] = 0;

            const palindrom = new PalindromServer({
                runAsServer: true,
                obj: data,
                wsServer,
                server,
                ot: true,
                localVersionPath,
                remoteVersionPath
            });
            assert.strictEqual(data, palindrom.obj);
        });
    });
});