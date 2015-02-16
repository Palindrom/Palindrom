describe("ValidatePatches", function () {


  // Lang helpers
  // copy own properties from 'api' to 'prototype
  function extend(prototype, api) {
    if (prototype && api) {
      // use only own properties of 'api'
      Object.getOwnPropertyNames(api).forEach(function (n) {
        // acquire property descriptor
        var pd = Object.getOwnPropertyDescriptor(api, n);
        if (pd) {
          // clone property via descriptor
          Object.defineProperty(prototype, n, pd);
        }
      });
    }
    return prototype;
  }

  it("should pass empty sequence", function (done) {
    var tree = {
      name: {
        first$: "Elvis",
        last$: "Presley"
      }
    };
    var sequence = [];
    var errors = [];
    //var puppetMock = new Puppet();
    var puppetMock = Object.create(Puppet.prototype);

    puppetMock.debug = true;
    puppetMock.addEventListener('error', function (ev) {
      errors.push(ev);
    });
    puppetMock.validateAndApplySequence(tree, sequence);
    setTimeout(function () {
      expect(errors.length).toBe(0);
      done();
    }, 100);
  });

  it("replacing an unexisting property should cause OPERATION_PATH_UNRESOLVABLE (test built into Fast-JSON-Patch)", function (done) {
    var tree = {
      name: {
        first$: "Elvis",
        last$: "Presley"
      }
    };
    var sequence = [{op: "replace", path: "/address$", value: ""}];
    var puppetMock = Object.create(Puppet.prototype);
    puppetMock.debug = true;
    puppetMock.addEventListener('error', function (ev) {
      expect(ev.error.name).toEqual('OPERATION_PATH_UNRESOLVABLE');
      done();
    });
    puppetMock.validateAndApplySequence(tree, sequence);
  });

  it("should trigger window-observable error event if Puppet is attached to DOM", function (done) {
    var tree = {
      name: {
        first$: "Elvis",
        last$: "Presley"
      }
    };
    var sequence = [{op: "replace", path: "/address$", value: ""}];
    var puppetMock = document.createElement('DIV');
    extend(puppetMock, Puppet.prototype);
    document.body.appendChild(puppetMock);
    puppetMock.debug = true;
    window.addEventListener('error', function (ev) {
      expect(ev.error.name).toEqual('OPERATION_PATH_UNRESOLVABLE');
      document.body.removeChild(puppetMock);
      done();
    });
    puppetMock.validateAndApplySequence(tree, sequence);
  });

  it("should be possible to override validatePatches to add custom validation", function (done) {
    var tree = {
      name: {
        first: "Elvis",
        last: "Presley"
      }
    };
    var sequence = [
      {op: "replace", path: "/name/first", value: "Albert"}
    ];

    var outgoingJsonpatch = Object.create(jsonpatch);
    outgoingJsonpatch.validator = function polyjuicePatchValidator(operation, index, tree, existingPathFragment) {
      jsonpatch.validator.call(outgoingJsonpatch, operation, index, tree, existingPathFragment);

      if (operation.op === "replace") {
        if (operation.path.substr(operation.path.length - 1, 1) !== "$") {
          throw new outgoingJsonpatch.JsonPatchError('Cannot replace a property which name finishes with $ character', 'PUPPET_CANNOT_REPLACE_READONLY', index, operation, tree);
        }
      }
    };

    var customPuppetJs = function () {
      Puppet.apply(this, arguments);
    };
    customPuppetJs.prototype = Object.create(Puppet.prototype);
    customPuppetJs.prototype.validateSequence = function (tree, sequence) {
      var error = outgoingJsonpatch.validate(sequence, tree);
      if (error) {
        error.message = "Outgoing patch validation error: " + error.message;
        var ev = new ErrorEvent("error", {bubbles: true, error: error}); //this needs to be shimmed in IE
        this.dispatchEvent(ev);
      }
    };

    var puppetMock = Object.create(customPuppetJs.prototype);
    puppetMock.debug = true;
    puppetMock.addEventListener('error', function (ev) {
      expect(ev.error.name).toEqual('PUPPET_CANNOT_REPLACE_READONLY');
      done();
    });

    puppetMock.validateSequence(tree, sequence);
  });
});