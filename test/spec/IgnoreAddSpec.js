describe("IgnoreAdd", function () {
  jsonpatch.intervals = [10];

  beforeEach(function () {
    jasmine.Ajax.install();
  });

  afterEach(function () {
    this.puppet.unobserve();
    jasmine.Ajax.uninstall();
  });

  it('should not send add patch to an ignored property', function (done) {
    var obj;
    this.puppet = new Puppet({remoteUrl: '/test', callback: function (myObj) {
      obj = myObj;
    }});
    this.puppet.ignoreAdd = /\/\$.+/;

    jasmine.Ajax.requests.mostRecent().respondWith({
      "status": 200,
      "contentType": 'application/json',
      "responseText": '{"hello": 0}'
    });

    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();

    obj.hello = 1;
    obj.publicProp = 1;
    obj.$privateProp = 1;

    setTimeout(function () { //wait for xhr
        expect(patchSpy.calls.count()).toBe(1);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":1},{"op":"add","path":"/publicProp","value":1}]');
        done();
    }, 20);
  });

  it('should not send replace patch to an ignored property', function (done) {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
    var obj;
    this.puppet = new Puppet({remoteUrl: '/test', callback: function (myObj) {
      obj = myObj;
    }});
    this.puppet.ignoreAdd = /\/\$.+/;

    jasmine.Ajax.requests.mostRecent().respondWith({
      "status": 200,
      "contentType": 'application/json',
      "responseText": '{"hello": 0}'
    });

    obj.publicProp = 1;
    obj.$privateProp = 1;

    setTimeout(function () { //wait for xhr
      jasmine.Ajax.requests.mostRecent().respondWith({
        "status": 200,
        "contentType": 'application/json-patch+json',
        "responseText": '[]'
      });

      expect(patchSpy.calls.count()).toBe(2);
      expect(patchSpy).toHaveBeenCalledWith('[{"op":"add","path":"/publicProp","value":1}]');
      obj.publicProp = 2;
      obj.$privateProp = 2;

      setTimeout(function () { //wait for xhr
        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 200,
          "contentType": 'application/json-patch+json',
          "responseText": '[]'
        });

        expect(patchSpy.calls.count()).toBe(3);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/publicProp","value":2}]');
        done();
      }, 20);
    }, 20);
  });

  it('should not send replace patch to an ignored deep object', function (done) {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
    var obj;
    this.puppet = new Puppet({remoteUrl: '/test', callback: function (myObj) {
      obj = myObj;
    }});
    this.puppet.ignoreAdd = /\/\$.+/;

    jasmine.Ajax.requests.mostRecent().respondWith({
      "status": 200,
      "contentType": 'application/json',
      "responseText": '{"hello": 0}'
    });

    obj.publicProp = ["a", "b", "c"];
    obj.$privateProp = ["a", "b", "c"];

    setTimeout(function () { //wait for xhr
      jasmine.Ajax.requests.mostRecent().respondWith({
        "status": 200,
        "contentType": 'application/json-patch+json',
        "responseText": '[]'
      });

      expect(patchSpy.calls.count()).toBe(2);
      expect(patchSpy).toHaveBeenCalledWith('[{"op":"add","path":"/publicProp","value":["a","b","c"]}]');
      obj.publicProp[2] = "cc";
      obj.$privateProp[2] = "cc";

      setTimeout(function () { //wait for xhr
        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 200,
          "contentType": 'application/json-patch+json',
          "responseText": '[]'
        });

        expect(patchSpy.calls.count()).toBe(3);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/publicProp/2","value":"cc"}]');
        done();
      }, 20);
    }, 20);
  });

  it('should not send any patch if all changes were ignored', function (done) {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
    var obj;
    this.puppet = new Puppet({remoteUrl: '/test', callback: function (myObj) {
      obj = myObj;
    }});
    this.puppet.ignoreAdd = /\/\$.+/;

    jasmine.Ajax.requests.mostRecent().respondWith({
      "status": 200,
      "contentType": 'application/json',
      "responseText": '{"hello": 0}'
    });

    expect(patchSpy.calls.count()).toBe(1);
    obj.$privateProp = 1;

    setTimeout(function () { //wait for xhr
      expect(patchSpy.calls.count()).toBe(1);
      done();
    }, 20);
  });

  it('should not send a patch when added property is replaced', function (done) {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
    var obj;
    this.puppet = new Puppet({remoteUrl: '/test', callback: function (myObj) {
      obj = myObj;
    }});
    this.puppet.ignoreAdd = /\/\$.+/;

    jasmine.Ajax.requests.mostRecent().respondWith({
      "status": 200,
      "contentType": 'application/json',
      "responseText": '{"hello": 0}'
    });

    expect(patchSpy.calls.count()).toBe(1);
    obj.$privateProp = 1;
    obj.$privateProp = 2;
    triggerMouseup();

    setTimeout(function () { //wait for xhr
      expect(patchSpy.calls.count()).toBe(1);
      done();
    }, 20);
  });

  it('should not send a patch for ignored property of an object inside an array', function (done) {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
      var obj;
      this.puppet = new Puppet({
          obj: {
              row: {},
              rows: [{ v: 1 }]
          },
          remoteUrl: '/test', callback: function (myObj) {
              obj = myObj;
          }
      });
      this.puppet.ignoreAdd = /\/\$.+/;

      jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 200,
          "contentType": 'application/json',
          "responseText": '{"row": {"foo":0}}'
      });

      expect(patchSpy.calls.count()).toBe(1);
      obj.row = { foo: 1, $privateProp: 2 };
      obj.rows[0].v = 10;
      obj.rows[0].$v = "ignore";
      obj.rows.push({ v: 2, $v: "ignore" });
      triggerMouseup();

      setTimeout(function () { //wait for xhr
          expect(patchSpy).toHaveBeenCalledWith(null);
          expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/row","value":{"foo":1}},{"op":"replace","path":"/rows/0/v","value":10},{"op":"add","path":"/rows/1","value":{"v":2}}]');
          expect(patchSpy.calls.count()).toBe(2);
          done();
      }, 20);
  });
});