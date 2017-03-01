
describe("OnLocal/RemoteChange", function() {
    beforeEach(function() {
        jasmine.Ajax.install();
        // stub initial HTTP request
        jasmine.Ajax.stubRequest(window.location.href).andReturn(TestResponses.defaultInit.success);
    });

    afterEach(function() {
        this.palindrom.unobserve();
        jasmine.Ajax.uninstall();
    });

    beforeEach(function() {
        jasmine.WebSocket.install();
    });
    afterEach(function() {
        jasmine.WebSocket.uninstall();
    });
    console.log('To be updated as https://github.com/Palindrom/Palindrom/issues/103');
    xit("should call onLocalChange callback for outgoing patches", function(done) {
        var sentSpy = jasmine.createSpy("onLocalChange");

        var palindrom = this.palindrom = new Palindrom({
            useWebSocket: true,
            onLocalChange: sentSpy
        });
        var websocket = jasmine.WebSocket.spy.calls.mostRecent().returnValue;
        //open WS for changes
        websocket.open();
        this.palindrom.obj.hello = "onLocalChange callback";

        // wait for observer and mocked initial HTTP response
        setTimeout(function() {
            expect(palindrom.obj.hello).toEqual("onLocalChange callback");
            expect(sentSpy.calls.mostRecent().args[0]).toEqual([{
                "op": "replace",
                "path": "/hello",
                "value": "onLocalChange callback"
            }]);
            done();
        }, 100); // for FF
    });

    it("should call onRemoteChange callback for applied patches", function(done) {
        var receivedSpy = jasmine.createSpy("onRemoteChange");

        var palindrom = this.palindrom = new Palindrom({
            useWebSocket: true,
            onRemoteChange: receivedSpy
        });
        var websocket = jasmine.WebSocket.spy.calls.mostRecent().returnValue;
        //open WS for changes
        websocket.open();
        websocket.onmessage({
            data: '[{"op":"replace","path":"/hello","value":"onRemoteChange callback"}]'
        });

        // wait for observer and mocked initial HTTP response
        setTimeout(function() {
            expect(palindrom.obj.hello).toEqual("onRemoteChange callback");
            var mostRecentCall = receivedSpy.calls.mostRecent();
            expect(mostRecentCall.args[0]).toEqual([{
                "op": "replace",
                "path": "/hello",
                "value": "onRemoteChange callback"
            }]);
            expect(mostRecentCall.args[1]).toEqual(['world']);
            done();
        }, 100); // for FF
    });

    it("should fire patch-applied event for applied patches", function(done) {
        var receivedSpy = jasmine.createSpy("patch-applied");

        var palindrom = this.palindrom = new Palindrom({
            useWebSocket: true
        });
        palindrom.addEventListener('patch-applied', receivedSpy);
        var websocket = jasmine.WebSocket.spy.calls.mostRecent().returnValue;
        //open WS for changes
        websocket.open();
        websocket.onmessage({
            data: '[{"op":"replace","path":"/hello","value":"patch-applied"}]'
        });

        // wait for observer and mocked initial HTTP response
        setTimeout(function() {
            var detail = receivedSpy.calls.mostRecent().args[0].detail;
            expect(detail.patches).toEqual([{
                "op": "replace",
                "path": "/hello",
                "value": "patch-applied"
            }]);
            expect(detail.results).toEqual(['world']);
            done();
        }, 100); // for FF
    });

    it("should NOT fire patch-applied event for patches that were received, but not yet applied", function(done) {
        var appliedSpy = jasmine.createSpy("patch-applied");

        var palindrom = this.palindrom = new Palindrom({
            useWebSocket: true
        });
        palindrom.addEventListener('patch-applied', appliedSpy);
        palindrom.queue.receive = function() {}; // just swallowing queue
        var websocket = jasmine.WebSocket.spy.calls.mostRecent().returnValue;
        //open WS for changes
        websocket.open();
        websocket.onmessage({
            data: '[{"op":"replace","path":"/hello","value":"next-patch"}]'
        });

        // wait for observer and mocked initial HTTP response
        setTimeout(function() {
            expect(appliedSpy).not.toHaveBeenCalled();
            done();
        }, 100); // for FF
    });
});
