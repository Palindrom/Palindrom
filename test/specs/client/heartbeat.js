import Palindrom from '../../../src/palindrom';
import chai, { expect, assert } from 'chai';
import sinonChai  from "sinon-chai";
import { sleep, getTestURL } from '../../utils';
import sinon from 'sinon';

import fetchMock from 'fetch-mock';

chai.use(sinonChai);

const localVersion = '_ver#s';
const remoteVersion = '_ver#c$';
const localVersionPath = `/${localVersion}`;
const remoteVersionPath = `/${remoteVersion}`;

describe('HTTP Client', () => {
    let palindrom, onReconnectionCountdown, onReconnectionEnd;
    afterEach(() => {
        fetchMock.restore();
        // hackish way to silence previous instances of Palindrom.
        palindrom.network.heartbeat.stop()
        // console.info('palindrom\'s heartbeat stopped');
    });
    describe('Heartbeat', function () {
        it('When created with no `pingIntervalS` should not send any patch on idle', async function () {

            fetchMock.get(getTestURL('testURL'), {
                status: 200,
                headers: { contentType: 'application/json' },
                body: '{"hello": "world"}'
            }, {name: 'establish'});

            palindrom = new Palindrom({
                remoteUrl: getTestURL('testURL'),
                ot: true,
                localVersionPath,
                remoteVersionPath
            });
            fetchMock.patch(getTestURL('testURL'), {
                status: 200,
                headers: { contentType: 'application/json-patch+json' },
                body: '[]'
            }, {name: 'ping'});
            
            await sleep(1.5*1000);
            // only establish is called
            expect(fetchMock.calls()).to.be.lengthOf(1);
            expect(fetchMock.called(/testURL/)).to.be.ok;
        });
        // Fails due to bug
        // const pingIntervalS = 0.1;
        const pingIntervalS = 2;
        describe(`When created with \`pingIntervalS: ${pingIntervalS}\``, () => {
            beforeEach(async () => {
                this.timeout(0)
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

                    pingIntervalS
                });
                fetchMock.patch(getTestURL('testURL'), {
                    status: 200,
                    headers: { contentType: 'application/json-patch+json' },
                    body: '[]'
                }, {name: 'ping'});

            });
            it(`should send empty patch (\`[]\`) after ${pingIntervalS} seconds after establish`, async () => {

                // establish
                expect(fetchMock.calls('establish')).to.be.lengthOf(1);
                expect(fetchMock.called(/testURL/)).to.be.ok;

                await sleep(pingIntervalS*1000 + 10);
                // // ping
                expect(fetchMock.calls('ping')).to.be.lengthOf(1);
                const [pingURL, pingCall] = fetchMock.lastCall();
                expect(pingURL).to.equal(getTestURL('testURL'));
                expect(pingCall).to.have.property('body','[]');
                expect(pingCall).to.have.property('method','PATCH');
                expect(pingCall.headers).to.have.property('Content-Type','application/json-patch+json');
                expect(pingCall.headers).to.have.property('Accept','application/json-patch+json');
                
            }).timeout(pingIntervalS*2*1000);
            it(`should send empty patch (\`[]\`) after ${pingIntervalS} seconds after sending local change`, async () => {

                // establish
                expect(fetchMock.calls('establish')).to.be.lengthOf(1);
                expect(fetchMock.called(/testURL/)).to.be.ok;
                
                await sleep(10);
                // change
                palindrom.obj.hello = "Ping Machine";
                await sleep(10);
                expect(fetchMock.calls('ping')).to.be.lengthOf(1);

                await sleep(pingIntervalS*1000 + 10);
                // // ping
                expect(fetchMock.calls('ping')).to.be.lengthOf(2);
                const [pingURL, pingCall] = fetchMock.lastCall();
                expect(pingURL).to.equal(getTestURL('testURL'));
                expect(pingCall).to.have.property('body','[]');
                expect(pingCall).to.have.property('method','PATCH');
                expect(pingCall.headers).to.have.property('Content-Type','application/json-patch+json');
                expect(pingCall.headers).to.have.property('Accept','application/json-patch+json');
                
            }).timeout(pingIntervalS*2*1000);
            describe('and server does not respond to send ping within `pingIntervalS`', () => {
                // beforeEach(async () => {
                // });
                it('should call onReconnectionCountdown with number of milliseconds to scheduled reconnection as argument', async () => {
                    fetchMock.patch(getTestURL('testURL'), sleep(1).then({
                        status: 200,
                        headers: { contentType: 'application/json-patch+json' },
                        body: '[]'
                    }), {overwriteRoutes: true, name: 'ping'});
                    // wait to send a ping
                    await sleep(pingIntervalS*1000 + 1);
                    // no response comes within 1000
                    await sleep(pingIntervalS*1000 + 1);
                    // callback called
                    expect(onReconnectionCountdown).to.be.calledOnceWithExactly(1000);
                    
                    // wait for the response to come, to awoit Palindrom errors after the test.
                    await sleep(pingIntervalS*2*1000);
                }).timeout(pingIntervalS*5*1000);
                describe('after 1000ms', () => {
                    beforeEach(async function(){
                        this.timeout(pingIntervalS*4*1000);
                        
                        fetchMock.patch(getTestURL('testURL/reconnect'), sleep(1).then({
                            status: 200,
                            headers: { contentType: 'application/json-patch+json' },
                            body: '[]'
                        }), {name: 'reconnect'});
                        
                        // wait to send a ping
                        await sleep(pingIntervalS*1*1000 + 1);
                        // no response comes witihn pingIntervalS
                        await sleep(pingIntervalS*1*1000 + 1);
                        // do nothing for 1000ms
                        await sleep(1000 + 1);
                    });
                    it('should call onReconnectionEnd', async () => {
                            expect(onReconnectionEnd).to.be.calledOnce;
                    });
                    xit('should try to `PATCH /reconnect`', async () => {
                        await sleep(1100);
                        expect(fetchMock.calls('reconnect')).to.be.lengthOf(1);
                        const [pingURL, pingCall] = fetchMock.lastCall();
                        expect(pingURL).to.equal(getTestURL('testURL/reconnect'));
                        expect(pingCall).to.have.property('body','[]');
                        expect(pingCall).to.have.property('method','PATCH');
                        expect(pingCall.headers).to.have.property('Content-Type','application/json-patch+json');
                        expect(pingCall.headers).to.have.property('Accept','application/json');
                        
                    });
                });
            });
            
        });
    });
});