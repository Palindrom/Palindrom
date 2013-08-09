describe("Buttons", function () {
  beforeEach(function () {
    this.server = sinon.fakeServer.create();
  });

  afterEach(function () {
    if(this.puppet) {
      this.puppet.unobserve();
    }
    this.server.restore();
  });

  function createButtonTest(callback) {
    var BUTTON = document.createElement('BUTTON');
    BUTTON.innerHTML = 'Click me';
    document.body.appendChild(BUTTON);

    BUTTON.addEventListener('mouseup', callback);
    return BUTTON;
  }

  describe("click on button", function () {
    it("should call the callback", function () {
      var called = false;
      var BUTTON = createButtonTest(function () {
        called = true;
      });

      triggerMouseup(BUTTON);

      expect(called).toBe(true);
      BUTTON.parentNode.removeChild(BUTTON);
    });

    it("should send null patch when button is clicked", function () {
      var obj
        , patchSpy
        , BUTTON;

      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      waits(0);

      runs(function () {

        this.server.respond('{"hello": "world", "SendButton": null}');

        patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();

        BUTTON = createButtonTest(function () {
          obj.SendButton = null;
        });
        triggerMouseup(BUTTON);

      });

      waits(0);

      runs(function () {
        expect(patchSpy.callCount).toBe(1);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/SendButton","value":null}]');
        BUTTON.parentNode.removeChild(BUTTON);
      })

    });

    it("should send null patch twice", function () {
      var obj
        , patchSpy
        , BUTTON;

      new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      waits(0);

      runs(function () {
        this.server.respond('{"hello": "world", "SendButton": null}');

        patchSpy = spyOn(XMLHttpRequest.prototype, 'send');

        BUTTON = createButtonTest(function () {
          obj.SendButton = null;
        });
        triggerMouseup(BUTTON);
      });

      waits(0);

      runs(function () {
        expect(patchSpy.callCount).toBe(1);
        expect(patchSpy.mostRecentCall.args[0]).toBe('[{"op":"replace","path":"/SendButton","value":null}]');
        triggerMouseup(BUTTON);
      });

      waits(0);

      runs(function () {
        expect(patchSpy.callCount).toBe(2);
        expect(patchSpy.mostRecentCall.args[0]).toBe('[{"op":"replace","path":"/SendButton","value":null}]');
        BUTTON.parentNode.removeChild(BUTTON);
      })

    });

    it("should send null patch twice when null was defined in a patch", function () {
      var that = this
        , obj
        , patchSpy
        , BUTTON
        , BUTTON2;

      new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      waits(0);

      runs(function () {
        this.server.respond('{"hello": "world", "SendButton": null}');

        patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();

        BUTTON = createButtonTest(function () {
          obj.SendButton = null;
        });
        triggerMouseup(BUTTON);

        BUTTON2 = createButtonTest(function () {
          obj.AnotherButton = null;
        });
      });

      waits(0);

      runs(function () {
        that.server.respond('[{"op": "add", "path": "/AnotherButton", "value": null}]');

        triggerMouseup(BUTTON2);
      });

      waits(0);

      runs(function () {
        expect(patchSpy.callCount).toBe(2);
        expect(patchSpy.mostRecentCall.args[0]).toBe('[{"op":"replace","path":"/AnotherButton","value":null}]');
        BUTTON.parentNode.removeChild(BUTTON);
        BUTTON2.parentNode.removeChild(BUTTON2);
      });

    });
  });
});