/*! puppet-dom.js version: 2.5.2
 * (c) 2013 Joachim Wester
 * MIT license
 */

(function (global) {
  /**
   * PuppetDOM
   * @extends {Puppet}
   * @param {Object} [options] map of arguments. See README.md for description
   */
  var PuppetDOM = function (options){
    options || (options={});
    var onDataReady = options.callback;
    this.element = options.listenTo || document.body;
    var clickHandler = this.clickHandler.bind(this);
    this.historyHandler = this.historyHandler.bind(this);

    /* no need to wait for data to be ready to handle the event */
    this.element.addEventListener('puppet-redirect-pushstate', this.historyHandler);

    options.callback = function addDOMListeners(obj){
      this.listen();
      onDataReady && onDataReady.call(this, obj);
    };
    this.listen = function(){
      this.listening = true;

      this.element.addEventListener('puppet-redirect-pushstate', this.historyHandler);
      this.element.addEventListener('click', clickHandler);
      window.addEventListener('popstate', this.historyHandler); //better here than in constructor, because Chrome triggers popstate on page load
    };
    this.unlisten = function(){
      this.listening = false;

      this.element.removeEventListener('click', clickHandler);
      window.removeEventListener('popstate', this.historyHandler); //better here than in constructor, because Chrome triggers popstate on page load
      this.element.removeEventListener('puppet-redirect-pushstate', this.historyHandler);
    };
    //TODO move fallback to window.location.href from PuppetNetworkChannel to here (PuppetDOM)
    Puppet.call(this, options);
  };
  PuppetDOM.prototype = Object.create(Puppet.prototype);

  /**
   * Push a new URL to the browser address bar and send a patch request (empty or including queued local patches)
   * so that the URL handlers can be executed on the remote
   * @param url
   */
  PuppetDOM.prototype.morphUrl = function (url) {
    history.pushState(null, null, url);
    this.network.changeState(url);
  };

  PuppetDOM.prototype.clickHandler = function (event) {
    //Don't morph ctrl/cmd + click & middle mouse button
    if (event.ctrlKey || event.metaKey || event.which == 2) {
      return;
    }

    if (event.detail && event.detail.target) {
      //detail is Polymer
      event = event.detail;
    }

    var target = event.target;

    if (target.nodeName !== 'A') {
        for (var i = 0; i < event.path.length; i++) {
            if (event.path[i].nodeName == "A") {
                target = event.path[i];
                break;
            }
        }
    }

    //needed since Polymer 0.2.0 in Chrome stable / Web Plaftorm features disabled
    //because target.href returns undefined for <polymer-ui-menu-item href="..."> (which is an error)
    //while target.getAttribute("href") returns desired href (as string)
    var href = target.href || target.getAttribute("href");

    if (href && PuppetDOM.isApplicationLink(href)) {
      event.preventDefault();
      event.stopPropagation();
      this.morphUrl(href);
    }
    else if (target.type === 'submit') {
      event.preventDefault();
    }
  };

  PuppetDOM.prototype.historyHandler = function (/*event*/) {
    this.network.changeState(location.href);
  };

  /**
   * Returns information if a given element is an internal application link that PuppetJS should intercept into a history push
   * @param elem HTMLElement or String
   * @returns {boolean}
   */
  PuppetDOM.isApplicationLink = function (elem) {
    if (typeof elem === 'string') {
      //type string is reported in Polymer / Canary (Web Platform features disabled)
      var parser = document.createElement('A');
      parser.href = elem;

      // @see http://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
      // IE doesn't populate all link properties when setting .href with a relative URL,
      // however .href will return an absolute URL which then can be used on itself
      // to populate these additional fields.
      if (parser.host == "") {
        parser.href = parser.href;
      }

      elem = parser;
    }
    return (elem.protocol == window.location.protocol && elem.host == window.location.host);
  };

  global.PuppetDOM = PuppetDOM;
})(window);
