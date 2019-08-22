/*! Palindrom
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */
import { Palindrom } from './palindrom.js'

class AbortError extends Error {};

    /** scroll to coordiates and return if the scroll was successful */
    function attemptScroll(x, y) {
        scrollTo(x, y);
        return window.scrollX === x && window.scrollY === y;
    }

    async function sleep(duration) {
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

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

            this.element = options.listenTo || document;
            this.clickHandler = this.clickHandler.bind(this);
            this.historyHandler = this.historyHandler.bind(this);

            this.morphUrlEventHandler = this.morphUrlEventHandler.bind(this);
            this._scrollWatcher = this._scrollWatcher.bind(this);

            /* in some cases, people emit redirect requests before `listen` is called */
            this.element.addEventListener(
                'palindrom-redirect-pushstate',
                this.morphUrlEventHandler
            );

            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }
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
                this.morphUrlEventHandler
            );

            this._watchingScroll();
        }
        _watchingScroll() {
            window.addEventListener('scroll', this._scrollWatcher);
        }
        _unwatchingScroll() {
            window.removeEventListener('scroll', this._scrollWatcher);
        }
        _scrollWatcher() {
            // do not record self created scroll events
            if(this._attemptingScroll) {
                return;
            }
            clearTimeout(this._scrollDebounceTimeout);
            this._scrollDebounceTimeout = setTimeout(() => {
                history.replaceState([window.scrollX, window.scrollY], null);
            }, 20);
        }
        unlisten() {
            this.listening = false;

            this.element.removeEventListener('click', this.clickHandler);
            window.removeEventListener('popstate', this.historyHandler); //better here than in constructor, because Chrome triggers popstate on page load
            this.element.removeEventListener(
                'palindrom-redirect-pushstate',
                this.morphUrlEventHandler
            );

            this.element.removeEventListener(
                'palindrom-morph-url',
                this.morphUrlEventHandler
            );
            this._unwatchingScroll();
        }

        /**
         * @param {String} href
         * @throws {Error} network error if occured or the `palindrom-before-redirect` was cancelled by calling event.preventDefault()
         * @fires Palindrom#palindrom-before-redirect
         * @fires Palindrom#palindrom-after-redirect
         * @returns {Promise<Object>} JSON response
         */
        async getPatchUsingHTTP(href) {
            /**
             * palindrom-before-redirect event.
             *
             * @event Palindrom#palindrom-before-redirect
             * @type {CustomEvent}
             * @property {Object} detail containing `href` property that contains the URL
             */
            const beforeEvent = new CustomEvent('palindrom-before-redirect', {
                detail: {
                    href
                },
                cancelable: true,
                bubbles: true
            });

            this.element.dispatchEvent(beforeEvent);

            if (beforeEvent.defaultPrevented) {
                throw new AbortError(
                    '`getPatchUsingHTTP` was aborted by cancelling `palindrom-before-redirect` event.'
                );
            }

            const data = await this.network.getPatchUsingHTTP(href);
            let detail = { href, data };

            /**
             * palindrom-after-redirect event
             *
             * @event Palindrom#palindrom-after-redirect
             * @type {CustomEvent}
             * @property {Object} detail containing `href: String` and `data: Object`
             */
            const afterEvent = new CustomEvent('palindrom-after-redirect', {
                detail,
                bubbles: true
            });

            this.element.dispatchEvent(afterEvent);
            return data;
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
         * @returns {boolean} true if morphing was successful
         */
        async morphUrl(url) {
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;
            try {
                const res = await this.getPatchUsingHTTP(url);
                if (res) {
                    // mark current state's scroll position
                    history.replaceState(
                        [scrollX, scrollY],
                        null,
                        window.location.href
                    );

                    // push a new state with the new position
                    history.pushState([0, 0], null, url);

                    // scroll it!
                    scrollTo(0, 0);
                    return true;
                }
            } catch (error) {
                if (error instanceof AbortError) {
                    return false;
                }
                throw new Error(`HTTP request failed, error message: ${error.message}`);
            }
        }
        /**
         * Handles `palindrom-morph-url` event and channels its `detail.url` to `morphUrl`
         * @param {palindrom-morph-url Event} event
         */
        morphUrlEventHandler(event) {
            return this.morphUrl(event.detail.url);
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
                if (!eventPath) {
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

            if (
                !hasDownloadAttribute &&
                (!anchorTarget || anchorTarget === '_self')
            ) {
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
        async historyHandler(event) {
            await this.getPatchUsingHTTP(location.href);
            const [scrollX, scrollY] = event.state || [0, 0];

            // flag if the user has scrolled, not our own code
            let userHadScrolled = false;

            // flag if this code it scrolling, not the user
            this._attemptingScroll = false;

            // if this handler is called && we're not attemptingScroll, then the user has scrolled!
            const scrollHandler = () => (userHadScrolled = !this._attemptingScroll);
            window.addEventListener('scroll', scrollHandler);

            // give the user a chance to cancel history scrolling by scrolling on their own (eg momentum mouse wheel)
            await sleep(30);

            for (let i = 0; i < 30 && !userHadScrolled; i++) {
                // prevent our scroll attempt from setting `hadScrolled`
                this._attemptingScroll = true;
                const scrollSucceeded = attemptScroll(scrollX, scrollY);
                this._attemptingScroll = false;
                if (scrollSucceeded) {
                    break;
                } else {
                    await sleep(30);
                }
            }
            window.removeEventListener('scroll', scrollHandler);
        }

        /**
         * Stops all networking, stops listeners, heartbeats, etc.
         * @see Palindrom.stop
         * @see .unlisten()
         */
        stop(){
            this.unlisten();
            super.stop(...arguments);
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
export {Palindrom, PalindromDOM};