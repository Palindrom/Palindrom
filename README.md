PuppetJs
========

Client side library that binds Web Components or AngularJs to server side view models using JSON-Patch

Implements [Server communication](https://github.com/Starcounter-Jack/PuppetJs/wiki/Server-communication).

### To-do

* Register  `document.model` (currently available as `puppet.obj`, where `puppet` is name of the PuppetJs instance)

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

### Dependencies

PuppetJs is dependent on [Starcounter-Jack/JSON-Patch](https://github.com/Starcounter-Jack/JSON-Patch) to observe changes in local scope, generate patches to be sent to the server and apply changes received from the server.

### Testing

Open `test/SpecRunner.html` in your web browser to run Jasmine test suite.