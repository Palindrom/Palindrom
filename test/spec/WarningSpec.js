describe("Warning", function () {
  beforeEach(function () {
    this.server = sinon.fakeServer.create();
  });

  afterEach(function () {
    this.puppet.unobserve();
    this.server.restore();
  });

  /// init
  describe("when the root path is patched", function () {
    it("should show a warning when debug=true", function () {
      var consoleSpy = spyOn(window.console, 'warn');
      var obj;

      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      this.server.respond('{"hello": "world"}');

      obj.hello = "galaxy";
      triggerMouseup();

      waits(0);

      runs(function () {
        this.server.respond('[{"op":"replace","path":"/","value":{"hello": "universe"}}]');
        //expect(obj.hello).toBe("universe"); //TODO JSON-Patch does not apply such patch correctly as of version 0.3.7
        expect(consoleSpy.callCount).toBe(1);
        expect(consoleSpy.argsForCall[0][0]).toBe('PuppetJs warning: Server pushed patch that replaces the object root ([{"op":"replace","path":"/","value":{"hello": "universe"}}])');
      });
    });

    it("should not show a warning when debug=false", function () {
      var consoleSpy = spyOn(window.console, 'warn');
      var obj;

      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });
      this.puppet.debug = false;

      this.server.respond('{"hello": "world"}');

      obj.hello = "galaxy";
      triggerMouseup();

      waits(0);

      runs(function () {
        this.server.respond('[{"op":"replace","path":"/","value":{"hello": "universe"}}]');
        //expect(obj.hello).toBe("universe"); //TODO JSON-Patch does not apply such patch correctly as of version 0.3.7
        expect(consoleSpy.callCount).toBe(0);
      });
    });
  });
});