# Installation

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
See [Dependencies section](#dependencies) for more details.

##### NPM:

```sh
npm install palindrom --save
```

Then you can require it CommonJS or ES6/TS style:

```js
// CommonJS
const Palindrom = require('palindrom').Palindrom;
const PalindromDOM = require('palindrom').PalindromDOM;

// ES6/TS
import { Palindrom } from 'palindrom';
import { PalindromDOM } from 'palindrom';
```

Note: The NPM package uses an entry point without a default export. Depending on your environment (Node or browser), you should choose one of the two named exports available: `Palindrom` and `PalindromDOM`.

##### GitHub:

You can [browse the source code on GitHub](https://github.com/Palindrom/Palindrom) or download [a ZIP archive from there](https://github.com/Palindrom/Palindrom/archive/master.zip).
