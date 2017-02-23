jasmine.Ajax.install();


var model = window.model = {
    "_ver#c$": 0,
    "_ver#s": 0,
    text: "Polymer 1.0 demo",
    message: "There were no clicks so far.",
    clickCount$: 0,
    booleanSwitch$: false,
    checked$: false,

    people:[
        {
            first: "Tomek",
            last: "Wytrębowicz",
            full: "Tomek Wytrębowicz"
        },{
            first: "Marcin",
            last: "Warpechowski",
            full: "Marcin Warpechowski"
        }
    ]
};

var stub = jasmine.Ajax.stubRequest(/(\/lab\/polymer_fancy_binding\/?$|index\.html$|import\.html$|test\.json$)/);
stub.andReturn({
    "responseText": "Error"
});

var _old = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.send = function (data) {
    if (/.*import\.html$/gi.test(this.url)) {
        stub.responseText = "<p>Message inside palindrom-import: <span>{{model.message}}</span></p>"
    } else if (data == null && this.requestHeaders["Accept"] == "application/json") {
        stub.responseText = JSON.stringify(model);
    } else if (this.requestHeaders["Accept"] == "application/json-patch+json") {
        var inPatches = data ? JSON.parse(data) : [];
        var outPatches = [];
        jsonpatch.apply(model, inPatches);

        for (var i = 0; i < inPatches.length; i++) {
            var p = inPatches[i];

            if (p.path === "/click$") {
                outPatches.push({ op: "replace", path: "/message", value: "The click #" + p.value + "!" });
            }
            if (p.path.match(/\/first|\/last/)) {
                model.people[0].full = model.people[0].first + ' ' + model.people[0].last;
                model.people[1].full = model.people[1].first + ' ' + model.people[1].last;
                outPatches.push({ op: "replace", path: p.path.replace(/first|last/,"full"), value: model.people[p.path.match(/\d/)[0]].full });
            }
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
