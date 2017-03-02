# Palindrom
<p align="center">
  <img alt="Palindrom Logo" src="https://cloud.githubusercontent.com/assets/17054134/23406359/e2690c08-fdbe-11e6-8880-c23dc771f899.png">
</p> 

---

Library for two-way data binding between local JSON view models and remote, using JSON-Patch, w/ optional OT, via HTTP or WebSocket.

Implements [Server communication](https://github.com/Starcounter-Jack/PuppetJs/wiki/Server-communication).

For additional binding with DOM, browser history, etc. use [PalindromDOM](#PalindromDOM).

### Installation

You can install it using [bower](http://bower.io/) `bower install Palindrom` or just download from [github](https://github.com/Palindrom/Palindrom).

Then add source to your head:

```html

<!-- include Palindrom with dependencies -->
<script src="bower_components/fast-json-patch/src/json-patch-duplex.js"></script>
<script src="bower_components/Palindrom/src/palindrom.js"></script>
```
See [Dependencies section](https://github.com/Palindrom/Palindrom#dependencies) for more details.

### Usage

After DOM is ready, initialize with the constructor:

```javascript
/**
 * Defines a connection to a remote PATCH server, gives an object that is persistent between browser and server
 */
var palindrom = new Palindrom();
// ..
// use palindrom.obj
palindrom.obj.someProperty = "new value";
```

### Demo

[Example of Palindrom + PalindromDOM with Polymer's Template Binding and Web Components](http://Palindrom.github.io/Palindrom/lab/polymer/index.html)

### Options (`Palindrom()` constructor parameters)
All the parameters are optional.
```javascript
var palindrom = new Palindrom({attribute: value});
```

Attribute              | Type          | Default                | Description
---                    | ---           | ---                    | ---
`remoteUrl` **Required**            | *String*      | `window.location.href` | PATCH server URL
`callback`             | *Function*    |                        | Called after initial state object is received from the server (NOT necessarily after WS connection was established)
`obj`                  | *Object*      | `{}`                   | object where the parsed JSON data will be inserted
`useWebSocket`         | *Boolean*     | `false`                | Set to `true` to enable WebSocket support
`ignoreAdd`            | *RegExp*      |                        | Regular Expression for `add` operations to be ignored (tested against JSON Pointer in JSON Patch)
`debug`                | *Boolean*     | `true`                 | Toggle debugging mode
`onLocalChange`        | *Function*    |                        | Helper callback triggered each time a change is observed locally
`onRemoteChange`       | *Function*    |                        | Deprecated, please use patch-applied event. Helper callback triggered each time a remote patch is applied.
`onPatchReceived`      | *Function*    |                        | Helper callback triggered each time a JSON-patch is received, accepts three parameters: (*String* `data`, *String* `url`, *String*, `method`)
`onPatchSent`          | *Function*    |                        | Helper callback triggered each time a JSON-patch is sent, accepts two parameters: (*String* `data`, *String* `url`, *String*, `method`)
`onSocketStateChanged` | *Function*    |                        | Helper callback triggered when socket state changes, accepts next parameters: (*int* `state`, *String* `url`, *String* `data`, *int* `code`, *String* `reason`)
`onConnectionError`    | *Function*    |                        | Helper callback triggered when socket connection closed, socket connection failed to establish, http requiest failed. Accepts next parameters: (*Object* `data`, *String* `url`, *String*, `method`). The data object contains the following properties: *String* `statusText` (HTTP response status code reason phrase or WebSocket error title), *String* `statusCode` (HTTP response status code or WS error code), *Number* `readyState`, *String* `url`, *String* `reason` (HTTP error response body or WebSocket disconnection reason message)
`localVersionPath`     | *JSONPointer* | `disabled`             | local version path, set it to enable Versioned JSON Patch communication
`remoteVersionPath`    | *JSONPointer* | `disabled`             | remote version path, set it (and `localVersionPath`) to enable Versioned JSON Patch communication
`ot`                   | *Boolean*     | `false`                | `true` to enable OT (requires `localVersionPath` and `remoteVersionPath`)
`purity`               | *Boolean*     | `false`                | `true` to enable purist mode of OT
`pingIntervalS`        | *Number*      | `0`                    | Palindrom will generate heartbeats every `pingIntervalS` seconds if no activity is detected. `0` - disable heartbeat
`retransmissionThreshold`| *Number*    | `3`                    | After server reports this number of messages missing, we start retransmission
`onReconnectionCountdown`| *Function*  |                        | Triggered when palindrom detected connection problem and reconnection is scheduled. Accepts number of milliseconds to scheduled reconnection. Called every second until countdown reaches 0 (inclusive)
`onReconnectionEnd`    | *Function*    |                        | Triggered when palindrom successfully reconnected
`jsonpatch`            | *Object*      | `window.jsonpatch`       | The provider object for jsonpatch apply, validate, observe and unobserve. By default assumes Starcounter-Jack/JSON-Patch library available in global `jsonpatch` variable.

most of them are accessible also in runtime:

#### Properties

```javascript
palindrom.property
```
Attribute             | Type       | Default                | Description
---                   | ---        | ---                    | ---
`remoteUrl`           | *String*   | `window.location.href` | See above
`obj`                 | *Object*   | `{}`                   | See above
`useWebSocket`        | *Boolean*  | `false`                | See above
`ignoreAdd`           | *RegExp*   |                        | See above
`debug`               | *Boolean*  | `true`                 | See above
`onRemoteChange`      | *Function* |                        | See above
`onPatchReceived`     | *Function* |                        | See above
`onSocketStateChanged`| *Function* |                        | See above
`onPatchSent`         | *Function* |                        | See above
`onConnectionError`   | *Function* |                        | See above


### Binding object once is ready (`callback`)
To bind object where you need once it will be fetched from remote you can use define `callback` in constructor:
```javascript
var palindrom = new Palindrom({callback: function (obj) {
  document.getElementById('test').model = obj;
}});
```

### Sending client changes to remote

Palindrom detects changes to the observed object in real time. So after
```javascript
palindrom.obj.some="change";
```
The JSON Patch request will be send to the remote.

### Two-way data binding frameworks

Palindrom works superbly with with frameworks that allow for two-way data binding, such as Polymer and Angular. These frameworks have the ability to bind an `<input>` element to a JavaScript data model in a way that the object updates after each keystroke. In consequence, Palindrom sends a patch the server after each keystroke.

If you want to opt-out from such behavior, you need to force your framework to update the data model after the element is unfocused (`blur` event). Depending on the framework:

- In Polymer 0.5 it is only possible with a Custom Element that extends the native `<input>`, similarly but not exactly how [`core-input`](https://github.com/Polymer/core-input/blob/master/core-input.html) is dome
- In Polymer 0.9+, use built-in `<input value="{{bindValue::blur}}">`
- In Angular 1.3+, use built-in `<input type="text" ng-model="name" ng-model-options="{updateOn: 'blur'}" />`

### Generating patches based on local changes

Palindrom automatically observes local changes. This is implemented by dirty checking, triggered in event listeners for typical browser events (`mousedown`, `mouseup`, etc). It is done by the JSON-Patch library ([source](https://github.com/Starcounter-Jack/JSON-Patch/blob/master/src/json-patch-duplex.ts#L352-L354)).

To generate patches for changes made in code, you need to either simulate a browser event (recommended):

```js
var clickEvent = document.createEvent('MouseEvents');
clickEvent.initEvent("mouseup", true, true);
window.dispatchEvent(clickEvent);
```

Or use a low level API exposed by the JSON-Patch library, provided that you have a reference the Palindrom instance:

```js
jsonpatch.generate(palindrom.observer);
```

Future versions of Palindrom may contain a high level API for generating patches. Please follow the issue [#29](https://github.com/Palindrom/Palindrom/issues/29) to know more.

### Ignoring local changes (`ignoreAdd`)

If you want to create a property in the observed object that will remain local, there is an `ignoreAdd` option and property that
let's you disregard client-side "add" operations in the object using a regular expression. Sample usage:

```javascript
// in constructor
var palindrom = new Palindrom({obj: myObj, ignoreAdd: /\/_.+/});
// or via property
palindrom.ignoreAdd = null;  //undefined or null means that all properties added on client will be sent to server
palindrom.ignoreAdd = /./; //ignore all the "add" operations
palindrom.ignoreAdd = /\/\$.+/; //ignore the "add" operations of properties that start with $
palindrom.ignoreAdd = /\/_.+/; //ignore the "add" operations of properties that start with _
// .. later on any
myObj._somethingNew = 1; // will not be propagated to server
```

### Upgrading to WebSocket (`useWebSocket`)

You can upgrade the communication protocol to use WebSocket by setting `useWebSocket: true` option in Palindrom constructor or you can switch it at any moment by `palindrom.useWebSocket = true`.

WebSocket is a replacement for requests that would be sent using `HTTP PATCH` otherwise. The requests sent over `HTTP GET` (such as link clicks) are not affected.

:bulb: Note that this is an experimental implementation in which the WebSocket upgrade request URL is hardcoded (`__default/wsupgrade/<sessionID>`). In future, it will be replaced with a configurable URL.

Sample:

```javascript
// enable it in constructor
var palindrom = new Palindrom({useWebSocket: true});
// change it later via property
palindrom.useWebSocket = false;
```

### Heartbeat and reconnection

Palindrom will try to detect connection problems and then reconnect to server. If `pingIntervalS` is set it determines maximal time without network activity. When this time passes and no activity has been detected
Palindrom will issue a heartbeat patch (an empty patch, consisting only of version operations).

When connection problem is detected (e.g. there was no response to heartbeat or websocket has been closed) palindrom will schedule reconnection and trigger `onReconnectionCountdown` callback with number of milliseconds
to scheduled reconnection as argument, it will then trigger it every second. When countdown reaches 0 (callback is still called then) palindrom will try to reconnect (using `/reconnect` endpoint) to server. If this reconnection
fails then new reconnection will be scheduled for twice as many seconds (i.e. first it will occur after a seconds, then two seconds, then four, etc.). If reconnection succeeds, `onReconnectionEnd` callback will be triggered
and normal operations will continue.

For successful reconnection, palindrom sends a list of pending patches (those sent, but unconfirmed by server) to `/reconnect` endpoint and accepts a new state (along with version numbers) as a response. It then resets
to this new state and resumes its operations.

### Dependencies

Palindrom is dependent on [Starcounter-Jack/JSON-Patch](https://github.com/Starcounter-Jack/JSON-Patch) to observe changes in local scope, generate patches to be sent to the server and apply changes received from the server.

It also, uses [URL API](http://www.w3.org/TR/url/), if your environment does not support it (IE, Node), you need to use shim, for example [Polymer/URL](https://github.com/Polymer/URL).
```shell
bower install Polymer/URL
```
```html
<script src="bower_components/url/url.js"></script>
```

### Development

#### Local installation of dependencies

In order to develop Palindrom locally we suggest to use [polyserve](https://npmjs.com/polyserve) tool to handle bower paths gently.

1. Install the global NPM modules [bower](http://bower.io/) & [polyserve](https://npmjs.com/polyserve): `npm install -g bower polyserve`
2. Make a local clone of this repo: `git clone git@github.com:Palindrom/Palindrom.git`
3. Go to the directory: `cd Palindrom`
4. Install the local dependencies: `bower install`
5. Start the development server: `polyserve -p 8000`
6. Open the demo: [http://localhost:8000/components/Palindrom/lab/polymer/index.html](http://localhost:8000/components/Palindrom/lab/polymer/index.html)
7. Open the test suite: [http://localhost:8000/components/Palindrom/test/SpecRunner.html](http://localhost:8000/components/Palindrom/test/SpecRunner.html)

#### Minifying

In order to minify it locally you'll need a basic setup.

* Install [Grunt](http://gruntjs.com/):

    ```sh
    $ [sudo] npm install -g grunt-cli
    ```

* Install local dependencies:

    ```sh
    $ npm install
    ```

* To minify project.

    ```sh
    $ grunt uglify
    ```

### Releases

To release new version run
```sh
grunt uglify bump

```

### Testing

Open `test/SpecRunner.html` in your web browser to run Jasmine test suite.

### Changelog

To see the list of recent changes, see [Releases](https://github.com/Palindrom/Palindrom/releases).


PalindromDOM
========

Extension to [Palindrom](#Palindrom) that adds DOM into two-way data binding chain (DOM ↔ local JSON ↔ remote JSON). Client side library that binds data on DOM level, so it integrates nicely with good old JavaScript, WebComponents, or Angular.

Implements [Server communication](https://github.com/Starcounter-Jack/Palindrom/wiki/Server-communication).

### Installation

You can install it using [bower](http://bower.io/) `bower install Palindrom` or just download from [github](https://github.com/Palindrom/Palindrom).

Then add source to your head:

```html
<!-- include Palindrom + PalindromDOM with dependencies -->
<script src="bower_components/fast-json-patch/src/json-patch-duplex.js"></script>
<script src="bower_components/Palindrom/src/palindrom.js"></script>
<script src="bower_components/Palindrom/src/palindrom-dom.js"></script>
```

### Usage

After DOM is ready, initialize with the constructor:

```javascript
/**
 * Defines a connection to a remote PATCH server, gives an object that is persistent between browser and server
 */
var palindrom = new PalindromDOM();
```
Now click, blur, pop/pushstate events may trigger a HTTP PATCH request.

### Demo

[Example with Polymer's Template Binding and Web Components](http://Palindrom.github.io/Palindrom/lab/polymer/index.html)

### Options (`PalindromDOM()` constructor parameters)

PalindromDOM accepts the same option attributes as Palindrom, plus the ones listed below. All the parameters are optional.

```javascript
var palindrom = new PalindromDOM({attribute: value});
```

Attribute           | Type          | Default                | Description
---                 | ---           | ---                    | ---
`listenTo`          | *HTMLElement* | `document.body`        | DOM node, that indicates a root of subtree to listen to events.

most of them are accessible also in runtime:

#### Properties

```javascript
palindrom.property
```
Property   | Type          | Default         | Description
---         | ---           | ---             | ---
`element`   | *HTMLElement* | `document.body` | See `listenTo` above
`listening` | *Boolean*     | `true`          | Is listening on

#### Methods

```javascript
palindrom.method()
```
Attribute   | Type          | Description
---         | ---           | ---
`unlisten`  | *HTMLElement* | Stop listening to DOM events
`listen`    | *HTMLElement* | Start listening to DOM events

### Browser history

Palindrom uses the HTML5 history API to update the URL in the browser address bar to reflect the new page. It also listens to a `popstate` event so it could ask the server for new JSON-Patch to morph the page back to previous state. Due to lack of native `pushstate` event you need to either:
 * call `palindrom.changeState(url)` after your `history.pushState(url)`,
 * call `palindrom.morph(url)` - that will call `pushState` and update palindrom's state for you,
 * trigger `palindrom-redirect-pushstate` with `{url: "/new/url"}` on `window` after your `history.pushState(url)`,
 * or use [`<palindrom-redirect>`](https://github.com/Palindrom/palindrom-redirect) Custom Element that does it for you.

### Development

In order to minify it locally you'll need a basic setup.

* Install [Grunt](http://gruntjs.com/):

    ```sh
    $ [sudo] npm install -g grunt-cli
    ```

* Install local dependencies:

    ```sh
    $ npm install
    ```

* To minify project.

    ```sh
    $ grunt uglify
    ```

### Releases

To release new version run
```sh
grunt uglify bump

```

### Testing

Open `test/SpecRunner.html` in your web browser to run Jasmine test suite.

### Changelog

To see the list of recent changes, see [Releases](https://github.com/Palindrom/Palindrom/releases).

## License

MIT
