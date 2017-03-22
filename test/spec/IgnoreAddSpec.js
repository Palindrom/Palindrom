describe("IgnoreAdd", function () {
  
  beforeEach(function () {
    jasmine.Ajax.install();
  });

  afterEach(function () {
    this.palindrom.unobserve();
    jasmine.Ajax.uninstall();
  });

  it('should not send add patch to an ignored property', function (done) {
    var obj;
    this.palindrom = new Palindrom({remoteUrl: '/test', callback: function (myObj) {
      obj = myObj;
    }});
    this.palindrom.ignoreAdd = /\/\$.+/;

    jasmine.Ajax.requests.mostRecent().respondWith({
      "status": 200,
      "contentType": 'application/json',
      "responseText": '{"hello": 0}'
    });

    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();

    obj.hello = 1; // change 1
    expect(patchSpy.calls.count()).toBe(1);
    expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":1}]');

    obj.publicProp = 1; // change 2
    expect(patchSpy.calls.count()).toBe(2);
    expect(patchSpy).toHaveBeenCalledWith('[{"op":"add","path":"/publicProp","value":1}]');    
    obj.$privateProp = 1;  // ignored change

    expect(patchSpy.calls.count()).toBe(2); // still two!
    done();

  });

  it('should not send replace patch to an ignored property', function (done) {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
    var obj;
    this.palindrom = new Palindrom({remoteUrl: '/test', callback: function (myObj) {
      obj = myObj;
    }});
    this.palindrom.ignoreAdd = /\/\$.+/;

    jasmine.Ajax.requests.mostRecent().respondWith({
      "status": 200,
      "contentType": 'application/json',
      "responseText": '{"hello": 0}'
    });

    obj.publicProp = 1;
    obj.$privateProp = 1;


    jasmine.Ajax.stubRequest('/test').andReturn({
        "status": 200,
        "contentType": 'application/json-patch+json',
        "responseText": '[]'
    });

    setTimeout(function () { //wait for xhr

      expect(patchSpy.calls.count()).toBe(2);
      expect(patchSpy).toHaveBeenCalledWith('[{"op":"add","path":"/publicProp","value":1}]');
      obj.publicProp = 2;
      obj.$privateProp = 2;

      jasmine.Ajax.stubRequest('/test').andReturn({
          "status": 200,
          "contentType": 'application/json-patch+json',
          "responseText": '[]'
      });

      setTimeout(function () { //wait for xhr
        expect(patchSpy.calls.count()).toBe(3);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/publicProp","value":2}]');
        done();
      }, 20);
    }, 20);
  });

  it('should not send replace patch to an ignored deep object', function (done) {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
    var obj;
    this.palindrom = new Palindrom({remoteUrl: '/test', callback: function (myObj) {
      obj = myObj;
    }});
    this.palindrom.ignoreAdd = /\/\$.+/;

    jasmine.Ajax.requests.mostRecent().respondWith({
      "status": 200,
      "contentType": 'application/json',
      "responseText": '{"hello": 0}'
    });

    obj.publicProp = ["a", "b", "c"];
    obj.$privateProp = ["a", "b", "c"];

    jasmine.Ajax.stubRequest('/test').andReturn({
        "status": 200,
        "contentType": 'application/json-patch+json',
        "responseText": '[]'
    });
    
    setTimeout(function () { //wait for xhr
      expect(patchSpy.calls.count()).toBe(2);
      expect(patchSpy).toHaveBeenCalledWith('[{"op":"add","path":"/publicProp","value":["a","b","c"]}]');
      obj.publicProp[2] = "cc";
      obj.$privateProp[2] = "cc";

      jasmine.Ajax.stubRequest('/test').andReturn({
          "status": 200,
          "contentType": 'application/json-patch+json',
          "responseText": '[]'
      });
      
      setTimeout(function () { //wait for xhr
        expect(patchSpy.calls.count()).toBe(3);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/publicProp/2","value":"cc"}]');
        done();
      }, 20);
    }, 20);
  });

  it('should not send any patch if all changes were ignored', function (done) {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
    var obj;
    this.palindrom = new Palindrom({remoteUrl: '/test', callback: function (myObj) {
      obj = myObj;
    }});
    this.palindrom.ignoreAdd = /\/\$.+/;

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
    this.palindrom = new Palindrom({remoteUrl: '/test', callback: function (myObj) {
      obj = myObj;
    }});
    this.palindrom.ignoreAdd = /\/\$.+/;

    jasmine.Ajax.requests.mostRecent().respondWith({
      "status": 200,
      "contentType": 'application/json',
      "responseText": '{"hello": 0}'
    });

    expect(patchSpy.calls.count()).toBe(1);
    obj.$privateProp = 1;
    obj.$privateProp = 2;
    
    setTimeout(function () { //wait for xhr
      expect(patchSpy.calls.count()).toBe(1);
      done();
    }, 20);
  });
});
