global.WebSocket = require("mock-socket").WebSocket;

const MockSocketServer = require("mock-socket").Server;
const Palindrom = require("../../src/palindrom");
const assert = require("assert");
const moxios = require("moxios");
const sinon = require("sinon");

describe("Sockets", () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });

  describe("Palindrom constructor", () => {
    describe("if `useWebSocket` flag is provided", () => {
      it("should try to open WebSocket connection ", function(done) {
        const server = new MockSocketServer("ws://localhost/testURL");

        moxios.stubRequest("http://localhost/testURL", {
          status: 200,
          headers: { location: "http://localhost/testURL" },
          responseText: '{"hello": "world"}'
        });

        var spy = sinon.spy();
        var palindrom = new Palindrom({
          remoteUrl: "http://localhost/testURL",
          useWebSocket: true
        });
        /* socket should be undefined before XHR delay */
        assert(typeof palindrom.network._ws === "undefined");

        setTimeout(
          () => {
            /* socket should NOT be undefined after XHR delay */
            assert(typeof palindrom.network._ws !== "undefined");
            server.stop(done);
          },
          5
        );
      });

      it("should calculate WebSocket URL correctly", function(done) {
        const server = new MockSocketServer("ws://localhost/testURL");

        moxios.stubRequest("http://localhost/testURL", {
          status: 200,
          headers: { location: "http://localhost/testURL" },
          responseText: '{"hello": "world"}'
        });

        var spy = sinon.spy();
        var palindrom = new Palindrom({
          remoteUrl: "http://localhost/testURL",
          useWebSocket: true
        });

        setTimeout(
          () => {
            assert(palindrom.network._ws.url === "ws://localhost/testURL");

            /* stop server async then call done */
            server.stop(done);
          },
          5
        );
      });

      it("should resolve to correct WebSocket URL from location header, with root slash /", function(done) {
        const server = new MockSocketServer(
          "ws://localhost/default/this_is_a_nice_url"
        );

        moxios.stubRequest("http://localhost/testURL", {
          status: 200,
          headers: { location: "/default/this_is_a_nice_url" },
          responseText: '{"hello": "world"}'
        });

        var spy = sinon.spy();
        var palindrom = new Palindrom({
          remoteUrl: "http://localhost/testURL",
          useWebSocket: true
        });

        setTimeout(
          () => {
            assert(
              palindrom.network._ws.url ===
                "ws://localhost/default/this_is_a_nice_url"
            );
            /* stop server async then call done */
            server.stop(done);
          },
          5
        );
      });

      it("should resolve to correct WebSocket URL from location header, relatively", function(done) {
        const server = new MockSocketServer(
          "ws://localhost/default/this_is_a_nice_url"
        );

        moxios.stubRequest("http://localhost/testURL", {
          status: 200,
          headers: { location: "default/this_is_a_nice_url" },
          responseText: '{"hello": "world"}'
        });

        var spy = sinon.spy();
        var palindrom = new Palindrom({
          remoteUrl: "http://localhost/testURL",
          useWebSocket: true
        });

        setTimeout(
          () => {
            assert(
              palindrom.network._ws.url ===
                "ws://localhost/default/this_is_a_nice_url"
            );
            /* stop server async then call done */
            server.stop(done);
          },
          5
        );
      });

      it("should resolve to correct WebSocket URL from location header, with root slash and extra pathname", function(done) {
        const server = new MockSocketServer(
          "ws://localhost/default/this_is_a_nice_url"
        );

        moxios.stubRequest("http://localhost/testURL/koko", {
          status: 200,
          headers: { location: "/default/this_is_a_nice_url" },
          responseText: '{"hello": "world"}'
        });

        var spy = sinon.spy();
        var palindrom = new Palindrom({
          remoteUrl: "http://localhost/testURL/koko",
          useWebSocket: true
        });

        setTimeout(
          () => {
            assert(
              palindrom.network._ws.url ===
                "ws://localhost/default/this_is_a_nice_url"
            );
            /* stop server async then call done */
            server.stop(done);
          },
          5
        );
      });

      it("should resolve to correct WebSocket URL from location header, without root slash and extra pathname", function(done) {
        const server = new MockSocketServer(
          "ws://localhost/testURL/default/this_is_a_nice_url"
        );

        moxios.stubRequest("http://localhost/testURL/koko", {
          status: 200,
          headers: { location: "default/this_is_a_nice_url" },
          responseText: '{"hello": "world"}'
        });

        var spy = sinon.spy();
        var palindrom = new Palindrom({
          remoteUrl: "http://localhost/testURL/koko",
          useWebSocket: true
        });

        setTimeout(
          () => {
            assert(
              palindrom.network._ws.url ===
                "ws://localhost/testURL/default/this_is_a_nice_url"
            );
            /* stop server async then call done */
            server.stop(done);
          },
          5
        );
      });
      it("should use wss for https remote URL", function(done) {
        const server = new MockSocketServer(
          "wss://localhost/testURL/default/this_is_a_nice_url"
        );

        moxios.stubRequest("https://localhost/testURL/koko", {
          status: 200,
          headers: { location: "default/this_is_a_nice_url" },
          responseText: '{"hello": "world"}'
        });

        var spy = sinon.spy();
        var palindrom = new Palindrom({
          remoteUrl: "https://localhost/testURL/koko",
          useWebSocket: true
        });

        setTimeout(
          () => {
            assert(
              palindrom.network._ws.url ===
                "wss://localhost/testURL/default/this_is_a_nice_url"
            );
            /* stop server async then call done */
            server.stop(done);
          },
          50
        );
      });

      it("should use same host, port, username, and password as provided in remoteUrl", function(done) {
        const server = new MockSocketServer(
          "ws://localhost/test/this_is_a_nice_url"
        );

        const remoteUrl = "http://localhost/testURL/koko";

        moxios.stubRequest(remoteUrl, {
          status: 200,
          headers: { location: "/test/this_is_a_nice_url" },
          responseText: '{"hello": "world"}'
        });

        var palindrom = new Palindrom({
          remoteUrl,
          useWebSocket: true
        });

        setTimeout(
          () => {
            assert(
              palindrom.network._ws.url ===
                "ws://localhost/test/this_is_a_nice_url"
            );
            /* stop server async then call done */
            server.stop(done);
          },
          5
        );
      });
      describe("Before connection is established", () => {
        it("shouldn't start a socket connection", function(done) {
          const server = new MockSocketServer(
            "ws://localhost/test/this_is_a_nice_url"
          );

          const remoteUrl = "http://localhost/testURL/koko";
          let everConnected = false;

          moxios.stubRequest(remoteUrl, {
            status: 200,
            headers: { location: "/test/this_is_a_nice_url" },
            responseText: '{"hello": "world"}'
          });

          server.on("connection", server => {
            everConnected = true;
          });

          var palindrom = new Palindrom({
            remoteUrl,
            useWebSocket: true,
            callback: () => {
              /* shouldn't connect before XHR */
              assert(everConnected === false);
            }
          });

          /* should connect after XHR */
          setTimeout(
            () => {
              assert(everConnected === true);
              /* stop server async then call done */
              server.stop(done);
            },
            50
          );
        });

        it("shouldn't send any change patches", function(done) {
          const server = new MockSocketServer(
            "ws://localhost/test/this_is_a_cool_url"
          );

          const remoteUrl = "http://localhost/testURL/koko";

          moxios.stubRequest(remoteUrl, {
            status: 200,
            headers: { location: "/test/this_is_a_cool_url" },
            responseText: '{"hello": "world"}'
          });

          let everConnected = false;
          const messages = [];

          server.on("connection", server => {
            everConnected = true;
          });

          server.on("message", patches => {
            let patchesParsed = JSON.parse(patches);
            messages.push(...patchesParsed);
          });

          var palindrom = new Palindrom({
            remoteUrl,
            useWebSocket: true
          });

          palindrom.obj.firstName = "Omar";

          setTimeout(
            () => {
              assert(messages.length === 0);
              server.stop(done);
            },
            5
          );
        });
      });
      describe("After connection is established", () => {
        it("should send new changes over WebSocket", function(done) {
          const server = new MockSocketServer(
            "ws://localhost/test/this_is_a_nicer_url"
          );

          const remoteUrl = "http://localhost/testURL/koko";

          moxios.stubRequest(remoteUrl, {
            status: 200,
            headers: { location: "/test/this_is_a_nicer_url" },
            responseText: '{"hello": "world"}'
          });

          let everConnected = false;
          const messages = [];

          server.on("connection", server => {
            everConnected = true;
          });

          server.on("message", patches => {
            let patchesParsed = JSON.parse(patches);
            messages.push(...patchesParsed);
          });

          var palindrom = new Palindrom({
            remoteUrl,
            useWebSocket: true
          });

          setTimeout(
            () => {
              palindrom.obj.firstName = "Omar";
              setTimeout(
                () => {
                  assert(messages.length === 1);
                  assert.deepEqual(messages[0], {
                    op: "add",
                    path: "/firstName",
                    value: "Omar"
                  });
                  server.stop(done);
                },
                5
              );
            },
            50
          );
        });

        it("should send patches over HTTP before ws.readyState is OPENED, and over WebSocket after ws.readyState is OPENED", function(done) {
          const server = new MockSocketServer(
            "ws://localhost/test/this_is_a_fast_url"
          );

          const remoteUrl = "http://localhost/testURL/koko";

          moxios.stubRequest(remoteUrl, {
            status: 200,
            headers: { location: "/test/this_is_a_fast_url" },
            responseText: '{"hello": "world"}'
          });

          let everConnected = false;
          const messages = [];

          server.on("connection", server => {
            everConnected = true;
          });

          server.on("message", patches => {
            let patchesParsed = JSON.parse(patches);
            messages.push(...patchesParsed);
          });

          var palindrom = new Palindrom({
            remoteUrl,
            useWebSocket: true,
            callback: function(obj) {
              moxios.stubRequest("http://localhost/test/this_is_a_fast_url", {
                status: 200,
                responseText: "[]"
              });

              /* here, socket connection isn't established yet, let's issue a change */
              obj.name = "Mark";

              setTimeout(
                () => {
                  assert(
                    '[{"op":"add","path":"/name","value":"Mark"}]' ===
                      moxios.requests.mostRecent().config.data
                  );

                  /* make sure there is no socket messages */
                  assert(messages.length === 0);
                },
                5
              );

              /* now socket is connected, let's issue a change */
              setTimeout(
                () => {
                  palindrom.obj.firstName = "Omar";

                  assert(messages.length === 1);
                  assert(
                    JSON.stringify(messages[0]) ===
                      '{"op":"add","path":"/firstName","value":"Omar"}'
                  );
                },
                10
              );

              /* now socket is connected, let's issue another change */
              setTimeout(
                () => {
                  palindrom.obj.firstName = "Hanan";

                  assert(messages.length === 2);
                  assert(
                    JSON.stringify(messages[1]) ===
                      '{"op":"replace","path":"/firstName","value":"Hanan"}'
                  );
                  server.stop(done);
                },
                15
              );
            }
          });
        });
      });
    });
  });
});
