describe("History", function () {
  var wsSpy, puppet;
  beforeEach(function () {
    //wsSpy = jasmine.createSpy();
    jasmine.Ajax.install();
    puppet = new PuppetDOM();
    // stub initial HTTP request
    jasmine.Ajax.stubRequest(window.location.href).andReturn( TestResponses.defaultInit.success );
  });

  afterEach(function () {
    puppet.unobserve();
    jasmine.Ajax.uninstall();
  });

  /// init
  describe("should send JSON Patch HTTP request once history state get changed", function () {
    it("by `puppet.morphURL(url)` method", function (done) {
      var currLoc = window.location.href;
      puppet.morphUrl("/newUrl");

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toEqual("/newUrl");
      expect(window.location.pathname).toEqual("/newUrl");

      history.pushState(null, null, currLoc);
      done();
    });

  });
  /// init
  describe("should send JSON Patch HTTP request once history state get changed", function () {
    it("by dispatching `puppet-redirect-pushstate` event", function (done) {
      var currLoc = window.location.href;

      history.pushState(null, null, '/newUrl-puppet');
      
      document.body.dispatchEvent(
                    new CustomEvent(
                        'puppet-redirect-pushstate',
                        {
                            "detail": {"url" : '/newUrl-puppet'},
                            "bubbles": true
                        }
                    )
                );

      setTimeout(function () {
        var request = jasmine.Ajax.requests.mostRecent();
        expect(new URL(request.url).pathname).toEqual("/newUrl-puppet");
        expect(window.location.pathname).toEqual("/newUrl-puppet");
        
        //to restore the original working URL
        history.pushState(null, null, currLoc);
        done();
        
      }, 1);
    });

  });

});

