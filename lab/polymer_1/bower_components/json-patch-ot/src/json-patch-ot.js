(function(scope){
  var JSONPatchOT = scope.JSONPatchOT || {};
  JSONPatchOT.transform = function (sequenceA, sequences) {
    var concatAllSequences = [];
    concatAllSequences = concatAllSequences.concat.apply(concatAllSequences, sequences);
    // var clonedPatch = JSON.parse(JSON.stringify(this.patch)); // clone needed for debugging and visualization
    var clonedPatch = JSON.parse(JSON.stringify(sequenceA)); // clone needed for debugging and visualization
    var result = concatAllSequences.reduce(composeJSONPatches, clonedPatch); // <=> composeJSONPatches(this, operations.concat() )
    return result;
    // return new JSONPatchOperation(result, this.localRevision, operations[operations.length-1].localRevision, this.localRevPropName, this.remoteRevPropName);
  };
  JSONPatchOT.transformAgainstSingleOp = function(sequenceA, operationObj){

  };
  var composeJSONPatches = function( original, operationObj ){

      // basic validation (as in fast-json-patch)
      if (operationObj.value === undefined && (operationObj.op === "add" || operationObj.op === "replace" || operationObj.op === "test")) {
          throw new Error("'value' MUST be defined");
      }
      if (operationObj.from === undefined && (operationObj.op === "copy" || operationObj.op === "move")) {
          throw new Error("'from' MUST be defined");
      }

      // apply patch operation to all original ops
      if(transformAgainst[operationObj.op]){ // if we have any function to transform operationObj.op at all
        if(typeof transformAgainst[operationObj.op] == "function"){ //not perfectly performant but gives easier maintenance and flexibility with transformations
          transformAgainst[operationObj.op](operationObj, original);
        } else {
          var orgOpsLen = original.length, currentOp = 0;
          while (currentOp < orgOpsLen) {
            var originalOp = original[currentOp];
            currentOp++;

            if( transformAgainst[operationObj.op][originalOp.op] ){
              transformAgainst[operationObj.op][originalOp.op](operationObj, originalOp)
            } else{
              console.log("No function to transform " + originalOp.op + "against" + operationObj.op);
            }
          }
        }
      } else {
        console.log("No function to transform against " + operationObj.op)
      }
      return original;
    };
    var transformAgainst = {
      remove: function(patchOp, original){
        console.log("Transforming ", JSON.stringify(original) ," against `remove` ", patchOp);
        var orgOpsLen = original.length, currentOp = 0, originalOp;
        // remove operation objects
        while (originalOp = original[currentOp]) {


          // TODO: `move`, and `copy` (`from`) may not be covered well (tomalec)
          console.log("TODO: `move`, and `copy` (`from`) may not be covered well (tomalec)");
          if( (originalOp.op === 'add' || originalOp.op === 'test') && patchOp.path === originalOp.path ){
            // do nothing ? (tomalec)
          } else 
          // node in question was removed
          if( originalOp.from && 
                  (originalOp.from === patchOp.path || originalOp.from.indexOf(patchOp.path + "/") === 0 ) ||
              ( patchOp.path === originalOp.path || originalOp.path.indexOf(patchOp.path + "/") === 0 ) ){
            console.log("Removing ", originalOp);
            original.splice(currentOp,1);
            orgOpsLen--;
            currentOp--;
          } 
          currentOp++;
        }
        // shift indexes
        // var match = patchOp.path.match(/(.*\/)(\d+)$/); // last element is a number
        var lastSlash = patchOp.path.lastIndexOf("/");
        if( lastSlash > -1){
          var index = patchOp.path.substr(lastSlash+1);
          var arrayPath = patchOp.path.substr(0,lastSlash+1);
          if( isValidIndex(index)){
            console.warn("Bug prone guessing that, as number given in path, this is an array!");

            console.log("Shifting array indexes");
            orgOpsLen = original.length;
            currentOp = 0;
            while (currentOp < orgOpsLen) {
              originalOp = original[currentOp];
              currentOp++;

              if(originalOp.path.indexOf(arrayPath) === 0){//item from the same array
                originalOp.path = replacePathIfHigher(originalOp.path, arrayPath, index);
              }
              if(originalOp.from && originalOp.from.indexOf(arrayPath) === 0){//item from the same array
                originalOp.from = replacePathIfHigher(originalOp.from, arrayPath, index);
              }
            }
          }
        }

      },
      replace: function(patchOp, original){
        console.log("Transforming ", JSON.stringify(original) ," against `replace` ", patchOp);
        var currentOp = 0, originalOp;
        // remove operation objects withing replaced JSON node
        while (originalOp = original[currentOp]) {


          // TODO: `move`, and `copy` (`from`) may not be covered well (tomalec)
          console.log("TODO: `move`, and `copy` (`from`) may not be covered well (tomalec)");
          // node in question was removed
          // IT:
          // if( patchOp.path === originalOp.path || originalOp.path.indexOf(patchOp.path + "/") === 0 ){
          if( originalOp.from && 
                  (originalOp.from === patchOp.path || originalOp.from.indexOf(patchOp.path + "/") === 0 ) ||
              originalOp.path.indexOf(patchOp.path + "/") === 0 ){
            console.log("Removing ", originalOp);
            original.splice(currentOp,1);
            currentOp--;
          } 
          currentOp++;
        }
        
      }
    };
    function replacePathIfHigher(path, repl, index){
      var result = path.substr(repl.length);
      // var match = result.match(/^(\d+)(.*)/);
      // if(match && match[1] > index){
      var eoindex = result.indexOf("/");
      eoindex > -1 || (eoindex = result.length);
      var oldIndex = result.substr(0, eoindex);
      var rest  = result.substr(eoindex);
      if(isValidIndex(oldIndex) && oldIndex > index){
        return repl + (oldIndex -1) + rest;
      } else {
        return path;
      }
    }
    function isValidIndex(str) {
        var n = ~~Number(str);
        return String(n) === str && n >= 0;
    }
    scope.JSONPatchOT = JSONPatchOT;
}(window));