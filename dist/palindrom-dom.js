/*! Palindrom, version: 5.0.0 */
var PalindromDOM =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(6);

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  typeof document.createElement -> undefined
 */
function isStandardBrowserEnv() {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof document.createElement === 'function'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object' && !isArray(obj)) {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};


/***/ }),
/* 1 */
/***/ (function(module, exports) {

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/*!
 * https://github.com/Starcounter-Jack/JSON-Patch
 * (c) 2017 Joachim Wester
 * MIT license
 */
var _hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(obj, key) {
    return _hasOwnProperty.call(obj, key);
}
exports.hasOwnProperty = hasOwnProperty;
function _objectKeys(obj) {
    if (Array.isArray(obj)) {
        var keys = new Array(obj.length);
        for (var k = 0; k < keys.length; k++) {
            keys[k] = "" + k;
        }
        return keys;
    }
    if (Object.keys) {
        return Object.keys(obj);
    }
    var keys = [];
    for (var i in obj) {
        if (hasOwnProperty(obj, i)) {
            keys.push(i);
        }
    }
    return keys;
}
exports._objectKeys = _objectKeys;
;
/**
* Deeply clone the object.
* https://jsperf.com/deep-copy-vs-json-stringify-json-parse/25 (recursiveDeepCopy)
* @param  {any} obj value to clone
* @return {any} cloned obj
*/
function _deepClone(obj) {
    switch (typeof obj) {
        case "object":
            return JSON.parse(JSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
        case "undefined":
            return null; //this is how JSON.stringify behaves for array items
        default:
            return obj; //no need to clone primitives
    }
}
exports._deepClone = _deepClone;
//3x faster than cached /^\d+$/.test(str)
function isInteger(str) {
    var i = 0;
    var len = str.length;
    var charCode;
    while (i < len) {
        charCode = str.charCodeAt(i);
        if (charCode >= 48 && charCode <= 57) {
            i++;
            continue;
        }
        return false;
    }
    return true;
}
exports.isInteger = isInteger;
/**
* Escapes a json pointer path
* @param path The raw pointer
* @return the Escaped path
*/
function escapePathComponent(path) {
    if (path.indexOf('/') === -1 && path.indexOf('~') === -1)
        return path;
    return path.replace(/~/g, '~0').replace(/\//g, '~1');
}
exports.escapePathComponent = escapePathComponent;
/**
 * Unescapes a json pointer path
 * @param path The escaped pointer
 * @return The unescaped path
 */
function unescapePathComponent(path) {
    return path.replace(/~1/g, '/').replace(/~0/g, '~');
}
exports.unescapePathComponent = unescapePathComponent;
function _getPathRecursive(root, obj) {
    var found;
    for (var key in root) {
        if (hasOwnProperty(root, key)) {
            if (root[key] === obj) {
                return escapePathComponent(key) + '/';
            }
            else if (typeof root[key] === 'object') {
                found = _getPathRecursive(root[key], obj);
                if (found != '') {
                    return escapePathComponent(key) + '/' + found;
                }
            }
        }
    }
    return '';
}
exports._getPathRecursive = _getPathRecursive;
function getPath(root, obj) {
    if (root === obj) {
        return '/';
    }
    var path = _getPathRecursive(root, obj);
    if (path === '') {
        throw new Error("Object not found in root");
    }
    return '/' + path;
}
exports.getPath = getPath;
/**
* Recursively checks whether an object has any undefined values inside.
*/
function hasUndefined(obj) {
    if (obj === undefined) {
        return true;
    }
    if (obj) {
        if (Array.isArray(obj)) {
            for (var i = 0, len = obj.length; i < len; i++) {
                if (hasUndefined(obj[i])) {
                    return true;
                }
            }
        }
        else if (typeof obj === "object") {
            var objKeys = _objectKeys(obj);
            var objKeysLength = objKeys.length;
            for (var i = 0; i < objKeysLength; i++) {
                if (hasUndefined(obj[objKeys[i]])) {
                    return true;
                }
            }
        }
    }
    return false;
}
exports.hasUndefined = hasUndefined;
var PatchError = (function (_super) {
    __extends(PatchError, _super);
    function PatchError(message, name, index, operation, tree) {
        _super.call(this, message);
        this.message = message;
        this.name = name;
        this.index = index;
        this.operation = operation;
        this.tree = tree;
    }
    return PatchError;
}(Error));
exports.PatchError = PatchError;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * version: 3.0.0-rc.0
 */
var queue = __webpack_require__(19);
var sync = __webpack_require__(20);

module.exports = { JSONPatchQueue: queue, JSONPatchQueueSynchronous: sync, /* Babel demands this */__esModule:  true };


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var utils = __webpack_require__(0);
var normalizeHeaderName = __webpack_require__(27);

var PROTECTION_PREFIX = /^\)\]\}',?\n/;
var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(8);
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = __webpack_require__(8);
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      data = data.replace(PROTECTION_PREFIX, '');
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMehtodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var pSlice = Array.prototype.slice;
var objectKeys = __webpack_require__(16);
var isArguments = __webpack_require__(17);

var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var equalsOptions = { strict: true };
var _equals = __webpack_require__(4);
var areEquals = function (a, b) {
    return _equals(a, b, equalsOptions);
};
var helpers_1 = __webpack_require__(1);
exports.JsonPatchError = helpers_1.PatchError;
exports.deepClone = helpers_1._deepClone;
/* We use a Javascript hash to store each
 function. Each hash entry (property) uses
 the operation identifiers specified in rfc6902.
 In this way, we can map each patch operation
 to its dedicated function in efficient way.
 */
/* The operations applicable to an object */
var objOps = {
    add: function (obj, key, document) {
        obj[key] = this.value;
        return { newDocument: document };
    },
    remove: function (obj, key, document) {
        var removed = obj[key];
        delete obj[key];
        return { newDocument: document, removed: removed };
    },
    replace: function (obj, key, document) {
        var removed = obj[key];
        obj[key] = this.value;
        return { newDocument: document, removed: removed };
    },
    move: function (obj, key, document) {
        /* in case move target overwrites an existing value,
        return the removed value, this can be taxing performance-wise,
        and is potentially unneeded */
        var removed = getValueByPointer(document, this.path);
        if (removed) {
            removed = helpers_1._deepClone(removed);
        }
        var originalValue = applyOperation(document, { op: "remove", path: this.from }).removed;
        applyOperation(document, { op: "add", path: this.path, value: originalValue });
        return { newDocument: document, removed: removed };
    },
    copy: function (obj, key, document) {
        var valueToCopy = getValueByPointer(document, this.from);
        // enforce copy by value so further operations don't affect source (see issue #177)
        applyOperation(document, { op: "add", path: this.path, value: helpers_1._deepClone(valueToCopy) });
        return { newDocument: document };
    },
    test: function (obj, key, document) {
        return { newDocument: document, test: areEquals(obj[key], this.value) };
    },
    _get: function (obj, key, document) {
        this.value = obj[key];
        return { newDocument: document };
    }
};
/* The operations applicable to an array. Many are the same as for the object */
var arrOps = {
    add: function (arr, i, document) {
        if (helpers_1.isInteger(i)) {
            arr.splice(i, 0, this.value);
        }
        else {
            arr[i] = this.value;
        }
        // this may be needed when using '-' in an array
        return { newDocument: document, index: i };
    },
    remove: function (arr, i, document) {
        var removedList = arr.splice(i, 1);
        return { newDocument: document, removed: removedList[0] };
    },
    replace: function (arr, i, document) {
        var removed = arr[i];
        arr[i] = this.value;
        return { newDocument: document, removed: removed };
    },
    move: objOps.move,
    copy: objOps.copy,
    test: objOps.test,
    _get: objOps._get
};
/**
 * Retrieves a value from a JSON document by a JSON pointer.
 * Returns the value.
 *
 * @param document The document to get the value from
 * @param pointer an escaped JSON pointer
 * @return The retrieved value
 */
function getValueByPointer(document, pointer) {
    if (pointer == '') {
        return document;
    }
    var getOriginalDestination = { op: "_get", path: pointer };
    applyOperation(document, getOriginalDestination);
    return getOriginalDestination.value;
}
exports.getValueByPointer = getValueByPointer;
/**
 * Apply a single JSON Patch Operation on a JSON document.
 * Returns the {newDocument, result} of the operation.
 * It modifies the `document` and `operation` objects - it gets the values by reference.
 * If you would like to avoid touching your values, clone them:
 * `jsonpatch.applyOperation(document, jsonpatch._deepClone(operation))`.
 *
 * @param document The document to patch
 * @param operation The operation to apply
 * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
 * @param mutateDocument Whether to mutate the original document or clone it before applying
 * @return `{newDocument, result}` after the operation
 */
function applyOperation(document, operation, validateOperation, mutateDocument) {
    if (validateOperation === void 0) { validateOperation = false; }
    if (mutateDocument === void 0) { mutateDocument = true; }
    if (validateOperation) {
        if (typeof validateOperation == 'function') {
            validateOperation(operation, 0, document, operation.path);
        }
        else {
            validator(operation, 0);
        }
    }
    /* ROOT OPERATIONS */
    if (operation.path === "") {
        var returnValue = { newDocument: document };
        if (operation.op === 'add') {
            returnValue.newDocument = operation.value;
            return returnValue;
        }
        else if (operation.op === 'replace') {
            returnValue.newDocument = operation.value;
            returnValue.removed = document; //document we removed
            return returnValue;
        }
        else if (operation.op === 'move' || operation.op === 'copy') {
            returnValue.newDocument = getValueByPointer(document, operation.from); // get the value by json-pointer in `from` field
            if (operation.op === 'move') {
                returnValue.removed = document;
            }
            return returnValue;
        }
        else if (operation.op === 'test') {
            returnValue.test = areEquals(document, operation.value);
            if (returnValue.test === false) {
                throw new exports.JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', 0, operation, document);
            }
            returnValue.newDocument = document;
            return returnValue;
        }
        else if (operation.op === 'remove') {
            returnValue.removed = document;
            returnValue.newDocument = null;
            return returnValue;
        }
        else if (operation.op === '_get') {
            operation.value = document;
            return returnValue;
        }
        else {
            if (validateOperation) {
                throw new exports.JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', 0, operation, document);
            }
            else {
                return returnValue;
            }
        }
    } /* END ROOT OPERATIONS */
    else {
        if (!mutateDocument) {
            document = helpers_1._deepClone(document);
        }
        var path = operation.path || "";
        var keys = path.split('/');
        var obj = document;
        var t = 1; //skip empty element - http://jsperf.com/to-shift-or-not-to-shift
        var len = keys.length;
        var existingPathFragment = undefined;
        var key = void 0;
        var validateFunction = void 0;
        if (typeof validateOperation == 'function') {
            validateFunction = validateOperation;
        }
        else {
            validateFunction = validator;
        }
        while (true) {
            key = keys[t];
            if (validateOperation) {
                if (existingPathFragment === undefined) {
                    if (obj[key] === undefined) {
                        existingPathFragment = keys.slice(0, t).join('/');
                    }
                    else if (t == len - 1) {
                        existingPathFragment = operation.path;
                    }
                    if (existingPathFragment !== undefined) {
                        validateFunction(operation, 0, document, existingPathFragment);
                    }
                }
            }
            t++;
            if (Array.isArray(obj)) {
                if (key === '-') {
                    key = obj.length;
                }
                else {
                    if (validateOperation && !helpers_1.isInteger(key)) {
                        throw new exports.JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", 0, operation.path, operation);
                    } // only parse key when it's an integer for `arr.prop` to work
                    else if (helpers_1.isInteger(key)) {
                        key = ~~key;
                    }
                }
                if (t >= len) {
                    if (validateOperation && operation.op === "add" && key > obj.length) {
                        throw new exports.JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", 0, operation.path, operation);
                    }
                    var returnValue = arrOps[operation.op].call(operation, obj, key, document); // Apply patch
                    if (returnValue.test === false) {
                        throw new exports.JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', 0, operation, document);
                    }
                    return returnValue;
                }
            }
            else {
                if (key && key.indexOf('~') != -1) {
                    key = helpers_1.unescapePathComponent(key);
                }
                if (t >= len) {
                    var returnValue = objOps[operation.op].call(operation, obj, key, document); // Apply patch
                    if (returnValue.test === false) {
                        throw new exports.JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', 0, operation, document);
                    }
                    return returnValue;
                }
            }
            obj = obj[key];
        }
    }
}
exports.applyOperation = applyOperation;
/**
 * Apply a full JSON Patch array on a JSON document.
 * Returns the {newDocument, result} of the patch.
 * It modifies the `document` object and `patch` - it gets the values by reference.
 * If you would like to avoid touching your values, clone them:
 * `jsonpatch.applyPatch(document, jsonpatch._deepClone(patch))`.
 *
 * @param document The document to patch
 * @param patch The patch to apply
 * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
 * @param mutateDocument Whether to mutate the original document or clone it before applying
 * @return An array of `{newDocument, result}` after the patch
 */
function applyPatch(document, patch, validateOperation, mutateDocument) {
    if (mutateDocument === void 0) { mutateDocument = true; }
    if (validateOperation) {
        if (!Array.isArray(patch)) {
            throw new exports.JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
        }
    }
    if (!mutateDocument) {
        document = helpers_1._deepClone(document);
    }
    var results = new Array(patch.length);
    for (var i = 0, length_1 = patch.length; i < length_1; i++) {
        results[i] = applyOperation(document, patch[i], validateOperation);
        document = results[i].newDocument; // in case root was replaced
    }
    results.newDocument = document;
    return results;
}
exports.applyPatch = applyPatch;
/**
 * Apply a single JSON Patch Operation on a JSON document.
 * Returns the updated document.
 * Suitable as a reducer.
 *
 * @param document The document to patch
 * @param operation The operation to apply
 * @return The updated document
 */
function applyReducer(document, operation) {
    var operationResult = applyOperation(document, operation);
    if (operationResult.test === false) {
        throw new exports.JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', 0, operation, document);
    }
    return operationResult.newDocument;
}
exports.applyReducer = applyReducer;
/**
 * Validates a single operation. Called from `jsonpatch.validate`. Throws `JsonPatchError` in case of an error.
 * @param {object} operation - operation object (patch)
 * @param {number} index - index of operation in the sequence
 * @param {object} [document] - object where the operation is supposed to be applied
 * @param {string} [existingPathFragment] - comes along with `document`
 */
function validator(operation, index, document, existingPathFragment) {
    if (typeof operation !== 'object' || operation === null || Array.isArray(operation)) {
        throw new exports.JsonPatchError('Operation is not an object', 'OPERATION_NOT_AN_OBJECT', index, operation, document);
    }
    else if (!objOps[operation.op]) {
        throw new exports.JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', index, operation, document);
    }
    else if (typeof operation.path !== 'string') {
        throw new exports.JsonPatchError('Operation `path` property is not a string', 'OPERATION_PATH_INVALID', index, operation, document);
    }
    else if (operation.path.indexOf('/') !== 0 && operation.path.length > 0) {
        // paths that aren't empty string should start with "/"
        throw new exports.JsonPatchError('Operation `path` property must start with "/"', 'OPERATION_PATH_INVALID', index, operation, document);
    }
    else if ((operation.op === 'move' || operation.op === 'copy') && typeof operation.from !== 'string') {
        throw new exports.JsonPatchError('Operation `from` property is not present (applicable in `move` and `copy` operations)', 'OPERATION_FROM_REQUIRED', index, operation, document);
    }
    else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && operation.value === undefined) {
        throw new exports.JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_REQUIRED', index, operation, document);
    }
    else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && helpers_1.hasUndefined(operation.value)) {
        throw new exports.JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED', index, operation, document);
    }
    else if (document) {
        if (operation.op == "add") {
            var pathLen = operation.path.split("/").length;
            var existingPathLen = existingPathFragment.split("/").length;
            if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
                throw new exports.JsonPatchError('Cannot perform an `add` operation at the desired path', 'OPERATION_PATH_CANNOT_ADD', index, operation, document);
            }
        }
        else if (operation.op === 'replace' || operation.op === 'remove' || operation.op === '_get') {
            if (operation.path !== existingPathFragment) {
                throw new exports.JsonPatchError('Cannot perform the operation at a path that does not exist', 'OPERATION_PATH_UNRESOLVABLE', index, operation, document);
            }
        }
        else if (operation.op === 'move' || operation.op === 'copy') {
            var existingValue = { op: "_get", path: operation.from, value: undefined };
            var error = validate([existingValue], document);
            if (error && error.name === 'OPERATION_PATH_UNRESOLVABLE') {
                throw new exports.JsonPatchError('Cannot perform the operation from a path that does not exist', 'OPERATION_FROM_UNRESOLVABLE', index, operation, document);
            }
        }
    }
}
exports.validator = validator;
/**
 * Validates a sequence of operations. If `document` parameter is provided, the sequence is additionally validated against the object document.
 * If error is encountered, returns a JsonPatchError object
 * @param sequence
 * @param document
 * @returns {JsonPatchError|undefined}
 */
