describe("Warning", function () {
  beforeEach(function () {
    jasmine.Ajax.install();
  });

  afterEach(function () {
    this.palindrom.unobserve();
    jasmine.Ajax.uninstall();
  });

  /// init
  describe("when the root path is patched", function () {
    it("should show a warning when debug=true", function (done) {
      var consoleSpy = spyOn(window.console, 'warn');
      var obj;

      this.palindrom = new Palindrom({remoteUrl: '/test', callback: function (myObj) {
        obj = myObj;
      }});

      jasmine.Ajax.requests.mostRecent().respondWith({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      obj.hello = "galaxy";
      triggerMouseup();

      setTimeout(function () { //wait for xhr
        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 200,
          "contentType": 'application/json-patch+json',
          "responseText": '[{"op":"replace","path":"","value":{"hello": "universe"}}]'
        });
        expect(obj.hello).toBe("universe");
        expect(consoleSpy.calls.count()).toBeGreaterThan(0);
        expect(consoleSpy.calls.allArgs().map(function(a){return a[0]})).toContain('Palindrom warning: Server pushed patch that replaces the object root ([{"op":"replace","path":"","value":{"hello":"universe"}}])');
        done();
      }, 1);
    });

    it("should not show a warning when debug=false", function (done) {
      var consoleSpy = spyOn(window.console, 'warn');
      var obj;

      this.palindrom = new Palindrom({remoteUrl: '/test', callback: function (myObj) {
        obj = myObj;
      }});
      this.palindrom.debug = false;

      jasmine.Ajax.requests.mostRecent().respondWith({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });

      obj.hello = "galaxy";
      triggerMouseup();

      setTimeout(function () { //wait for xhr
        jasmine.Ajax.requests.mostRecent().respondWith({
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