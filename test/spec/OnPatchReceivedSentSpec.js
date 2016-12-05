describe("OnPatchReceived/Sent", function () {
    beforeEach(function () {
        jasmine.Ajax.install();
        // stub initial HTTP request
        jasmine.Ajax.stubRequest(window.location.href).andReturn( TestResponses.defaultInit.success );
    });

    afterEach(function () {
        this.puppet.unobserve();
        jasmine.Ajax.uninstall();
    });

    it("should call onPatchSent for initial requests", function (done) {
        var sentSpy = jasmine.createSpy();

        this.puppet = new Puppet({
            onPatchSent: sentSpy
        });

        expect(sentSpy.calls.count()).toEqual(1);
        expect(sentSpy).toHaveBeenCalledWith(null, window.location.href, "GET");
        done();

    });
    describe("in HTTP mode", function(){
        console.log('To be updated as https://github.com/PuppetJs/PuppetJs/issues/103');
        xit("should call callbacks onPatchSent and onPatchReceived for outgoing and incoming patches", function (done) {
            var sentSpy = jasmine.createSpy("onPatchSent");
            var receivedSpy = jasmine.createSpy("onPatchReceived");

            this.puppet = new Puppet({
                onPatchSent: sentSpy,
                onPatchReceived: receivedSpy
            });

            this.puppet.obj.hello = "onPatchSent callback";


            // wait for observer and mocked initial HTTP response
            setTimeout(function () {
                expect(sentSpy.calls.mostRecent().args).toEqual(
                    [
                    '[{"op":"replace","path":"/hello","value":"onPatchSent callback"}]',
                    window.location.origin + '/__default/testId001',
                    'PATCH'
                    ]
                );
                // mock also response
                jasmine.Ajax.requests.mostRecent().respondWith({responseText: '[{"op":"replace", "path":"/hello", "value":"onPatchReceived callback"}]'});


                expect(receivedSpy.calls.count()).toEqual(1);
                expect(receivedSpy).toHaveBeenCalledWith(
                    '[{"op":"replace", "path":"/hello", "value":"onPatchReceived callback"}]',
                    window.location.origin + '/__default/testId001',
                    'PATCH'
                );

                done();
            }, 100); // for FF
        });
    });


    describe("in WebSockets mode", function(){
        beforeEach(function () {
            jasmine.WebSocket.install();
        });
        afterEach(function () {
            jasmine.WebSocket.uninstall();
        });
        console.log('To be updated as https://github.com/PuppetJs/PuppetJs/issues/103');
        xit("should call onPatchSent callback for outgoing patches", function (done) {
            var WSSpy = jasmine.WebSocket.spy;
            var sentSpy = jasmine.createSpy("onPatchSent");

            var puppet = this.puppet = new Puppet({
                useWebSocket: true,
                onPatchSent: sentSpy
            });
            var websocket = jasmine.WebSocket.spy.calls.mostRecent().returnValue;
            //open WS for changes
            websocket.open();
            this.puppet.obj.hello = "onPatchSent callback";

            // wait for observer and mocked initial HTTP response
            setTimeout(function () {
                expect(puppet.obj.hello).toEqual("onPatchSent callback");
                expect(sentSpy.calls.mostRecent().args[0]).toEqual('[{"op":"replace","path":"/hello","value":"onPatchSent callback"}]');
                expect(sentSpy.calls.mostRecent().args[1]).toMatch(/ws:\/\/.*__default\/testId001/);
                done();
            }, 100); // for FF
        });

        it("should call onPatchReceived callback for incoming patches", function (done) {
            var WSSpy = jasmine.WebSocket.spy;
            var receivedSpy = jasmine.createSpy("onPatchReceived");

            var puppet = this.puppet = new Puppet({
                useWebSocket: true,
                onPatchReceived: receivedSpy
            });
            var websocket = jasmine.WebSocket.spy.calls.mostRecent().returnValue;
            //open WS for changes
            websocket.open();
            websocket.onmessage({data:'[{"op":"replace","path":"/hello","value":"onPatchReceived callback"}]'});

            // wait for observer and mocked initial HTTP response
            setTimeout(function () {
                expect(puppet.obj.hello).toEqual("onPatchReceived callback");
                expect(receivedSpy.calls.mostRecent().args[0]).toEqual('[{"op":"replace","path":"/hello","value":"onPatchReceived callback"}]');
                expect(receivedSpy.calls.mostRecent().args[1]).toMatch(/ws:\/\/.*__default\/testId001/);
                done();
            }, 100); // for FF
        });
    });
});
