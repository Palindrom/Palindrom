## Filtering Patches

### 1. By defining non-enumerable properties _(recommended)_:
Assuming your Palindrom instance is instantiated and your `palindrom.obj` is ready, you can create a non-enumerable object child in `palindrom.obj` and use it as a local non-synced store for your needs.

#### Example:

```js
Object.defineProperty(palindrom.obj, "myLocalNonSyncedObject", {
    enumerable: false,
    value: {},
    writable: true
});
```
Now `palindrom.obj.myLocalNonSyncedObject` is an object this is not synced with the server. This is ideal for keeping client-side related information (eg: div height, or something like `isModalWarningDisplayed = true`).

Example:

```js
palindrom.obj.myLocalNonSyncedObject.divHeight = 50;
```
... is a local change.

**Note:  The added property must be an object.***

_*Adding a non-enumerable property adds a property to the object in a non-synced manner, however, if you modify this property Palindrom will nonetheless try to sync it. To overcome that, the added property must be an object that doesn't change itself, only its children do, and that doesn't trigger Palindrom._

### 2. By extending `Palindrom#filterLocalChange`

You can ignore local changes by exteding `Palindrom.filterLocalChange` function. This function should accept a JSON Patch operation and either return it or return a falsy value. Obviously, returning a falsy value will result an ignored operation.

### Example

```js
const palindrom = new Palindrom({ remoteUrl: window.location.href });

var old = palindrom.filterLocalChange;
palindrom.filterLocalChange = function(operation) {
    operation = old.call(palindrom, operation); //make sure you don't overwrite other filters
    if (operation && !operation.path.startsWith('$')) {
        return operation;
    }
}
// use palindrom.obj
palindrom.obj.$someProperty = 'new value'; // this change will be ignored and will not reach the server
```
You can also pass `filterLocalChange` to Palindrom constructor as in:

```js
const palindrom = new Palindrom({ remoteUrl: window.location.href, filterLocalChange: op => !op.path.startsWith('$') && op });
```
