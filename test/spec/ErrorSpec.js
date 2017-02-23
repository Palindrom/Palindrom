describe("Error", function () {
  beforeEach(function () {
    jasmine.Ajax.install();
  });

  afterEach(function () {
    this.palindrom.unobserve();
    jasmine.Ajax.uninstall();
  });

  /// init
  describe("on error response", function () {
    console.log('To be updated as https://github.com/Palindrom/Palindrom/issues/103');
    xit("should throw an error when status code 400 comes from the server (bootstrap)", function () {

      jasmine.Ajax.stubRequest(/.*\/test/).andReturn({
        "status": 400,
        "contentType": 'application/json',
        "responseText": 'Custom msg'
      });
      function establishPalindrom400() {
          this.palindrom = new Palindrom({remoteUrl: '/test'});
      }

      expect(establishPalindrom400).toThrowError(/Palindrom JSON response error.*400[\s\S]*Custom msg/);
    });

    console.log('To be updated as https://github.com/Palindrom/Palindrom/issues/103');
    xit("should throw an error when status code 599 comes from the server (bootstrap)", function () {

      jasmine.Ajax.stubRequest(/.*\/test/).andReturn({
        "status": 599,
        "contentType": 'application/json',
        "responseText": 'Custom msg'
      });

      function establishPalindrom599(){
        this.palindrom = new Palindrom({remoteUrl: '/test'});
      }

      expect(establishPalindrom599).toThrowError(/Palindrom JSON response error.*599[\s\S]*Custom msg/);
    });

    console.log('To be updated as https://github.com/Palindrom/Palindrom/issues/103');
    xit("should throw an error when status code 400 comes from the server (patch)", function (done) {
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
        function respondWith400() {
          jasmine.Ajax.requests.mostRecent().respondWith({
            "status": 400,
            "contentType": 'application/json',
            "responseText": 'Custom msg'
          });
        }

        expect(respondWith400).toThrowError(/Palindrom JSON response error.*400[\s\S]*Custom msg/);
        done();
      }, 1);
    });

    console.log('To be updated as https://github.com/Palindrom/Palindrom/issues/103');
    xit("should throw an error when status code 599 comes from the server (patch)", function (done) {
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
        function respondWith599() {
          jasmine.Ajax.requests.mostRecent().respondWith({
            "status": 599,
            "contentType": 'application/json',
            "responseText": 'Custom msg'
          });
        }
        expect(respondWith599).toThrowError(/Palindrom JSON response error.*599[\s\S]*Custom msg/);

        done();
      }, 1);
    });

  });
});
