describe("Warning", function () {
  beforeEach(function () {
    jasmine.Ajax.install();
  });

  afterEach(function () {
    this.puppet.unobserve();
    jasmine.Ajax.uninstall();
  });

  /// init
  describe("when the root path is patched", function () {
    it("should show a warning when debug=true", function (done) {
      var consoleSpy = spyOn(window.console, 'warn');
      var obj;

      this.puppet = new Puppet({remoteUrl: '/test', callback: function (myObj) {
        obj = myObj;
      }});

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      obj.hello = "galaxy";
      triggerMouseup();

      setTimeout(function () { //wait for xhr
        jasmine.Ajax.requests.mostRecent().response({
          "status": 200,
          "contentType": 'application/json-patch+json',
          "responseText": '[{"op":"replace","path":"","value":{"hello": "universe"}}]'
        });
        expect(obj.hello).toBe("universe");
        expect(consoleSpy.calls.count()).toBe(1);
        expect(consoleSpy.calls.argsFor(0)[0]).toBe('PuppetJs warning: Server pushed patch that replaces the object root ([{"op":"replace","path":"","value":{"hello":"universe"}}])');
        done();
      }, 1);
    });

    it("should not show a warning when debug=false", function (done) {
      var consoleSpy = spyOn(window.console, 'warn');
      var obj;

      this.puppet = new Puppet({remoteUrl: '/test', callback: function (myObj) {
        obj = myObj;
      }});
      this.puppet.debug = false;

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      obj.hello = "galaxy";
      triggerMouseup();

      setTimeout(function () { //wait for xhr
        jasmine.Ajax.requests.mostRecent().response({
          "status": 200,
          "contentType": 'application/json-patch+json',
          "responseText": '[{"op":"replace","path":"","value":{"hello": "universe"}}]'
        });
        expect(obj.hello).toBe("universe");
        expect(consoleSpy.calls.count()).toBe(0);
        done();
      }, 1);
    });
  });
});