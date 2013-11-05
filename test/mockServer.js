var full = {
  username: "Marcin",
  subpage: {
    genderList: ['Male', 'Female'],
    people: [
      {id: 1, name: {first: 'Joe', last: 'Fabiano'}, gender: 'Male', age: 21, languages: {english: 'Yes', spanish: 'Yes', french: 'No'}, salary: 2000},
      {id: 2, name: {first: 'Fred', last: 'Wecler'}, gender: 'Male', age: 25, languages: {english: 'Yes', spanish: 'No', french: 'No'}, salary: 2500},
      {id: 3, name: {first: 'Steve', last: 'Wilson'}, gender: 'Male', age: 32, languages: {english: 'Yes', spanish: 'No', french: 'No'}, salary: 1700},
      {id: 4, name: {first: 'Maria', last: 'Fernandez'}, gender: 'Female', age: 27, languages: {english: 'No', spanish: 'Yes', french: 'Yes'}, salary: 3000},
      {id: 5, name: {first: 'Pierre', last: 'Barbault'}, gender: 'Male', age: 46, languages: {english: 'Yes', spanish: 'No', french: 'Yes'}, salary: 1450},
      {id: 6, name: {first: 'Nancy', last: 'Moore'}, gender: 'Female', age: 34, languages: {english: 'Yes', spanish: 'No', french: 'No'}, salary: 2300},
      {id: 7, name: {first: 'Barbara', last: 'MacDonald'}, gender: 'Female', age: 19, languages: {english: 'Yes', spanish: 'No', french: 'No'}, salary: 1900},
      {id: 8, name: {first: 'Wilma', last: 'Williams'}, gender: 'Female', age: 33, languages: {english: 'Yes', spanish: 'Yes', french: 'Yes'}, salary: 2400},
      {id: 9, name: {first: 'Sasha', last: 'Silver'}, gender: 'Male', age: 27, languages: {english: 'Yes', spanish: 'No', french: 'Yes'}, salary: 2110},
      {id: 10, name: {first: 'Don', last: 'Pérignon'}, gender: 'Male', age: 42, languages: {english: 'No', spanish: 'No', french: 'Yes'}, salary: 2090},
      {id: 11, name: {first: 'Aaron', last: 'Kinley'}, gender: 'Female', age: 33, languages: {english: 'Yes', spanish: 'Yes', french: 'Yes'}, salary: 2799}
    ],
    settings: {

    },
    html: "./partials/page_1.html"
  }
};

////

var current = 0;
var names = ["Fred", "Wilma", "Pebbles", "Dino", "Barney", "Betty", "Bamm-Bamm"];

function changeUsername() {
  var patches = [
    {op: "replace", path: "/username", value: names[current] }
  ];

  for (var i = 0, ilen = full.subpage.people.length; i < ilen; i++) {
    if (full.subpage.people[i].name.first) {
      patches.push({op: "replace", path: "/subpage/people/" + i + "/name/first", value: names[current] });
    }
  }

  current++;
  if (current === names.length) {
    current = 0;
  }

  return patches;
}


////


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
  if (url.indexOf('partial') > -1 || url.indexOf('components') > -1) {  //'components' required to make SinonJS work with Polymer's HTMLImports.js
    return (true);
  }
  return (false);
});

var lastUrl = window.location.href;

if (lastUrl.indexOf('page_1') > -1) {
  full.subpage.html = './partials/page_1.html';
}
else if (lastUrl.indexOf('page_2') > -1) {
  full.subpage.html = './partials/page_2.html';
}

server.respondWith(function (xhr) {
  var patches = changeUsername();
  if (xhr.requestHeaders['Accept'] == 'application/json-patch+json') {
    if (xhr.url !== lastUrl) {
      lastUrl = xhr.url;
      if (lastUrl.indexOf('page_1') > -1) {
        patches.push({op: 'replace', path: '/subpage/html', value: './partials/page_1.html'});
      }
      else if (lastUrl.indexOf('page_2') > -1) {
        patches.push({op: 'replace', path: '/subpage/html', value: './partials/page_2.html'});
      }
    }

    xhr.respond(200, 'application/json-patch', JSON.stringify(patches));
  }
  else {
    xhr.respond(200, 'application/json', JSON.stringify(full));
  }
});

/// simulate server push (here: query server every 2 s
/*setInterval(function () {
 var a = document.createElement('A');
 a.href = window.location.href;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 }, 2000);*/