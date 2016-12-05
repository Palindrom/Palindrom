// load dom for node tests
if (typeof window === 'undefined') {
    var jsdom = require("jsdom").jsdom;
    var doc = jsdom(undefined, undefined);
    GLOBAL.window = doc.defaultView;
    GLOBAL.document = doc.defaultView.document;
}

function triggerMouseup(elem) {
  fireEvent((elem || document.body), 'mouseup')
}

//http://stackoverflow.com/questions/827716/emulate-clicking-a-link-with-javascript-that-works-with-ie
function fireEvent(obj, evt) {
  var fireOnThis = obj;
  if (document.createEvent) {
    var evObj = document.createEvent(evt.indexOf('mouse') > -1 ? 'MouseEvents' : 'KeyboardEvent');
    evObj.initEvent(evt, true, false);
    fireOnThis.dispatchEvent(evObj);

  } else if (document.createEventObject) {
    var evObj = document.createEventObject();
    fireOnThis.fireEvent('on' + evt, evObj);
  }
}

TestResponses = {
  defaultInit: {
    success: {
      "status": 200,
      "contentType": 'application/json',
      "responseText": '{"hello": "world"}',
      "responseHeaders": [{
        name: "X-Location",
        value: "/__default/testId001" //TODO: check how it works without Cookie/custom header
      }]
    }
  }
};


(function(global){
  var oryginalWebSocket = global.WebSocket;
  jasmine.WebSocket = {
    oryginalWebSocket: oryginalWebSocket,
    FakeWebSocket: FakeWebSocket,
    spy: null,
    install: function(){
      this.spy = spyOn(global, "WebSocket").and.callFake(function(url,protocols){
        return new FakeWebSocket(url, protocols);
      });
      this.spy.and.callThroughConstructor = function(){
        return this.callFake(function(url,protocols){
          return new oryginalWebSocket(url,protocols);
        });
      };
    },

    uninstall: function(){
      this.spy = null;
      global.WebSocket = oryginalWebSocket;
    },
    stubConnection: function(urlPattern){
      var stub = new ConnectionStub(urlPattern);
      this.addStub(stub);
      return stub;
    }

  };

  function ConnectionStub(urlPattern){
    this.urlPattern = urlPattern;
  }
  /**
   * [andDo description]
   * @param  {options} options what to do
   * @param {[options.callback]} define yourself what to do callback(stub, ws)
   * @return {[type]}         [description]
   */
  ConnectionStub.prototype.andDo = function(callback){
    this.action = callback;
  };

  function FakeWebSocket(url, protocols){
    console.log("FakeWebSocket(",url,",", protocols,") created");
    //return  new WebSocket(url, protocols);
    // WebSocket api
    this.url            = url;
    // this.binaryType     = "blob";
    this.bufferedAmount = 0;
    this.extensions     = "";
    // this.onclose        = null;
    // this.onerror        = null;
    // this.onmessage      = null;
    // this.onopen         = null;
    this.protocol       = protocols || "";
    this.readyState     = 0;

    // FakeWebSocket api
    this.sendSpy = jasmine.getEnv().spyOn(this, "send").and.callThrough();
    return this;
  }
  // FakeWebSocket.prototype = Object.create( WebSocket.prototype );
  FakeWebSocket.prototype.open = function(){
    this.readyState = 1;
    this.onopen && this.onopen();
  };
  FakeWebSocket.prototype.send = function(msg){
  };


})(window);
