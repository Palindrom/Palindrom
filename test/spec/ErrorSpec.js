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
    console.log('To be updated as https://github.com/PuppetJs/PuppetJs/issues/103');
    xit("should throw an error when status code 400 comes from the server (bootstrap)", function () {

      jasmine.Ajax.stubRequest(/.*\/test/).andReturn({
        "status": 400,
        "contentType": 'application/json',
        "responseText": 'Custom msg'
      });
      function establishPuppet400() {
          this.puppet = new Puppet({remoteUrl: '/test'});
      }

      expect(establishPuppet400).toThrowError(/PuppetJs JSON response error.*400[\s\S]*Custom msg/);
    });

    console.log('To be updated as https://github.com/PuppetJs/PuppetJs/issues/103');
    xit("should throw an error when status code 599 comes from the server (bootstrap)", function () {

      jasmine.Ajax.stubRequest(/.*\/test/).andReturn({
        "status": 599,
        "contentType": 'application/json',
        "responseText": 'Custom msg'
      });

      function establishPuppet599(){
        this.puppet = new Puppet({remoteUrl: '/test'});
      }

      expect(establishPuppet599).toThrowError(/PuppetJs JSON response error.*599[\s\S]*Custom msg/);
    });

    console.log('To be updated as https://github.com/PuppetJs/PuppetJs/issues/103');
    xit("should throw an error when status code 400 comes from the server (patch)", function (done) {
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

    console.log('To be updated as https://github.com/PuppetJs/PuppetJs/issues/103');
    xit("should throw an error when status code 599 comes from the server (patch)", function (done) {
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
