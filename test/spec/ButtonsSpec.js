describe("Buttons", function () {
  var puppet;
  beforeEach(function () {
    jasmine.Ajax.install();
  });

  afterEach(function () {
    if(puppet) {
      puppet.unobserve();
    }
    jasmine.Ajax.uninstall();
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

    it("should send null patch when button is clicked", function (done) {
      var obj
        , patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough()
        , BUTTON;

      puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      setTimeout(function () {
        expect(patchSpy.calls.count()).toBe(1);
        jasmine.Ajax.requests.mostRecent().response({
          "status": 200,
          "contentType": 'application/json',
          "responseText": '{"hello": "world", "SendButton": null}'
        });

        BUTTON = createButtonTest(function () {
          obj.SendButton = null;
        });
        triggerMouseup(BUTTON);

        setTimeout(function () {
          expect(patchSpy.calls.count()).toBe(2);
          jasmine.Ajax.requests.mostRecent().response({
            "status": 200,
            "contentType": 'application/json-patch+json',
            "responseText": '[]'
          });

          expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/SendButton","value":null}]');
          BUTTON.parentNode.removeChild(BUTTON);
          done();
        }, 100);
      }, 100);
    });

    it("should send null patch twice", function (done) {
      var obj
        , patchSpy
        , BUTTON;

      new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      setTimeout(function () {
        jasmine.Ajax.requests.mostRecent().response({
          "status": 200,
          "contentType": 'application/json',
          "responseText": '{"hello": "world", "SendButton": null}'
        });

        patchSpy = spyOn(XMLHttpRequest.prototype, 'send');

        BUTTON = createButtonTest(function () {
          obj.SendButton = null;
        });
        triggerMouseup(BUTTON);

        setTimeout(function () {
          jasmine.Ajax.requests.mostRecent().response({
            "status": 200,
            "contentType": 'application/json-patch+json',
            "responseText": '[]'
          });

          expect(patchSpy.calls.count()).toBe(1);
          expect(patchSpy.calls.mostRecent().args[0]).toBe('[{"op":"replace","path":"/SendButton","value":null}]');
          triggerMouseup(BUTTON);

          setTimeout(function () {
            jasmine.Ajax.requests.mostRecent().response({
              "status": 200,
              "contentType": 'application/json-patch+json',
              "responseText": '[]'
            });

            expect(patchSpy.calls.count()).toBe(2);
            expect(patchSpy.calls.mostRecent().args[0]).toBe('[{"op":"replace","path":"/SendButton","value":null}]');
            BUTTON.parentNode.removeChild(BUTTON);
            done();
          }, 0);
        }, 0);
      }, 0);
    });

    it("should send null patch twice when null was defined in a patch", function (done) {
      var obj
        , patchSpy
        , BUTTON
        , BUTTON2;

      new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      setTimeout(function () {
        jasmine.Ajax.requests.mostRecent().response({
          "status": 200,
          "contentType": 'application/json',
          "responseText": '{"hello": "world", "SendButton": null}'
        });

        patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();

        BUTTON = createButtonTest(function () {
          obj.SendButton = null;
        });
        triggerMouseup(BUTTON);

        BUTTON2 = createButtonTest(function () {
          obj.AnotherButton = null;
        });

        setTimeout(function () {
          jasmine.Ajax.requests.mostRecent().response({
            "status": 200,
            "contentType": 'application/json-patch+json',
            "responseText": '[{"op": "add", "path": "/AnotherButton", "value": null}]'
          });

          triggerMouseup(BUTTON2);

          setTimeout(function () {
            jasmine.Ajax.requests.mostRecent().response({
              "status": 200,
              "contentType": 'application/json-patch+json',
              "responseText": '[]'
            });

            expect(patchSpy.calls.count()).toBe(2);
            expect(patchSpy.calls.mostRecent().args[0]).toBe('[{"op":"replace","path":"/AnotherButton","value":null}]');
            BUTTON.parentNode.removeChild(BUTTON);
            BUTTON2.parentNode.removeChild(BUTTON2);
            done();
          }, 0);
        }, 0);
      }, 0);
    });
  });
});