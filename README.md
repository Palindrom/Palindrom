PuppetJs
========

Client side library that binds Web Components or AngularJs to server side view models using JSON-Patch

Implements [Server communication](https://github.com/Starcounter-Jack/PuppetJs/wiki/Server-communication).

### Usage

Install by adding source to your head:

```html
<!-- include PuppetJs with dependencies -->
<script src="lib/json-patch/src/json-patch-duplex.js"></script>
<script src="src/puppet.js"></script>
```

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

### Dependencies

PuppetJs is dependent on [Starcounter-Jack/JSON-Patch](https://github.com/Starcounter-Jack/JSON-Patch) to observe changes in local scope, generate patches to be sent to the server and apply changes received from the server.

### Testing

Open `test/SpecRunner.html` in your web browser to run Jasmine test suite.

### Changelog

#### 0.1.0 (Nov 6, 2013)

First numbered version