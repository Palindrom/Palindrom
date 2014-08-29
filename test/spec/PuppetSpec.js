describe("Puppet", function () {
  beforeEach(function () {
    jasmine.Ajax.install();
  });

  afterEach(function () {
    this.puppet.unobserve();
    jasmine.Ajax.uninstall();
  });

  /// init
  describe("init", function () {
    it("should call callback with an object as single parameter", function (done) {
      var initSpy = jasmine.createSpy();

      this.puppet = new Puppet(window.location.href, initSpy);

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      setTimeout(function() {
        expect(initSpy).toHaveBeenCalledWith(jasmine.any(Object));
        done();
      }, 0);
    });

    it("should accept a JSON that has an empty string as a key (which is valid)", function (done) {
      var initSpy = jasmine.createSpy();

      this.puppet = new Puppet(window.location.href, initSpy);
      var that = this;

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world","": {"hola": "mundo"}}'
      });

      setTimeout(function() {
        expect(initSpy).toHaveBeenCalledWith(jasmine.any(Object));
        expect(that.puppet.obj[""].hola).toBe("mundo");
        done();
      }, 0);
    });
  });

  /// ajax
  describe("ajax", function () {
    it("should make a XHR request on init", function (done) {
      var initSpy = jasmine.createSpy();

      this.puppet = new Puppet('/test', initSpy);

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      setTimeout(function() {
        expect(initSpy).toHaveBeenCalledWith({"hello": "world"});
        done();
      }, 10);
    });

    it("should patch changes", function (done) {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
      var obj;

      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      expect(obj.hello).toEqual("world");

      obj.hello = "galaxy";
      triggerMouseup();

      setTimeout(function() {
        expect(patchSpy.calls.count()).toBe(2);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"galaxy"}]');

        jasmine.Ajax.requests.mostRecent().response({
          "status": 200,
          "contentType": 'application/json-patch+json',
          "responseText": '[{"op":"replace","path":"/hello","value":"universe"}]'
        });

        expect(obj.hello).toEqual("universe");

        done();
      }, 100);
    });

    it("should not patch changes after unobserve() was called", function (done) {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
      var obj;
      var that = this;

      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      expect(obj.hello).toEqual("world");

      expect(patchSpy.calls.count()).toBe(1);
      obj.hello = "galaxy";
      triggerMouseup();

      setTimeout(function() {
        expect(patchSpy.calls.count()).toBe(2);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"galaxy"}]');

        that.puppet.unobserve();

        jasmine.Ajax.requests.mostRecent().response({
          "status": 200,
          "contentType": 'application/json-patch+json',
          "responseText": '[{"op":"replace","path":"/hello","value":"universe"}]'
        });

        expect(obj.hello).toEqual("galaxy");

        done();
      }, 0);
    });

    it("should patch changes after observe() was called", function (done) {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
      var obj;
      var that = this;

      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      expect(obj.hello).toEqual("world");

      obj.hello = "galaxy";
      triggerMouseup();

      setTimeout(function() {
        expect(patchSpy.calls.count()).toBe(2);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"galaxy"}]');

        that.puppet.unobserve();

        jasmine.Ajax.requests.mostRecent().response({
          "status": 200,
          "contentType": 'application/json-patch+json',
          "responseText": '[{"op":"replace","path":"/hello","value":"universe"}]'
        });

        that.puppet.observe();
        obj.hello = "cosmos";
        triggerMouseup();

        setTimeout(function() {
          expect(patchSpy.calls.count()).toBe(3);
          expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"cosmos"}]');

          done();
        }, 0);
      }, 0);
    });
  });

  describe('Queue', function () {
    it('should NOT send key stroke changes until blur event occurs - by default', function (done) {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
      var obj;
      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      var INPUT = document.createElement('INPUT');
      INPUT.type = "email";
      document.body.appendChild(INPUT);

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      setTimeout(function () {
        INPUT.focus();
        INPUT.value = "H";
        obj.hello = INPUT.value;
        triggerMouseup(INPUT); //trigger patch generation

        setTimeout(function () {
          INPUT.value = "Hi";
          obj.hello = INPUT.value;
          triggerMouseup(INPUT);
          INPUT.blur();

          setTimeout(function () {
            expect(patchSpy.calls.count()).toBe(2);
            expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"Hi"}]');
            INPUT.parentNode.removeChild(INPUT);
            done();
          }, 10);
        }, 10);
      }, 0);
    });

    it('should send key stroke changes immediately - with attribute update-on="input"', function (done) {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
      var obj;
      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      var INPUT = document.createElement('INPUT');
      INPUT.type = "email";
      INPUT.setAttribute('update-on', 'input');
      document.body.appendChild(INPUT);

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      setTimeout(function () {
        INPUT.focus();
        INPUT.value = "O";
        obj.hello = INPUT.value;
        triggerMouseup(INPUT); //trigger patch generation

        setTimeout(function () {
          INPUT.value = "On";
          obj.hello = INPUT.value;
          triggerMouseup(INPUT);
          INPUT.blur();

          setTimeout(function () {
            expect(patchSpy.calls.count()).toBe(3);
            expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"O"}]');
            expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":"On"}]');
            INPUT.parentNode.removeChild(INPUT);
            done();
          }, 10);
        }, 10);
      }, 0);
    });

    it('should send clicks on a button', function (done) {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
      var obj;
      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      var BUTTON = document.createElement('BUTTON');
      BUTTON.addEventListener('mouseup', function () {
        obj.hello = null;
      });
      document.body.appendChild(BUTTON);

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": null}'
      });

      setTimeout(function () {
        triggerMouseup(BUTTON);

        setTimeout(function () {
          expect(patchSpy.calls.count()).toBe(2);
          expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":null}]');
          BUTTON.parentNode.removeChild(BUTTON);
          done();
        }, 0);
      }, 0);
    });

    it('should queue up patches until response comes', function (done) {
      var obj;
      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"city": "Gdynia"}'
      });

      setTimeout(function () {
        obj.city = "Gdansk";
        triggerMouseup();

        setTimeout(function () {
          obj.city = "Sopot";
          triggerMouseup();

          setTimeout(function () {
            //reply to Sopot
            expect(jasmine.Ajax.requests.at(2).params).toBe('[{"op":"replace","path":"/city","value":"Sopot"}]');
            jasmine.Ajax.requests.at(2).response({
              "status": 200,
              "contentType": 'application/json-patch+json',
              "responseText": '[{"op": "replace", "path": "/city", "value": "Changed to Sopot"}]'
            });

            setTimeout(function () {
              //reply to Gdansk
              expect(jasmine.Ajax.requests.at(1).params).toBe('[{"op":"replace","path":"/city","value":"Gdansk"}]');
              jasmine.Ajax.requests.at(1).response({
                "status": 200,
                "contentType": 'application/json-patch+json',
                "responseText": '[{"op": "replace", "path": "/city", "value": "Changed to Gdansk"}]'
              });

              setTimeout(function () {
                expect(obj.city).toBe("Changed to Sopot");
                done();
              }, 100);
            }, 100);
          }, 100);
        }, 0);
      }, 0);
    });
  });
});