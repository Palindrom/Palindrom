describe("History", function () {
  var wsSpy, palindrom;
  beforeEach(function () {
    //wsSpy = jasmine.createSpy();
    jasmine.Ajax.install();
    palindrom = new PalindromDOM({remoteUrl: window.location.href});
    // stub initial HTTP request
    jasmine.Ajax.stubRequest(window.location.href).andReturn( TestResponses.defaultInit.success );
  });

  afterEach(function () {
    palindrom.unobserve();
    jasmine.Ajax.uninstall();
  });

  /// init
  describe("should send JSON Patch HTTP request once history state get changed", function () {
    it("by `palindrom.morphURL(url)` method", function (done) {
      var currLoc = window.location.href;
      palindrom.morphUrl("/newUrl");

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toEqual("/newUrl");
      expect(window.location.pathname).toEqual("/newUrl");

      history.pushState(null, null, currLoc);
      done();
    });

  });

});
describe("Backward compatibility, History with PuppetDOM constructor", function () {
  var wsSpy, palindrom;
  beforeEach(function () {
    //wsSpy = jasmine.createSpy();
    jasmine.Ajax.install();
    palindrom = new PuppetDOM({remoteUrl: window.location.href});
    // stub initial HTTP request
    jasmine.Ajax.stubRequest(window.location.href).andReturn( TestResponses.defaultInit.success );
  });

  afterEach(function () {
    palindrom.unobserve();
    jasmine.Ajax.uninstall();
  });

  /// init
  describe("should send JSON Patch HTTP request once history state get changed", function () {
    it("by `palindrom.morphURL(url)` method", function (done) {
      var currLoc = window.location.href;
      palindrom.morphUrl("/newUrl");

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toEqual("/newUrl");
      expect(window.location.pathname).toEqual("/newUrl");

      history.pushState(null, null, currLoc);
      done();
    });

  });

});

describe("`palindrom-redirect-pushstate` event handling", function () {
  var wsSpy, palindrom;
  beforeEach(function () {
    //wsSpy = jasmine.createSpy();
    jasmine.Ajax.install();
    palindrom = new PalindromDOM({remoteUrl: '/', listenTo: document.body});
    // stub initial HTTP request
    jasmine.Ajax.stubRequest(window.location.href).andReturn( TestResponses.defaultInit.success );
  });

  afterEach(function () {
    palindrom.unobserve();
    jasmine.Ajax.uninstall();
  });

  /// init
  describe("should send JSON Patch HTTP request once history state get changed", function () {
    it("by dispatching `palindrom-redirect-pushstate` event", function (done) {
      var currLoc = window.location.href;

      history.pushState(null, null, '/newUrl');
      document.body.dispatchEvent(
                    new CustomEvent(
                        'palindrom-redirect-pushstate',
                        {
                            "detail": {"url" : '/newUrl'},
                            "bubbles": true
                        }
                    )
                );

      setTimeout(function () {
        var request = jasmine.Ajax.requests.mostRecent();
        console.log(request.url)
        expect(new URL(request.url).pathname).toEqual("/newUrl");
        expect(window.location.pathname).toEqual("/newUrl");
        
        //to restore the original working URL
        history.pushState(null, null, currLoc);
        done();
      }, 1);
    });

    
    /* backward compatibility */
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
        console.log(request.url)
        expect(new URL(request.url).pathname).toEqual("/newUrl-puppet");
        expect(window.location.pathname).toEqual("/newUrl-puppet");
        
        //to restore the original working URL
        history.pushState(null, null, currLoc);
        done();
        
      }, 1);
    });

  });

});