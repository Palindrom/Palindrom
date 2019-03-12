# PalindromDOM

> Extension to Palindrom that adds DOM into two-way data binding chain (DOM ↔ local JSON ↔ remote JSON). Client side library that binds data on DOM level, so it integrates nicely with good old JavaScript, WebComponents, or Angular.

Implements [Server communication](https://github.com/Starcounter-Jack/Palindrom/wiki/Server-communication).

### Usage

After DOM is ready, initialize with the constructor:

```js
/**
 * Defines a connection to a remote PATCH server, gives an object that is persistent between browser and server
 */
const palindrom = new PalindromDOM({remoteUrl: window.location.href});
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
`listenTo`          | *HTMLElement* | `document`             | DOM node, that indicates a root of subtree to listen to events.

most of them are accessible also in runtime:

#### Properties

```javascript
palindrom.property
```
Property    | Type          | Default    | Description
---         | ---           | ---        | ---
`element`   | *HTMLElement* | `document` | See `listenTo` above
`listening` | *Boolean*     | `true`     | Is listening on

#### Methods

```javascript
palindrom.method()
```
Attribute   | Arguments          | Description
---         | ---           | ---
`unlisten`  | None | Stop listening to DOM events
`listen`    | *target: HTMLElement* | Start listening to DOM events
`async morphUrl`    | *url: String*    | Navigates to a URL and morphs the page accordingly
`async getPatchUsingHTTP`    | *url: String*    | Sends a `PATCH/GET` request to the server demanding a patch that synchronizes server and client sides. It sends a `PATCH` request when there are pending data in the client's queue. And a `GET` request when there is not.

### Browser history

Palindrom uses the HTML5 history API to update the URL in the browser address bar to reflect the new page. It also listens to a `popstate` event so it could ask the server for new JSON-Patch to morph the page back to previous state. Due to lack of native `pushstate` event you need to either:
 * call `palindrom.getPatchUsingHTTP(url)` after your `history.pushState(url)`. This method returns a promise that resolves when the HTTP request is done. Returns a boolean representing if the request was successful,
 * call `palindrom.morphUrl(url)` - this will call `pushState` and update PalindromDOM's state for you,
 * trigger `palindrom-redirect-pushstate` with `{url: "/new/url"}` on `window`. This will call `morphUrl` for you,
 * or use [`<palindrom-redirect>`](https://github.com/Palindrom/palindrom-redirect) Custom Element that does it for you.

#### Browser history events

PalindromDOM dispatches bubbling events before and after it manipulates browser history.
- Before: it dispatches `palindrom-before-redirect` event with `detail` object containing `href` property that contains the URL.
- After: it dispatches `palindrom-after-redirect` event with `detail` object containing `href: string` property that contains the URL and `successful: boolean` indicating whether the HTTP request was successful.

#### Morph URL with an event

Sometimes, it's tedious to locate the `PalindromDOM` instance in your application using `querySelector`, making it bothersome to call `palindrom.morphUrl`. In this case, you can dispatch an event to `palindrom.listenTo` element if you set one, or to `window` if you haven't, and `PaldinromDOM` with handle it and morph the URL.

Example:

```js
document.dispatchEvent(new CustomEvent('palindrom-morph-url', {detail: {url: yourURL}}))
```

Or you can create a helper function:

```js
function morph(url) {
  window.dispatchEvent(new CustomEvent('palindrom-morph-url', {detail: {url}}))
}

// then
morph(yourURL);
```
