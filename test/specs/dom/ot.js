/** only run DOM tests in browsers */
if (typeof window !== 'undefined') {
  if (!global.WebSocket) {
    global.WebSocket = require('mock-socket').WebSocket;
  }
  const MockSocketServer = require("mock-socket").Server;

  const PalindromDOM = require('../../../src/palindrom-dom');
  const assert = require('assert');
  const moxios = require('moxios');

  describe('PalindromDOM OT', function() {
    let currLoc;

    beforeEach(function() {
      currLoc = window.location.href;
      moxios.install();
    });

    afterEach(function() {
      history.pushState(null, null, currLoc);
      moxios.uninstall();
    });

  it("should patch a mix of XHR and WS incoming patches in the correct order", function(done) {
    const baseUrl = window.location;
    const url = new URL("/testURL", baseUrl).toString();
    const server = new MockSocketServer(
      url.replace("http", "ws")
    );
    moxios.stubRequest(url, {
      status: 200,
      headers: {
        contentType: "application/json"
      },
      responseText: `{"_ver#c$":0,"_ver#s":0,"WebsiteProvider_0":{"Html":"/websiteprovider/surfaces/DefaultSurface.html","Sections":{"Main":{"WebsiteProvider_1":{},"WebsiteProvider_0":{"Html":"/WebsiteProvider/views/ContentWrapperPage.html","Content":{"People_0":{"Html":"/People/viewmodels/MasterPage.html","ShowMenu":true,"CurrentPage":{"People_0":{"Html":"/People/viewmodels/OrganizationsPage.html","Organizations":[],"AddUrl":"/people/organizations/add","RedirectUrl$":"","Confirm":{"Html":"/People/viewmodels/ConfirmDialogPage.html","Message":"","Ok$":"","Reject$":""},"EntriesPerPage$":0,"Pagination":{"Html":"/People/viewmodels/PaginationPage.html","ChangePage$":0,"NextPage$":0,"PreviousPage$":0,"LastPage$":0,"FirstPage$":0,"EntriesPerPage":5,"PageEntries":[{"Amount":5,"Text":"Show 5 items per page"},{"Amount":15,"Text":"Show 15 items per page"},{"Amount":30,"Text":"Show 30 items per page"}],"Pages":[],"TotalEntries":0,"TotalPages":0,"CurrentPage":1,"CurrentOffset":0,"DisableFirst":true,"DisableLast":false}}}}}}},"TopBar":{"WebsiteProvider_1":{},"WebsiteProvider_0":{},"SignIn_0":{"Uri":"","Html":"/SignIn/viewmodels/SignInPage.html","IsSignedIn":true,"Message":"","FullName":"admin admin","SignInClick$":0,"Submit":0,"SessionUri":"/__default/7F3049B0CEE1FA3530000000","UserImage":{"SignIn_0":{"Html":"/SignIn/viewmodels/UserImagePage.html"}}}}}}}`
    });
    let tempObject;
    const palindrom = new PalindromDOM({
      remoteUrl: url,
      onStateReset: function(obj) {
        tempObject = obj;
      },
      localVersionPath: '/_ver#c$',
      remoteVersionPath: '/_ver#s',
      ot: true,
      useWebSocket: true
    });
    setTimeout(
      () => {
        setTimeout(() => {
          server.send(
            `[{"op":"replace","path":"/_ver#s","value":2},{"op":"test","path":"/_ver#c$","value":0},{"op":"remove","path":"/WebsiteProvider_0/Sections/Main/WebsiteProvider_0/Content/People_0/CurrentPage/People_0/CustomContactTypes/0"},{"op":"add","path":"/WebsiteProvider_0/Sections/Main/WebsiteProvider_0/Content/People_0/CurrentPage/People_0/CustomContactTypes/0","value":{"Name$":"XXX"}},{"op":"remove","path":"/WebsiteProvider_0/Sections/Main/WebsiteProvider_0/Content/People_0/CurrentPage/People_0/Persons/0/CustomContactRelations/0"},{"op":"add","path":"/WebsiteProvider_0/Sections/Main/WebsiteProvider_0/Content/People_0/CurrentPage/People_0/Persons/0/CustomContactRelations/0","value":{"Name":null,"ThisUrl":"/people/persons/R"}},{"op":"remove","path":"/WebsiteProvider_0/Sections/Main/WebsiteProvider_0/Content/People_0/CurrentPage/People_0/Persons/1/CustomContactRelations/0"},{"op":"add","path":"/WebsiteProvider_0/Sections/Main/WebsiteProvider_0/Content/People_0/CurrentPage/People_0/Persons/1/CustomContactRelations/0","value":{"Name":null,"ThisUrl":"/people/persons/Q2"}}]`
          );
        }, 100);

        setTimeout(() => {
          const url2 = new URL("/testURL2", baseUrl).toString();
          moxios.stubRequest(url2, {
            status: 200,
            headers: {
              contentType: "application/json-patch+json"
            },
            responseText: `[{"op":"replace","path":"/_ver#s","value":1},{"op":"test","path":"/_ver#c$","value":0},{"op":"replace","path":"","value":{"_ver#c$":0,"_ver#s":1,"WebsiteProvider_0":{"Html":"/websiteprovider/surfaces/DefaultSurface.html","Sections":{"Main":{"WebsiteProvider_1":{},"WebsiteProvider_0":{"Html":"/WebsiteProvider/views/ContentWrapperPage.html","Content":{"People_0":{"Html":"/People/viewmodels/MasterPage.html","ShowMenu":true,"CurrentPage":{"People_0":{"Html":"/People/viewmodels/PersonsPage.html","NonSelectedFields":[],"SelectedFields":[{"Name$":"XXX","IsClicked$":0}],"CustomContactTypes":[{"Name$":"XXX"}],"Persons":[{"Key":"R","Name":null,"Extra":{"People_0":{}},"ParentNameList":[],"EmailAddressName":"admin@starcounter.com","PhoneNumberName":"","AddressName":"","Delete$":0,"Edit$":0,"CustomContactRelations":[{"Name":null,"ThisUrl":"/people/persons/R"}],"ViewUrl":"/people/persons/R"},{"Key":"Q","Name":"admin admin","Extra":{"People_0":{}},"ParentNameList":[],"EmailAddressName":"","PhoneNumberName":"","AddressName":"","Delete$":0,"Edit$":0,"CustomContactRelations":[{"Name":null,"ThisUrl":"/people/persons/Q0"}],"ViewUrl":"/people/persons/Q1"}],"InputAdd$":"","AddUrl":"/people/persons/add","RedirectUrl$":"","Confirm":{"Html":"/People/viewmodels/ConfirmDialogPage.html","Message":"","Ok$":"","Reject$":""},"EntriesPerPage$":0,"Pagination":{"Html":"/People/viewmodels/PaginationPage.html","ChangePage$":0,"NextPage$":0,"PreviousPage$":0,"LastPage$":0,"FirstPage$":0,"EntriesPerPage":5,"PageEntries":[{"Amount":5,"Text":"Show 5 items per page"},{"Amount":15,"Text":"Show 15 items per page"},{"Amount":30,"Text":"Show 30 items per page"}],"Pages":[{"PageNumber":1,"Active":true}],"TotalEntries":2,"TotalPages":1,"CurrentPage":1,"CurrentOffset":0,"DisableFirst":true,"DisableLast":true}}}}}}},"TopBar":{"WebsiteProvider_1":{},"WebsiteProvider_0":{},"SignIn_0":{"Uri":"","Html":"/SignIn/viewmodels/SignInPage.html","IsSignedIn":true,"Message":"","FullName":"admin admin","SignInClick$":0,"Submit":0,"SessionUri":"/__default/7F3049B0CEE1FA3530000000","UserImage":{"SignIn_0":{"Html":"/SignIn/viewmodels/UserImagePage.html"}}}}}}}}]`,
          });
          palindrom.morphUrl(url2);
        }, 300);

        setTimeout(() => {
          server.send(
            `[{"op":"replace","path":"/_ver#s","value":3},{"op":"test","path":"/_ver#c$","value":0},{"op":"remove","path":"/WebsiteProvider_0/Sections/Main/WebsiteProvider_0/Content/People_0/CurrentPage/People_0/CustomContactTypes/0"},{"op":"add","path":"/WebsiteProvider_0/Sections/Main/WebsiteProvider_0/Content/People_0/CurrentPage/People_0/CustomContactTypes/0","value":{"Name$":"XXX"}},{"op":"remove","path":"/WebsiteProvider_0/Sections/Main/WebsiteProvider_0/Content/People_0/CurrentPage/People_0/Persons/0/CustomContactRelations/0"},{"op":"add","path":"/WebsiteProvider_0/Sections/Main/WebsiteProvider_0/Content/People_0/CurrentPage/People_0/Persons/0/CustomContactRelations/0","value":{"Name":null,"ThisUrl":"/people/persons/R"}},{"op":"remove","path":"/WebsiteProvider_0/Sections/Main/WebsiteProvider_0/Content/People_0/CurrentPage/People_0/Persons/1/CustomContactRelations/0"},{"op":"add","path":"/WebsiteProvider_0/Sections/Main/WebsiteProvider_0/Content/People_0/CurrentPage/People_0/Persons/1/CustomContactRelations/0","value":{"Name":null,"ThisUrl":"/people/persons/Q3"}}]`
          );
        }, 500);

        setTimeout(
          () => {
            assert.equal(tempObject.WebsiteProvider_0.Sections.Main.WebsiteProvider_0.Content.People_0.CurrentPage.People_0.Persons[1].CustomContactRelations[0].ThisUrl, "/people/persons/Q3");
            palindrom.unobserve();
            palindrom.unlisten();
            server.stop(done);
          },
          700
        );
      }, 50);
  });
});

}
