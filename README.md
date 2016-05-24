PuppetJs
========

Library for two-way data binding between local JSON view models and remote, using JSON-Patch, w/ optional OT, via HTTP or WebSocket.


Implements [Server communication](https://github.com/Starcounter-Jack/PuppetJs/wiki/Server-communication).

For additional binding with DOM, browser history, etc. use [PuppetDOM](#PuppetDOM).

### Installation

You can install it using [bower](http://bower.io/) `bower install PuppetJs` or just download from [github](https://github.com/PuppetJs/PuppetJs).

Then add source to your head:

```html

<!-- include PuppetJs with dependencies -->
<script src="bower_components/fast-json-patch/src/json-patch-duplex.js"></script>
<script src="bower_components/PuppetJs/src/puppet.js"></script>
```
See [Dependencies section](https://github.com/PuppetJs/puppetjs#dependencies) for more details.

### Usage

After DOM is ready, initialize with the constructor:

```javascript
/**
 * Defines a connection to a remote PATCH server, gives an object that is persistent between browser and server
 */
var puppet = new Puppet();
// ..
// use puppet.obj
puppet.obj.someProperty = "new value";
```

### Demo

[Example of PuppetJS + PuppetDOM with Polymer's Template Binding and Web Components](http://puppetjs.github.io/PuppetJs/lab/polymer/index.html)

### Options (Constructor parameters)
All the parameters are optional.
```javascript
var puppet = new Puppet({attribute: value});
```

Attribute              | Type          | Default                | Description
---                    | ---           | ---                    | ---
`remoteUrl`            | *String*      | `window.location.href` | PATCH server URL
`callback`             | *Function*    |                        | Called after initial state object is received from the server (NOT necessarily after WS connection was established)
`obj`                  | *Object*      | `{}`                   | object where the parsed JSON data will be inserted
`useWebSocket`         | *Boolean*     | `false`                | Set to `true` to enable WebSocket support
`ignoreAdd`            | *RegExp*      |                        | Regular Expression for `add` operations to be ignored (tested against JSON Pointer in JSON Patch)
`debug`                | *Boolean*     | `true`                 | Toggle debugging mode
`onLocalChange`        | *Function*    |                        | Helper callback triggered each time a change is observed locally
`onRemoteChange`       | *Function*    |                        | Helper callback triggered each time a patch is obtained from remote
`onPatchReceived`      | *Function*    |                        | Helper callback triggered each time a JSON-patch is received, accepts two parameters: (*String* `data`, *String* `url`, *String*, `method`)
`onPatchSent`          | *Function*    |                        | Helper callback triggered each time a JSON-patch is sent, accepts two parameters: (*String* `data`, *String* `url`, *String*, `method`)
`onSocketStateChanged` | *Function*    |                        | Helper callback triggered when socket state changes, accepts next parameters: (*int* `state`, *String* `url`, *String* `data`, *int* `code`, *String* `reason`)
`onConnectionError`    | *Function*    |                        | Helper callback triggered when socket connection closed, socket connection failed to establish, http requiest failed. Accepts next parameters: (*String* `data`, *String* `url`, *String*, `method`)
`localVersionPath`     | *JSONPointer* | `disabled`             | local version path, set it to enable Versioned JSON Patch communication
`remoteVersionPath`    | *JSONPointer* | `disabled`             | remote version path, set it (and `localVersionPath`) to enable Versioned JSON Patch communication
`ot`                   | *Boolean*     | `false`                | `true` to enable OT (requires `localVersionPath` and `remoteVersionPath`)
`purity`               | *Boolean*     | `false`                | `true` to enable purist mode of OT
`pingInterval`         | *Number*      | `0`                    | Interval in seconds between ping patches, `0` - disable ping patches
`jsonpatch`            | *Object*      | window.jsonpatch       | The provider object for jsonpatch apply, validate, observe and unobserve. By default assumes Starcounter-Jack/JSON-Patch library available in global `jsonpatch` variable.

most of them are accessible also in runtime:

#### Properties

```javascript
puppet.property
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
var puppet = new Puppet({callback: function (obj) {
  document.getElementById('test').model = obj;
}});
```

### Sending client changes to remote

PuppetJs detects changes to the observed object in real time. So after
```javascript
puppet.obj.some="change";
```
The JSON Patch request will be send to the remote.

### Two-way data binding frameworks

PuppetJs works superbly with with frameworks that allow for two-way data binding, such as Polymer and Angular. These frameworks have the ability to bind an `<input>` element to a JavaScript data model in a way that the object updates after each keystroke. In consequence, PuppetJs sends a patch the server after each keystroke.

If you want to opt-out from such behavior, you need to force your framework to update the data model after the element is unfocused (`blur` event). Depending on the framework:

- In Polymer 0.5 it is only possible with a Custom Element that extends the native `<input>`, similarly but not exactly how [`core-input`](https://github.com/Polymer/core-input/blob/master/core-input.html) is dome
- In Polymer 0.9+, use built-in `<input value="{{bindValue::blur}}">`
- In Angular 1.3+, use built-in `<input type="text" ng-model="name" ng-model-options="{updateOn: 'blur'}" />`

### Getting the parent scope

PuppetJS adds an inenumerable `$parent` getter at each level in the data object. You can use it to retrieve parent data from descendant scopes in Angular, Polymer, etc.

For example, such data object:

```json
{
  "Name": "Marcin",
  "Address": {
    "City": "Stockholm"
  }
}
```

Can be used as follows:

```html
<template bind="{{Address}}">
  {{$parent.Name}} lives in {{City}} <!-- Marcin lives in Stockholm -->
</template>

<script>
  puppet.obj.Address.$parent.Name === puppet.obj.Name //true
</script>
```

### Generating patches based on local changes

PuppetJs automatically observes local changes. This is implemented by dirty checking, triggered in event listeners for typical browser events (`mousedown`, `mouseup`, etc). It is done by the JSON-Patch library ([source](https://github.com/Starcounter-Jack/JSON-Patch/blob/master/src/json-patch-duplex.ts#L352-L354)).

To generate patches for changes made in code, you need to either simulate a browser event (recommended):

```js
var clickEvent = document.createEvent('MouseEvents');
clickEvent.initEvent("mouseup", true, true);
window.dispatchEvent(clickEvent);
```

Or use a low level API exposed by the JSON-Patch library, provided that you have a reference the PuppetJs instance:

```js
jsonpatch.generate(puppet.observer);
```

Future versions of PuppetJs may contain a high level API for generating patches. Please follow the issue [#29](https://github.com/PuppetJs/PuppetJs/issues/29) to know more.

### Ignoring local changes (`ignoreAdd`)

If you want to create a property in the observed object that will remain local, there is an `ignoreAdd` option and property that
let's you disregard client-side "add" operations in the object using a regular expression. Sample usage:

```javascript
// in constructor
var puppet = new Puppet({obj: myObj, ignoreAdd: /\/_.+/});
// or via property
puppet.ignoreAdd = null;  //undefined or null means that all properties added on client will be sent to server
puppet.ignoreAdd = /./; //ignore all the "add" operations
puppet.ignoreAdd = /\/\$.+/; //ignore the "add" operations of properties that start with $
puppet.ignoreAdd = /\/_.+/; //ignore the "add" operations of properties that start with _
// .. later on any
myObj._somethingNew = 1; // will not be propagated to server
```

### Upgrading to WebSocket (`useWebSocket`)

You can upgrade the communication protocol to use WebSocket by setting `useWebSocket: true` option in Puppet constructor or you can switch it at any moment by `puppet.useWebSocket = true`.

WebSocket is a replacement for requests that would be sent using `HTTP PATCH` otherwise. The requests sent over `HTTP GET` (such as link clicks) are not affected.

:bulb: Note that this is an experimental implementation in which the WebSocket upgrade request URL is hardcoded (`__default/wsupgrade/<sessionID>`). In future, it will be replaced with a configurable URL.

Sample:

```javascript
// enable it in constructor
var puppet = new Puppet({useWebSocket: true});
// change it later via property
puppet.useWebSocket = false;
```

### Dependencies

PuppetJs is dependent on [Starcounter-Jack/JSON-Patch](https://github.com/Starcounter-Jack/JSON-Patch) to observe changes in local scope, generate patches to be sent to the server and apply changes received from the server.

It also, uses [URL API](http://www.w3.org/TR/url/), if your environment does not support it (IE, Node), you need to use shim, for example [Polymer/URL](https://github.com/Polymer/URL).
```shell
bower install Polymer/URL
```
```html
<script src="bower_components/url/url.js"></script>
```

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

To see the list of recent changes, see [Releases](https://github.com/PuppetJs/PuppetJs/releases).


PuppetDOM
========

Extension to [PuppetJS](#PuppetJS) that adds DOM into two-way data binding chain (DOM ↔ local JSON ↔ remote JSON). Client side library that binds data on DOM level, so it integrates nicely with good old JavaScript, WebComponents, or Angular.

Implements [Server communication](https://github.com/Starcounter-Jack/PuppetJs/wiki/Server-communication).

### Installation

You can install it using [bower](http://bower.io/) `bower install PuppetJs` or just download from [github](https://github.com/PuppetJs/PuppetJs).

Then add source to your head:

```html
<!-- include PuppetJs + PuppetDOM with dependencies -->
<script src="bower_components/fast-json-patch/src/json-patch-duplex.js"></script>
<script src="bower_components/PuppetJs/src/puppet.js"></script>
<script src="bower_components/PuppetJs/src/puppet-dom.js"></script>
```

### Usage

After DOM is ready, initialize with the constructor:

```javascript
/**
 * Defines a connection to a remote PATCH server, gives an object that is persistent between browser and server
 */
var puppet = new PuppetDOM();
```
Now click, blur, pop/pushstate events may trigger a HTTP PATCH request.

### Demo

[Example with Polymer's Template Binding and Web Components](http://puppetjs.github.io/PuppetJs/lab/polymer/index.html)

### Options (Constructor parameters)
All the parameters are optional.
```javascript
var puppet = new Puppet({attribute: value});
```

Attribute           | Type          | Default                | Description
---                 | ---           | ---                    | ---
`listenTo`          | *HTMLElement* | `document.body`        | DOM node, that indicates a root of subtree to listen to events.

most of them are accessible also in runtime:

#### Properties

```javascript
puppet.property
```
Property   | Type          | Default         | Description
---         | ---           | ---             | ---
`element`   | *HTMLElement* | `document.body` | See `listenTo` above
`listening` | *Boolean*     | `true`          | Is listening on

#### Methods

```javascript
puppet.method()
```
Attribute   | Type          | Description
---         | ---           | ---
`unlisten`  | *HTMLElement* | Stop listening to DOM events
`listen`    | *HTMLElement* | Start listening to DOM events

### Browser history

PuppetJs uses the HTML5 history API to update the URL in the browser address bar to reflect the new page. It also listens to a `popstate` event so it could ask the server for new JSON-Patch to morph the page back to previous state. Due to lack of native `pushstate` event you need to either:
 * call `puppet.changeState(url)` after your `history.pushState(url)`,
 * call `puppet.morph(url)` - that will call `pushState` and update puppet's state for you,
 * trigger `puppet-redirect-pushstate` with `{url: "/new/url"}` on `window` after your `history.pushState(url)`,
 * or use [`<puppet-redirect>`](https://github.com/PuppetJs/puppet-redirect) Custom Element that does it for you.

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

To see the list of recent changes, see [Releases](https://github.com/PuppetJs/PuppetJs/releases).

## License

MIT
