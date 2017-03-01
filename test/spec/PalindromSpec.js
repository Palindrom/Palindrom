describe("Palindrom", function () {
  beforeEach(function () {
    jasmine.Ajax.install();
  });

  afterEach(function () {
    this.palindrom.unobserve();
    jasmine.Ajax.uninstall();
  });

  /// init
  describe("init", function () {
    it("should call callback with an object as single parameter", function (done) {
      var initSpy = jasmine.createSpy();

      this.palindrom = new Palindrom({callback: initSpy});

      jasmine.Ajax.requests.mostRecent().respondWith({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      setTimeout(function () {
        expect(initSpy).toHaveBeenCalledWith(jasmine.any(Object));
        done();
      }, 1); //promise shim resolves after 1 ms
    });

    it("should accept a JSON that has an empty string as a key (which is valid)", function (done) {
      var initSpy = jasmine.createSpy();

      this.palindrom = new Palindrom({callback: initSpy});
      var that = this;

      jasmine.Ajax.requests.mostRecent().respondWith({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world","": {"hola": "mundo"}}'
      });

      setTimeout(function () {
        expect(initSpy).toHaveBeenCalledWith(jasmine.any(Object));
        expect(that.palindrom.obj[""].hola).toBe("mundo");
        done();
      }, 1); //promise shim resolves after 1 ms
    });
  });

  /// ajax
  describe("ajax", function () {
    it("should make a XHR request on init", function (done) {
      var initSpy = jasmine.createSpy();

      this.palindrom = new Palindrom({remoteUrl: '/test', callback: initSpy});

      jasmine.Ajax.requests.mostRecent().respondWith({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      setTimeout(function () {
        expect(initSpy).toHaveBeenCalledWith({"hello": "world"});
        done();
      }, 10);
    });

    it("should patch changes", function (done) {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
      var obj;

      this.palindrom = new Palindrom({remoteUrl: '/test', callback: function (myObj) {
        obj = myObj;

        checkWhenReady();
      }});

      jasmine.Ajax.requests.mostRecent().respondWith({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      function checkWhenReady(){
        expect(obj.hello).toEqual("world");

        obj.hello = "galaxy";
        triggerMouseup();

        setTimeout(function () { //wait for xhr
          expect(patchSpy.calls.count()).toBe(2);
          expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"galaxy"}]');

          jasmine.Ajax.requests.mostRecent().respondWith({
            "status": 200,
            "contentType": 'application/json-patch+json',
            "responseText": '[{"op":"replace","path":"/hello","value":"universe"}]'
          });

          expect(obj.hello).toEqual("universe");

          done();
        }, 1);
      }
    });

    it("should not patch changes after unobserve() was called", function (done) {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
      var obj;
      var that = this;

      this.palindrom = new Palindrom({remoteUrl: '/test', callback: function (myObj) {
        obj = myObj;

        checkWhenReady();
      }});

      jasmine.Ajax.requests.mostRecent().respondWith({ //responds immediately
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      function checkWhenReady() { //wait xhr request promise
        expect(obj.hello).toEqual("world");

        expect(patchSpy.calls.count()).toBe(1);
        obj.hello = "galaxy";

        triggerMouseup();

        setTimeout(function () { //wait for xhr
          expect(patchSpy.calls.count()).toBe(2);
          expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"galaxy"}]');

          that.palindrom.unobserve();

          jasmine.Ajax.requests.mostRecent().respondWith({
            "status": 200,
            "contentType": 'application/json-patch+json',
            "responseText": '[{"op":"replace","path":"/hello","value":"universe"}]'
          });

          expect(obj.hello).toEqual("galaxy");
          done();
        }, 1);
      }
    });

    it("should patch changes after observe() was called", function (done) {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
      var obj;
      var that = this;

      this.palindrom = new Palindrom({remoteUrl: '/test', callback: function (myObj) {
        obj = myObj;

        checkWhenReady();
      }});

      jasmine.Ajax.requests.mostRecent().respondWith({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      function checkWhenReady(){
        expect(obj.hello).toEqual("world");

        obj.hello = "galaxy";
        triggerMouseup();

        setTimeout(function () { //wait for xhr
          expect(patchSpy.calls.count()).toBe(2);
          expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"galaxy"}]');

          that.palindrom.unobserve();

          jasmine.Ajax.requests.mostRecent().respondWith({
            "status": 200,
            "contentType": 'application/json-patch+json',
            "responseText": '[{"op":"replace","path":"/hello","value":"universe"}]'
          });

          that.palindrom.observe();
          obj.hello = "cosmos";
          triggerMouseup();

          setTimeout(function () { //wait for xhr
            expect(patchSpy.calls.count()).toBe(3);
            expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"cosmos"}]');

            done();
          }, 1);
        }, 1);
      }
    });
  });
});