global.WebSocket = require("mock-socket").WebSocket;

const Palindrom = require("../../src/palindrom");
const assert = require("assert");
const moxios = require("moxios");
const sinon = require("sinon");
const expect = require("chai").expect;

describe("Palindrom", () => {
  describe("#IgnoreAdd", () => {
    beforeEach(() => {
      moxios.install();
    });
    afterEach(() => {
      moxios.uninstall();
    });
    it("should not send add patch to an ignored property", function(done) {
      const spy = sinon.spy();

      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"hello": "world"}'
      });

      let tempObject;
      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        onConnectionError: spy,
        onStateReset: function(myObj) {
          tempObject = myObj;
        }
      });

      palindrom.ignoreAdd = /\/\$.+/;

      /* before adding an ignored variable, we should have one ajax request */
      setTimeout(
        () => {
          assert.equal(1, moxios.requests.count());

          /* now we add an ignored variable */
          tempObject.$privateProp = 1;
        },
        5
      );

      /* after adding an ignored variable, we should still have one ajax request */
      setTimeout(
        () => {
          assert.equal(1, moxios.requests.count());

          /* now added a NOT ignored variable */
          tempObject.publicProb = 1;
        },
        10
      );

      /* after adding a NOT ignored variable, we should have TWO ajax requests */
      setTimeout(
        () => {
          assert.equal(2, moxios.requests.count());
          let request = moxios.requests.mostRecent();

          /* and the mostRecent of them should be the following patch */
          assert.equal(
            '[{"op":"add","path":"/publicProb","value":1}]',
            request.config.data
          );
          done();
        },
        15
      );
    });
    it("should not send replace patch to an ignored property", function(done) {
      const spy = sinon.spy();

      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"hello": "world"}'
      });

      let tempObject;
      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        onConnectionError: spy,
        onStateReset: function(myObj) {
          tempObject = myObj;
        }
      });

      palindrom.ignoreAdd = /\/\$.+/;

      /* before adding an ignored variable, we should have one ajax request */
      setTimeout(
        () => {
          assert.equal(1, moxios.requests.count());

          /* add an ignored variable */
          tempObject.$privateProp = 1;
        },
        5
      );

      /* let's change the ignored variable */
      setTimeout(
        () => {
          tempObject.$privateProp = 2;
        },
        10
      );

      /* after changing an ignored variable, we should still have one ajax request */
      setTimeout(
        () => {
          assert.equal(1, moxios.requests.count());
          done();
        },
        15
      );
    });

    it("should not send replace patch to an ignored deep object", function(done) {
      const spy = sinon.spy();

      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"hello": 0}'
      });

      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        onConnectionError: spy,
        onStateReset: function(tempObject) {
          tempObject.publicProp = [1, 2, 3];

          setTimeout(
            () => {
              /* initial request and `add` publicProb */
              assert.equal(2, moxios.requests.count());

              tempObject.$privateProp = [1, 2, 3];

              /* we should have two requests, initial and publicProb add */
              setTimeout(
                () => {
                  assert.equal(2, moxios.requests.count());
                },
                5
              );

              /* change ignored property deeply */
              setTimeout(
                () => {
                  tempObject.$privateProp[1] = 32;
                },
                10
              );

              /* we should STILL have two requests, initial and publicProb add only */
              setTimeout(
                () => {
                  assert.equal(2, moxios.requests.count());
                  done();
                },
                15
              );
            },
            5
          );
        }
      });

      palindrom.ignoreAdd = /\/\$.+/;
    });

    it("should not send any patch if all changes were ignored", function(done) {
      const spy = sinon.spy();

      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"hello": 0}'
      });

      let tempObject;
      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        onConnectionError: spy,
        onStateReset: function(myObj) {
          tempObject = myObj;

          tempObject.$privateProp = 1;
        }
      });

      palindrom.ignoreAdd = /\/\$.+/;

      /* we should have two requests, initial and publicProb add */
      setTimeout(
        () => {
          assert.equal(1, moxios.requests.count());

          tempObject.$privateProp = 22;
        },
        5
      );

      /* change ignored property deeply */
      setTimeout(
        () => {
          assert.equal(1, moxios.requests.count());
          done();
        },
        100
      );
    });

    it("should not send a patch when added property is replaced", function(done) {
      const spy = sinon.spy();

      moxios.stubRequest("http://localhost/testURL", {
        status: 200,
        headers: { contentType: "application/json" },
        responseText: '{"hello": 0}'
      });

      let tempObject;
      const palindrom = new Palindrom({
        remoteUrl: "http://localhost/testURL",
        onConnectionError: spy,
        onStateReset: function(myObj) {
          tempObject = myObj;
        }
      });

      palindrom.ignoreAdd = /\/\$.+/;

      /* we should have one request, initial connection */
      setTimeout(
        () => {
          assert.equal(1, moxios.requests.count());

          /* change ignored properties */
          tempObject.$privateProp = 1;
          tempObject.$privateProp = 2;
        },
        5
      );

      /*  we should still have one request, initial connection */
      setTimeout(
        () => {
          assert.equal(1, moxios.requests.count());
          done();
        },
        100
      );
    });
  });
});
