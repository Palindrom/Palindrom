describe("ValidatePatches", function () {

  it("should pass empty sequence", function (done) {
    var tree = {
      name: {
        first$: "Elvis",
        last$: "Presley"
      }
    };
    var sequence = [];
    var errors = Puppet.prototype.validatePatches(sequence, tree);
    expect(errors.length).toBe(0);
    done();
  });

  it("replacing an unexisting property should cause OPERATION_PATH_UNRESOLVABLE (test built into Fast-JSON-Patch)", function (done) {
    var tree = {
      name: {
        first$: "Elvis",
        last$: "Presley"
      }
    };
    var sequence = [{op: "replace", path: "/address$", value: ""}];
    var errors = Puppet.prototype.validatePatches(sequence, tree);
    expect(errors).toEqual(['OPERATION_PATH_UNRESOLVABLE']);
    done();
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
    outgoingJsonpatch.validator = function polyjuicePatchValidator(operation, tree, currentValue) {
      var error = jsonpatch.validator.call(outgoingJsonpatch, operation, tree, currentValue);
      if (error) {
        return error;
      }

      if (operation.op === "replace") {
        if (operation.path.substr(operation.path.length - 1, 1) !== "$") {
          return 'PUPPET_CANNOT_REPLACE_READONLY';
        }
      }

      return '';
    };

    var customPuppetJs = function () {
      Puppet.apply(this, arguments);
    };
    customPuppetJs.prototype = Object.create(Puppet.prototype);
    customPuppetJs.prototype.validatePatches = function (sequence, tree, isOutgoing) {
      var errors;
      if (isOutgoing) {
        errors = outgoingJsonpatch.validate(sequence, tree);
      }
      else {
        errors = jsonpatch.validate(sequence, tree);
      }

      return errors;
    };

    var errors = customPuppetJs.prototype.validatePatches(sequence, tree, true);
    expect(errors).toEqual(['PUPPET_CANNOT_REPLACE_READONLY']);

    errors = customPuppetJs.prototype.validatePatches(sequence, tree);
    expect(errors.length).toEqual(0);

    errors = Puppet.prototype.validatePatches(sequence, tree);
    expect(errors.length).toEqual(0);

    errors = Puppet.prototype.validatePatches(sequence, tree);
    expect(errors.length).toEqual(0);

    done();
  });
});