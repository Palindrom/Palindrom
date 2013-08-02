(function (global) {

  var lastClickHandler;

  /**
   * Defines a connection to a remote PATCH server, returns callback to a object that is persistent between browser and server
   * @param remoteUrl If undefined, current window.location.href will be used as the PATCH server URL
   * @param callback Called after initial state object is received from the server
   */
  function Puppet(remoteUrl, callback) {
    this.remoteUrl = remoteUrl;
    this.callback = callback;
    this.obj = null;
    this.observer = null;
    this.referer = readCookie("Location");
    eraseCookie("Location");
    this.xhr(this.remoteUrl, 'application/json', null, this.bootstrap.bind(this));
  }

  //http://www.quirksmode.org/js/cookies.html
  function createCookie(name, value, days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
  }

  //http://www.quirksmode.org/js/cookies.html
  function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  //http://www.quirksmode.org/js/cookies.html
  function eraseCookie(name) {
    createCookie(name, "", -1);
  }

  Puppet.prototype.bootstrap = function (event) {
    this.handleResponseHeader(event.target);
    this.obj = JSON.parse(event.target.responseText);
    this.observe();
    if (this.callback) {
      this.callback(this.obj);
    }
    if (lastClickHandler) {
      document.body.removeEventListener('click', lastClickHandler);
    }
    document.body.addEventListener('click', lastClickHandler = this.clickHandler.bind(this));
    window.addEventListener('popstate', this.historyHandler.bind(this)); //better here than in constructor, because Chrome triggers popstate on page load
  };

  Puppet.prototype.handleResponseHeader = function (xhr) {
    var location = xhr.getResponseHeader('Location');
    if (location) {
      this.referer = location;
    }
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
    this.xhr(this.referer || this.remoteUrl, 'application/json-patch+json', JSON.stringify(patches), this.handleRemoteChange.bind(this));
  };

  Puppet.prototype.handleRemoteChange = function (event) {
    this.handleResponseHeader(event.target);
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

  Puppet.prototype.changeState = function (href) {
    this.xhr(href, 'application/json-patch+json', null, this.handleRemoteChange.bind(this));
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
      this.changeState(target.href);
    }
  };

  Puppet.prototype.historyHandler = function (/*event*/) {
    this.changeState(location.href);
  };

  Puppet.prototype.xhr = function (url, accept, data, callback) {
    var req = new XMLHttpRequest();
    req.addEventListener('load', callback, false);
    url = url || window.location.href;
    if (data) {
      req.open("PATCH", url, true);
      req.setRequestHeader('Content-Type', 'application/json-patch+json');
    }
    else {
      req.open("GET", url, true);
    }
    if (accept) {
      req.setRequestHeader('Accept', accept);
    }
    if (this.referer) {
      req.setRequestHeader('X-Referer', this.referer);
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