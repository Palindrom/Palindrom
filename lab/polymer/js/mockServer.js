window.addEventListener('polymer-ready', function () { //see https://github.com/pivotal/jasmine-ajax/issues/79
  jasmine.Ajax.install();

  var full = window.full = {
    user: {
      fullName: "",
      firstName$: "",
      lastName$: "",
      resetNameClicked$: null
    }
  };

  function handlePageLoad(url) {
    if (url.indexOf('subpage.html') > -1) {
      full.user.firstName$ = 'Nikola';
      full.user.lastName$ = 'Tesla';
      full.user.fullName = 'Nikola Tesla';
    }
    else { //index.html
      full.user.firstName$ = 'Albert';
      full.user.lastName$ = 'Einstein';
      full.user.fullName = 'Albert Einstein';
    }
  }

  var lastUrl = window.location.href;
  handlePageLoad(lastUrl);

  var stub = jasmine.Ajax.stubRequest(/(\/lab\/polymer\/?$|index\.html$|subpage\.html$)/);
  stub.andReturn({
    "responseText": "Error"
  });

  var _old = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (data) {
    if (data == null && this.requestHeaders['Accept'] == 'application/json') {
      stub.responseText = JSON.stringify(full);
    }
    else if (this.requestHeaders['Accept'] == 'application/json-patch+json') {
      var inPatches = data ? JSON.parse(data) : [];
      var outPatches = [];

      if (this.url != lastUrl) {
        handlePageLoad(this.url);
        stub.responseHeaders = [{name: "Location", value: "/PuppetJs/lab/polymer/index.html"},{name: "X-Referer", value: "/PuppetJs/lab/polymer/index.html"}];
        lastUrl = this.url;
        outPatches.push({op: 'replace', path: '/user/firstName$', value: full.user.firstName$});
        outPatches.push({op: 'replace', path: '/user/lastName$', value: full.user.lastName$});
        outPatches.push({op: 'replace', path: '/user/fullName', value: full.user.fullName});
      }

      jsonpatch.apply(full, inPatches);

      inPatches.forEach(function (patch) {
        if (patch.op == "replace" &&
          (patch.path == "/user/firstName$" || patch.path == "/user/lastName$")
          ) {
          full.user.fullName = full.user.firstName$ + ' ' + full.user.lastName$;
          outPatches.push({op: 'replace', path: '/user/fullName', value: full.user.fullName});
        }
        if (patch.op == "replace" &&
          (patch.path == "/user/resetNameClicked$" && patch.value === true)
          ) {
          full.user.firstName$ = "Isaac";
          full.user.lastName$ = "Newton";
          full.user.fullName = full.user.firstName$ + ' ' + full.user.lastName$;
          outPatches.push({op: 'replace', path: '/user/firstName$', value: full.user.firstName$});
          outPatches.push({op: 'replace', path: '/user/lastName$', value: full.user.lastName$});
          outPatches.push({op: 'replace', path: '/user/fullName', value: full.user.fullName});
          outPatches.push({op: 'replace', path: '/user/resetNameClicked$', value: false});
        }
      });

      stub.responseText = JSON.stringify(outPatches);
    }
    else {
      stub.responseText = "Error";
    }

    console.info("Mock Server ",this.url, "\n request", data, "\n response", stub.status, stub.responseText);
    return _old.apply(this, [].slice.call(arguments));
  };
});