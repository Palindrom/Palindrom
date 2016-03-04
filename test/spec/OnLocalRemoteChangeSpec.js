
describe("OnLocal/RemoteChange", function() {
    beforeEach(function() {
        jasmine.Ajax.install();
        // stub initial HTTP request
        jasmine.Ajax.stubRequest(window.location.href).andReturn(TestResponses.defaultInit.success);
    });

    afterEach(function() {
        this.puppet.unobserve();
        jasmine.Ajax.uninstall();
    });

    beforeEach(function() {
        jasmine.WebSocket.install();
    });
    afterEach(function() {
        jasmine.WebSocket.uninstall();
    });
    it("should call onLocalChange callback for outgoing patches", function(done) {
        var WSSpy = jasmine.WebSocket.spy;
        var sentSpy = jasmine.createSpy("onLocalChange");

        var puppet = this.puppet = new Puppet({
            useWebSocket: true,
            onLocalChange: sentSpy
        });
        var websocket = jasmine.WebSocket.spy.calls.mostRecent().returnValue;
        //open WS for changes
        websocket.open();
        this.puppet.obj.hello = "onLocalChange callback";

        // wait for observer and mocked initial HTTP response
        setTimeout(function() {
            expect(puppet.obj.hello).toEqual("onLocalChange callback");
            expect(sentSpy.calls.mostRecent().args[0]).toEqual([{
                "op": "replace",
                "path": "/hello",
                "value": "onLocalChange callback"
            }]);
            done();
        }, 100); // for FF
    });

    it("should call onRemoteChange callback for incoming patches", function(done) {
        var WSSpy = jasmine.WebSocket.spy;
        var receivedSpy = jasmine.createSpy("onRemoteChange");

        var puppet = this.puppet = new Puppet({
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
            expect(puppet.obj.hello).toEqual("onRemoteChange callback");
            expect(receivedSpy.calls.mostRecent().args[0]).toEqual([{
                "op": "replace",
                "path": "/hello",
                "value": "onRemoteChange callback"
            }]);
            done();
        }, 100); // for FF
    });
});
