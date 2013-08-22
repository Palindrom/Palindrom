describe("Parent", function () {
  beforeEach(function () {
    this.server = sinon.fakeServer.create();
  });

  afterEach(function () {
    this.puppet.unobserve();
    this.server.restore();
  });

  describe("attach $parent to each child object", function () {
    it("should return parent when $parent keyword is used (shallow)", function () {
      var initSpy = jasmine.createSpy();

      this.puppet = new Puppet(window.location.href, initSpy);

      this.server.respond('{"hello": "world", "child": {}}');

      waitsFor(function () {
        return initSpy.wasCalled;
      }, 10);

      runs(function () {
        expect(this.puppet.obj.child.$parent.hello).toEqual("world");
      });
    });

    it("should return parent when $parent keyword is used (deep)", function () {
      var initSpy = jasmine.createSpy();

      this.puppet = new Puppet(window.location.href, initSpy);

      this.server.respond('{"hello": "world", "children": [{"first": "1st"}, {"second": "2nd"}]}');

      waitsFor(function () {
        return initSpy.wasCalled;
      }, 10);

      runs(function () {
        expect(this.puppet.obj.children[0].$parent.$parent.children[1].second).toEqual("2nd");
      });
    });

    it("should return parent on a locally added property", function () {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();

      this.puppet = new Puppet(window.location.href, function () {
      });

      this.server.respond('{"hello": "world", "child": {}}');

      waits(0);

      runs(function () {
        this.puppet.obj.children = [
          {first: "1st"},
          {second: "2nd"}
        ];
        triggerMouseup();
      });

      waits(10);

      runs(function () {
        expect(this.puppet.obj.children[0].$parent.$parent.children[1].second).toEqual("2nd");
        expect(patchSpy.callCount).toBe(2); //only children should generate a patch ($parent getter should not)
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"add","path":"/children","value":[{"first":"1st"},{"second":"2nd"}]}]');
      });
    });

    it("should return parent on a remotely added property", function () {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();

      this.puppet = new Puppet(window.location.href, function () {
      });

      this.server.respond('{"hello": "world", "child": {}}');

      waits(0);

      runs(function () {
        this.puppet.obj.children = [
          {first: "1st"},
          {second: "2nd"}
        ];
        triggerMouseup();
      });

      waits(10);

      runs(function () {
        this.server.respond('[{"op":"add","path":"/children/0/remotes","value":[{"first":"1st"},{"second":"2nd"}]}]');
      });

      waits(10);

      runs(function () {
        expect(this.puppet.obj.children[0].remotes.$parent.remotes[1].second).toEqual("2nd");
        expect(patchSpy.callCount).toBe(2);
      });
    });
  });
});