function validate(sequence, document, externalValidator) {
    try {
        if (!Array.isArray(sequence)) {
            throw new exports.JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
        }
        if (document) {
            //clone document and sequence so that we can safely try applying operations
            applyPatch(helpers_1._deepClone(document), helpers_1._deepClone(sequence), externalValidator || true);
        }
        else {
            externalValidator = externalValidator || validator;
            for (var i = 0; i < sequence.length; i++) {
                externalValidator(sequence[i], i, document, undefined);
            }
        }
    }
    catch (e) {
        if (e instanceof exports.JsonPatchError) {
            return e;
        }
        else {
            throw e;
        }
    }
}
exports.validate = validate;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),
/* 7 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var utils = __webpack_require__(0);
var settle = __webpack_require__(28);
var buildURL = __webpack_require__(30);
var parseHeaders = __webpack_require__(31);
var isURLSameOrigin = __webpack_require__(32);
var createError = __webpack_require__(9);
var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || __webpack_require__(33);

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if (process.env.NODE_ENV !== 'test' &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED'));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = __webpack_require__(34);

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        if (request.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var enhanceError = __webpack_require__(29);

/**
 * Create an Error with the specified message, config, error code, and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 @ @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, response);
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

/*! Palindrom
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */

const Palindrom = __webpack_require__(13);

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

      /* in some cases, people emit redirect requests before `listen` is called */
      this.element.addEventListener(
        'palindrom-redirect-pushstate',
        this.historyHandler
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
  
  return PalindromDOM;
})();

module.exports = PalindromDOM;
module.exports.default = PalindromDOM;
module.exports.__esModule = true;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/*! Palindrom 
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */

/* this variable is bumped automatically when you call npm version */
const palindromVersion = '5.0.0';

const CLIENT = 'Client';
const SERVER = 'Server';


const { applyPatch, validate } = __webpack_require__(15);
const JSONPatcherProxy = __webpack_require__(18);
const JSONPatchQueueSynchronous = __webpack_require__(2)
  .JSONPatchQueueSynchronous;
const JSONPatchQueue = __webpack_require__(2).JSONPatchQueue;
const JSONPatchOT = __webpack_require__(21);
const JSONPatchOTAgent = __webpack_require__(22);
const URL = __webpack_require__(23);
const axios = __webpack_require__(24);
const {
  PalindromError,
  PalindromConnectionError
} = __webpack_require__(42);

/* We are going to hand `websocket` lib as an external to webpack
  (see: https://webpack.js.org/configuration/externals/), 
  this will make `w3cwebsocket` property `undefined`, 
  and this will lead Palindrom to use Browser's WebSocket when it is used 
  from the bundle. And use `websocket` lib in Node environment */
const NodeWebSocket = __webpack_require__(43).w3cwebsocket;

/* this allows us to stub WebSockets */
if (!global.WebSocket && NodeWebSocket) {
  /* we are in Node production env */
  var WebSocket = NodeWebSocket;
} else if (global.WebSocket) {
  /* we are in testing env */
  var WebSocket = global.WebSocket;
}
/* else {
    we are using Browser's WebSocket
  } */

