var full = {
  user: {
    fullName: "",
    firstName$: "",
    lastName$: "",
    resetName$: null
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
handlePageLoad(window.location.href);

var server = sinon.fakeServer.create();
server.autoRespond = true;
server.autoRespondAfter = 100;

Object.defineProperty(server.xhr.prototype, "response", {
  get: function () {
    return this.responseText; //'response' getter required to make SinonJS work with Polymer's HTMLImports.js
  }
});

server.xhr.useFilters = true;
server.xhr.addFilter(function (method, url) {
  //apply only to `/lab/polymer`, `/lab/polymer/`, `/lab/polymer/index.html`, `/lab/polymer/subpage.html
  if (url.match("(/lab/polymer/?$|index\.html$|subpage\.html$)")) {
    return false;
  }
  return true;
});

var lastUrl = window.location.href;
handlePageLoad(lastUrl);

server.respondWith(function (xhr) {
  var inPatches = xhr.requestBody ? JSON.parse(xhr.requestBody) : [];
  var outPatches = [];

  if (xhr.requestHeaders['Accept'] == 'application/json-patch+json') {
    if (xhr.url != lastUrl) {
      handlePageLoad(xhr.url);
      lastUrl = xhr.url;
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
        (patch.path == "/user/resetName$" && patch.value === null)
        ) {
        full.user.firstName$ = "Isaac";
        full.user.lastName$ = "Newton";
        full.user.fullName = full.user.firstName$ + ' ' + full.user.lastName$;
        outPatches.push({op: 'replace', path: '/user/firstName$', value: full.user.firstName$});
        outPatches.push({op: 'replace', path: '/user/lastName$', value: full.user.lastName$});
        outPatches.push({op: 'replace', path: '/user/fullName', value: full.user.fullName});
      }
    });

    xhr.respond(200, 'application/json-patch', JSON.stringify(outPatches));
  }
  else {
    xhr.respond(200, 'application/json', JSON.stringify(full));
  }
});