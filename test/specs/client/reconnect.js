import { Palindrom } from '../../../src/palindrom';
import chai, { expect, assert } from 'chai';
import sinonChai  from "sinon-chai";
import { sleep, getTestURL } from '../../utils';
import { Server as MockSocketServer } from 'mock-socket';
import sinon from 'sinon';

import fetchMock from 'fetch-mock';
 
chai.use(sinonChai);

const localVersion = '_ver#c$';
const remoteVersion = '_ver#s';
const localVersionPath = `/${localVersion}`;
const remoteVersionPath = `/${remoteVersion}`;


function variantDescribe(name, variants, fn) {
    variants.forEach(variant => {
        describe(`${name} | variant: ${variant[0]}`, fn.bind(this,...variant.slice(1)));
    });
}


describe('WS Client', () => {
    let palindrom, onReconnectionCountdown, onReconnectionEnd, mockSocketServer, anotherSocket;
    afterEach(async function(){
        this.timeout(3000);
        fetchMock.restore();
        // FIXME: https://github.com/Palindrom/Palindrom/issues/248
        // hackish way to silence previous instances of Palindrom.
        palindrom.network.heartbeat.stop()
        palindrom.network.closeConnection();
        // console.info('palindrom\'s heartbeat stopped');
        mockSocketServer.stop();
        anotherSocket.stop();
        // wait for all socket  events to be triggered
        await sleep(10);
        // FIXME: wait for ping callback to pass, https://github.com/Palindrom/Palindrom/issues/248
        await sleep(1000);
    });
    describe('Reconnect', function () {
        // Fails due to bug
        // const pingIntervalS = 0.1;
        const pingIntervalS = 2;
        variantDescribe(`When web socket connection get closed`, [
            ['cleanly', 1000, true, undefined],
            ['not cleanly without a reason', 1011, false, undefined],
            ['not cleanly with a reason', 1011, false, 'reason']
        ], (code, wasClean, reason) => {
            beforeEach(async () => {
                mockSocketServer = new MockSocketServer(getTestURL('testURL', false, true));
                fetchMock.get(getTestURL('testURL'), {
                    status: 200,
                    headers: { contentType: 'application/json' },
                    body: '{"hello": "world"}'
                }, {name: 'establish'});
                
                onReconnectionCountdown = sinon.spy();
                onReconnectionEnd = sinon.spy();
                palindrom = new Palindrom({
                    remoteUrl: getTestURL('testURL'),
                    ot: true,
                    localVersionPath,
                    remoteVersionPath,
                    onReconnectionCountdown,
                    onReconnectionEnd,
                    useWebSocket: true,

                    pingIntervalS
                });
                fetchMock.patch(getTestURL('testURL'), {
                    status: 200,
                    headers: { contentType: 'application/json-patch+json' },
                    body: '[]'
                }, {name: 'ping'});
                fetchMock.patch(getTestURL('testURL')+'/reconnect', {
                    status: 200,
                    headers: { contentType: 'application/json' },
                    body: `{"witaj": "swiecie", "${remoteVersion}": 777}`
                }, {name: 'reconnect'});
                // wait for HTTP responses and WebSocket server to be established
                await sleep(100);
                // issue a change that will not get acknoledged by server
                palindrom.obj.hello = 'OT';
                // close the WS
                mockSocketServer.close({
                    code,
                    wasClean,
                    reason
                });
                // setup another web socket so reconnection would not throw an error
                anotherSocket = new MockSocketServer(getTestURL('testURL', false, true));
            });
            if(!wasClean && !reason){
                it('should send `HTTP PATCH _remoteUrl_/reconnect` with pending changes in body', async () => {
                    
                    await sleep(pingIntervalS*1000 + 10);
                    // establish
                    console.log('flaky')
                    expect(fetchMock.calls('establish')).to.be.lengthOf(1, "expected `establish` to be fetched once");
                    expect(fetchMock.called(/testURL/)).to.be.ok;
                    
                    // reconnect
                    expect(fetchMock.calls('reconnect')).to.be.lengthOf(1, "expected `reconnect` to be fetched once");
                    const [reconnectURL, reconnectCall] = fetchMock.lastCall();
                    expect(reconnectURL).to.equal(getTestURL('testURL')+'/reconnect');
                    expect(reconnectCall).to.have.property('body','[[{"op":"replace","path":"/_ver#c$","value":1},{"op":"test","path":"/_ver#s"},{"op":"replace","path":"/hello","value":"OT"}]]');
                    expect(reconnectCall).to.have.property('method','PATCH');
                    expect(reconnectCall.headers).to.have.property('Content-Type','application/json-patch+json');
                    expect(reconnectCall.headers).to.have.property('Accept','application/json');
                }).timeout(pingIntervalS*2*1000);
                describe('when server responds to `/reconnect`', () => {
                    let anotherSocketMessageSpy, anotherSocketConnectedSpy;
                    beforeEach(function(done){
                        anotherSocketConnectedSpy = sinon.spy().named('another socket connected')
                        anotherSocketMessageSpy = sinon.spy().named('another socket message');
                        anotherSocket.on('connection', (socket) => {
                            console.info('new socket');
                            anotherSocketConnectedSpy(...arguments);
                            socket.on('message', anotherSocketMessageSpy);
                        });
                        this.timeout(pingIntervalS*4*1000);
                        sleep(pingIntervalS*3*1000+10).then(done);
                    })
                    it('should replace the `palindrom.obj` with whatever was given by server', async () => {
                        expect(palindrom.obj).to.deep.equal({
                            witaj: 'swiecie',
                            [remoteVersion]: 777
                        });
                    });
                    it('should reset remote version to the one given in the object', async () => {
                        expect(palindrom.queue.remoteVersion).to.equal(777);
                    });
                    it('should try to establish another Web Socket connection', async() => {

                        console.log('flakuy')
                        expect(anotherSocketConnectedSpy).to.be.calledOnce;    
                    });
                    it(`should send WS ping messages over new web socket`, async () => {         
                        
                        await sleep(pingIntervalS*1*1000 + 10);
                        // ping
                        expect(anotherSocketMessageSpy).to.be.called;
                        expect(anotherSocketMessageSpy).to.be.calledWithExactly('[]');
                    }).timeout(pingIntervalS*2*1000);  
                });

            } else {
                it('should NOT send `HTTP PATCH _remoteUrl_/reconnect`', async () => {
                    await sleep(pingIntervalS*1000 + 10);
                    // establish
                    expect(fetchMock.calls('establish')).to.be.lengthOf(1, "expected `establish` to be fetched once");
                    expect(fetchMock.called(/testURL/)).to.be.ok;
                    
                    // no reconnect
                    expect(fetchMock.calls('reconnect')).to.be.lengthOf(0, "expected `reconnect` not to be fetched");
                }).timeout(pingIntervalS*3*1000);
            }

            if(wasClean){
                console.warn('TODO: Current implementation of Palindrom is unable to fallback to HTTP communication after WS connection is closed');
                xit(`should  send HTTP ping`, async () => {         
                    
                    await sleep(pingIntervalS*2*1000 + 10);
                    // ping
                    expect(fetchMock.calls('ping')).to.be.lengthOf.at.least(1, "expected `ping` to be fetched");
                }).timeout(pingIntervalS*3*1000);
            } else {
                it(`should NOT send HTTP ping`, async () => {         
                    await sleep(pingIntervalS*2*1000 + 10);
                    // no ping
                    expect(fetchMock.calls('ping')).to.be.lengthOf(0, "expected `ping` not to be fetched");
                }).timeout(pingIntervalS*3*1000);                
            }
        });
    });
});