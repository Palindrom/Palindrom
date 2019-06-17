import './inject-mock-websocket';
import './specs/palindrom.callbacks.test';
import './specs/palindrom.test';
import './specs/palindrom.validate.test';
import './specs/palindrom.websockets.test';
import './specs/onPatchSentAndReceived.test';
import './specs/palindrom.errors.test';
import './specs/palindrom.ignore.defineProperty.test.js';
import './specs/palindrom.filter.test';

//server tests. Webpack is configured to skip the server tests in 'runner-browser.js' bundle
import './specs/server/initialization';
import './specs/server/websocket';

import './specs/dom/index';
import './specs/dom/ot'; //fixme: this does not clean up well, must be the last one