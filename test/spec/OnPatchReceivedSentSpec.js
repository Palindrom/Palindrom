describe("OnPatchReceivedSent", function () {
    beforeEach(function () {
        jasmine.Ajax.install();
        jasmine.WebSocket.install();
    });

    afterEach(function () {
        this.puppet.unobserve();
        jasmine.Ajax.uninstall();
        jasmine.WebSocket.uninstall();
    });

    describe("init", function () {
        it("should call callbacks onPatchSent and onPatchReceived", function (done) {
            var sendStr = '{"hello": "request"}';
            var receiveStr = '{"hello": "response"}';
            var sentData, receivedData;
            var sentUrl, receivedUrl;

            this.puppet = new Puppet({
                referer: window.location.href,
                remoteUrl: window.location.href,
                //useWebSocket: true,
                onPatchSent: function (data, url) {
                    sentData = data;
                    sentUrl = url;
                },
                onPatchReceived: function (data, url) {
                    receivedData = data;
                    receivedUrl = url;
                    console.log(data);
                }
            });

            this.puppet.network.send(sendStr);

            jasmine.Ajax.requests.mostRecent().respondWith({
                "status": 200,
                "contentType": 'application/json',
                "responseText": receiveStr,
                responseHeaders: {
                    "X-Location": window.location.pathname
                }
            });

            setTimeout(function () {
                expect(sentData).toEqual(sendStr);
                expect(sentUrl).toEqual(window.location.href);

                expect(receivedData).toEqual(receiveStr);
                expect(receivedUrl).toEqual(window.location.href);

                done();
            }, 100);
        });
    });
});