const Palindrom = (() => {
  if (typeof global === 'undefined') {
    if (typeof window !== 'undefined') {
      /* incase neither window nor global existed, e.g React Native */
      var global = window;
    } else {
      var global = {};
    }
  }

  /**
   * Replaces http and https to ws and wss in a URL and returns it as a string.
   * @param  {String} remoteUrl HTTP remote address
   * @return {String}           WS address
   */
  function toWebSocketURL(remoteUrl) {
    /* replace 'http' strictly in the beginning of the string,
    this covers http and https */
    return remoteUrl.replace(/^http/i, 'ws');
  }

  /**
   * @callback reconnectionCallback called when reconnection attempt is scheduled.
   * It's called every second until reconnection attempt is made (`milliseconds` reaches 0)
   * @param {number} milliseconds - number of milliseconds to next reconnection attempt. >= 0
   */
  /**
   * @param {Function} reconnect used to perform reconnection. No arguments
   * @param {reconnectionCallback} onReconnectionCountdown called to notify that reconnection attempt is scheduled
   * @param {Function} onReconnectionEnd called to notify that reconnection attempt is not longer scheduled
   * @constructor
   */
  function Reconnector(reconnect, onReconnectionCountdown, onReconnectionEnd) {
    let intervalMs;
    let timeToCurrentReconnectionMs;
    let reconnectionPending;
    let reconnection;
    const defaultIntervalMs = 1000;

    function reset() {
      intervalMs = defaultIntervalMs;
      timeToCurrentReconnectionMs = 0;
      reconnectionPending = false;
      clearTimeout(reconnection);
      reconnection = null;
    }

    const step = () => {
      if (timeToCurrentReconnectionMs == 0) {
        onReconnectionCountdown(0);
        reconnectionPending = false;
        intervalMs *= 2;
        reconnect();
      } else {
        onReconnectionCountdown(timeToCurrentReconnectionMs);
        timeToCurrentReconnectionMs -= 1000;
        setTimeout(step, 1000);
      }
    };

    /**
     * Notify Reconnector that connection error occurred and automatic reconnection should be scheduled.
     */
    this.triggerReconnection = () => {
      if (reconnectionPending) {
        return;
      }
      timeToCurrentReconnectionMs = intervalMs;
      reconnectionPending = true;
      step();
    };

    /**
     * Reconnect immediately and reset all reconnection timers.
     */
    this.reconnectNow = () => {
      timeToCurrentReconnectionMs = 0;
      intervalMs = defaultIntervalMs;
    };

    /**
     * Notify Reconnector that there's no need to do further actions (either connection has been established or a fatal error occured).
     * Resets state of Reconnector
     */
    this.stopReconnecting = () => {
      reset();
      onReconnectionEnd();
    };

    // remember, we're still in constructor
    reset();
  }

  /**
   * Guarantees some communication to server and monitors responses for timeouts.
   * @param sendHeartbeatAction will be called to send a heartbeat
   * @param onError will be called if no response will arrive after `timeoutMs` since a message has been sent
   * @param intervalMs if no request will be sent in that time, a heartbeat will be issued
   * @param timeoutMs should a response fail to arrive in this time, `onError` will be called
   * @constructor
   */
  function Heartbeat(sendHeartbeatAction, onError, intervalMs, timeoutMs) {
    let scheduledSend;
    let scheduledError;

    /**
     * Call this function at the beginning of operation and after successful reconnection.
     */
    this.start = function() {
      if (scheduledSend) {
        return;
      }
      scheduledSend = setTimeout(() => {
        this.notifySend();
        sendHeartbeatAction();
      }, intervalMs);
    };

    /**
     * Call this method just before a message is sent. This will prevent unnecessary heartbeats.
     */
    this.notifySend = function() {
      clearTimeout(scheduledSend); // sending heartbeat will not be necessary until our response arrives
      scheduledSend = null;
      if (scheduledError) {
        return;
      }
      scheduledError = setTimeout(() => {
        scheduledError = null;
        onError(
          new PalindromConnectionError(
            "Timeout has passed and response hasn't arrived",
            CLIENT,
            this.remoteUrl,
            'Unknown'
          )
        ); // timeout has passed and response hasn't arrived
      }, timeoutMs);
    };

    /**
     * Call this method when a message arrives from other party. Failing to do so will result in false positive `onError` calls
     */
    this.notifyReceive = function() {
      clearTimeout(scheduledError);
      scheduledError = null;
      this.start();
    };

    /**
     * Call this method to disable heartbeat temporarily. This is *not* automatically called when error is detected
     */
    this.stop = () => {
      clearTimeout(scheduledSend);
      scheduledSend = null;
      clearTimeout(scheduledError);
      scheduledError = null;
    };
  }

  function NoHeartbeat() {
    this.start = this.stop = this.notifySend = this.notifyReceive = () => {};
  }

  class PalindromNetworkChannel {
    constructor(
      palindrom,
      remoteUrl,
      useWebSocket,
      onReceive,
      onSend,
      onConnectionError,
      onSocketOpened,
      onFatalError,
      onStateChange
    ) {
      // TODO(tomalec): to be removed once we will achieve better separation of concerns
      this.palindrom = palindrom;

      if (typeof window !== 'undefined' && window.location) {
        this.remoteUrl = new URL(remoteUrl, window.location.href);
      } else {
        // in Node, URL is absolute
        this.remoteUrl = new URL(remoteUrl);
      }

      onReceive && (this.onReceive = onReceive);
      onSend && (this.onSend = onSend);
      onConnectionError && (this.onConnectionError = onConnectionError);
      onFatalError && (this.onFatalError = onFatalError);
      onStateChange && (this.onStateChange = onStateChange);
      onSocketOpened && (this.onSocketOpened = onSocketOpened);

      Object.defineProperty(this, 'useWebSocket', {
        get: function() {
          return useWebSocket;
        },
        set: newValue => {
          useWebSocket = newValue;

          if (newValue == false) {
            if (this._ws) {
              this._ws.onclose = function() {
                //overwrites the previous onclose
                this._ws = null;
              };
              this._ws.close();
            }
            // define wsUrl if needed
          } else if (!this.wsUrl) {
            this.wsUrl = toWebSocketURL(this.remoteUrl.href);
          }
          return useWebSocket;
        }
      });
    }
    get useWebSocket() {
      return this._useWebSocket;
    }
    set useWebSocket(newValue) {
      this._useWebSocket = newValue;

      if (newValue == false) {
        if (this._ws) {
          this._ws.onclose = () => {
            //overwrites the previous onclose
            this._ws = null;
          };
          this._ws.close();
        }
        // define wsUrl if needed
      } else if (!this.wsUrl) {
        this.wsUrl = toWebSocketURL(this.remoteUrl.href);
      }
      return this.useWebSocket;
    }

    establish(bootstrap) {
      establish(this, this.remoteUrl.href, null, bootstrap);
    }

    reestablish(pending, bootstrap) {
      establish(
        this,
        `${this.remoteUrl.href}/reconnect`,
        JSON.stringify(pending),
        bootstrap
      );
    }

    /**
     * Send any text message by currently established channel
     * @TODO: handle readyState 2-CLOSING & 3-CLOSED (tomalec)
     * @param  {String} msg message to be sent
     * @return {PalindromNetworkChannel}     self
     */
    send(msg) {
      // send message only if there is a working ws connection
      if (this.useWebSocket && this._ws && this._ws.readyState === 1) {
        this._ws.send(msg);
        this.onSend(msg, this._ws.url, 'WS');
      } else {
        const url = this.remoteUrl.href;
        this.xhr(url, 'application/json-patch+json', msg, (res, method) => {
          this.onReceive(res.data, url, method);
        });
      }
      return this;
    }

    /**
     * Callback function that will be called once message from remote comes.
     * @param {String} [JSONPatch_sequences] message with Array of JSONPatches that were send by remote.
     * @return {[type]} [description]
     */
    onReceive(/*String_with_JSONPatch_sequences*/) {}

    onSend() {}
    onStateChange() {}
    upgrade(msg) {}

    /**
     * Send a WebSocket upgrade request to the server.
     * For testing purposes WS upgrade url is hard-coded now in Palindrom (replace __default/ID with __default/ID)
     * In future, server should suggest the WebSocket upgrade URL
     * @TODO:(tomalec)[cleanup] hide from public API.
     * @param {Function} [callback] Function to be called once connection gets opened.
     * @returns {WebSocket} created WebSocket
     */
    webSocketUpgrade(onSocketOpenCallback) {
      this.wsUrl = toWebSocketURL(this.remoteUrl.href);
      const upgradeURL = this.wsUrl;

      closeWsIfNeeded(this);

      this._ws = new WebSocket(upgradeURL);
      this._ws.onopen = event => {
        this.onStateChange(this._ws.readyState, upgradeURL);
        onSocketOpenCallback && onSocketOpenCallback(event);
      };
      this._ws.onmessage = event => {
        try {
          var parsedMessage = JSON.parse(event.data);
        } catch (e) {
          this.onFatalError(
            new PalindromConnectionError(
              event.data,
              SERVER,
              this._ws.url,
              'WS'
            )
          );
          return;
        }
        this.onReceive(parsedMessage, this._ws.url, 'WS');        
      };
      this._ws.onerror = event => {
        this.onStateChange(this._ws.readyState, upgradeURL, event.data);

        if (!this.useWebSocket) {
          return;
        }

        const message = [
          'WebSocket connection could not be made',
          'readyState: ' + this._ws.readyState
        ].join('\n');

        this.onFatalError(
          new PalindromConnectionError(message, CLIENT, upgradeURL, 'WS')
        );
      };
      this._ws.onclose = event => {

        this.onStateChange(
          this._ws.readyState,
          upgradeURL,
          null,
          event.code,
          event.reason
        );

        if (event.reason) {

          const message = [
            'WebSocket connection closed unexpectedly.',
            'reason: ' + event.reason,
            'readyState: ' + this._ws.readyState, 
            'stateCode: ' + event.code
          ].join('\n');

          this.onFatalError(
            new PalindromConnectionError(message, SERVER, upgradeURL, 'WS')
          );
          
        } else if (!event.wasClean) {
          const message = [
            'WebSocket connection closed unexpectedly.',
            'reason: ' + event.reason,
            'readyState: ' + this._ws.readyState,
            'stateCode: ' + event.code
          ].join('\n');

          this.onConnectionError(
            new PalindromConnectionError(message, SERVER, upgradeURL, 'WS')
          );
        }
      };
    }

    getPatchUsingHTTP(href) {
      return this.xhr(
        href,
        'application/json-patch+json',
        null,
        (res, method) => {
          this.onReceive(res.data, href, method);
        },
        true
      );
    }

    changeState(href) {
      console.warn(
        "changeState was renamed to `getPatchUsingHTTP`, and they're both not recommended to use, please use `PalindromDOM.morphUrl` instead"
      );
      return this.getPatchUsingHTTP(href);
    }

    // TODO:(tomalec)[cleanup] hide from public API.
    setRemoteUrl(remoteUrl) {
      if (this.remoteUrlSet && this.remoteUrl && this.remoteUrl != remoteUrl) {

        const message = [
          'Session lost.',
          'Server replied with a different session ID than the already set one.',
          'Possibly a server restart happened while you were working.',
          'Please reload the page.',
          'Previous session ID: ' + this.remoteUrl,
          'New session ID: ' + remoteUrl
        ].join('\n');

        throw new PalindromError(message);
      }
      this.remoteUrlSet = true;
      this.remoteUrl = new URL(remoteUrl, this.remoteUrl.href);
    }

    handleResponseHeader(res) {
      /* Axios always returns lowercase headers */
      const location =
        res.headers && (res.headers['x-location'] || res.headers['location']);
      if (location) {
        this.setRemoteUrl(location);
      }
    }

    /**
     * Internal method to perform XMLHttpRequest
     * @param url (Optional) URL to send the request. If empty string, undefined or null given - the request will be sent to window location
     * @param accept (Optional) HTTP accept header
     * @param data (Optional) Data payload
     * @param [callback(response)] callback to be called in context of palindrom with response as argument
     * @returns {XMLHttpRequest} performed XHR
     */
    xhr(url, accept, data, callback, setReferer) {
      const method = data ? 'PATCH' : 'GET';
      const headers = {};
      let requestPromise;

      if (data) {
        headers['Content-Type'] = 'application/json-patch+json';
      }
      if (accept) {
        headers['Accept'] = accept;
      }
      if (this.remoteUrl && setReferer) {
        headers['X-Referer'] = this.remoteUrl.pathname;
      }
      if (method === 'GET') {
        requestPromise = axios.get(url, {
          headers
        });
      } else {
        requestPromise = axios.patch(url, data, {
          headers
        });
      }
      requestPromise
        .then(res => {
          this.handleResponseHeader(res);
          callback && callback.call(this.palindrom, res, method);
        })
        .catch(error => {
          const res = error.response;

          if (res) {
            var statusCode = res.status;
            var statusText = res.statusText || res.data;
            var reason = res.data;
          } else {
            // no sufficient error information, we need to create on our own
            var statusCode = -1;
            var statusText = `An unknown network error has occurred. Raw message: ${
              error.message
            }`;
            var reason = 'Maybe you lost connection with the server';
            // log it for verbosity
            console.error(error);
          }

          const message = [
            statusText,
            'statusCode: ' + statusCode,
            'reason: ' + reason,
            'url: ' + url,
            'HTTP method: ' + method
          ].join('\n');

          this.onFatalError(
            new PalindromConnectionError(message, CLIENT, url, method)
          );
        });

      this.onSend(data, url, method);
    }
  }
  // TODO: auto-configure here #38 (tomalec)
  function establish(network, url, body, bootstrap) {
    return network.xhr(url, 'application/json', body, res => {
      bootstrap(res.data);
      if (network.useWebSocket) {
        network.webSocketUpgrade(network.onSocketOpened);
      }
    });
  }

  function closeWsIfNeeded(network) {
    if (network._ws) {
      network._ws.onclose = () => {};
      network._ws.close();
      network._ws = null;
    }
  }

  /**
   * Non-queuing object that conforms JSON-Patch-Queue API
   * @param {Object} obj target object where patches are applied
   * @param {Function} apply function to apply received patch, must return the object in its final state
   */
  class NoQueue {
    constructor(obj, apply) {
      this.obj = obj;
      this.apply = apply;
    }

    /** just forward message */
    send(msg) {
      return msg;
    }

    /** Apply given JSON Patch sequence immediately */
    receive(sequence) {
      return (this.obj = this.apply(this.obj, sequence));
    }

    reset(newState) {
      const patch = [{ op: 'replace', path: '', value: newState }];
      return (this.obj = this.apply(this.obj, patch));
    }
  }

  function connectToRemote(palindrom, reconnectionFn) {
    // if we lose connection at this point, the connection we're trying to establish should trigger onError
    palindrom.heartbeat.stop();

    reconnectionFn(function bootstrap(json) {
      palindrom.reconnector.stopReconnecting();

      if (palindrom.debug) {
        palindrom.remoteObj = JSON.parse(JSON.stringify(json));
      }

      palindrom.queue.reset(json);

      palindrom.heartbeat.start();
    });
  }

  function makeInitialConnection(palindrom) {
    connectToRemote(
      palindrom,
      palindrom.network.establish.bind(palindrom.network)
    );
  }

  function makeReconnection(palindrom) {
    connectToRemote(palindrom, bootstrap => {
      palindrom.network.reestablish(palindrom.queue.pending, bootstrap);
    });
  }

  /**
   * Defines a connection to a remote PATCH server, serves an object that is persistent between browser and server.
   * @param {Object} [options] map of arguments. See README.md for description
   */
  class Palindrom {
    /**
     * Palindrom version
     */
    static get version() {
      return palindromVersion;
    }

    constructor(options) {
      /**
       * Palindrom instance version
       */
      this.version = palindromVersion;

      if (typeof options !== 'object') {
        throw new TypeError(
          'Palindrom constructor requires an object argument.'
        );
      }
      if (!options.remoteUrl) {
        throw new TypeError('remoteUrl is required');
      }

      if (options.ignoreAdd) {
        throw new TypeError(
          '`ignoreAdd` is removed in favour of local state objects. see https://github.com/Palindrom/Palindrom/issues/136'
        );
      }

      this.debug = options.debug != undefined ? options.debug : true;

      const noop = function noOpFunction() {};

      this.isObserving = false;
      this.onLocalChange = options.onLocalChange || noop;
      this.onRemoteChange = options.onRemoteChange || noop;
      this.onStateReset = options.onStateReset || options.callback || noop;
      this.filterLocalChange =
        options.filterLocalChange || (operation => operation);

      if (options.callback) {
        console.warn(
          'options.callback is deprecated. Please use `onStateReset` instead'
        );
      }

      this.onPatchReceived = options.onPatchReceived || noop;
      this.onPatchSent = options.onPatchSent || noop;
      this.onSocketStateChanged = options.onSocketStateChanged || noop;
      this.onConnectionError = options.onConnectionError || noop;
      this.retransmissionThreshold = options.retransmissionThreshold || 3;
      this.onReconnectionCountdown = options.onReconnectionCountdown || noop;
      this.onReconnectionEnd = options.onReconnectionEnd || noop;
      this.onSocketOpened = options.onSocketOpened || noop;
      this.onIncomingPatchValidationError =
        options.onIncomingPatchValidationError || noop;
      this.onOutgoingPatchValidationError =
        options.onOutgoingPatchValidationError || noop;
      this.onError = options.onError || noop;

      this.reconnector = new Reconnector(
        () => makeReconnection(this),
        this.onReconnectionCountdown,
        this.onReconnectionEnd
      );

      if (options.pingIntervalS) {
        const intervalMs = options.pingIntervalS * 1000;
        this.heartbeat = new Heartbeat(
          this.ping.bind(this),
          this.handleConnectionError.bind(this),
          intervalMs,
          intervalMs
        );
      } else {
        this.heartbeat = new NoHeartbeat();
      }

      this.network = new PalindromNetworkChannel(
        this, // palindrom instance TODO: to be removed, used for error reporting
        options.remoteUrl,
        options.useWebSocket || false, // useWebSocket
        this.handleRemoteChange.bind(this), //onReceive
        this.onPatchSent.bind(this), //onSend,
        this.handleConnectionError.bind(this), //onConnectionError,
        this.onSocketOpened.bind(this),
        this.handleFatalError.bind(this), //onFatalError,
        this.onSocketStateChanged.bind(this) //onStateChange
      );
      /**
       * how many OT operations are there in each patch 0, 1 or 2
       */
      this.OTPatchIndexOffset = 0;
      // choose queuing engine
      if (options.localVersionPath) {
        if (!options.remoteVersionPath) {
          this.OTPatchIndexOffset = 1;
          // just versioning
          this.queue = new JSONPatchQueueSynchronous(
            this.obj,
            options.localVersionPath,
            this.validateAndApplySequence.bind(this),
            options.purity
          );
        } else {
          this.OTPatchIndexOffset = 2;
          // double versioning or OT
          this.queue = options.ot
            ? new JSONPatchOTAgent(
                this.obj,
                JSONPatchOT.transform,
                [options.localVersionPath, options.remoteVersionPath],
                this.validateAndApplySequence.bind(this),
                options.purity
              )
            : new JSONPatchQueue(
                this.obj,
                [options.localVersionPath, options.remoteVersionPath],
                this.validateAndApplySequence.bind(this),
                options.purity
              ); // full or noop OT
        }
      } else {
        // no queue - just api
        this.queue = new NoQueue(
          this.obj,
          this.validateAndApplySequence.bind(this)
        );
      }
      makeInitialConnection(this);
    }
    set ignoreAdd(newValue) {
      throw new TypeError(
        "Can't set `ignoreAdd`, it is removed in favour of local state objects. see https://github.com/Palindrom/Palindrom/issues/136"
      );
    }
    get useWebSocket() {
      return this.network.useWebSocket;
    }
    set useWebSocket(newValue) {
      this.network.useWebSocket = newValue;
    }
    ping() {
      sendPatches(this, []); // sends empty message to server
    }

    prepareProxifiedObject(obj) {
      if (!obj) {
        obj = {};
      }
      /* wrap a new object with a proxy observer */
      this.jsonPatcherProxy = new JSONPatcherProxy(obj);

      const proxifiedObj = this.jsonPatcherProxy.observe(false, operation => {
        const filtered = this.filterLocalChange(operation);
        // totally ignore falsy (didn't pass the filter) JSON Patch operations
        filtered && this.handleLocalChange(filtered);
      });

      /* make it read-only and expose it as `obj` */
      Object.defineProperty(this, 'obj', {
        get() {
          return proxifiedObj;
        },
        set() {
          throw new Error('palindrom.obj is readonly');
        },
        /* so that we can redefine it */
        configurable: true
      });
      /* JSONPatcherProxy default state is observing */
      this.isObserving = true;
    }

    observe() {
      this.jsonPatcherProxy && this.jsonPatcherProxy.resume();
      this.isObserving = true;
    }

    unobserve() {
      this.jsonPatcherProxy && this.jsonPatcherProxy.pause();
      this.isObserving = false;
    }

    handleLocalChange(operation) {
      // it's a single operation, we need to check only it's value
      operation.value &&
        findRangeErrors(operation.value, this.onOutgoingPatchValidationError, operation.path);

      const patches = [operation];
      if (this.debug) {
        this.validateSequence(this.remoteObj, patches);
      }
      sendPatches(this, this.queue.send(patches));
      this.onLocalChange(patches);
    }

    validateAndApplySequence(tree, sequence) {
      // we don't want this changes to generate patches since they originate from server, not client
      try {
        this.unobserve();
        const results = applyPatch(tree, sequence, this.debug);
        // notifications have to happen only where observe has been re-enabled
        // otherwise some listener might produce changes that would go unnoticed
        this.observe();
        // the state was fully replaced
        if (results.newDocument !== tree) {
          // object was reset, proxify it again
          this.prepareProxifiedObject(results.newDocument);

          this.queue.obj = this.obj;

          // validate json response
          findRangeErrors(this.obj, this.onIncomingPatchValidationError);

          //notify people about it
          try {
            this.onStateReset(this.obj);
          } catch (error) {
            // to prevent the promise's catch from swallowing errors inside onStateReset
            this.onError(
              new PalindromError(
                `Error inside onStateReset callback: ${
                  error.message
                }`
              )
            );
            console.error(error);
          }
        }
        this.onRemoteChange(sequence, results);
      } catch (error) {
        if (this.debug) {
          this.onIncomingPatchValidationError(error);
          return;
        } else {
          throw error;
        }
      }
      return this.obj;
    }

    validateSequence(tree, sequence) {
      const error = validate(sequence, tree);
      if (error) {
        this.onOutgoingPatchValidationError(error);
      }
    }

    /**
     * Handle an error which is probably caused by random disconnection
     */
    handleConnectionError() {
      this.heartbeat.stop();
      this.reconnector.triggerReconnection();
    }

    /**
     * Handle an error which probably won't go away on itself (basically forward upstream)
     * @param {PalindromConnectionError} palindromError
     */
    handleFatalError(palindromError) {
      this.heartbeat.stop();
      this.reconnector.stopReconnecting();
      if (this.onConnectionError) {
        this.onConnectionError(palindromError);
      }
    }

    reconnectNow() {
      this.reconnector.reconnectNow();
    }

    showWarning(heading, description) {
      if (this.debug && global.console && console.warn) {
        if (description) {
          heading += ` (${description})`;
        }
        console.warn(`Palindrom warning: ${heading}`);
      }
    }

    handleRemoteChange(data, url, method) {
    
      if (this.onPatchReceived) {
        this.onPatchReceived(data, url, method);
      }

      this.heartbeat.notifyReceive();
      const patches = data || []; // fault tolerance - empty response string should be treated as empty patch array

      validateNumericsRangesInPatch(
        patches,
        this.onIncomingPatchValidationError,
        this.OTPatchIndexOffset
      );

      if (patches.length === 0) {
        // ping message
        return;
      }

      // apply only if we're still watching
      if (!this.isObserving) {
        return;
      }
      this.queue.receive(patches);
      if (
        this.queue.pending &&
        this.queue.pending.length &&
        this.queue.pending.length > this.retransmissionThreshold
      ) {
        // remote counterpart probably failed to receive one of earlier messages, because it has been receiving
        // (but not acknowledging messages for some time
        this.queue.pending.forEach(sendPatches.bind(null, this));
      }

      if (this.debug) {
        this.remoteObj = JSON.parse(JSON.stringify(this.obj));
      }
    }
  }

  /**
   * Iterates a JSON-Patch, traversing every patch value looking for out-of-range numbers
   * @param {JSONPatch} patch patch to check
   * @param {Function} errorHandler the error handler callback
   * @param {*} startFrom the index where iteration starts
   */
  function validateNumericsRangesInPatch(patch, errorHandler, startFrom) {
    for (let i = startFrom, len = patch.length; i < len; i++) {
      findRangeErrors(patch[i].value, errorHandler, patch[i].path);
    }
  }

  /**
   * Traverses/checks value looking for out-of-range numbers, throws a RangeError if it finds any
   * @param {*} val value
   * @param {Function} errorHandler
   */
  function findRangeErrors(val, errorHandler, variablePath = "") {
    const type = typeof val;
    if (type == 'object') {
      for (const key in val) {
        if (val.hasOwnProperty(key)) {
          findRangeErrors(val[key], errorHandler, variablePath + '/' + key);
        }
      }
    } else if (
      type === 'number' &&
      (val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER)
    ) {
      errorHandler(
        new RangeError(
          `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${val}, variable path is: ${variablePath}`
        )
      );
    }
  }

  function sendPatches(palindrom, patches) {
    const txt = JSON.stringify(patches);
    palindrom.unobserve();
    palindrom.heartbeat.notifySend();
    palindrom.network.send(txt);
    palindrom.observe();
  }

  return Palindrom;
})();

