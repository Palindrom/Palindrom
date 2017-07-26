## Filtering Patches

You can ignore local changes by setting `Palindrom.filter` function. This functions should accept a JSON Patch operation and either return it or return a falsy value. Obviously, returning a falsy value will result an ignored operation.

### Example

```js
const palindrom = new Palindrom({remoteUrl: window.location.href});

palindrom.filter = function(operation) {
  if(!operation.path.startsWith('$')) {
    return operation;
  }
}
// use palindrom.obj
palindrom.obj.$someProperty = "new value"; // this change will be ignored and will not reach the server 

```

