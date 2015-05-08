describe("WebSocket", function () {
  var wsSpy;
  beforeEach(function () {
    //wsSpy = jasmine.createSpy();
    jasmine.Ajax.install();
    jasmine.WebSocket.install();
    // stub initial HTTP request
    jasmine.Ajax.stubRequest(window.location.href).andReturn( TestResponses.defaultInit.success );
  });

  afterEach(function () {
    this.puppet && this.puppet.unobserve();
    jasmine.Ajax.uninstall();
    jasmine.WebSocket.uninstall();
  });

  /// init
  describe("Puppet constructor", function () {
      describe("if `useWebSocket` flag is provided", function () {
        it("should try to open WebSocket connection ", function (done) {

          var WSSpy = jasmine.WebSocket.spy.and.callThroughConstructor();

          this.puppet = new Puppet({useWebSocket: true});
          expect(WSSpy).toHaveBeenCalledWith("ws://" + window.location.host + "/__default/wsupgrade/testId001");
          expect(WSSpy.calls.mostRecent().returnValue.readyState).toEqual(WebSocket.CONNECTING); // 0
          done();

        });
        it("should use same host, port, username, and password as provided in remoteUrl", function (done) {

          var WSSpy = jasmine.WebSocket.spy.and.callThroughConstructor();

          this.puppet = new Puppet({
            remoteUrl: "http://junji:ito@house.of.puppets:1234/disregard/path?query=string#andHash",
            useWebSocket: true});
          expect(WSSpy).toHaveBeenCalledWith("ws://junji:ito@house.of.puppets:1234/__default/wsupgrade/testId001");
          done();

        });
        it("should use `wss://` for `http://` remotes", function (done) {

          var WSSpy = jasmine.WebSocket.spy.and.callThroughConstructor();

          this.puppet = new Puppet({
            remoteUrl: "https://house.of.puppets/",
            useWebSocket: true});
          expect(WSSpy).toHaveBeenCalledWith("wss://house.of.puppets/__default/wsupgrade/testId001");
          done();

        });
      });

  });

  describe("before connection is opened", function () {
    it("should not try to send changes", function (done) {

      var WSSpy = jasmine.WebSocket.spy.and.callThroughConstructor();
      var sendSpy = spyOn( jasmine.WebSocket.oryginalWebSocket.prototype, "send").and.callThrough();

        this.puppet = new Puppet({useWebSocket: true});
        this.puppet.obj.hello = "galaxy";
        triggerMouseup();

      expect(WSSpy.calls.mostRecent().returnValue.readyState).toEqual(WebSocket.CONNECTING); // 0
      expect(sendSpy).not.toHaveBeenCalled();
      done();

    });

  });
  describe("once connection is opened", function () {
    it("should send over WebSocket changes queued after HTTP responded, but before WS was created", function (done) {

      var WSSpy = jasmine.WebSocket.spy;

        this.puppet = new Puppet({useWebSocket: true, callback: onDataReady});
        function onDataReady(){
          // tested code
          // // change the data once it was fetched but before WS instance was even created
          var puppetObj = this.obj;
          puppetObj.hello = "galaxy";
          triggerMouseup();
          // change object later
          setTimeout(function(){
            puppetObj.foo = "bar";
            triggerMouseup();
            setTimeout( checkOnceReady, 1); // wait for WS to get created
          },1);

        }

        function checkOnceReady(){
          var websocket = WSSpy.calls.mostRecent().returnValue;
          websocket.open();


          expect(websocket.readyState).toEqual(WebSocket.OPEN); // 1
          expect(websocket.sendSpy.calls.argsFor(0)).toEqual([JSON.stringify([{op:"replace",path: "/hello", value:"galaxy"}])]);
          expect(websocket.sendSpy.calls.argsFor(1)).toEqual([JSON.stringify([{op:"add",path: "/foo", value:"bar"}])]);
          done();
        }

    });
    it("should send over WebSocket changes queued after HTTP responded and WS was created, but before WS was opened", function (done) {

      var WSSpy = jasmine.WebSocket.spy;

        this.puppet = new Puppet({useWebSocket: true, callback: onDataReady});
        function onDataReady(puppetObj){
          // tested code
          // // change the data once it was fetched but before WS instance was even created
          // wait for WebSocket to get created
          setTimeout(function(){

            var websocket = WSSpy.calls.mostRecent().returnValue;
            expect(websocket.readyState).toEqual(WebSocket.CONNECTING); // 0
            puppetObj.hello = "galaxy";
            triggerMouseup();

            // another change a bit later
            setTimeout(function(){
              puppetObj.foo = "bar";
              triggerMouseup();

              //wait for async trigger(?)
              setTimeout(checkOnceReady);
            },1);
          },1);

        }

        function checkOnceReady(){
          var websocket = WSSpy.calls.mostRecent().returnValue;
          websocket.open();


          expect(websocket.readyState).toEqual(WebSocket.OPEN); // 0
          expect(websocket.sendSpy.calls.argsFor(0)).toEqual([JSON.stringify([{op:"replace",path: "/hello", value:"galaxy"}])]);
          expect(websocket.sendSpy.calls.argsFor(1)).toEqual([JSON.stringify([{op:"add",path: "/foo", value:"bar"}])]);
          done();
        }

    });

    it("should send new changes over WebSocket", function (done) {

      var WSSpy = jasmine.WebSocket.spy;

        this.puppet = new Puppet({useWebSocket: true, callback: onDataReady});
        function onDataReady(puppetObj){
          // wait for WS to get created
          setTimeout(function(){
            var websocket = WSSpy.calls.mostRecent().returnValue;
            // open websocket
            websocket.open();
            //tested code
              puppetObj.hello = "galaxy";
              triggerMouseup();  

              //wait for async trigger(?)
              setTimeout(checkOnceReady);
            
          });       
        }

        function checkOnceReady(){
          var websocket = WSSpy.calls.mostRecent().returnValue;
          expect(websocket.readyState).toEqual(WebSocket.OPEN); // 1
          expect(websocket.sendSpy.calls.argsFor(0)).toEqual([JSON.stringify([{op:"replace",path: "/hello", value:"galaxy"}])]); 
          done();
        }


    });

  });

});
