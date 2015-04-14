PuppetJs
========

Client side library that binds Web Components or AngularJs to server side view models using JSON-Patch

Implements [Server communication](https://github.com/Starcounter-Jack/PuppetJs/wiki/Server-communication).

### Installation

You can install it using [bower](http://bower.io/) `bower install PuppetJs` or just download from [github](https://github.com/PuppetJs/PuppetJs).

Then add source to your head:

```html
<!-- include PuppetJs with dependencies -->
<script src="bower_components/fast-json-patch/src/json-patch-duplex.js"></script>
<script src="bower_components/PuppetJs/src/puppet.js"></script>
```

### Usage

After DOM is ready, initialize with the constructor:

```javascript
/**
 * Defines a connection to a remote PATCH server, gives an object that is persistent between browser and server
 */
var puppet = new Puppet();
// ..
// use puppet.obj
```

### Demo

[Example with Polymer's Template Binding and Web Components](http://puppetjs.github.io/PuppetJs/lab/polymer/index.html)

### Options (Constructor parameters)
All the parameters are optional.
```javascript
var puppet = new Puppet({attribute: value});
```

Attribute           | Type          | Default                | Description
---                 | ---           | ---                    | ---
`remoteUrl`         | *String*      | `window.location.href` | PATCH server URL
`callback`          | *Function*    |                        | Called after initial state object is received from the server (NOT necessarily after WS connection was established)
`obj`               | *Object*      | `{}`                   | object where the parsed JSON data will be inserted
`useWebSocket`      | *Boolean*     | `false`                | Set to `true` to enable WebSocket support
`ignoreAdd`         | *RegExp*      |                        | Regular Expression for `add` operations to be ignored (tested against JSON Pointer in JSON Patch)
`debug`             | *Boolean*     | `true`                 | Toggle debugging mode
`onRemoteChange`    | *Function*    |                        | Deprecated. Helper callback triggered each time a patch is obtained from server
`onPatchReceived`   | *Function*    |                        | Helper callback triggered each time a JSON-patch is received, accepts two parameters: (*String* `data`, *String* `url`, *String*, `method`)
`onPatchSent`       | *Function*    |                        | Helper callback triggered each time a JSON-patch is sent, accepts two parameters: (*String* `data`, *String* `url`, *String*, `method`)
`onSocketStateChanged`| *Function*  |                        | Helper callback triggered when stocket state changes, accepts next parameters: (*int* `state`, *String* `url`, *String* `data`, *int* `code`, *String* `reason`)
`localVersionPath`  | *JSONPointer* | `disabled`             | local version path, set it to enable Versioned JSON Patch communication
`remoteVersionPath` | *JSONPointer* | `disabled`             | remote version path, set it (and `localVersionPath`) to enable Versioned JSON Patch communication
`ot`                | *Boolean*     | `false`                | `true` to enable OT (requires `localVersionPath` and `remoteVersionPath`)
`purity`            | *Boolean*     | `false`                | `true` to enable purist mode of OT

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


### Binding object once is ready (`callback`)
To bind object to some DOM node once it will be fetched from server you can use define `callback` in constructor:
```javascript
var puppet = new Puppet({callback: function (obj) {
  document.getElementById('test').model = obj;
}});
```

### Sending client changes to server

PuppetJs detects changes to the observed object in real time. However, change patches are
queued and not sent to the server until a `blur` event occurs. It is because normally there is no business need to save
a partially filled field and in many cases it may be harmful to data integrity. Another benefit is performance
 improvement due to reduced number of requests.

To force sending changes on each key stroke (for example to implement live search), you can configure it
per input field (given that this field is bound to observed object):

```html
<input update-on="blur"><!-- default behavior: update server on blur -->
<input update-on="input"><!-- update server on key stroke -->
```

### Browser history

PuppetJs uses the HTML5 history API to update the URL in the browser address bar to reflect the new page. It also listens to a `popstate` event so it could ask the server for new JSON-Patch to morph the page back to previous state. Due to lack of native `pushstate` event you need to either:
 * call `puppet.changeState(url)` after your `history.pushState(url)`, 
 * call `puppet.morph(url)` - that will call `pushState` and update puppet's state for you, 
 * trigger `puppet-redirect-pushstate` with `{url: "/new/url"}` on `window` after your `history.pushState(url)`, 
 * or use [`<puppet-redirect>`](https://github.com/PuppetJs/puppet-redirect) Custom Element that does it for you.

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
