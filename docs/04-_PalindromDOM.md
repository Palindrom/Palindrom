# PalindromDOM

> Extension to Palindrom that adds DOM into two-way data binding chain (DOM ↔ local JSON ↔ remote JSON). Client side library that binds data on DOM level, so it integrates nicely with good old JavaScript, WebComponents, or Angular.

Implements [Server communication](https://github.com/Starcounter-Jack/Palindrom/wiki/Server-communication).

### Usage

After DOM is ready, initialize with the constructor:

```js
/**
 * Defines a connection to a remote PATCH server, gives an object that is persistent between browser and server
 */
var palindrom = new PalindromDOM({remoteUrl: window.location.href});
```

* *Note 1: Please make sure you pass the correct PATCH server URL.*
* *Note 2: `palindrom.obj` is only available after `options.onStateReset` is called.*

Now any changes to `palindrom.obj` will trigger a HTTP PATCH request. And any received will be applied.

### Demo

- [Example with Polymer's Template Binding and Web Components](http://Palindrom.github.io/lab/polymer/index.html)
- [Example with Vue](http://Palindrom.github.io/lab/vue/index.html)
- [Example with React](http://Palindrom.github.io/lab/react/index.html)

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

#### Morph URL with an event

Sometimes, it's tedious to locate the `PalindromDOM` instance in your application using `querySelector`, making it bothersome to call `palindrom.morphUrl`. In this case, you can dispatch an event to `palindrom.listenTo` element if you set one, or to `document.body` if you haven't, and `PaldinromDOM` with handle it and morph the URL.

Example:

```js
document.body.dispatchEvent(new CustomEvent('palindrom-morph-url', {detail: {url: yourURL}}))
```

Or you can create a helper function:

```js
function morph(url) {
  document.body.dispatchEvent(new CustomEvent('palindrom-morph-url', {detail: {url}}))
}

// then
morph(yourURL);
 ```
