import PalindromDOM from '../../../src/palindrom-dom';
import assert from 'assert';
import fetchMock from 'fetch-mock';
import { Server as MockSocketServer, MockWebSocket } from 'mock-socket';
import { sleep, getTestURL } from '../../utils';

/** only run DOM tests in browsers */
if (typeof window !== 'undefined') {
    if (!global.MockWebSocket) {
        global.MockWebSocket = MockWebSocket;
    }

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

    describe('PalindromDOM OT', function() {
        let currLoc;

        beforeEach(function() {
            currLoc = window.location.href;

        });

        afterEach(function() {
            history.pushState(null, null, currLoc);
            fetchMock.restore();
        });

        it('should patch a mix of HTTP and WS incoming patches in the correct order', async () => {
            const url = getTestURL('/testURL');
            const wsUrl = getTestURL('/testURL', false, true);

            let mockSocket;
            const mockSocketServer = new MockSocketServer(wsUrl);
            
            mockSocketServer.on('connection', socket => {
                mockSocket = socket;
            });

            fetchMock.mock(url, {
                status: 200,
                headers: {
                    contentType: 'application/json'
                },
                body: JSON.stringify(initialResponse)
            });

            const palindrom = new PalindromDOM({
                remoteUrl: url,
                localVersionPath: '/_ver#c$',
                remoteVersionPath: '/_ver#s',
                ot: true,
                useWebSocket: true
            });

            await sleep(80);

            // make sure initial request is applied to `palindrom.obj`.
            assert.equal(palindrom.obj.children.length, 3);

            // respond with patch2, BEFORE patch1
            mockSocket.send(JSON.stringify(patch2));

            await sleep();

            // make sure patch2 has NOT been applied (because patch1 didn't arrive yet)
            assert.equal(palindrom.obj.children.length, 3);

            assert.equal(palindrom.obj.newChildren, null);

            const url2 = getTestURL('/testURL2');

            fetchMock.mock(url2, {
                status: 200,
                headers: {
                    contentType: 'application/json-patch+json'
                },
                body: JSON.stringify(patch1)
            });

            await palindrom.morphUrl(url2);

            await sleep();
            // by now, patch1 should have been applied, and pending patch2 should be applied, too.

            // verify patch1
            assert.equal(palindrom.obj.children.length, 4);

            assert.deepEqual(palindrom.obj.children, [1, 2, 3, 4]);
            // verify patch2
            assert.equal(palindrom.obj.newChildren.Name$, 'XXX');

            // OK send patch3
            mockSocket.send(JSON.stringify(patch3));

            await sleep();

            // newChildren should be `null` again
            assert.equal(palindrom.obj.newChildren.Name$, null);
            assert.deepEqual(palindrom.obj.newChildren, {});

            palindrom.unobserve();
            palindrom.unlisten();
            mockSocketServer.stop();
            fetchMock.restore();
        });
    });
}
