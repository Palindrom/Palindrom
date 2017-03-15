describe("History", function() {
  var wsSpy, palindrom;
  beforeEach(function() {
    //wsSpy = jasmine.createSpy();
    jasmine.Ajax.install();
    palindrom = new PalindromDOM(
      {remoteUrl: window.location.href}
    );
    // stub initial HTTP request
    jasmine.Ajax
      .stubRequest(window.location.href)
      .andReturn(TestResponses.defaultInit.success);
  });

  afterEach(function() {
    palindrom.unobserve();
    jasmine.Ajax.uninstall();
  });

  /// init
  describe(
    "should send JSON Patch HTTP request once history state get changed",
    function() {
      it("by `palindrom.morphURL(url)` method", function(done) {
        var currLoc = window.location.href;
        palindrom.morphUrl("/newUrl");
        var request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toEqual("/newUrl");
        expect(window.location.pathname).toEqual("/newUrl");

        history.pushState(null, null, currLoc);
        done();
      });
    }
  );
  // init
  describe(
    "should send JSON Patch HTTP request once history state get changed",
    function() {
      beforeEach(function() {
        //wsSpy = jasmine.createSpy();
        jasmine.Ajax.install();
        palindrom = new PalindromDOM({remoteUrl: window.location.href});
        // stub initial HTTP request
        jasmine.Ajax
          .stubRequest(window.location.href)
          .andReturn(TestResponses.defaultInit.success);
      });

      afterEach(function() {
        palindrom.unobserve();
        jasmine.Ajax.uninstall();
      });

      it("by dispatching `palindrom-redirect-pushstate` event", function(done) {
        var currLoc = window.location.href;
        history.pushState(null, null, "/newUrl-palindrom");

        document.body.dispatchEvent(
          new CustomEvent("palindrom-redirect-pushstate", {
            detail: { url: "/newUrl-palindrom" },
            bubbles: true
          })
        );

        setTimeout(
          function() {
            var request = jasmine.Ajax.requests.mostRecent();
            expect(new URL(request.url).pathname).toEqual("/newUrl-palindrom");
            expect(window.location.pathname).toEqual("/newUrl-palindrom");

            //to restore the original working URL
            history.pushState(null, null, currLoc);
            done();
          },
          10
        );
      });
    }
  );
});