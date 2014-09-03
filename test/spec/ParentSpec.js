describe("Parent", function () {
  beforeEach(function () {
    jasmine.Ajax.install();
  });

  afterEach(function () {
    this.puppet.unobserve();
    jasmine.Ajax.uninstall();
  });

  describe("attach $parent to each child object", function () {
    it("should return parent when $parent keyword is used (shallow)", function (done) {
      var initSpy = jasmine.createSpy();

      this.puppet = new Puppet(window.location.href, initSpy);

      initSpy.and.callFake(function() {
        expect(this.obj.child.$parent.hello).toEqual("world");
        done();
      });

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world", "child": {}}'
      });
    });

    it("should return parent when $parent keyword is used (deep)", function (done) {
      var initSpy = jasmine.createSpy();

      this.puppet = new Puppet(window.location.href, initSpy);

      initSpy.and.callFake(function() {
        expect(this.obj.children[0].$parent.$parent.children[1].second).toEqual("2nd");
        done();
      });

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world", "children": [{"first": "1st"}, {"second": "2nd"}]}'
      });
    });

    it("should return parent on a locally added property", function (done) {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();

      this.puppet = new Puppet(window.location.href, function () {
      });

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world", "child": {}}'
      });

      var that = this;
      setTimeout(function () {
        that.puppet.obj.children = [
          {first: "1st"},
          {second: "2nd"}
        ];
        triggerMouseup();

        setTimeout(function () {
          expect(that.puppet.obj.children[0].$parent.$parent.children[1].second).toEqual("2nd");
          expect(patchSpy.calls.count()).toBe(2); //only children should generate a patch ($parent getter should not)
          expect(patchSpy).toHaveBeenCalledWith('[{"op":"add","path":"/children","value":[{"first":"1st"},{"second":"2nd"}]}]');
          done();
        }, 10);
      }, 0);
    });

    it("should return parent on a remotely added property", function (done) {
      var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();

      this.puppet = new Puppet(window.location.href, function () {
      });

      jasmine.Ajax.requests.mostRecent().response({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world", "child": {}}'
      });

      var that = this;
      setTimeout(function () {
        that.puppet.obj.children = [
          {first: "1st"},
          {second: "2nd"}
        ];
        triggerMouseup();

        setTimeout(function () {
          jasmine.Ajax.requests.mostRecent().response({
            "status": 200,
            "contentType": 'application/json-patch+json',
            "responseText": '[{"op":"add","path":"/children/0/remotes","value":[{"first":"1st"},{"second":"2nd"}]}]'
          });

          setTimeout(function () {
            expect(that.puppet.obj.children[0].remotes.$parent.remotes[1].second).toEqual("2nd");
            expect(patchSpy.calls.count()).toBe(2);
            done();
          }, 10);
        }, 10);
      }, 0);
    });
  });
});