module.exports = Palindrom;
module.exports.default = Palindrom;
module.exports.__esModule = true;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14)))

/***/ }),
/* 14 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var equalsOptions = { strict: true };
var _equals = __webpack_require__(4);
var areEquals = function (a, b) {
    return _equals(a, b, equalsOptions);
};
var helpers_1 = __webpack_require__(1);
var core_1 = __webpack_require__(5);
/* export all core functions */
var core_2 = __webpack_require__(5);
exports.applyOperation = core_2.applyOperation;
exports.applyPatch = core_2.applyPatch;
exports.applyReducer = core_2.applyReducer;
exports.getValueByPointer = core_2.getValueByPointer;
exports.validate = core_2.validate;
exports.validator = core_2.validator;
/* export some helpers */
var helpers_2 = __webpack_require__(1);
exports.JsonPatchError = helpers_2.PatchError;
exports.deepClone = helpers_2._deepClone;
exports.escapePathComponent = helpers_2.escapePathComponent;
exports.unescapePathComponent = helpers_2.unescapePathComponent;
var beforeDict = [];
var Mirror = (function () {
    function Mirror(obj) {
        this.observers = [];
        this.obj = obj;
    }
    return Mirror;
}());
var ObserverInfo = (function () {
    function ObserverInfo(callback, observer) {
        this.callback = callback;
        this.observer = observer;
    }
    return ObserverInfo;
}());
function getMirror(obj) {
    for (var i = 0, length = beforeDict.length; i < length; i++) {
        if (beforeDict[i].obj === obj) {
            return beforeDict[i];
        }
    }
}
function getObserverFromMirror(mirror, callback) {
    for (var j = 0, length = mirror.observers.length; j < length; j++) {
        if (mirror.observers[j].callback === callback) {
            return mirror.observers[j].observer;
        }
    }
}
function removeObserverFromMirror(mirror, observer) {
    for (var j = 0, length = mirror.observers.length; j < length; j++) {
        if (mirror.observers[j].observer === observer) {
            mirror.observers.splice(j, 1);
            return;
        }
    }
}
/**
 * Detach an observer from an object
 */
