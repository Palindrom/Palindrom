# Installation

The library comes in two flavours: `Palindrom` and `PalindromDOM`. The difference is explained on the [`PalindromDOM` page](04-_PalindromDOM.md).

#### You can install the library using [Bower](http://bower.io/) or [NPM](http://npmjs.com/):

##### Bower:

```sh
bower install Palindrom --save
```

Then add source to your HTML:

```html
<!-- include a bundle with Palindrom global object -->
<script src="bower_components/Palindrom/dist/palindrom.min.js"></script>
<!-- or, include a bundle with PalindromDOM global object -->
<script src="bower_components/Palindrom/dist/palindrom-dom.min.js"></script>
```
See [Dependencies page](06-_Dependencies.md) for details about what's in the bundles.

##### NPM:

```sh
npm install palindrom --save
```

Then you can require it CommonJS or ES6/TS style:

```js
// CommonJS
// require Palindrom constructor
const Palindrom = require('palindrom').Palindrom;
// or, require PalindromDOM constructor
const PalindromDOM = require('palindrom').PalindromDOM;

// ES6/TS
// import Palindrom constructor
import { Palindrom } from 'palindrom';
// or, import PalindromDOM constructor
import { PalindromDOM } from 'palindrom';
```

##### GitHub:

You can [browse the source code on GitHub](https://github.com/Palindrom/Palindrom) or download [a ZIP archive from there](https://github.com/Palindrom/Palindrom/archive/master.zip).
