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

    it("should accept a JSON that has an empty string as a key (which is valid)", function () {
      var initSpy = jasmine.createSpy();

      this.puppet = new Puppet(window.location.href, initSpy);
      var that = this;

      this.server.respond('{"hello": "world","": {"hola": "mundo"}}');

      waitsFor(function () {
        return initSpy.wasCalled;
      }, 10);

      runs(function () {
        expect(initSpy).toHaveBeenCalledWith(jasmine.any(Object));
        expect(that.puppet.obj[""].hola).toBe("mundo");
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

  describe('Queue', function () {
    it('should NOT send key stroke changes until blur event occurs - by default', function () {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();
      var obj;
      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      var INPUT = document.createElement('INPUT');
      INPUT.type = "email";
      document.body.appendChild(INPUT);

      this.server.respond('{"hello": "world"}');

      waits(0);

      runs(function () {
        INPUT.focus();
        INPUT.value = "H";
        obj.hello = INPUT.value;
        triggerMouseup(INPUT); //trigger patch generation
      });

      waits(10);

      runs(function () {
        INPUT.value = "Hi";
        obj.hello = INPUT.value;
        triggerMouseup(INPUT);
        INPUT.blur();
      });

      waits(10);

      runs(function () {
        expect(patchSpy.callCount).toBe(2);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"Hi"}]');
        INPUT.parentNode.removeChild(INPUT);
      });
    });

    it('should send key stroke changes immediately - with attribute update-on="input"', function () {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();
      var obj;
      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      var INPUT = document.createElement('INPUT');
      INPUT.type = "email";
      INPUT.setAttribute('update-on', 'input');
      document.body.appendChild(INPUT);

      this.server.respond('{"hello": "world"}');

      waits(0);

      runs(function () {
        INPUT.focus();
        INPUT.value = "O";
        obj.hello = INPUT.value;
        triggerMouseup(INPUT); //trigger patch generation
      });

      waits(10);

      runs(function () {
        INPUT.value = "On";
        obj.hello = INPUT.value;
        triggerMouseup(INPUT);
        INPUT.blur();
      });

      waits(10);

      runs(function () {
        expect(patchSpy.callCount).toBe(3);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"O"}]');
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"On"}]');
        INPUT.parentNode.removeChild(INPUT);
      });
    });

    it('should send clicks on a button', function () {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();
      var obj;
      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      var BUTTON = document.createElement('BUTTON');
      BUTTON.addEventListener('mouseup', function () {
        obj.hello = null;
      });
      document.body.appendChild(BUTTON);

      this.server.respond('{"hello": null}');

      waits(0);

      runs(function () {
        triggerMouseup(BUTTON);
      });

      waits(0);

      runs(function () {
        expect(patchSpy.callCount).toBe(2);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":null}]');
        BUTTON.parentNode.removeChild(BUTTON);
      });
    });
  });
});