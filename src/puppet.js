(function (global) {

  var lastClickHandler;

  /**
   * Defines a connection to a remove URL, returns callback to a object that is persistent between browser and server
   * @param remoteUrl
   * @param callback
   */
  function Puppet(remoteUrl, callback) {
    this.remoteUrl = remoteUrl;
    this.callback = callback;
    this.obj = null;
    this.observer = null;
    this.xhr(remoteUrl, 'application/json', null, this.bootstrap.bind(this));
  }

  Puppet.prototype.bootstrap = function (event) {
    this.obj = JSON.parse(event.target.responseText);
    this.observe();
    this.callback(this.obj);
    if (lastClickHandler) {
      document.body.removeEventListener('click', lastClickHandler);
    }
    document.body.addEventListener('click', lastClickHandler = this.clickHandler.bind(this));
  };

  Puppet.prototype.observe = function () {
    this.observer = jsonpatch.observe(this.obj, this.handleLocalChange.bind(this));
  };

  Puppet.prototype.unobserve = function () {
    if (this.observer) { //there is a bug in JSON-Patch when trying to unobserve something that is already unobserved
      jsonpatch.unobserve(this.obj, this.observer);
      this.observer = null;
    }
  };

  Puppet.prototype.handleLocalChange = function (patches) {
    this.xhr(this.remoteUrl, 'application/json-patch+json', JSON.stringify(patches), this.handleRemoteChange.bind(this));
  };

  Puppet.prototype.handleRemoteChange = function (event) {
    var patches = JSON.parse(event.target.responseText);
    this.unobserve();
    jsonpatch.apply(this.obj, patches);
    this.observe();
    if (this.onRemoteChange) {
      this.onRemoteChange(patches);
    }
  };

  Puppet.prototype.isApplicationLink = function (href) {
    return (href.protocol == window.location.protocol && href.host == window.location.host);
  };

  Puppet.prototype.clickHandler = function (event) {
    var target = event.target;
    if (window.PuppetExternalLink) {
      target = window.PuppetExternalLink;
      window.PuppetExternalLink = null;
    }
    if (target.href && this.isApplicationLink(target)) {
      event.preventDefault();
      history.pushState(null, null, target.href);
      this.xhr(target.href, 'application/json-patch+json', null, this.handleRemoteChange.bind(this));
    }
  };

  Puppet.prototype.xhr = function (url, accept, data, callback) {
    var req = new XMLHttpRequest();
    req.addEventListener('load', callback, false);
    req.open("GET", url, true);
    if (accept) {
      req.setRequestHeader('Accept', accept);
    }
    req.send(data);
  };

  Puppet.prototype.catchExternaLink = function (element) {
    element.addEventListener("click", function (event) {
      window.PuppetExternalLink = event.target;
    });
  };

  global.Puppet = Puppet;
})(window);