function unobserve(root, observer) {
    observer.unobserve();
}
exports.unobserve = unobserve;
/**
 * Observes changes made to an object, which can then be retrieved using generate
 */
function observe(obj, callback) {
    var patches = [];
    var root = obj;
    var observer;
    var mirror = getMirror(obj);
    if (!mirror) {
        mirror = new Mirror(obj);
        beforeDict.push(mirror);
    }
    else {
        observer = getObserverFromMirror(mirror, callback);
    }
    if (observer) {
        return observer;
    }
    observer = {};
    mirror.value = helpers_1._deepClone(obj);
    if (callback) {
        observer.callback = callback;
        observer.next = null;
        var dirtyCheck = function () {
            generate(observer);
        };
        var fastCheck = function () {
            clearTimeout(observer.next);
            observer.next = setTimeout(dirtyCheck);
        };
        if (typeof window !== 'undefined') {
            if (window.addEventListener) {
                window.addEventListener('mouseup', fastCheck);
                window.addEventListener('keyup', fastCheck);
                window.addEventListener('mousedown', fastCheck);
                window.addEventListener('keydown', fastCheck);
                window.addEventListener('change', fastCheck);
            }
            else {
                document.documentElement.attachEvent('onmouseup', fastCheck);
                document.documentElement.attachEvent('onkeyup', fastCheck);
                document.documentElement.attachEvent('onmousedown', fastCheck);
                document.documentElement.attachEvent('onkeydown', fastCheck);
                document.documentElement.attachEvent('onchange', fastCheck);
            }
        }
    }
    observer.patches = patches;
    observer.object = obj;
    observer.unobserve = function () {
        generate(observer);
        clearTimeout(observer.next);
        removeObserverFromMirror(mirror, observer);
        if (typeof window !== 'undefined') {
            if (window.removeEventListener) {
                window.removeEventListener('mouseup', fastCheck);
                window.removeEventListener('keyup', fastCheck);
                window.removeEventListener('mousedown', fastCheck);
                window.removeEventListener('keydown', fastCheck);
            }
            else {
                document.documentElement.detachEvent('onmouseup', fastCheck);
                document.documentElement.detachEvent('onkeyup', fastCheck);
                document.documentElement.detachEvent('onmousedown', fastCheck);
                document.documentElement.detachEvent('onkeydown', fastCheck);
            }
        }
    };
    mirror.observers.push(new ObserverInfo(callback, observer));
    return observer;
}
exports.observe = observe;
/**
 * Generate an array of patches from an observer
 */
function generate(observer) {
    var mirror;
    for (var i = 0, length = beforeDict.length; i < length; i++) {
        if (beforeDict[i].obj === observer.object) {
            mirror = beforeDict[i];
            break;
        }
    }
    _generate(mirror.value, observer.object, observer.patches, "");
    if (observer.patches.length) {
        core_1.applyPatch(mirror.value, observer.patches);
    }
    var temp = observer.patches;
    if (temp.length > 0) {
        observer.patches = [];
        if (observer.callback) {
            observer.callback(temp);
        }
    }
    return temp;
}
exports.generate = generate;
// Dirty check if obj is different from mirror, generate patches and update mirror
function _generate(mirror, obj, patches, path) {
    if (obj === mirror) {
        return;
    }
    if (typeof obj.toJSON === "function") {
        obj = obj.toJSON();
    }
    var newKeys = helpers_1._objectKeys(obj);
    var oldKeys = helpers_1._objectKeys(mirror);
    var changed = false;
    var deleted = false;
    //if ever "move" operation is implemented here, make sure this test runs OK: "should not generate the same patch twice (move)"
    for (var t = oldKeys.length - 1; t >= 0; t--) {
        var key = oldKeys[t];
        var oldVal = mirror[key];
        if (helpers_1.hasOwnProperty(obj, key) && !(obj[key] === undefined && oldVal !== undefined && Array.isArray(obj) === false)) {
            var newVal = obj[key];
            if (typeof oldVal == "object" && oldVal != null && typeof newVal == "object" && newVal != null) {
                _generate(oldVal, newVal, patches, path + "/" + helpers_1.escapePathComponent(key));
            }
            else {
                if (oldVal !== newVal) {
                    changed = true;
                    patches.push({ op: "replace", path: path + "/" + helpers_1.escapePathComponent(key), value: helpers_1._deepClone(newVal) });
                }
            }
        }
        else {
            patches.push({ op: "remove", path: path + "/" + helpers_1.escapePathComponent(key) });
            deleted = true; // property has been deleted
        }
    }
    if (!deleted && newKeys.length == oldKeys.length) {
        return;
    }
    for (var t = 0; t < newKeys.length; t++) {
        var key = newKeys[t];
        if (!helpers_1.hasOwnProperty(mirror, key) && obj[key] !== undefined) {
            patches.push({ op: "add", path: path + "/" + helpers_1.escapePathComponent(key), value: helpers_1._deepClone(obj[key]) });
        }
    }
}
/**
 * Create an array of patches from the differences in two objects
 */
