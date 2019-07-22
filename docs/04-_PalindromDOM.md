# PalindromDOM

Extension to Palindrom that adds navigation interception. This allows to have links on the HTML page that send and receive patches instead of full page reloads. The navigation appears to be full for the end user, thanks to the use of History API to update the URL in the browser address bar. More details about this feature on the next page: [Navigation interception](05-_Navigation_Interception.md).

PalindromDOM is used in scenarios when the Palindrom instance is a client that runs in a Web browser and the HTML document contains links, which should be intercepted and sent to the server as patches.

### Usage

After DOM is ready, initialize the `PalindromDOM` constructor instead of `Palindrom` constructor:

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

- [Example with Polymer's Template Binding and Web Components](http://palindrom.github.io/lab/polymer/index.html)
- [Example with Vue](http://palindrom.github.io/lab/vue/dist/index.html)
- [Example with React](http://palindrom.github.io/lab/react/index.html)

### Options (`PalindromDOM()` constructor parameters)

PalindromDOM accepts the same option attributes as Palindrom, plus the ones listed below. All the parameters are optional.

```javascript
var palindrom = new PalindromDOM({attribute: value});
```

Attribute           | Type          | Default                | Description
---                 | ---           | ---                    | ---
`listenTo`          | *HTMLElement* | `document`             | DOM node, that indicates a root of subtree to listen to DOM events.

most of them are accessible also in runtime:

#### Properties

```javascript
palindrom.property
```
Property    | Type          | Default    | Description
---         | ---           | ---        | ---
`element`   | *HTMLElement* | `document` | The element on which PalindromDOM is listening to DOM events (document or the the element passed using the `listenTo` option)
`listening` | *Boolean*     | `true`     | True if DOM event listening is on

#### Methods

```javascript
palindrom.method()
```
Attribute   | Arguments          | Description
---         | ---           | ---
`unlisten`  | None | Stop listening to DOM events
`listen`    | *target: HTMLElement* | Start listening to DOM events
`async morphUrl`    | *url: String*    | Navigates to a URL by making a request using `async getPatchUsingHTTP` followed by a History API call.
`async getPatchUsingHTTP`    | *url: String*    | Sends a `PATCH/GET` request to the server demanding a patch that synchronizes server and client sides. It sends a `PATCH` request when there are pending data in the client's queue. And a `GET` request when there is not.

### Morphing pages programmatically

PalindromDOM uses the HTML5 history API to update the URL in the browser address bar to reflect the new page. It also listens to a `popstate` event so it could ask the server for new JSON-Patch to morph the page back to previous state.

To morph to a page programmatically, you need to either:

If you don't have a reference to the PalindromDOM instance:

 * trigger `palindrom-morph-url` or `palindrom-redirect-pushstate` event with `{url: "/new/url"}` on `palindrom.element` (equals `document` by default). This will call `morphUrl` for you. Example: `document.dispatchEvent(new CustomEvent('palindrom-morph-url', {detail: {url: yourURL}}))`,
 * or use [`<palindrom-redirect>`](https://github.com/Palindrom/palindrom-redirect) Custom Element that does it for you.

If you have a reference to the PalindromDOM instance:

 * call `palindrom.morphUrl(url)` - this will call `history.pushState` and update PalindromDOM's state for you,
 * call `palindrom.getPatchUsingHTTP(url)` after your `history.pushState(url)`. This method returns a [`Promise<Response>`](https://github.com/axios/axios#response-schema). This methods throws an error if the HTTP request has failed or the `palindrom-before-redirect` was canceled by calling `event.preventDefault()`.