# Palindrom
<p align="center">
  <img title="Palindrom" alt="Palindrom Logo" src="https://cloud.githubusercontent.com/assets/17054134/25017514/5f22bcd4-2084-11e7-816c-ee249e1b3164.png">
</p>

<h4 align="center">
Library for two-way data binding between local and remote JSON models. It uses JSON-Patch for data updates and Operational Transformation for versioning and data consistency. It operates via HTTP or WebSocket or both.
</h4>

[![Build Status](https://travis-ci.org/Palindrom/Palindrom.svg?branch=master)](https://travis-ci.org/Palindrom/Palindrom)
[![npm version](https://badge.fury.io/js/palindrom.svg)](https://badge.fury.io/js/palindrom)
[![MIT](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](https://opensource.org/licenses/MIT)

---

Implements [Server communication](https://github.com/Starcounter-Jack/PuppetJs/wiki/Server-communication).

```js
/**
 * Defines a connection to a remote PATCH server, gives an object that is persistent between browser and server
 */
var palindrom = new Palindrom({remoteUrl: window.location.href});

// ...
// use palindrom.obj
palindrom.obj.someProperty = "new value";
// Your change gets propagated automatically to the remote, no glue code needed.
```

### [Documentation](https://palindrom.github.io/docs)

---

### Installation

#### You can install using [bower](http://bower.io/) and [NPM](http://npmjs.com/):

##### Bower:

```sh
bower install Palindrom --save
```

Then add source to your HTML

```html
<!-- include Palindrom bundle -->
<script src="bower_components/Palindrom/dist/palindrom.js"></script>
```
See [Dependencies section](https://github.com/Palindrom/Palindrom#dependencies) for more details.

##### NPM:

```sh
npm install palindrom --save
```

Then you can import it ES Modules style:

```js
import { Palindrom } from 'palindrom';
import { PalindromDOM } from 'palindrom';
```

Note: The NPM package uses an entry point without a default export. Depending on your environment (Node or browser), you should choose one of the two named exports available: `Palindrom` and `PalindromDOM`.

##### GitHub:

You can [browse the source code on GitHub](https://github.com/Palindrom/Palindrom) or download [a ZIP archive from there](https://github.com/Palindrom/Palindrom/archive/master.zip).

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

- [Example with Polymer's Template Binding and Web Components](http://palindrom.github.io/lab/polymer/index.html)
- [Example with Vue](https://palindrom.github.io/lab/vue/dist/index.html)
- [Example with React](http://palindrom.github.io/lab/react/index.html)


### Changelog

To see the list of recent changes, see [Releases](https://github.com/Palindrom/Palindrom/releases).

## License

MIT
