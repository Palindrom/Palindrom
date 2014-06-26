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

### Ignoring local changes

If you want to create a property in the observed object that will remain local, there is an `ignoreAdd` property that
let's you disregard client-side "add" operations in the object using a regular expression. Sample usage:

```javascript
puppet.ignoreAdd = null;  //undefined or null means that all properties added on client will be sent to server
puppet.ignoreAdd = /./; //ignore all the "add" operations
puppet.ignoreAdd = /\/\$.+/; //ignore the "add" operations of properties that start with $
puppet.ignoreAdd = /\/_.+/; //ignore the "add" operations of properties that start with _
```

### Dependencies

PuppetJs is dependent on [Starcounter-Jack/JSON-Patch](https://github.com/Starcounter-Jack/JSON-Patch) to observe changes in local scope, generate patches to be sent to the server and apply changes received from the server.

### Testing

Open `test/SpecRunner.html` in your web browser to run Jasmine test suite.

### Changelog

#### 0.1.12 (Jun 27, 2014)

- show console warning when patch from server replaces object root (only when the `debug` flag is set to true)

#### 0.1.11 (Jun 13, 2014)

- fix error "Uncaught TypeError: Illegal invocation"

#### 0.1.10 (Jun 13, 2014)

- always trigger internal `changeState` behavior when history.push is detected (not only when `morphUrl` was called)

#### 0.1.9 (Apr 22, 2014)

- bugfix: did not intercept clicks on elements nested in `<a>`
- bugfix: event listener on links inside Shadow DOM did not work with Polymer 0.2.2
- set the dev dependency on `Polymer/polymer` without specifying the version number, which should help to avoid conflicts in Bower

#### 0.1.8 (Apr 2, 2014)

- `setModelValue(elem, value)` separated, and changed to `getModel(elem).property = value` [Polyjuice/model-operations](https://github.com/Polyjuice/model-operations). Now, instead of
`<button bind="{{Remove$}}" onclick="setModelValue(this)" value="null"></button>`
use
`<button onclick="getModel(elem).Remove$ = null"></button>`

#### 0.1.7 (Mar 27, 2014)

- fix ShadowDOMPolyfill problem in Canary ([#17](https://github.com/PuppetJs/PuppetJs/issues/17))
- change bindings to bindings_ - makes code ready for Polymer 0.2.2 ([#18](https://github.com/PuppetJs/PuppetJs/issues/18))
- replace "wc" and "mdv" examples with a new one for Polymer
- the new Polymer example shows usage of `setModelValue` and `update-on="input"`
- remove the dependencies of the removed examples

#### 0.1.6 (Feb 21, 2014)

- New `beforeSend` callback in `puppet.xhr` for hackability
- Upgrade to [&lt;x-html&gt;](https://github.com/PuppetJs/x-html) to v0.0.20140221
- New sugar `setModelValue` function, to give HTML attribute event handlers access to the model's property. (As `Node` extension was removed from [&lt;x-html&gt;](https://github.com/PuppetJs/x-html) code). Now instead of `<polymer-ui-icon-button icon="trash" value="{{Remove$}}" onclick="this.model.Remove$ = null"></polymer-ui-icon-button>` use `<polymer-ui-icon-button icon="trash" bind="{{Remove$}}" onclick="setModelValue(this)" value="null"></polymer-ui-icon-button>`
- Upgrade Polymer to v0.2.0

#### 0.1.5 (Jan 24, 2014)

- Less strict behavior when `Location` is received more than once from the server. Still showing an error message when the server changes the `Location` during the session
- Upgrade to [&lt;x-html&gt;](https://github.com/PuppetJs/x-html) to v0.0.20140122
- Upgrade Polymer to v0.1.3

#### 0.1.4 (Jan 10, 2014)

- Redo the how the internal application clicks are intercepted by PuppetJS and changed into a patch and history push (previous implementation stopped working in ShadowDOM)
- Deprecate `catchExternaLink` (no need to use it anymore)
- Fixed an infinite loop when a key in the JSON file was an empty string and its value was an object ([#14](https://github.com/PuppetJs/PuppetJs/issues/14))

#### 0.1.3 (Dec 20, 2013)

- Use shadowRoot instead of webkitShadowRoot if available
- Recommended to use PuppetJS in Chrome with Web Platform features flag enabled (otherwise you may experience an issue with the link catching)
- Upgrade to [&lt;x-html&gt;](https://github.com/PuppetJs/x-html) to v0.0.20131220
- Upgrade Polymer to v0.1.1

#### 0.1.2 (Dec 13, 2013)

- New property `puppet.ignoreAdd` allows to ignore local "add" operations in the observed object, allowing client-only properties that will not be propagated to server (solves [#10](https://github.com/PuppetJs/PuppetJs/issues/10) and [#12](https://github.com/PuppetJs/PuppetJs/issues/12))
- Fixed lint code errors
- Fixed exception in Angular example (`ng-partial` directive)
- Upgrade to [&lt;x-html&gt;](https://github.com/PuppetJs/x-html) to v0.0.20131213
- Upgrade Polymer to v0.1.0

#### 0.1.1 (Dec 4, 2013)

- HTTP referer header (described in [Server communication](https://github.com/Starcounter-Jack/PuppetJs/wiki/Server-communication)) will now show an error if set in a XHR response. The only permitted way is to set it in the main HTML document response HTTP headers
- Upgrade to [&lt;x-html&gt;](https://github.com/PuppetJs/x-html) to v0.0.20131126
- Refactor examples in `lab/` to use the updated &lt;x-html&gt;
- In case of error, display the error message with absolute positioning

#### 0.1.0 (Nov 6, 2013)

First numbered version
