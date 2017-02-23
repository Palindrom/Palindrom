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
    this.palindrom && this.palindrom.unobserve();
    jasmine.Ajax.uninstall();
    jasmine.WebSocket.uninstall();
  });

  /// init
  describe("Palindrom constructor", function () {
      describe("if `useWebSocket` flag is provided", function () {
        it("should try to open WebSocket connection ", function (done) {

          var WSSpy = jasmine.WebSocket.spy.and.callThroughConstructor();

          this.palindrom = new Palindrom({useWebSocket: true});
          expect(WSSpy).toHaveBeenCalledWith("ws://" + window.location.host + "/__default/testId001");
          expect(WSSpy.calls.mostRecent().returnValue.readyState).toEqual(WebSocket.CONNECTING); // 0
          done();

        });
        it("should use same host, port, username, and password as provided in remoteUrl", function (done) {

          var WSSpy = jasmine.WebSocket.spy.and.callThroughConstructor();
          var remoteUrl = "http://junji:ito@house.of.palindroms:1234/disregard/path?query=string#andHash";
          jasmine.Ajax.stubRequest(remoteUrl).andReturn( TestResponses.defaultInit.success );


          this.palindrom = new Palindrom({
            remoteUrl: remoteUrl,
            useWebSocket: true});
          expect(WSSpy).toHaveBeenCalledWith("ws://junji:ito@house.of.palindroms:1234/__default/testId001");
          done();

        });
        it("should use `wss://` for `http://` remotes", function (done) {

          var WSSpy = jasmine.WebSocket.spy.and.callThroughConstructor();
          var remoteUrl = "https://house.of.palindroms/";
          jasmine.Ajax.stubRequest(remoteUrl).andReturn( TestResponses.defaultInit.success );

          this.palindrom = new Palindrom({
            remoteUrl: remoteUrl,
            useWebSocket: true});
          expect(WSSpy).toHaveBeenCalledWith("wss://house.of.palindroms/__default/testId001");
          done();

        });
      });

      it("two palindroms should work with different WebSockets", function (done) {
          var WSSpy = jasmine.WebSocket.spy;
          var url1 = "http://house1.of.palindroms/";
          var url2 = "http://house2.of.palindroms/";

          jasmine.Ajax.stubRequest(url1).andReturn(TestResponses.defaultInit.success);
          jasmine.Ajax.stubRequest(url2).andReturn(TestResponses.defaultInit.success);

          var palindrom1 = new Palindrom({
              remoteUrl: url1,
              useWebSocket: true,
              callback: function () {
                  setTimeout(function () {
                      var websocket = WSSpy.calls.mostRecent().returnValue;

                      websocket.open();
                  }, 1);
              },
              onSocketStateChanged: function (state, url) {
                  if (state == 1) {
                      palindrom1.obj.hello = "world2";
                      triggerMouseup();
                  }
              },
              onPatchSent: function (data, url) {
                  if (data) {
                      expect(data).toEqual('[{"op":"replace","path":"/hello","value":"world2"}]');
                      expect(url).toEqual("ws://house1.of.palindroms/__default/testId001");
                      expect(url).toEqual(palindrom1.network._ws.url);
                      expect(palindrom2.network._ws).not.toEqual(palindrom1.network._ws);
                  }
              }
          });

          var palindrom2 = new Palindrom({
              remoteUrl: url2,
              useWebSocket: true,
              callback: function () {
                  setTimeout(function () {
                      var websocket = WSSpy.calls.mostRecent().returnValue;

                      websocket.open();
                  }, 1);
              },
              onSocketStateChanged: function (state, url) {
                  if (state == 1) {
                      palindrom2.obj.hello = "world3";
                      triggerMouseup();
                  }
              },
              onPatchSent: function (data, url) {
                  if (data) {
                      expect(data).toEqual('[{"op":"replace","path":"/hello","value":"world3"}]');
                      expect(url).toEqual("ws://house2.of.palindroms/__default/testId001");
                      expect(url).toEqual(palindrom2.network._ws.url);
                      expect(palindrom2.network._ws).not.toEqual(palindrom1.network._ws);

                      done();
                  }
              }
          });
      });
  });

  describe("before connection is opened", function () {
    it("should not try to send changes", function (done) {

      var WSSpy = jasmine.WebSocket.spy.and.callThroughConstructor();
      var sendSpy = spyOn( jasmine.WebSocket.oryginalWebSocket.prototype, "send").and.callThrough();

        this.palindrom = new Palindrom({useWebSocket: true});
        this.palindrom.obj.hello = "galaxy";
        triggerMouseup();

      expect(WSSpy.calls.mostRecent().returnValue.readyState).toEqual(WebSocket.CONNECTING); // 0
      expect(sendSpy).not.toHaveBeenCalled();
      done();

    });

  });
  describe("once connection is opened", function () {
    it("should send patches over HTTP before ws.readyState is OPENED, and over WebSocket after ws.readyState is OPENED", function (done) {

      var WSSpy = jasmine.WebSocket.spy;

        this.palindrom = new Palindrom({useWebSocket: true, callback: onDataReady});
        function onDataReady(){
          // tested code
          // // change the data once it was fetched but before WS instance was even created
          var palindromObj = this.obj;
          palindromObj.hello = "galaxy";
          triggerMouseup();

          // change object later
          setTimeout(function () {
            //The patch should be send immediately as WS connection is not yet established
            expect(jasmine.Ajax.requests.mostRecent().params).toEqual(JSON.stringify([{ op: "replace", path: "/hello", value: "galaxy" }]));

            palindromObj.foo = "bar";
            triggerMouseup();

            setTimeout(function () {
              //The patch should be send immediately as WS connection is not yet established
              expect(jasmine.Ajax.requests.mostRecent().params).toEqual(JSON.stringify([{ op: "add", path: "/foo", value: "bar" }]));

              var websocket = WSSpy.calls.mostRecent().returnValue;
              websocket.open();

              palindromObj.bar = "foo";
              triggerMouseup();

              setTimeout(function () {
                //Patches should be send over WS once connection established
                expect(websocket.sendSpy.calls.argsFor(0)).toEqual([JSON.stringify([{ op: "add", path: "/bar", value: "foo" }])]);

                done();
              }, 1);
            }, 1);
          },1);

        }

        /*function checkOnceReady(){
          var websocket = WSSpy.calls.mostRecent().returnValue;
          websocket.open();

          expect(websocket.readyState).toEqual(WebSocket.OPEN); // 1
          expect(websocket.sendSpy.calls.argsFor(0)).toEqual([JSON.stringify([{op:"replace",path: "/hello", value:"galaxy"}])]);
          expect(websocket.sendSpy.calls.argsFor(1)).toEqual([JSON.stringify([{op:"add",path: "/foo", value:"bar"}])]);
          done();
        }*/

    });
    /*it("should send over WebSocket changes queued after HTTP responded and WS was created, but before WS was opened", function (done) {

      var WSSpy = jasmine.WebSocket.spy;

        this.palindrom = new Palindrom({useWebSocket: true, callback: onDataReady});
        function onDataReady(palindromObj){
          // tested code
          // // change the data once it was fetched but before WS instance was even created
          // wait for WebSocket to get created
          setTimeout(function(){

            var websocket = WSSpy.calls.mostRecent().returnValue;
            expect(websocket.readyState).toEqual(WebSocket.CONNECTING); // 0
            palindromObj.hello = "galaxy";
            triggerMouseup();

            // another change a bit later
            setTimeout(function(){
              palindromObj.foo = "bar";
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

    });*/

    it("should send new changes over WebSocket", function (done) {

      var WSSpy = jasmine.WebSocket.spy;

        this.palindrom = new Palindrom({useWebSocket: true, callback: onDataReady});
        function onDataReady(palindromObj){
          // wait for WS to get created
          setTimeout(function(){
            var websocket = WSSpy.calls.mostRecent().returnValue;
            // open websocket
            websocket.open();
            //tested code
              palindromObj.hello = "galaxy";
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
