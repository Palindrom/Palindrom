jasmine.Ajax.install();

function getCurrentPage() {
    var url = window.location.href;

    if (url.indexOf("subpage.html") > -1) {
        return "subpage.html";
    } else {
        return "index.html";
    }
}

function getPages(current) {
    var pages = ["index.html", "subpage.html"];
    var result = [];

    for (var i = 0; i < pages.length; i++) {
        result.push({
            name: pages[i],
            selected: pages[i] == current
        });
    }

    return result;
}

var model = window.model = {
    "_ver#c$": 0,
    "_ver#s": 0,
    currentPage: getCurrentPage(),
    pages: getPages(getCurrentPage()),
    text: "Polymer 1.0 demo",
    message: "There were no clicks so far.",
    click$: 0
};

var stub = jasmine.Ajax.stubRequest(/(\/lab\/polymer_1\/?$|index\.html$|subpage\.html$)/);
stub.andReturn({
    "responseText": "Error"
});

var _old = XMLHttpRequest.prototype.send;
var puppet = null;

XMLHttpRequest.prototype.send = function (data) {
    if (data == null && this.requestHeaders["Accept"] == "application/json") {
        stub.responseText = JSON.stringify(model);
    } else if (this.requestHeaders["Accept"] == "application/json-patch+json") {
        var inPatches = data ? JSON.parse(data) : [];
        var outPatches = [];
        var page = getCurrentPage();

        for (var i = 0; i < inPatches.length; i++) {
            var p = inPatches[i];

            if (p.path == "/click$") {
                outPatches.push({ op: "replace", path: "/message", value: "The click #" + p.value + "!" });
            }
        }

        if (puppet.obj.currentPage != page) {
            outPatches.push({ op: "replace", path: "/currentPage", value: page });
            outPatches.push({ op: "replace", path: "/pages", value: getPages(page) });
        }

        if (outPatches) {
            model["_ver#s"]++;
            outPatches.unshift({ op: 'test', path: '/_ver#c$', value: model["_ver#c$"] + 1 }, { op: 'replace', path: '/_ver#s', value: model["_ver#s"] });
            model["_ver#c$"]++;
        }

        stub.responseText = JSON.stringify(outPatches);
    } else {
        stub.responseText = "Error";
    }

    console.info("Mock Server ", this.url, "\n request", data, "\n response", stub.status, stub.responseText);
    return _old.apply(this, [].slice.call(arguments));
};

window.addEventListener("WebComponentsReady", function () {
    puppet = document.querySelector("puppet-client");
});