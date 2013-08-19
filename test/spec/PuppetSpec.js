describe("Puppet", function () {
  beforeEach(function () {
    this.server = sinon.fakeServer.create();
  });

  afterEach(function () {
    this.puppet.unobserve();
    this.server.restore();
  });

  /// init
  describe("init", function () {
    it("should call callback with an object as single parameter", function () {
      var initSpy = jasmine.createSpy();

      this.puppet = new Puppet(window.location.href, initSpy);

      this.server.respond('{"hello": "world"}');

      waitsFor(function () {
        return initSpy.wasCalled;
      }, 10);

      runs(function () {
        expect(initSpy).toHaveBeenCalledWith(jasmine.any(Object));
      });
    });
  });

  /// ajax
  describe("ajax", function () {
    it("should make a XHR request on init", function () {
      var initSpy = jasmine.createSpy();

      this.puppet = new Puppet('/test', initSpy);

      this.server.respond('{"hello": "world"}');

      waitsFor(function () {
        return initSpy.wasCalled;
      }, 10);

      runs(function () {
        expect(initSpy).toHaveBeenCalledWith({"hello": "world"});
      });
    });

    it("should patch changes", function () {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();
      var obj;

      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      this.server.respond('{"hello": "world"}');

      expect(obj.hello).toEqual("world");

      obj.hello = "galaxy";
      triggerMouseup();

      waits(100);

      runs(function () {
        expect(patchSpy.callCount).toBe(2);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"galaxy"}]');

        this.server.respond('[{"op":"replace","path":"/hello","value":"universe"}]');

        expect(obj.hello).toEqual("universe");
      });
    });

    it("should not patch changes after unobserve() was called", function () {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();
      var obj;

      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      this.server.respond('{"hello": "world"}');

      expect(obj.hello).toEqual("world");

      expect(patchSpy.callCount).toBe(1);
      obj.hello = "galaxy";
      triggerMouseup();

      waits(0);

      runs(function () {
        expect(patchSpy.callCount).toBe(2);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"galaxy"}]');

        this.puppet.unobserve();
        this.server.respond('[{"op":"replace","path":"/hello","value":"universe"}]');

        expect(obj.hello).toEqual("galaxy");
      });
    });

    it("should patch changes after observe() was called", function () {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();
      var obj;

      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      this.server.respond('{"hello": "world"}');

      expect(obj.hello).toEqual("world");

      obj.hello = "galaxy";
      triggerMouseup();

      waits(0);

      runs(function () {
        expect(patchSpy.callCount).toBe(2);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"galaxy"}]');

        this.puppet.unobserve();
        this.server.respond('[{"op":"replace","path":"/hello","value":"universe"}]');

        this.puppet.observe();
        obj.hello = "cosmos";
        triggerMouseup();
      });

      waits(0);

      runs(function () {
        expect(patchSpy.callCount).toBe(3);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"cosmos"}]');
      });
    });
  });
});