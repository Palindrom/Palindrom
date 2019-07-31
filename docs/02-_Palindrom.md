# Palindrom

> Palindrom is a library for two-way data binding between local and remote JSON models. It uses JSON-Patch for data updates and Operational Transformation for versioning and data consistency. It operates via HTTP or WebSocket or both.


### Usage

After DOM is ready, initialize with the constructor:

```js
/**
 * Defines a connection to a remote PATCH server, gives an object that is persistent between browser and server
 */
var palindrom = new Palindrom({remoteUrl: window.location.href});

// ..
// use palindrom.obj
palindrom.obj.someProperty = "new value";
```
* *Note 1: Please make sure you pass the correct PATCH server URL.*
* *Note 2: `palindrom.obj` is only available after `options.onStateReset` is called.*


### Demo

- [Example with Polymer's Template Binding and Web Components](http://palindrom.github.io/Palindrom/lab/polymer/index.html)
- [Example with Vue](http://palindrom.github.io/Palindrom/lab/vue/dist/index.html)
- [Example with React](http://palindrom.github.io/Palindrom/lab/react/index.html)

### Options (`Palindrom()` constructor argument)
All the argument's properties are optional.
```javascript
var palindrom = new Palindrom({property: value});
```

Property               | Type          | Default                | Description
---                    | ---           | ---                    | ---
`remoteUrl`            | **`String`**      |  **Required**          | PATCH server URL
`onStateReset`         | *Function*    |                        | Called after initial state object is received from the server (NOT necessarily after WS connection was established), **it can be called again if the state was reset by a root-replacing patch**. Arguments: **`Object`** New state object
`useWebSocket`         | *Boolean*     | `false`                | Set to `true` to enable WebSocket support
`debug`                | *Boolean*     | `true`                 | Toggle debugging mode
`filterLocalChange`            | *Function*      |       | A function that is called with every local change and allows you to filter (ignore) some changes. See [Filtering Patches](https://palindrom.github.io/#/docs/master/04-Filtering Patches) section. Arguments: **`Object`** Operation to go through the filter
`onLocalChange`        | *Function*    |                        | Helper callback triggered each time a change is observed locally. Arguments: **`JSONPatch`** Patch (array of operations)
`onRemoteChange`       | *Function*    |                        | Helper callback triggered each time a change is received from the server and applied. Arguments: **`JSONPatch`** Patch (array of operations), **`Array`** Validation results
`onPatchReceived`      | *Function*    |                        | Callback triggered each time a JSON-patch is received. Arguments: **`JSONPatch`** Patch (array of operations) that was send by remote, **`String`** URL from which the change was issued,  **`String`** HTTP method which resulted in this change ('GET' or 'PATCH') or 'WS' if came as Web Socket message
`onPatchSent`          | *Function*    |                        | Helper callback triggered each time a JSON-patch is sent. Arguments: (**`String`** `data` Patch (array of operations) serialized to string (optional, i.e. `null` if method equals `GET`), **`String`** `url`, **`String`** `method`)
`onSocketStateChanged` | *Function*    |                        | Helper callback triggered when socket state changes. Arguments: **`number`** `state`, **`String`** `url`, **`String`** `data` (optional), **`number`** `code` (optional), **`String`** `reason` (only if `code` is provided)
`onError`    | *Function*    |                        | Helper callback triggered when a generic error occurs. Arguments: **`PalindromError`** Error object that has the following properties: **`String`** `message`. It extends ES6 Error, it has the stack trace with all the information `Error` class offers.
`onConnectionError`    | *Function*    |                        | Helper callback triggered when socket connection closed, socket connection failed to establish, http requiest failed. Arguments: **`PalindromConnectionError`** `error`). `PalindromConnectionError` has the following properties: (**`String`** `message`, **`String`** `side <Server\|Client>`, **`String`** `url`, **`String`** `connectionType`). It extends ES6 Error class, it has the stack trace with all the information `Error` class offers.
`onIncomingPatchValidationError`    | *Function*    |                        | Helper callback triggered when a wrong patch is received. Arguments: **`Error`** Error object
`onOutgoingPatchValidationError`    | *Function*    |                        | Helper callback triggered when a wrong patch is locally issued. Arguments: **`Error`** Error object
`localVersionPath`     | *JSONPointer* | `disabled`             | local version path, set it to enable Versioned JSON Patch communication
`remoteVersionPath`    | *JSONPointer* | `disabled`             | remote version path, set it (and `localVersionPath`) to enable Versioned JSON Patch communication
`ot`                   | *Boolean*     | `false`                | `true` to enable OT (requires `localVersionPath` and `remoteVersionPath`)
`purity`               | *Boolean*     | `false`                | `true` to enable purist mode of OT
`pingIntervalS`        | *Number*      | `0`                    | Palindrom will generate heartbeats every `pingIntervalS` seconds if no activity is detected. `0` - disable heartbeat
`retransmissionThreshold`| *Number*    | `3`                    | After server reports this number of messages missing, we start retransmission
`onReconnectionCountdown`| *Function*  |                        | Triggered when palindrom detected connection problem and reconnection is scheduled. Called every second until countdown reaches 0 (inclusive). Arguments: **`number`** milliseconds to scheduled reconnection.
`onReconnectionEnd`    | *Function*    |                        | Triggered when palindrom successfully reconnected. No arguments.
`jsonpatch`            | *Object*      | `window.jsonpatch`       | The provider object for jsonpatch `apply` and  `validate`. By default it uses Starcounter-Jack/JSON-Patch library.



most of the properties are accessible also in runtime:

#### Properties

```js
palindrom.property
```
Attribute             | Type       | Default                | Description
---                   | ---        | ---                    | ---
`remoteUrl`           | **`String`**   | **Required**           | See above
`obj [readonly]`      | *Object*   | `{}`                   | Your initial state object, _**please read notes below**_.
`useWebSocket`        | *Boolean*  | `false`                | See above
`debug`               | *Boolean*  | `true`                 | See above
`onRemoteChange`      | *Function* |                        | See above
`onPatchReceived`     | *Function* |                        | See above
`onSocketStateChanged`| *Function* |                        | See above
`onPatchSent`         | *Function* |                        | See above
`onConnectionError`   | *Function* |                        | See above
`onIncomingPatchValidationError`   | *Function* |           | See above
`onOutgoingPatchValidationError`   | *Function* |           | See above
`version`             | *String `semver`*   |                        | Contains current Palindrom version, available statically too (i.e: `Palindrom.version`)

* **_ Note 1: `palindrom.obj` becomes only available after `options.onStateReset` is called._**
* **_ Note 2: `palindrom.obj` is a constant (as in `const`) property, you can modify its properties but you can't assign it again or `delete` it. `palindrom.obj = {}` would throw an error._**


### Binding object once is ready (`onStateReset`)
To bind object where you need once it will be fetched from remote you can use define `onStateReset` in constructor:
```js
var palindrom = new Palindrom({remoteUrl: url, onStateReset: function (obj) {
  document.getElementById('test').model = obj;
}});
```

### Sending client changes to remote

Palindrom detects changes to the observed object synchronously. So after
```javascript
palindrom.obj.some="change";
```
The JSON Patch request will be send to the remote.

### Two-way data binding frameworks

Palindrom works superbly with frameworks that allow for two-way data binding, such as Polymer, React, Vue and Angular. These frameworks have the ability to bind an `<input>` element to a JavaScript data model in a way that the object updates after each keystroke. In consequence, Palindrom sends a patch the server after each keystroke.

If you want to opt-out from such behavior, you need to force your framework to update the data model after the element is unfocused (`blur` event). Depending on the framework:

- In Polymer 0.5 it is only possible with a Custom Element that extends the native `<input>`, similarly but not exactly how [`core-input`](https://github.com/Polymer/core-input/blob/master/core-input.html) is dome
- In Polymer 0.9+, use built-in `<input value="{{bindValue::blur}}">`
- In Angular 1.3+, use built-in `<input type="text" ng-model="name" ng-model-options="{updateOn: 'blur'}" />`

### Upgrading to WebSocket (`useWebSocket`)

You can upgrade the communication protocol to use WebSocket by setting `useWebSocket: true` option in Palindrom constructor or you can switch it at any moment by `palindrom.useWebSocket = true`.

WebSocket is a replacement for requests that would be sent using `HTTP PATCH` otherwise. The requests sent over `HTTP GET` (such as link clicks) are not affected.

:bulb: Note that this is an experimental implementation in which the WebSocket upgrade request URL taken from `X-Location` header of your first AJAX call response.

Sample:

```javascript
// enable it in constructor
var palindrom = new Palindrom({remoteUrl: url, useWebSocket: true});
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