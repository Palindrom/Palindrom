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

    it("should send toggled boolean value in patch when button is clicked", function (done) {
      var obj
        , patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough()
        , BUTTON;

      puppet = new Puppet({remoteUrl: '/test', callback: function (myObj) {
        obj = myObj;
      }});

        expect(patchSpy.calls.count()).toBe(1);
        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 200,
          "contentType": 'application/json',
          "responseText": '{"hello": "world", "SendButton": false}'
        });

        BUTTON = createButtonTest(function () {
          obj.SendButton = !obj.SendButton;
        });
        triggerMouseup(BUTTON);

      setTimeout(function () { //wait for xhr
          expect(patchSpy.calls.count()).toBe(2);
          jasmine.Ajax.requests.mostRecent().respondWith({
            "status": 200,
            "contentType": 'application/json-patch+json',
            "responseText": '[]'
          });

          expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/SendButton","value":true}]');
          BUTTON.parentNode.removeChild(BUTTON);
          done();
      }, 1);
    });

    it("should toggle on (`true`) and off (`false`) boolean value in consecutive patches", function (done) {
      var obj
        , patchSpy
        , BUTTON;

      new Puppet({remoteUrl: '/test', callback: function (myObj) {
        obj = myObj;
      }});

        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 200,
          "contentType": 'application/json',
          "responseText": '{"hello": "world", "SendButton": false}'
        });

        patchSpy = spyOn(XMLHttpRequest.prototype, 'send');

        BUTTON = createButtonTest(function () {
          obj.SendButton = !obj.SendButton;
        });
        triggerMouseup(BUTTON);

      setTimeout(function () { //wait for xhr
        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 200,
          "contentType": 'application/json-patch+json',
          "responseText": '[]'
        });

        expect(patchSpy.calls.count()).toBe(1);
        expect(patchSpy.calls.mostRecent().args[0]).toBe('[{"op":"replace","path":"/SendButton","value":true}]');
        triggerMouseup(BUTTON);

        setTimeout(function () { //wait xhr
          jasmine.Ajax.requests.mostRecent().respondWith({
            "status": 200,
            "contentType": 'application/json-patch+json',
            "responseText": '[]'
          });

          expect(patchSpy.calls.count()).toBe(2);
          expect(patchSpy.calls.mostRecent().args[0]).toBe('[{"op":"replace","path":"/SendButton","value":false}]');
          BUTTON.parentNode.removeChild(BUTTON);
          done();
        }, 1);
      }, 1);
    });

    it("should send incremented numeric value in patch when button is clicked", function (done) {
      var obj
        , patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough()
        , BUTTON;

      puppet = new Puppet({remoteUrl: '/test', callback: function (myObj) {
        obj = myObj;
      }});

        expect(patchSpy.calls.count()).toBe(1);
        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 200,
          "contentType": 'application/json',
          "responseText": '{"msg": "Show sparkles", "Amount": 0}'
        });

        BUTTON = createButtonTest(function () {
          obj.Amount++;
        });
        triggerMouseup(BUTTON);

      setTimeout(function () { //wait for xhr
        expect(patchSpy.calls.count()).toBe(2);
        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 200,
          "contentType": 'application/json-patch+json',
          "responseText": '[]'
        });

        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/Amount","value":1}]');
        BUTTON.parentNode.removeChild(BUTTON);
        done();
      }, 1);
    });

    it("should increment numeric value in consecutive patches", function (done) {
      var obj
        , patchSpy
        , BUTTON;

      new Puppet({remoteUrl: '/test', callback: function (myObj) {
        obj = myObj;
      }});

        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 200,
          "contentType": 'application/json',
          "responseText": '{"msg": "Show sparkles", "Amount": 0}'
        });

        patchSpy = spyOn(XMLHttpRequest.prototype, 'send');

        BUTTON = createButtonTest(function () {
          obj.Amount++;
        });
        triggerMouseup(BUTTON);

      setTimeout(function () { //wait for xhr
        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 200,
          "contentType": 'application/json-patch+json',
          "responseText": '[]'
        });

        expect(patchSpy.calls.count()).toBe(1);
        expect(patchSpy.calls.mostRecent().args[0]).toBe('[{"op":"replace","path":"/Amount","value":1}]');
        triggerMouseup(BUTTON);

        setTimeout(function () { //wait for xhr
          jasmine.Ajax.requests.mostRecent().respondWith({
            "status": 200,
            "contentType": 'application/json-patch+json',
            "responseText": '[]'
          });

          expect(patchSpy.calls.count()).toBe(2);
          expect(patchSpy.calls.mostRecent().args[0]).toBe('[{"op":"replace","path":"/Amount","value":2}]');
          BUTTON.parentNode.removeChild(BUTTON);
          done();
        }, 1);
      }, 1);
    });

  });
});