function compare(tree1, tree2) {
    var patches = [];
    _generate(tree1, tree2, patches, '');
    return patches;
}
exports.compare = compare;


/***/ }),
/* 16 */
/***/ (function(module, exports) {

exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}


/***/ }),
/* 17 */
/***/ (function(module, exports) {

var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*!
 * https://github.com/Palindrom/JSONPatcherProxy
 * (c) 2017 Starcounter 
 * MIT license
 */

/** Class representing a JS Object observer  */
const JSONPatcherProxy = (function() {
  /**
  * Deep clones your object and returns a new object.
  */
  function deepClone(obj) {
    switch (typeof obj) {
      case 'object':
        return JSON.parse(JSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
      case 'undefined':
        return null; //this is how JSON.stringify behaves for array items
      default:
        return obj; //no need to clone primitives
    }
  }
  JSONPatcherProxy.deepClone = deepClone;

  function escapePathComponent(str) {
    if (str.indexOf('/') == -1 && str.indexOf('~') == -1) return str;
    return str.replace(/~/g, '~0').replace(/\//g, '~1');
  }
  JSONPatcherProxy.escapePathComponent = escapePathComponent;

  /**
   * Walk up the parenthood tree to get the path
   * @param {JSONPatcherProxy} instance 
   * @param {Object} obj the object you need to find its path
   */
  function findObjectPath(instance, obj) {
    const pathComponents = [];
    let parentAndPath = instance.parenthoodMap.get(obj);
    while (parentAndPath && parentAndPath.path) {
      // because we're walking up-tree, we need to use the array as a stack
      pathComponents.unshift(parentAndPath.path);
      parentAndPath = instance.parenthoodMap.get(parentAndPath.parent);
    }
    if (pathComponents.length) {
      const path = pathComponents.join('/');
      return '/' + path;
    }
    return '';
  }
  /**
   * A callback to be used as th proxy set trap callback.
   * It updates parenthood map if needed, proxifies nested newly-added objects, calls default callbacks with the changes occurred.
   * @param {JSONPatcherProxy} instance JSONPatcherProxy instance
   * @param {Object} target the affected object
   * @param {String} key the effect property's name
   * @param {Any} newValue the value being set
   */
  function setTrap(instance, target, key, newValue) {
    const parentPath = findObjectPath(instance, target);

    const destinationPropKey = parentPath + '/' + escapePathComponent(key);

    if (instance.proxifiedObjectsMap.has(newValue)) {
      const newValueOriginalObject = instance.proxifiedObjectsMap.get(newValue);

      instance.parenthoodMap.set(newValueOriginalObject.originalObject, {
        parent: target,
        path: key
      });
    }
    /*
        mark already proxified values as inherited.
        rationale: proxy.arr.shift()
        will emit
        {op: replace, path: '/arr/1', value: arr_2}
        {op: remove, path: '/arr/2'}

        by default, the second operation would revoke the proxy, and this renders arr revoked.
        That's why we need to remember the proxies that are inherited.
      */
    const revokableInstance = instance.proxifiedObjectsMap.get(newValue);
    /*
    Why do we need to check instance.isProxifyingTreeNow?

    We need to make sure we mark revokables as inherited ONLY when we're observing,
    because throughout the first proxification, a sub-object is proxified and then assigned to 
    its parent object. This assignment of a pre-proxified object can fool us into thinking
    that it's a proxified object moved around, while in fact it's the first assignment ever. 

    Checking isProxifyingTreeNow ensures this is not happening in the first proxification, 
    but in fact is is a proxified object moved around the tree
    */
    if (revokableInstance && !instance.isProxifyingTreeNow) {
      revokableInstance.inherited = true;
    }

    // if the new value is an object, make sure to watch it
    if (
      newValue &&
      typeof newValue == 'object' &&
      !instance.proxifiedObjectsMap.has(newValue)
    ) {
      instance.parenthoodMap.set(newValue, {
        parent: target,
        path: key
      });
      newValue = instance._proxifyObjectTreeRecursively(target, newValue, key);
    }
    // let's start with this operation, and may or may not update it later
    const operation = {
      op: 'remove',
      path: destinationPropKey
    };
    if (typeof newValue == 'undefined') {
      // applying De Morgan's laws would be a tad faster, but less readable
      if (!Array.isArray(target) && !target.hasOwnProperty(key)) {
        // `undefined` is being set to an already undefined value, keep silent
        return Reflect.set(target, key, newValue);
      } else {
        // when array element is set to `undefined`, should generate replace to `null`
        if (Array.isArray(target)) {
          // undefined array elements are JSON.stringified to `null`
          (operation.op = 'replace'), (operation.value = null);
        }
        const oldValue = instance.proxifiedObjectsMap.get(target[key]);
        // was the deleted a proxified object?
        if (oldValue) {
          instance.parenthoodMap.delete(target[key]);
          instance.disableTrapsForProxy(oldValue);
          instance.proxifiedObjectsMap.delete(oldValue);
        }
      }
    } else {
      if (Array.isArray(target) && !Number.isInteger(+key.toString())) {
        /* array props (as opposed to indices) don't emit any patches, to avoid needless `length` patches */
        return Reflect.set(target, key, newValue);
      }
      operation.op = 'add';
      if (target.hasOwnProperty(key)) {
        if (typeof target[key] !== 'undefined' || Array.isArray(target)) {
          operation.op = 'replace'; // setting `undefined` array elements is a `replace` op
        }
      }
      operation.value = newValue;
    }
    const reflectionResult = Reflect.set(target, key, newValue);
    instance.defaultCallback(operation);
    return reflectionResult;
  }
  /**
   * A callback to be used as th proxy delete trap callback.
   * It updates parenthood map if needed, calls default callbacks with the changes occurred.
   * @param {JSONPatcherProxy} instance JSONPatcherProxy instance
   * @param {Object} target the effected object
   * @param {String} key the effected property's name
   */
  function deleteTrap(instance, target, key) {
    if (typeof target[key] !== 'undefined') {
      const parentPath = findObjectPath(instance, target);
      const destinationPropKey = parentPath + '/' + escapePathComponent(key);

      const revokableProxyInstance = instance.proxifiedObjectsMap.get(
        target[key]
      );

      if (revokableProxyInstance) {
        if (revokableProxyInstance.inherited) {
          /*
            this is an inherited proxy (an already proxified object that was moved around), 
            we shouldn't revoke it, because even though it was removed from path1, it is still used in path2.
            And we know that because we mark moved proxies with `inherited` flag when we move them

            it is a good idea to remove this flag if we come across it here, in deleteProperty trap.
            We DO want to revoke the proxy if it was removed again.
          */
          revokableProxyInstance.inherited = false;
        } else {
          instance.parenthoodMap.delete(revokableProxyInstance.originalObject);
          instance.disableTrapsForProxy(revokableProxyInstance);
          instance.proxifiedObjectsMap.delete(target[key]);
        }
      }
      const reflectionResult = Reflect.deleteProperty(target, key);

      instance.defaultCallback({
        op: 'remove',
        path: destinationPropKey
      });

      return reflectionResult;
    }
  }
  /* pre-define resume and pause functions to enhance constructors performance */
  function resume() {
    this.defaultCallback = operation => {
      this.isRecording && this.patches.push(operation);
      this.userCallback && this.userCallback(operation);
    };
    this.isObserving = true;
  }
  function pause() {
    this.defaultCallback = () => {};
    this.isObserving = false;
  }
  /**
    * Creates an instance of JSONPatcherProxy around your object of interest `root`. 
    * @param {Object|Array} root - the object you want to wrap
    * @param {Boolean} [showDetachedWarning = true] - whether to log a warning when a detached sub-object is modified @see {@link https://github.com/Palindrom/JSONPatcherProxy#detached-objects} 
    * @returns {JSONPatcherProxy}
    * @constructor
    */
  function JSONPatcherProxy(root, showDetachedWarning) {
    this.isProxifyingTreeNow = false;
    this.isObserving = false;
    this.proxifiedObjectsMap = new Map();
    this.parenthoodMap = new Map();
    // default to true
    if (typeof showDetachedWarning !== 'boolean') {
      showDetachedWarning = true;
    }

    this.showDetachedWarning = showDetachedWarning;
    this.originalObject = root;
    this.cachedProxy = null;
    this.isRecording = false;
    this.userCallback;
    /**
     * @memberof JSONPatcherProxy
     * Restores callback back to the original one provided to `observe`.
     */
    this.resume = resume.bind(this);
    /**
     * @memberof JSONPatcherProxy
     * Replaces your callback with a noop function.
     */
    this.pause = pause.bind(this);
  }

  JSONPatcherProxy.prototype.generateProxyAtPath = function(parent, obj, path) {
    if (!obj) {
      return obj;
    }
    const traps = {
      set: (target, key, value, receiver) =>
        setTrap(this, target, key, value, receiver),
      deleteProperty: (target, key) => deleteTrap(this, target, key)
    };
    const revocableInstance = Proxy.revocable(obj, traps);
    // cache traps object to disable them later.
    revocableInstance.trapsInstance = traps;
    revocableInstance.originalObject = obj;

    /* keeping track of object's parent and path */

    this.parenthoodMap.set(obj, { parent, path });

    /* keeping track of all the proxies to be able to revoke them later */
    this.proxifiedObjectsMap.set(revocableInstance.proxy, revocableInstance);
    return revocableInstance.proxy;
  };
  // grab tree's leaves one by one, encapsulate them into a proxy and return
  JSONPatcherProxy.prototype._proxifyObjectTreeRecursively = function(
    parent,
    root,
    path
  ) {
    for (let key in root) {
      if (root.hasOwnProperty(key)) {
        if (root[key] instanceof Object) {
          root[key] = this._proxifyObjectTreeRecursively(
            root,
            root[key],
            escapePathComponent(key)
          );
        }
      }
    }
    return this.generateProxyAtPath(parent, root, path);
  };
  // this function is for aesthetic purposes
  JSONPatcherProxy.prototype.proxifyObjectTree = function(root) {
    /*
    while proxyifying object tree,
    the proxyifying operation itself is being
    recorded, which in an unwanted behavior,
    that's why we disable recording through this
    initial process;
    */
    this.pause();
    this.isProxifyingTreeNow = true;
    const proxifiedObject = this._proxifyObjectTreeRecursively(
      undefined,
      root,
      ''
    );
    /* OK you can record now */
    this.isProxifyingTreeNow = false;
    this.resume();
    return proxifiedObject;
  };
  /**
   * Turns a proxified object into a forward-proxy object; doesn't emit any patches anymore, like a normal object
   * @param {Proxy} proxy - The target proxy object
   */
  JSONPatcherProxy.prototype.disableTrapsForProxy = function(
    revokableProxyInstance
  ) {
    if (this.showDetachedWarning) {
      const message =
        "You're accessing an object that is detached from the observedObject tree, see https://github.com/Palindrom/JSONPatcherProxy#detached-objects";

      revokableProxyInstance.trapsInstance.set = (
        targetObject,
        propKey,
        newValue
      ) => {
        console.warn(message);
        return Reflect.set(targetObject, propKey, newValue);
      };
      revokableProxyInstance.trapsInstance.set = (
        targetObject,
        propKey,
        newValue
      ) => {
        console.warn(message);
        return Reflect.set(targetObject, propKey, newValue);
      };
      revokableProxyInstance.trapsInstance.deleteProperty = (
        targetObject,
        propKey
      ) => {
        return Reflect.deleteProperty(targetObject, propKey);
      };
    } else {
      delete revokableProxyInstance.trapsInstance.set;
      delete revokableProxyInstance.trapsInstance.get;
      delete revokableProxyInstance.trapsInstance.deleteProperty;
    }
  };
  /**
   * Proxifies the object that was passed in the constructor and returns a proxified mirror of it. Even though both parameters are options. You need to pass at least one of them.
   * @param {Boolean} [record] - whether to record object changes to a later-retrievable patches array.
   * @param {Function} [callback] - this will be synchronously called with every object change with a single `patch` as the only parameter.
   */
  JSONPatcherProxy.prototype.observe = function(record, callback) {
    if (!record && !callback) {
      throw new Error('You need to either record changes or pass a callback');
    }
    this.isRecording = record;
    this.userCallback = callback;
    /*
    I moved it here to remove it from `unobserve`,
    this will also make the constructor faster, why initiate
    the array before they decide to actually observe with recording?
    They might need to use only a callback.
    */
    if (record) this.patches = [];
    this.cachedProxy = this.proxifyObjectTree(this.originalObject);
    return this.cachedProxy;
  };
  /**
   * If the observed is set to record, it will synchronously return all the patches and empties patches array.
   */
  JSONPatcherProxy.prototype.generate = function() {
    if (!this.isRecording) {
      throw new Error('You should set record to true to get patches later');
    }
    return this.patches.splice(0, this.patches.length);
  };
  /**
   * Revokes all proxies rendering the observed object useless and good for garbage collection @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/revocable}
   */
  JSONPatcherProxy.prototype.revoke = function() {
    this.proxifiedObjectsMap.forEach(el => {
      el.revoke();
    });
  };
  /**
   * Disables all proxies' traps, turning the observed object into a forward-proxy object, like a normal object that you can modify silently.
   */
  JSONPatcherProxy.prototype.disableTraps = function() {
    this.proxifiedObjectsMap.forEach(this.disableTrapsForProxy, this);
  };
  return JSONPatcherProxy;
})();

if (true) {
  module.exports = JSONPatcherProxy;
  module.exports.default = JSONPatcherProxy;
}


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * JSON Patch Queue for asynchronous operations, and asynchronous networking.
 * version: 3.0.0-rc.0
 * @param {Object} obj The target object where patches are applied
 * @param {Array<JSON-Pointer>} versionPaths JSON-Pointers to version numbers [local, remote]
 * @param {function} apply    apply(JSONobj, JSONPatchSequence) function to apply JSONPatch to object.
 * @param {Boolean} [purist]       If set to true adds test operation before replace.
 */
var JSONPatchQueue = function(obj, versionPaths, apply, purist){

	/**
	 * The target object where patches are applied
	 * @type {Object}
	 */
	this.obj = obj;
	/**
	 * Queue of consecutive JSON Patch sequences. May contain gaps.
	 * Item with index 0 has 1 version gap to this.remoteVersion.
	 * @type {Array}
	 */
	this.waiting = [];
	/**
	 * JSON-Pointer to local version in shared JSON document
	 * @type {JSONPointer}
	 */
	this.localPath = versionPaths[0];
	/**
	 * JSON-Pointer to remote version in shared JSON document
	 * @type {JSONPointer}
	 */
	this.remotePath = versionPaths[1];
	/**
	 * Function to apply JSONPatchSequence to JSON object
	 * @type {Function}
	 */
	this.apply = apply;
	/**
	 * If set to true adds test operation before replace.
	 * @type {Bool}
	 */
	this.purist = purist;

};
/** local version */
JSONPatchQueue.prototype.localVersion = 0;
/** Latest localVersion that we know that was acknowledged by remote */
// JSONPatchQueue.prototype.ackVersion = 0;
/** Latest acknowledged remote version */
JSONPatchQueue.prototype.remoteVersion = 0;

// instance property
//  JSONPatchQueue.prototype.waiting = [];
/** needed? OT only? */
// JSONPatchQueue.prototype.pending = [];
/**
 * Process received versioned JSON Patch
 * Applies or adds to queue.
 * @param  {JSONPatch} versionedJsonPatch patch to be applied
 * @param  {Function} [applyCallback]     optional `function(object, consecutivePatch)` to be called when applied, if not given #apply will be called
 */
JSONPatchQueue.prototype.receive = function(versionedJsonPatch, applyCallback){
	var apply = applyCallback || this.apply,
		consecutivePatch = versionedJsonPatch.slice(0);
	// strip Versioned JSON Patch specyfiv operation objects from given sequence
		if(this.purist){
			var testRemote = consecutivePatch.shift();
		}
		var replaceRemote = consecutivePatch.shift(),
			newRemoteVersion = replaceRemote.value;

	// TODO: perform versionedPath validation if needed (tomalec)

	if( newRemoteVersion <= this.remoteVersion){
	// someone is trying to change something that was already updated
    	throw new Error("Given version was already applied.");
	} else if ( newRemoteVersion == this.remoteVersion + 1 ){
	// consecutive new version
		while( consecutivePatch ){// process consecutive patch(-es)
			this.remoteVersion++;
			this.obj = apply(this.obj, consecutivePatch);
			consecutivePatch = this.waiting.shift();
		}
	} else {
	// add sequence to queue in correct position.
		this.waiting[newRemoteVersion - this.remoteVersion -2] = consecutivePatch;
	}
};
/**
 * Wraps JSON Patch sequence with version related operation objects
 * @param  {JSONPatch} sequence JSON Patch sequence to wrap
 * @return {VersionedJSONPatch}
 */
JSONPatchQueue.prototype.send = function(sequence){
	this.localVersion++;
	var newSequence = sequence.slice(0);
	if(this.purist){
		newSequence.unshift({ // test for consecutiveness
			op: "test",
			path: this.localPath,
			value: this.localVersion - 1
		},{ // replace for queue
			op: "replace",
			path: this.localPath,
			value: this.localVersion
		});
	} else {
		newSequence.unshift({ // replace for queue (+assumed test for consecutiveness_)
			op: "replace",
			path: this.localPath,
			value: this.localVersion
		});
	}
	return newSequence;
};

JSONPatchQueue.getPropertyByJsonPointer = function(obj, pointer) {
	var parts = pointer.split('/');
	if(parts[0] === "") {
		parts.shift();
	}
	var target = obj;
	while(parts.length) {
		var path = parts.shift().replace('~1', '/').replace('~0', '~');
		if(parts.length) {
			target = target[path];
		}
	}
	return target[path];
};

/**
 * Reset queue internals and object to new, given state
 * @param newState versioned object representing desired state along with versions
 */
JSONPatchQueue.prototype.reset = function(newState){
	this.remoteVersion = JSONPatchQueue.getPropertyByJsonPointer(newState, this.remotePath);
	this.waiting = [];
	var patch = [{ op: "replace", path: "", value: newState }];
	return this.obj = this.apply(this.obj, patch);
};

if(true) {
	module.exports = JSONPatchQueue;
	module.exports.default = JSONPatchQueue;
	/* Babel demands this */
	module.exports.__esModule = true;
}


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * JSON Patch Queue for synchronous operations, and asynchronous networking.
 * version: 3.0.0-rc.0
 * @param {Object} Obj The target object where patches are applied
 * @param {JSON-Pointer} versionPath JSON-Pointers to version numbers
 * @param {function} apply    apply(JSONobj, JSONPatchSequence) function to apply JSONPatch to object.
 * @param {Boolean} [purist]       If set to true adds test operation before replace.
 */
var JSONPatchQueueSynchronous = function(obj, versionPath, apply, purist){

	/**
	 * The target object where patches are applied
	 * @type {Object}
	 */
	this.obj = obj;

	/**
	 * Queue of consecutive JSON Patch sequences. May contain gaps.
	 * Item with index 0 has 1 sequence version gap to `this.version`.
	 * @type {Array}
	 */
	this.waiting = [];
	/**
	 * JSON-Pointer to local version in shared JSON document
	 * @type {JSONPointer}
	 */
	this.versionPath = versionPath;
	/**
	 * Function to apply JSONPatchSequence to JSON object
	 * @type {Function}
	 */
	this.apply = apply;
	/**
	 * If set to true adds test operation before replace.
	 * @type {Bool}
	 */
	this.purist = purist;
};
/** JSON version */
JSONPatchQueueSynchronous.prototype.version = 0;
//JSONPatchQueueSynchronous.prototype.purist = false;
// instance property
//  JSONPatchQueueSynchronous.prototype.waiting = [];
/**
 * Process received versioned JSON Patch.
 * Applies or adds to queue.
 * @param  {JSONPatch} versionedJsonPatch patch to be applied
 * @param  {Function} [applyCallback]     optional `function(object, consecutivePatch)` to be called when applied, if not given #apply will be called
 */
JSONPatchQueueSynchronous.prototype.receive = function(versionedJsonPatch, applyCallback){
	var apply = applyCallback || this.apply,
		consecutivePatch = versionedJsonPatch.slice(0);
	// strip Versioned JSON Patch specyfiv operation objects from given sequence
		if(this.purist){
			var testRemote = consecutivePatch.shift();
		}
		var replaceVersion = consecutivePatch.shift(),
			newVersion = replaceVersion.value;

	// TODO: perform versionedPath validation if needed (tomalec)

	if( newVersion <= this.version){
	// someone is trying to change something that was already updated
    	throw new Error("Given version was already applied.");
	} else if ( newVersion == this.version + 1 ){
	// consecutive new version
		while( consecutivePatch ){// process consecutive patch(-es)
			this.version++;
			this.obj = apply(this.obj, consecutivePatch);
			consecutivePatch = this.waiting.shift();
		}
	} else {
	// add sequence to queue in correct position.
		this.waiting[newVersion - this.version -2] = consecutivePatch;
	}
};
/**
 * Wraps JSON Patch sequence with version related operation objects
 * @param  {JSONPatch} sequence JSON Patch sequence to wrap
 * @return {VersionedJSONPatch}
 */
JSONPatchQueueSynchronous.prototype.send = function(sequence){
	this.version++;
	var newSequence = sequence.slice(0);
	newSequence.unshift({
		op: "replace",
		path: this.versionPath,
		value: this.version
	});
	if(this.purist){
		newSequence.unshift({ // test for purist
			op: "test",
			path: this.versionPath,
			value: this.version-1
		});
	}
	return newSequence;
};

JSONPatchQueueSynchronous.getPropertyByJsonPointer = function(obj, pointer) {
	var parts = pointer.split('/');
	if(parts[0] === "") {
		parts.shift();
	}
	var target = obj;
	while(parts.length) {
		var path = parts.shift().replace('~1', '/').replace('~0', '~');
		if(parts.length) {
			target = target[path];
		}
	}
	return target[path];
};

/**
 * Reset queue internals and object to new, given state
 * @param newState versioned object representing desired state along with versions
 */
JSONPatchQueueSynchronous.prototype.reset = function(newState){
	this.version = JSONPatchQueueSynchronous.getPropertyByJsonPointer(newState, this.versionPath);
	this.waiting = [];
	var patch = [{ op: "replace", path: "", value: newState }];
	return this.obj = this.apply(this.obj, patch);
};

if(true) {
	module.exports = JSONPatchQueueSynchronous;
	module.exports.default = JSONPatchQueueSynchronous;
	/* Babel demands this */
	module.exports.__esModule = true;
}


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

/*!
 * https://github.com/Palindrom/JSONPatchOT
 * JSON-Patch-OT version: 1.0.1
 * (c) 2017 Tomek Wytrebowicz
 * MIT license
 */

var JSONPatchOT = (function(){

  var debug = false;
  var JSONPatchOT = JSONPatchOT || {};
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
              debug && console.log("No function to transform " + originalOp.op + "against" + operationObj.op);
            }
          }
        }
      } else {
        debug && console.log("No function to transform against " + operationObj.op)
      }
      return original;
    };
    var transformAgainst = {
      remove: function(patchOp, original){
        debug && console.log("Transforming ", JSON.stringify(original) ," against `remove` ", patchOp);
        var orgOpsLen = original.length, currentOp = 0, originalOp;
        // remove operation objects
        while (originalOp = original[currentOp]) {


          // TODO: `move`, and `copy` (`from`) may not be covered well (tomalec)
          debug && console.log("TODO: `move`, and `copy` (`from`) may not be covered well (tomalec)");
          if( (originalOp.op === 'add' || originalOp.op === 'test') && patchOp.path === originalOp.path ){
            // do nothing ? (tomalec)
          } else
          // node in question was removed
          if( originalOp.from &&
                  (originalOp.from === patchOp.path || originalOp.from.indexOf(patchOp.path + "/") === 0 ) ||
              ( patchOp.path === originalOp.path || originalOp.path.indexOf(patchOp.path + "/") === 0 ) ){
            debug && console.log("Removing ", originalOp);
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
            debug && console.warn("Bug prone guessing that, as number given in path, this is an array!");

            debug && console.log("Shifting array indexes");
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
        debug && console.log("Transforming ", JSON.stringify(original) ," against `replace` ", patchOp);
        var currentOp = 0, originalOp;
        // remove operation objects withing replaced JSON node
        while (originalOp = original[currentOp]) {


          // TODO: `move`, and `copy` (`from`) may not be covered well (tomalec)
          debug && console.log("TODO: `move`, and `copy` (`from`) may not be covered well (tomalec)");
          // node in question was removed
          // IT:
          // if( patchOp.path === originalOp.path || originalOp.path.indexOf(patchOp.path + "/") === 0 ){
          if( originalOp.from &&
                  (originalOp.from === patchOp.path || originalOp.from.indexOf(patchOp.path + "/") === 0 ) ||
              originalOp.path.indexOf(patchOp.path + "/") === 0 ){
            debug && console.log("Removing ", originalOp);
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
    return JSONPatchOT;
}());

if(true) {
  module.exports = JSONPatchOT;
  module.exports.default = JSONPatchOT;
  module.exports.__esModule = true;
}

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

if(typeof JSONPatchQueue === 'undefined') {
	if(true) {
		var JSONPatchQueue = __webpack_require__(2).JSONPatchQueue;
	}
	else {
		throw new Error('You need to reference JSONPatchQueue before JSONPatchOTAgent');
	}
}

/**
 * [JSONPatchOTAgent description]
 * @param {Object} obj The target object where patches are applied
 * @param {Function} transform function(seqenceA, sequences) that transforms `seqenceA` against `sequences`.
 * @param {Array<JSON-Pointer>} versionPaths JSON-Pointers to version numbers [local, remote]
 * @param {function} apply apply(JSONobj, JSONPatchSequence) function to apply JSONPatch to object. Must return the final state of the object.
 * @param {Boolean} purity 
 * @constructor
 * @extends {JSONPatchQueue}
 * @version: 2.0.0-rc.0
 */
var JSONPatchOTAgent = function(obj, transform, versionPaths, apply, purity){
	JSONPatchQueue.call(this, obj, versionPaths, apply, purity);
	this.transform = transform;
	/**
	 * History of performed JSON Patch sequences that might not yet be acknowledged by Peer
	 * @type {Array<JSONPatch>}
	 */
	this.pending = [];

};
JSONPatchOTAgent.prototype = Object.create(JSONPatchQueue.prototype);
JSONPatchOTAgent.prototype.constructor = JSONPatchOTAgent;
JSONPatchOTAgent.prototype.ackLocalVersion = 0;

/**
 * Wraps JSON Patch sequence with version related operation objects
 * @param  {JSONPatch} sequence JSON Patch sequence to wrap
 * @return {VersionedJSONPatch}
 */
JSONPatchOTAgent.prototype.send = function(sequence){
	var newSequence = sequence.slice(0);
	newSequence.unshift({ // test for conflict resolutions
		op: "test",
		path: this.remotePath,
		value: this.remoteVersion
	});
	var versionedJSONPatch = JSONPatchQueue.prototype.send.call(this, newSequence);
	this.pending.push(versionedJSONPatch);
    return versionedJSONPatch;
};


/**
 * Process received versioned JSON Patch
 * Adds to queue, transform and apply when applicable.
 * @param  {Object} obj object to apply patches to
 * @param  {JSONPatch} versionedJsonPatch patch to be applied
 * @param  {Function} [applyCallback] optional `function(object, consecutiveTransformedPatch)` to be called when applied, must return the final state of the object, if not given #apply will be called
 */
JSONPatchOTAgent.prototype.receive = function(versionedJsonPatch, applyCallback){
	var apply = applyCallback || this.apply,
		queue = this;

	return JSONPatchQueue.prototype.receive.call(this, versionedJsonPatch,
		function applyOT(obj, remoteVersionedJsonPatch){
			// console.log("applyPatch", queue, arguments);
	        // transforming / applying
	        var consecutivePatch = remoteVersionedJsonPatch.slice(0);

	        // shift first operation object as it should contain test for our local version.
	        // ! We assume correct sequence structure, and queuing applied before.
	        //
	        // Latest local version acknowledged by remote
	        // Thanks to the queue version may only be higher or equal to current.
	        var localVersionAckByRemote = consecutivePatch.shift().value;
	        var ackDistance = localVersionAckByRemote - queue.ackLocalVersion;
	        queue.ackLocalVersion = localVersionAckByRemote;

	        //clear pending operations
	        queue.pending.splice(0,ackDistance);
	        if(queue.pending.length){// is there any pending local operation?
	            // => Remote sent us something based on outdated versionDistance
	            // console.info("Transformation needed", consecutivePatch, 'by', queue.nonAckList);
	            consecutivePatch = queue.transform(
	                    consecutivePatch,
	                    queue.pending
	                );
			}
			return queue.obj = apply(queue.obj, consecutivePatch);
		});
};

/**
 * Reset queue internals and object to new, given state
 * @param newState versioned object representing desired state along with versions
 */
JSONPatchOTAgent.prototype.reset = function(newState){
	this.ackLocalVersion = JSONPatchQueue.getPropertyByJsonPointer(newState, this.localPath);
	this.pending = [];
	return this.obj = JSONPatchQueue.prototype.reset.call(this, newState);
};
if(true) {
	module.exports = JSONPatchOTAgent;
	module.exports.default = JSONPatchOTAgent;
	module.exports.__esModule = true;
}

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = URL;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(25);

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);
var bind = __webpack_require__(6);
var Axios = __webpack_require__(26);
var defaults = __webpack_require__(3);

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(11);
axios.CancelToken = __webpack_require__(40);
axios.isCancel = __webpack_require__(10);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(41);

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = __webpack_require__(3);
var utils = __webpack_require__(0);
var InterceptorManager = __webpack_require__(35);
var dispatchRequest = __webpack_require__(36);
var isAbsoluteURL = __webpack_require__(38);
var combineURLs = __webpack_require__(39);

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var createError = __webpack_require__(9);

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response
    ));
  }
};


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 @ @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.response = response;
  return error;
};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      }

      if (!utils.isArray(val)) {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    }
  });

  return parsed;
};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

module.exports = btoa;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);
var transformData = __webpack_require__(37);
var isCancel = __webpack_require__(10);
var defaults = __webpack_require__(3);

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '');
};


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Cancel = __webpack_require__(11);

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),
/* 42 */
/***/ (function(module, exports) {

class PalindromError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}

class PalindromConnectionError extends PalindromError {
  /**
   * 
   * @param {String} message the message that describes the error
   * @param {String} side <Server|Client> the side where the error occured
   * @param {String} url The relevant URL
   * @param {String} connectionType <WebSocket|HTTP>
   */
  constructor(message, side, url = window.location.href, connectionType) {
    if (!side || !['Server', 'Client'].includes(side)) {
      throw new TypeError(
        "Error constructing PalindromConnectionError, `side` parameter is required and can either be 'Server' or 'Client'"
      );
    }
    super(message);
    this.side = side;
    this.message = `${side} error\n\t${message.replace(/\n/g, '\n\t')}`;
    this.url = url;
    this.connectionType = connectionType;
  }
}

module.exports = {
  PalindromError,
  PalindromConnectionError
};


/***/ }),
/* 43 */
/***/ (function(module, exports) {

module.exports = WebSocket;

/***/ })
/******/ ]);