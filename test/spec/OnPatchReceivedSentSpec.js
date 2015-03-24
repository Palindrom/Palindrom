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
        it("should call callbacks onPatchSent and onPatchReceived for http requests", function (done) {
            var sendStr = '{"hello": "request"}';
            var receiveStr = '{"hello": "response"}';
            var sentData, receivedData;
            var sentUrl, receivedUrl;

            this.puppet = new Puppet({
                referer: window.location.href,
                remoteUrl: window.location.href,
                onPatchSent: function (data, url) {
                    sentData = data;
                    sentUrl = url;
                },
                onPatchReceived: function (data, url) {
                    receivedData = data;
                    receivedUrl = url;
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

        it("should call callbacks onPatchSent and onPatchReceived for socket patches", function (done) {
            //var sendStr = '{"hello": "request"}';
            var responsePatchStr = '[{"hello": "response"}]';
            var modelStr = '{"hello": "request"}';
            var sentData, receivedData;
            var sentUrl, receivedUrl;
            var me = this;

            this.puppet = new Puppet({
                referer: window.location.href,
                remoteUrl: window.location.href,
                useWebSocket: true,
                onPatchSent: function (data, url) {
                    sentData = data;
                    sentUrl = url;
                    console.log("Sent: ", data);
                },
                onPatchReceived: function (data, url) {
                    receivedData = data;
                    receivedUrl = url;
                    console.log("Received: ", data);
                }
            });

            jasmine.Ajax.requests.mostRecent().respondWith({
                "status": 200,
                "contentType": 'application/json',
                "responseText": modelStr,
                responseHeaders: {
                    "X-Location": window.location.pathname
                }
            });

            setTimeout(function () {
                var socket = jasmine.WebSocket.spy.calls.mostRecent().returnValue;

                //me.puppet.network.send(sendStr);
                me.puppet.obj.hello = "!!";
                triggerMouseup();
                setTimeout(function () {
                    socket.onmessage({ data: responsePatchStr });
                });
            }, 100);

            /*socket.open();
            socket.onmessage = function (e) {
                console.log(e);
                socket.send(receiveStr);
                socket.close();
            };*/

            setTimeout(function () {
                /*expect(sentData).toEqual(sendStr);
                expect(sentUrl).toEqual(window.location.href);

                expect(receivedData).toEqual(receiveStr);
                expect(receivedUrl).toEqual(window.location.href);*/

                done();
            }, 100);
        });
    });
});