/*! Palindrom
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */

const Palindrom = require('./palindrom');

const PalindromDOM = (() => {
  /**
   * PalindromDOM
   * @extends {Palindrom}
   * @param {Object} [options] map of arguments. See README.md for description
   */
  class PalindromDOM extends Palindrom {
    constructor(options) {
      if (typeof options !== 'object') {
        throw new Error(
          'PalindromDOM constructor requires an object argument.'
        );
      }
      if (!options.remoteUrl) {
        throw new Error('remoteUrl is required');
      }
      const onStateReset = options.onStateReset || options.callback;
      if (options.callback) {
        console.warn(
          'Palindrom: options.callback is deprecated. Please use `onStateReset` instead'
        );
      }

      options.onStateReset = function addDOMListeners(obj) {
        this.listen();
        onStateReset && onStateReset.call(this, obj);
      };

      // construct Palindrom
      super(options);

      this.element = options.listenTo || document.body;
      this.clickHandler = this.clickHandler.bind(this);
      this.historyHandler = this.historyHandler.bind(this);
      this.morphUrlEventHandler = this.morphUrlEventHandler.bind(this);

      this.historyHandlerDeprecated = () => {
        console.warn(
          "`puppet-redirect-pushstate` event is deprecated, please use `palindrom-redirect-pushstate`, if you're using `puppet-redirect`, please upgrade to `palindrom-redirect`"
        );
        this.historyHandler();
      };

      /* in some cases, people emit redirect requests before `listen` is called */
      this.element.addEventListener(
        'palindrom-redirect-pushstate',
        this.historyHandler
      );

      /* backward compatibility: for people using old puppet-redirect */
      this.element.addEventListener(
        'puppet-redirect-pushstate',
        this.historyHandlerDeprecated
      );
    }

    listen() {
      this.listening = true;
      this.element.addEventListener('click', this.clickHandler);
      window.addEventListener('popstate', this.historyHandler); //better here than in constructor, because Chrome triggers popstate on page load

      this.element.addEventListener(
        'palindrom-morph-url',
        this.morphUrlEventHandler
      );

      this.element.addEventListener(
        'palindrom-redirect-pushstate',
        this.historyHandler
      );

      /* backward compatibility: for people using old puppet-redirect */
      this.element.addEventListener(
        'puppet-redirect-pushstate',
        this.historyHandlerDeprecated
      );
    }
    unlisten() {
      this.listening = false;

      this.element.removeEventListener('click', this.clickHandler);
      window.removeEventListener('popstate', this.historyHandler); //better here than in constructor, because Chrome triggers popstate on page load
      this.element.removeEventListener(
        'palindrom-redirect-pushstate',
        this.historyHandler
      );

      this.element.removeEventListener(
        'palindrom-morph-url',
        this.morphUrlEventHandler
      );

      /* backward compatibility: for people using old puppet-redirect */
      this.element.removeEventListener(
        'puppet-redirect-pushstate',
        this.historyHandlerDeprecated
      );
    }

    //TODO move fallback to window.location.href from PalindromNetworkChannel to here (PalindromDOM)

    /**
     * DISABLED FOR NOW: we don't know when rendering actually finishes.
     * It's left here for the hope of having synchronous rendering at some point in the future.
     * ====
     * we need to scroll asynchronously, because we need the document rendered to search for the anchored element
     * and even though onReceive + applyPatch are sync, Polymer is not, it renders async-ly
    PalindromDOM.prototype.scrollToAnchorOrTopAsync = function(link) {
      this.scrollAsyncTimeout && clearTimeout(this.scrollAsyncTimeout);
      if (window && window.document) {
        var anchorIndex;
        var anchor;
        // does the URL have an anchor
        if (link && (anchorIndex = link.indexOf('#')) > -1) {
          anchor = link.substr(anchorIndex);
        }
        if (!anchor) {
          window.scrollTo(0, 0);
        } else {
          // if somehow someone manages to navigate twice in a 100ms,
          // we don't scroll for their first navigation, i.e de-bouncing

          this.scrollAsyncTimeout = setTimeout(() => {
            // does that anchor exist in the page?
            const anchorTarget = document.querySelector(anchor); // look for #element-id
            if (anchorTarget) {
              anchorTarget.scrollIntoView();
            } else {
              window.scrollTo(0, 0);
            }
          }, 100);
        }
      }
    };
    */
    /**
     * Push a new URL to the browser address bar and send a patch request (empty or including queued local patches)
     * so that the URL handlers can be executed on the remote
     * @param url
     */
    morphUrl(url) {
      history.pushState(null, null, url);
      this.network.getPatchUsingHTTP(url);
      window && window.scrollTo(0, 0);
    }

    /**
     * Handles `palindrom-morph-url` event and channels its `detail.url` to `morphUrl`
     * @param {palindrom-morph-url Event} event 
     */
    morphUrlEventHandler(event) {
      this.morphUrl(event.detail.url);
    }

    clickHandler(event) {
      //Don't morph ctrl/cmd + click & middle mouse button
      if (event.ctrlKey || event.metaKey || event.which == 2) {
        return;
      }

      if (event.detail && event.detail.target) {
        //detail is Polymer
        event = event.detail;
      }

      let target = event.target;

      if (target.nodeName !== 'A') {
        let eventPath = event.composedPath && event.composedPath();
        if(!eventPath) {
          // for backwards compatibility with SDv0
          eventPath = event.path;
        }
        for (let i = 0; i < eventPath.length; i++) {
          if (eventPath[i].nodeName == 'A') {
            target = eventPath[i];
            break;
          }
        }
      }
      const anchorTarget = target.target || target.getAttribute('target');
      const hasDownloadAttribute = target.hasAttribute('download');

      if (!hasDownloadAttribute && (!anchorTarget || anchorTarget === '_self')) {
        //needed since Polymer 0.2.0 in Chrome stable / Web Plaftorm features disabled
        //because target.href returns undefined for <polymer-ui-menu-item href="..."> (which is an error)
        //while target.getAttribute("href") returns desired href (as string)
        const href = target.href || target.getAttribute('href');
        if (href && PalindromDOM.isApplicationLink(href)) {
          event.preventDefault();
          event.stopPropagation();
          this.morphUrl(href);
        } else if (target.type === 'submit') {
          event.preventDefault();
        }
      }
    }

    historyHandler() /*event*/ {
      this.network.getPatchUsingHTTP(location.href);
    }

    /**
     * Returns information if a given element is an internal application link that Palindrom should intercept into a history push
     * @param elem HTMLElement or String
     * @returns {boolean}
     */
    static isApplicationLink(elem) {
      if (typeof elem === 'string') {
        //type string is reported in Polymer / Canary (Web Platform features disabled)
        const parser = document.createElement('A');
        parser.href = elem;

        // @see http://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
        // IE doesn't populate all link properties when setting .href with a relative URL,
        // however .href will return an absolute URL which then can be used on itself
        // to populate these additional fields.
        if (parser.host == '') {
          parser.href = parser.href;
        }

        elem = parser;
      }
      return (
        elem.protocol == window.location.protocol &&
        elem.host == window.location.host
      );
    }
  }

  PalindromDOM.prototype = Object.create(Palindrom.prototype);

  /* backward compatibility, not sure if this is good practice */
  if (typeof global === 'undefined') {
    if (typeof window !== 'undefined') {
      /* incase neither window nor global existed, e.g React Native */
      var global = window;
    } else {
      var global = {};
    }
  }
  global.PuppetDOM = PalindromDOM;

  /* Since we have Palindrom bundled,
  let's expose it in case anyone needs it */
  global.Puppet = Palindrom;
  global.Palindrom = Palindrom;

  return PalindromDOM;
})();

module.exports = PalindromDOM;
module.exports.default = PalindromDOM;
module.exports.__esModule = true;
