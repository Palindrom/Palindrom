describe("IgnoreAdd", function () {
  jsonpatch.intervals = [10];

  beforeEach(function () {
    this.server = sinon.fakeServer.create();
  });

  afterEach(function () {
    this.puppet.unobserve();
    this.server.restore();
  });

  it('should not send add patch to an ignored property', function () {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();
    var obj;
    this.puppet = new Puppet('/test', function (myObj) {
      obj = myObj;
    });
    this.puppet.ignoreAdd = /\/\$.+/;

    this.server.respond('{"hello": 0}');

    waits(10);

    runs(function () {
      obj.hello = 1;
      obj.publicProp = 1;
      obj.$privateProp = 1;
    });

    waits(10);

    runs(function () {
      expect(patchSpy.callCount).toBe(2);
      expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":1},{"op":"add","path":"/publicProp","value":1}]');
    });
  });

  it('should not send replace patch to an ignored property', function () {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();
    var obj;
    this.puppet = new Puppet('/test', function (myObj) {
      obj = myObj;
    });
    this.puppet.ignoreAdd = /\/\$.+/;

    this.server.respond('{"hello": 0}');

    waits(10);

    runs(function () {
      obj.publicProp = 1;
      obj.$privateProp = 1;
    });

    waits(10);

    runs(function () {
      expect(patchSpy.callCount).toBe(2);
      expect(patchSpy).toHaveBeenCalledWith('[{"op":"add","path":"/publicProp","value":1}]');
      obj.publicProp = 2;
      obj.$privateProp = 2;
    });

    waits(10);

    runs(function () {
      expect(patchSpy.callCount).toBe(3);
      expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/publicProp","value":2}]');
    });
  });

  it('should not send replace patch to an ignored deep object', function () {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();
    var obj;
    this.puppet = new Puppet('/test', function (myObj) {
      obj = myObj;
    });
    this.puppet.ignoreAdd = /\/\$.+/;

    this.server.respond('{"hello": 0}');

    waits(10);

    runs(function () {
      obj.publicProp = ["a", "b", "c"];
      obj.$privateProp = ["a", "b", "c"];
    });

    waits(10);

    runs(function () {
      expect(patchSpy.callCount).toBe(2);
      expect(patchSpy).toHaveBeenCalledWith('[{"op":"add","path":"/publicProp","value":["a","b","c"]}]');
      obj.publicProp[2] = "cc";
      obj.$privateProp[2] = "cc";
    });

    waits(10);

    runs(function () {
      expect(patchSpy.callCount).toBe(3);
      expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/publicProp/2","value":"cc"}]');
    });
  });

  it('should not send any patch if all changes were ignored', function () {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').andCallThrough();
    var obj;
    this.puppet = new Puppet('/test', function (myObj) {
      obj = myObj;
    });
    this.puppet.ignoreAdd = /\/\$.+/;

    this.server.respond('{"hello": 0}');

    waits(10);

    runs(function () {
      expect(patchSpy.callCount).toBe(1);
      obj.$privateProp = 1;
    });

    waits(10);

    runs(function () {
      expect(patchSpy.callCount).toBe(1);
    });
  });
});