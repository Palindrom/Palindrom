describe("Error", function () {
  beforeEach(function () {
    jasmine.Ajax.install();
  });

  afterEach(function () {
    this.puppet.unobserve();
    jasmine.Ajax.uninstall();
  });

  /// init
  describe("on error response", function () {
    it("should throw an error when status code 400 comes from the server (bootstrap)", function () {
      this.puppet = new Puppet({remoteUrl: '/test'});
      
      function respondWith400(){
        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 400,
          "contentType": 'application/json',
          "responseText": 'Custom msg'
        });
      }

      expect(respondWith400).toThrowError(/PuppetJs JSON response error.*400[\s\S]*Custom msg/);
    });

    it("should throw an error when status code 599 comes from the server (bootstrap)", function () {
      this.puppet = new Puppet({remoteUrl: '/test'});
      
      function respondWith599(){
        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 599,
          "contentType": 'application/json',
          "responseText": 'Custom msg'
        });
      }

      expect(respondWith599).toThrowError(/PuppetJs JSON response error.*599[\s\S]*Custom msg/);
    });

    it("should throw an error when status code 400 comes from the server (patch)", function (done) {
      var obj;

      this.puppet = new Puppet({remoteUrl: '/test', callback: function (myObj) {
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
        function respondWith400() {
          jasmine.Ajax.requests.mostRecent().respondWith({
            "status": 400,
            "contentType": 'application/json',
            "responseText": 'Custom msg'
          });
        }

        expect(respondWith400).toThrowError(/PuppetJs JSON response error.*400[\s\S]*Custom msg/);
        done();
      }, 1);
    });

    it("should throw an error when status code 599 comes from the server (patch)", function (done) {
      var obj;

      this.puppet = new Puppet({remoteUrl: '/test', callback: function (myObj) {
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
        function respondWith599() {
          jasmine.Ajax.requests.mostRecent().respondWith({
            "status": 599,
            "contentType": 'application/json',
            "responseText": 'Custom msg'
          });
        }
        expect(respondWith599).toThrowError(/PuppetJs JSON response error.*599[\s\S]*Custom msg/);

        done();
      }, 1);
    });

  });
});