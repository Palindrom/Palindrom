(function(){
/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
 * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
 * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
 * Google as part of the polymer project is also subject to an additional IP
 * rights grant found at http://polymer.github.io/PATENTS.txt
 */

 /**
  * @return {string} '<count> <kind> tests' or '<count> <kind> test'.
  */
 function pluralizedStat(count, kind) {
   if (count === 1) {
     return count + ' ' + kind + ' test';
   } else {
     return count + ' ' + kind + ' tests';
   }
 }

// We capture console events when running tests; so make sure we have a
// reference to the original one.
const console = window.console;

const FONT =
    ';font: normal 13px "Roboto", "Helvetica Neue", "Helvetica", sans-serif;';
const STYLES = {
  plain: FONT,
  suite: 'color: #5c6bc0' + FONT,
  test: FONT,
  passing: 'color: #259b24' + FONT,
  pending: 'color: #e65100' + FONT,
  failing: 'color: #c41411' + FONT,
  stack: 'color: #c41411',
  results: FONT + 'font-size: 16px',
};

// I don't think we can feature detect this one...
const userAgent = navigator.userAgent.toLowerCase();
const CAN_STYLE_LOG = userAgent.match('firefox') || userAgent.match('webkit');
const CAN_STYLE_GROUP = userAgent.match('webkit');
// Track the indent for faked `console.group`
let logIndent = '';

function log(text, style) {
  text = text.split('\n')
             .map(function(l) {
               return logIndent + l;
             })
             .join('\n');
  if (CAN_STYLE_LOG) {
    console.log('%c' + text, STYLES[style] || STYLES.plain);
  } else {
    console.log(text);
  }
}

function logGroup(text, style) {
  if (CAN_STYLE_GROUP) {
    console.group('%c' + text, STYLES[style] || STYLES.plain);
  } else if (console.group) {
    console.group(text);
  } else {
    logIndent = logIndent + '  ';
    log(text, style);
  }
}

function logGroupEnd() {
  if (console.groupEnd) {
    console.groupEnd();
  } else {
    logIndent = logIndent.substr(0, logIndent.length - 2);
  }
}

function logException(error) {
  log(error.stack || error.message || (error + ''), 'stack');
}

/**
 * A Mocha reporter that logs results out to the web `console`.
 */
// export default class Console {
class Console {
  /**
   * @param runner The runner that is being reported on.
   */
  constructor(runner) {
    Mocha.reporters.Base.call(this, runner);

    runner.on('suite', function(suite) {
      if (suite.root) {
        return;
      }
      logGroup(suite.title, 'suite');
    }.bind(this));

    runner.on('suite end', function(suite) {
      if (suite.root) {
        return;
      }
      logGroupEnd();
    }.bind(this));

    runner.on('test', function(test) {
      logGroup(test.title, 'test');
    }.bind(this));

    runner.on('pending', function(test) {
      logGroup(test.title, 'pending');
    }.bind(this));

    runner.on('fail', function(_test, error) {
      logException(error);
    }.bind(this));

    runner.on('test end', function(_test) {
      logGroupEnd();
    }.bind(this));

    runner.on('end', this.logSummary.bind(this));
  }

  /** Prints out a final summary of test results. */
  logSummary() {
    logGroup('Test Results', 'results');

    if (this.stats.failures > 0) {
      log(pluralizedStat(this.stats.failures, 'failing'), 'failing');
    }
    if (this.stats.pending > 0) {
      log(pluralizedStat(this.stats.pending, 'pending'), 'pending');
    }
    log(pluralizedStat(this.stats.passes, 'passing'));

    if (!this.stats.failures) {
      log('test suite passed', 'passing');
    }
    log('Evaluated ' + this.stats.tests + ' tests in ' +
        this.stats.duration + 'ms.');
    logGroupEnd();
  }
}

// export default interface Console extends Mocha.reporters.Base {}
window.ConsoleReporter = Console;
}());
