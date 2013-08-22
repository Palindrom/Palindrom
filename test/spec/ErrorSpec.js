describe("Error", function () {
  beforeEach(function () {
    this.server = sinon.fakeServer.create();
  });

  afterEach(function () {
    this.puppet.unobserve();
    this.server.restore();
  });

  /// init
  describe("on error response", function () {
    it("should show a message when status code 400 comes from the server (bootstrap)", function () {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();
      this.puppet = new Puppet('/test');

      this.server.respondWith(function (xhr) {
        xhr.respond(400, 'application/json', 'Custom msg');
      });
      this.server.respond();

      var DIV = document.getElementById('puppetjs-error');

      expect(DIV).toBeTruthy();
      expect(DIV.innerHTML).toContain('PuppetJs JSON response error');
      expect(DIV.innerHTML).toContain('400');
      expect(DIV.innerHTML).toContain('Custom msg');

      DIV.parentNode.removeChild(DIV);
    });

    it("should show a message when status code 599 comes from the server (bootstrap)", function () {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();
      this.puppet = new Puppet('/test');

      this.server.respondWith(function (xhr) {
        xhr.respond(599, 'application/json', 'Custom msg');
      });
      this.server.respond();

      var DIV = document.getElementById('puppetjs-error');

      expect(DIV).toBeTruthy();
      expect(DIV.innerHTML).toContain('PuppetJs JSON response error');
      expect(DIV.innerHTML).toContain('599');
      expect(DIV.innerHTML).toContain('Custom msg');

      DIV.parentNode.removeChild(DIV);
    });

    it("should show a message when status code 400 comes from the server (patch)", function () {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();
      var obj;

      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      this.server.respond('{"hello": "world"}');

      obj.hello = "galaxy";
      triggerMouseup();

      waits(100);

      runs(function () {
        this.server.respondWith(function (xhr) {
          xhr.respond(400, 'application/json', 'Custom msg');
        });
        this.server.respond();

        var DIV = document.getElementById('puppetjs-error');

        expect(DIV).toBeTruthy();
        expect(DIV.innerHTML).toContain('PuppetJs JSON response error');
        expect(DIV.innerHTML).toContain('400');
        expect(DIV.innerHTML).toContain('Custom msg');

        DIV.parentNode.removeChild(DIV);
      });
    });

    it("should show a message when status code 599 comes from the server (patch)", function () {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();
      var obj;

      this.puppet = new Puppet('/test', function (myObj) {
        obj = myObj;
      });

      this.server.respond('{"hello": "world"}');

      obj.hello = "galaxy";
      triggerMouseup();

      waits(0);

      runs(function () {
        this.server.respondWith(function (xhr) {
          xhr.respond(599, 'application/json', 'Custom msg');
        });
        this.server.respond();

        var DIV = document.getElementById('puppetjs-error');

        expect(DIV).toBeTruthy();
        expect(DIV.innerHTML).toContain('PuppetJs JSON response error');
        expect(DIV.innerHTML).toContain('599');
        expect(DIV.innerHTML).toContain('Custom msg');

        DIV.parentNode.removeChild(DIV);
      });
    });

    it("should NOT show a message when debug == false", function () {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send')
      this.puppet = new Puppet('/test');
      this.puppet.debug = false;

      this.server.respond(599, '{"hello": "world"}');

      var DIV = document.getElementById('puppetjs-error');

      expect(DIV).toBeFalsy();
    });
  });
});