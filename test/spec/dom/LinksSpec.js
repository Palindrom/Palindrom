describe("PuppetDOM - Links -", function () {
 
  function createLinkTest(href, parent) {
    parent = parent || document.body;
    var a = document.createElement('A');
    a.innerHTML = 'Link';
    a.href = href;
    parent.appendChild(a);
    parent.addEventListener('click', clickHandler);
    fireEvent(a, 'click');
    parent.removeEventListener('click', clickHandler);
    parent.removeChild(a);
  }

  function createLinkTestNested(href, parent) {
    parent = parent || document.body;
    var a = document.createElement('A');
    a.innerHTML = '<strong>Link</strong>';
    a.href = href;
    parent.appendChild(a);
    parent.addEventListener('click', clickHandler);
    fireEvent(a.firstChild, 'click');

    parent.removeEventListener('click', clickHandler);
    parent.removeChild(a);
  }

  function fireEvent(fireOnThis, evt) {
    if (window.MouseEvent) {
      var event = new MouseEvent(evt, {
        'view': window,
        'bubbles': true,
        'cancelable': true
      });
      fireOnThis.dispatchEvent(event);
    }
  }

  function createLinkTestNestedShadowDOM(href, parent) {
    parent = parent || document.body;
    var div = document.createElement('DIV');
    parent.appendChild(div);

    var a = document.createElement('A');
    a.innerHTML = '<strong>Link</strong>';
    a.href = href;
    div.createShadowRoot().appendChild(a);
    parent.addEventListener('click', clickHandler);
    fireEvent(a.firstChild, 'click');

    parent.removeEventListener('click', clickHandler);
    parent.removeChild(div);
  }

  function createLinkTestNestedShadowDOMContent() {
    document.querySelector("my-menu-button strong").click();
  }

  function clickHandler(event) {
    event.preventDefault();
  }

  describe('when attached to default node - `document.body`', function() {
    var puppet;

    beforeEach(function (done) {
      jasmine.Ajax.install();
      puppet = new PuppetDOM({remoteUrl: '/'});
      jasmine.Ajax.requests.mostRecent().respondWith({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });
      setTimeout(done, 1);
    });

    afterEach(function () {
      puppet.unobserve();
      puppet.unlisten();
      jasmine.Ajax.uninstall();
    });
    it("its `.element` should point to `document.body`", function(){
      expect(puppet.element).toEqual(document.body);
    });
    describe("should intercept links to use History API", function () {
      it("relative path", function () {
        var historySpy = spyOn(window.history, 'pushState');

        var href = 'test_a';
        createLinkTest(href);

        expect(historySpy.calls.count()).toBe(1);
      });

      it("relative path (nested)", function () {
        var historySpy = spyOn(window.history, 'pushState');
        var href = 'test_b';
        createLinkTestNested(href);
        expect(historySpy.calls.count()).toBe(1);
      });

      it("relative path (nested, Shadow DOM)", function (done) {
        setTimeout(function () { //wait for platform.js ready
          var historySpy = spyOn(window.history, 'pushState');
          var href = 'test_c';
          createLinkTestNestedShadowDOM(href);
          setTimeout(function(){
            expect(historySpy.calls.count()).toBe(1);
            done();
          },100);
        }, 100);
      });

      it("relative path (nested, Shadow DOM content)", function (done) {
        setTimeout(function () { //wait for platform.js ready
          var historySpy = spyOn(window.history, 'pushState');
          createLinkTestNestedShadowDOMContent();
          expect(historySpy.calls.count()).toBe(1);
          done();
        }, 100);
      });

      it("absolute path", function () {
        var historySpy = spyOn(window.history, 'pushState');

        var href = '/test';
        createLinkTest(href);

        expect(historySpy.calls.count()).toBe(1);
      });

      it("full URL in the same host, same port", function () {
        var historySpy = spyOn(window.history, 'pushState');

        var href = window.location.protocol + '//' + window.location.host + '/test'; //http://localhost:8888/test
        createLinkTest(href);

        expect(historySpy.calls.count()).toBe(1);
      });
    });

    describe("should not intercept external links", function () {
      it("full URL in the same host, different port", function () {
        var historySpy = spyOn(window.history, 'pushState');

        var port = window.location.port === '80' || window.location.port === '' ? '8080' : '80';
        var href = window.location.protocol + '//' + window.location.hostname + ':' + port + '/test'; //http://localhost:88881/test
        createLinkTest(href);

        expect(historySpy.calls.count()).toBe(0);
      });

      it("full URL in the same host, different schema", function () {
        var historySpy = spyOn(window.history, 'pushState');

        var protocol = window.location.protocol === 'http:' ? 'https:' : 'http:';
        var href = protocol + '//' + window.location.host + '/test'; //https://localhost:8888/test
        createLinkTest(href);

        expect(historySpy.calls.count()).toBe(0);
      });
    });

    describe("should be accessible via API", function () {
      it("should change history state programatically", function () {
        var historySpy = spyOn(window.history, 'pushState');

        puppet.morphUrl("/page2");

        expect(historySpy.calls.count()).toBe(1);
      });
    });

    it("should stop listening to DOM changes after `.unlisten()` was called", function(){
      var historySpy = spyOn(window.history, 'pushState');

      puppet.unlisten();
      createLinkTest('#will_not_get_caught_by_puppet');

      expect(historySpy.calls.count()).toBe(0);
    });

    it("should start listening to DOM changes after `.listen()` was called", function(){
      var historySpy = spyOn(window.history, 'pushState');

      puppet.unlisten();
      puppet.listen();
      createLinkTest('#will_not_get_caught_by_puppet');

      expect(historySpy.calls.count()).toBe(1);
    });

  });


  describe('when attached to specific node', function() {
    var puppet, puppetB, puppetNode, nodeB;

    beforeEach(function (done) {
      jasmine.Ajax.install();
      puppetNode = document.createElement("DIV");
      document.body.appendChild(puppetNode);
      nodeB = document.createElement("DIV");
      document.body.appendChild(nodeB);
      puppet = new PuppetDOM({remoteUrl: '/', listenTo: puppetNode});
      jasmine.Ajax.requests.mostRecent().respondWith({
        "status": 200,
        "contentType": 'application/json',
        "responseText": '{"hello": "world"}'
      });
      // puppetB = new PuppetDOM({remoteUrl: '/', listenTo: nodeB});
      // jasmine.Ajax.requests.mostRecent().respondWith({
      //   "status": 200,
      //   "contentType": 'application/json',
      //   "responseText": '{"hello": "world"}'
      // });
      setTimeout(done, 1);
    });

    afterEach(function () {
      puppet.unobserve();
      puppet.unlisten();
      jasmine.Ajax.uninstall();
    });
    describe("should intercept child links to use History API", function () {
      it("relative path", function () {
        var historySpy = spyOn(window.history, 'pushState');

        var href = 'test_a';
        createLinkTest(href, puppetNode);

        expect(historySpy.calls.count()).toBe(1);
      });

      it("relative path (nested)", function () {
        var historySpy = spyOn(window.history, 'pushState');
        var href = 'test_b';
        createLinkTestNested(href, puppetNode);
        expect(historySpy.calls.count()).toBe(1);
      });

      it("relative path (nested, Shadow DOM)", function (done) {
        setTimeout(function () { //wait for platform.js ready
          var historySpy = spyOn(window.history, 'pushState');
          var href = 'test_c';
          createLinkTestNestedShadowDOM(href, puppetNode);
          setTimeout(function(){
            expect(historySpy.calls.count()).toBe(1);
            done();
          },100);
        }, 100);
      });

      it("absolute path", function () {
        var historySpy = spyOn(window.history, 'pushState');

        var href = '/test';
        createLinkTest(href, puppetNode);

        expect(historySpy.calls.count()).toBe(1);
      });

      it("full URL in the same host, same port", function () {
        var historySpy = spyOn(window.history, 'pushState');

        var href = window.location.protocol + '//' + window.location.host + '/test'; //http://localhost:8888/test
        createLinkTest(href, puppetNode);

        expect(historySpy.calls.count()).toBe(1);
      });
    });

    describe("should not intercept links from outside of `.element` tree to use History API", function () {
      it("relative path", function () {
        var historySpy = spyOn(window.history, 'pushState');

        var href = 'test_a';
        debugger
        createLinkTest(href, nodeB);

        expect(historySpy.calls.count()).toBe(0);
      });

      it("relative path (nested)", function () {
        var historySpy = spyOn(window.history, 'pushState');
        var href = 'test_b';
        createLinkTestNested(href, nodeB);
        expect(historySpy.calls.count()).toBe(0);
      });

      it("relative path (nested, Shadow DOM)", function (done) {
        setTimeout(function () { //wait for platform.js ready
          var historySpy = spyOn(window.history, 'pushState');
          var href = 'test_c';
          createLinkTestNestedShadowDOM(href, nodeB);
          setTimeout(function(){
            expect(historySpy.calls.count()).toBe(0);
            done();
          },100);
        }, 100);
      });

      it("absolute path", function () {
        var historySpy = spyOn(window.history, 'pushState');

        var href = '/test';
        createLinkTest(href, nodeB);

        expect(historySpy.calls.count()).toBe(0);
      });

      it("full URL in the same host, same port", function () {
        var historySpy = spyOn(window.history, 'pushState');

        var href = window.location.protocol + '//' + window.location.host + '/test'; //http://localhost:8888/test
        createLinkTest(href, nodeB);

        expect(historySpy.calls.count()).toBe(0);
      });
    });

    describe("should not intercept external links", function () {
      it("full URL in the same host, different port", function () {
        var historySpy = spyOn(window.history, 'pushState');

        var port = window.location.port === '80' || window.location.port === '' ? '8080' : '80';
        var href = window.location.protocol + '//' + window.location.hostname + ':' + port + '/test'; //http://localhost:88881/test
        createLinkTest(href, puppetNode);

        expect(historySpy.calls.count()).toBe(0);
      });

      it("full URL in the same host, different schema", function () {
        var historySpy = spyOn(window.history, 'pushState');

        var protocol = window.location.protocol === 'http:' ? 'https:' : 'http:';
        var href = protocol + '//' + window.location.host + '/test'; //https://localhost:8888/test
        createLinkTest(href, puppetNode);

        expect(historySpy.calls.count()).toBe(0);
      });
    });

    describe("should be accessible via API", function () {
      it("should change history state programatically", function () {
        var historySpy = spyOn(window.history, 'pushState');

        puppet.morphUrl("/page2");

        expect(historySpy.calls.count()).toBe(1);
      });
    });

    it("should stop listening to DOM changes after `.unlisten()` was called", function(){
      var historySpy = spyOn(window.history, 'pushState');

      puppet.unlisten();
      createLinkTest('#will_not_get_caught_by_puppet', puppetNode);

      expect(historySpy.calls.count()).toBe(0);
    });

    it("should start listening to DOM changes after `.listen()` was called", function(){
      var historySpy = spyOn(window.history, 'pushState');

      puppet.unlisten();
      puppet.listen();
      createLinkTest('#will_not_get_caught_by_puppet', puppetNode);

      expect(historySpy.calls.count()).toBe(1);
    });

  });
});