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
    it("should show a message when status code 400 comes from the server (bootstrap)", function () {
      this.puppet = new Puppet({remoteUrl: '/test'});
      var exceptionRaised = false;

      try {
        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 400,
          "contentType": 'application/json',
          "responseText": 'Custom msg'
        });
      }
      catch (e) {
        exceptionRaised = true;
      }

      var DIV = document.getElementById('puppetjs-error');

      expect(exceptionRaised).toBe(true);
      expect(DIV).toBeTruthy();
      expect(DIV.innerHTML).toContain('PuppetJs JSON response error');
      expect(DIV.innerHTML).toContain('400');
      expect(DIV.innerHTML).toContain('Custom msg');

      DIV.parentNode.removeChild(DIV);
    });

    it("should show a message when status code 599 comes from the server (bootstrap)", function () {
      this.puppet = new Puppet({remoteUrl: '/test'});
      var exceptionRaised = false;

      try {
        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 599,
          "contentType": 'application/json',
          "responseText": 'Custom msg'
        });
      }
      catch (e) {
        exceptionRaised = true;
      }

      var DIV = document.getElementById('puppetjs-error');

      expect(exceptionRaised).toBe(true);
      expect(DIV).toBeTruthy();
      expect(DIV.innerHTML).toContain('PuppetJs JSON response error');
      expect(DIV.innerHTML).toContain('599');
      expect(DIV.innerHTML).toContain('Custom msg');

      DIV.parentNode.removeChild(DIV);
    });

    it("should show a message when status code 400 comes from the server (patch)", function (done) {
      var exceptionRaised = false;
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
        try {
          jasmine.Ajax.requests.mostRecent().respondWith({
            "status": 400,
            "contentType": 'application/json',
            "responseText": 'Custom msg'
          });
        }
        catch (e) {
          exceptionRaised = true;
        }

        var DIV = document.getElementById('puppetjs-error');

        expect(exceptionRaised).toBe(true);
        expect(DIV).toBeTruthy();
        expect(DIV.innerHTML).toContain('PuppetJs JSON response error');
        expect(DIV.innerHTML).toContain('400');
        expect(DIV.innerHTML).toContain('Custom msg');

        DIV.parentNode.removeChild(DIV);
        done();
      }, 1);
    });

    it("should show a message when status code 599 comes from the server (patch)", function (done) {
      var exceptionRaised = false;
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
        try {
          jasmine.Ajax.requests.mostRecent().respondWith({
            "status": 599,
            "contentType": 'application/json',
            "responseText": 'Custom msg'
          });
        }
        catch (e) {
          exceptionRaised = true;
        }

        var DIV = document.getElementById('puppetjs-error');

        expect(exceptionRaised).toBe(true);
        expect(DIV).toBeTruthy();
        expect(DIV.innerHTML).toContain('PuppetJs JSON response error');
        expect(DIV.innerHTML).toContain('599');
        expect(DIV.innerHTML).toContain('Custom msg');

        DIV.parentNode.removeChild(DIV);
        done();
      }, 1);
    });

    it("should NOT show a message when debug == false", function () {
      this.puppet = new Puppet({remoteUrl: '/test'});
      this.puppet.debug = false;
      var exceptionRaised = false;

      try {
        jasmine.Ajax.requests.mostRecent().respondWith({
          "status": 599,
          "contentType": 'application/json',
          "responseText": 'Custom msg'
        });
      }
      catch (e) {
        exceptionRaised = true;
      }

      var DIV = document.getElementById('puppetjs-error');

      expect(exceptionRaised).toBe(true);
      expect(DIV).toBeFalsy();
    });
  });
});