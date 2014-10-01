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
 * Defines a connection to a remote PATCH server, returns callback to a object that is persistent between browser and server
 * @param remoteUrl If undefined, current window.location.href will be used as the PATCH server URL
 * @param callback Called after initial state object is loaded from the server
 */
var puppet = new Puppet(null, function callback (obj) {
  //called when loaded
});
puppet.onRemoteChange = function (patches) {
  //this is a helper callback triggered each time a patch is obtained from server
};
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

If you want to create a property in the observed object that will remain local, there is an `ignoreAdd` property that
let's you disregard client-side "add" operations in the object using a regular expression. Sample usage:

```javascript
var puppet = new Puppet(window.location.href, function (obj) {
  document.getElementById('test').model = obj;
});
puppet.ignoreAdd = null;  //undefined or null means that all properties added on client will be sent to server
puppet.ignoreAdd = /./; //ignore all the "add" operations
puppet.ignoreAdd = /\/\$.+/; //ignore the "add" operations of properties that start with $
puppet.ignoreAdd = /\/_.+/; //ignore the "add" operations of properties that start with _
```

### Upgrading to WebSocket (`useWebSocket`)

You can upgrade the communication protocol to use WebSocket using `useWebSocket = true` flag right after Puppet initialization.

WebSocket is a replacement for requests that would be sent using `HTTP PATCH` otherwise. The requests sent over `HTTP GET` (such as link clicks) are not affected.

:bulb: Note that this is an experimental implementation in which the WebSocket upgrade request URL is hardcoded (`__default/wsupgrade/<sessionID>`). In future, it will be replaced with a configurable URL.

Sample:


```javascript
var puppet = new Puppet(window.location.href, function (obj) {
  document.getElementById('test').model = obj;
});
puppet.useWebSocket = true;
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


### Testing

Open `test/SpecRunner.html` in your web browser to run Jasmine test suite.

### Changelog

To see the list of recent changes, see [Releases](https://github.com/PuppetJs/PuppetJs/releases).
