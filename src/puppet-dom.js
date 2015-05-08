/*! puppet-dom.js version: 1.0.1
 * (c) 2013 Joachim Wester
 * MIT license
 */

(function (global) {
  /**
   * PuppetDOM
   * @extends {Puppet}
   * @param {Object} [options] options object as in Puppet
   * @param {HTMLElement} [options.listenTo=document.body] HTML node to listen events. 
   */
  var PuppetDOM = function (options){
    options || (options={});
    var onDataReady = options.callback;
    this.element = options.listenTo || document.body;
    var old= this.clickHandler;
    var that =this;
    var clickHandler = this.clickHandler.bind(this);
    var historyHandler = this.historyHandler = this.historyHandler.bind(this);
    var clickAndBlurCallback = this.clickAndBlurCallback = this.clickAndBlurCallback.bind(this);

    //TODO: do not change given object
    options.callback = function addDOMListeners(obj){
      this.listen();
      onDataReady && onDataReady.call(this, obj);
    };
    this.listen = function(){      
      this.listening = true;

      this.element.addEventListener('click', clickHandler);
      window.addEventListener('popstate', this.historyHandler); //better here than in constructor, because Chrome triggers popstate on page load
      this.element.addEventListener('puppet-redirect-pushstate', this.historyHandler);
      this.element.addEventListener('blur', this.clickAndBlurCallback, true);

      this.addShadowRootClickListeners(clickHandler);
    };
    this.unlisten = function(){
      this.listening = false;

      this.element.removeEventListener('click', clickHandler);
      window.removeEventListener('popstate', this.historyHandler); //better here than in constructor, because Chrome triggers popstate on page load
      this.element.removeEventListener('puppet-redirect-pushstate', this.historyHandler);
      this.element.removeEventListener('blur', this.clickAndBlurCallback, true);

      this.removeShadowRootClickListeners(clickHandler);
    };
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
  /**
   * Returns array of shadow roots inside of a element (recursive)
   * @param el
   * @param out (Optional)
   */
  PuppetDOM.prototype.findShadowRoots = function (el, out) {
    if (!out) {
      out = [];
    }
    for (var i = 0, ilen = el.childNodes.length; i < ilen; i++) {
      if (el.childNodes[i].nodeType === 1) {
        var shadowRoot = el.childNodes[i].shadowRoot || el.childNodes[i].polymerShadowRoot_;
        if (shadowRoot) {
          out.push(shadowRoot);
          this.findShadowRoots(shadowRoot, out);
        }
        this.findShadowRoots(el.childNodes[i], out);
      }
    }
    return out;
  };
  function containsInShadow(root, element){
    var parent = element;
    while(parent && root !== parent){
      parent = parent.parentNode || parent.host;
    }

    return root === parent;
  }
  /**
   * Catches clicks in Shadow DOM
   * @see <a href="https://groups.google.com/forum/#!topic/polymer-dev/fDRlCT7nNPU">discussion</a>
   */
  PuppetDOM.prototype.addShadowRootClickListeners = function (clickHandler) {
    //existing shadow roots
    var shadowRoots = this.findShadowRoots(this.element);
    for (var i = 0, ilen = shadowRoots.length; i < ilen; i++) {
      (shadowRoots[i].impl || shadowRoots[i]).addEventListener("click", clickHandler);
    }
    var puppet = this;
    //future shadow roots
    //TODO: move it outside of listen/unlisten, to overwrite it only once.
    var old = Element.prototype.createShadowRoot;
    Element.prototype.createShadowRoot = function () {
      var shadowRoot = old.apply(this, arguments);
      // unwrap in case of WebComponents polyfill
      if(puppet.listening && containsInShadow(puppet.element, unwrap && unwrap(this) || this)){
        shadowRoot.addEventListener("click", clickHandler);
      }
      return shadowRoot;
    };
  };
  /**
   * Catches clicks in Shadow DOM
   * @see <a href="https://groups.google.com/forum/#!topic/polymer-dev/fDRlCT7nNPU">discussion</a>
   */
  PuppetDOM.prototype.removeShadowRootClickListeners = function (clickHandler) {

    //existing shadow roots
    var shadowRoots = this.findShadowRoots(this.element);
    // var shadowRoots = this.findShadowRoots(document.documentElement);
    for (var i = 0, ilen = shadowRoots.length; i < ilen; i++) {
      (shadowRoots[i].impl || shadowRoots[i]).removeEventListener("click", clickHandler);
    }
  };
  PuppetDOM.prototype.clickHandler = function (event) {
    if (event.detail && event.detail.target) {
      //detail is Polymer
      event = event.detail;
    }
    var target = event.target;
    if (target.impl) {
      //impl is Polymer
      target = target.impl;
    }

    if (target.nodeName !== 'A') {
      var parentA = closestHrefParent(target, 'A');
      if (parentA) {
        target = parentA;
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
    else {
      this.clickAndBlurCallback(); //needed for checkbox
    }
  };

  PuppetDOM.prototype.historyHandler = function (/*event*/) {
    this.network.changeState(location.href);
  };

  PuppetDOM.prototype.clickAndBlurCallback = function (ev) {
    if (ev && (ev.target === document.body || ev.target.nodeName === "BODY")) { //Polymer warps ev.target so it is not exactly document.body
      return; //IE triggers blur event on document.body. This is not what we need
    }
    var patches = jsonpatch.generate(this.observer); // calls also observe callback -> #filterChangedCallback
    if(patches.length){
      this.handleLocalChange(patches);
    }
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
  //goes up the DOM tree (including given element) until it finds an element that matches the nodeName
  var closestHrefParent = function (elem) {
    while (elem != null) {
      if (elem.nodeType === 1 && (elem.href || elem.getAttribute('href'))) {
        return elem;
      }
      elem = elem.parentNode;
    }
    return null;
  };

  global.PuppetDOM = PuppetDOM;
})(window);
