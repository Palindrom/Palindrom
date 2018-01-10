# Filtering and ignoring changes

Palindrom deeply observes changes made to the `palindrom.obj` object and converts them to patches. If you have a need to ignore some kind of changes, there are two ways to do it. Either make the changes in non-enumerable property or use a filtering function to ignore changes made in the enumerable properties.

### 1. By defining non-enumerable properties _(recommended)_:

Palindrom only generates patches for the enumerable properties of `palindrom.obj` and its subtrees. To create a part of the tree that is invisible for Palindrom's patch collection, define a non-enumerable property.

Assuming your Palindrom instance is instantiated and your `palindrom.obj` is ready, you can create a non-enumerable object child in `palindrom.obj` and use it as a local non-observed store for your needs.

#### Example:

```js
Object.defineProperty(palindrom.obj, "myLocalNonSyncedObject", {
    enumerable: false,
    value: {}
});
```
Now `palindrom.obj.myLocalNonSyncedObject` is an object this is not observed for patch generation. This is ideal for keeping client-side related information (eg: div height, or something like `isModalWarningDisplayed = true`).

Example:

```js
palindrom.obj.myLocalNonSyncedObject.divHeight = 50;
```
... does not generate a patch.

**Note:  In most cases, the added property is recommended to be an object.***

_*Note: You should not replace the value of the non-enumerable property after it has been defined. Otherwise Palindrom will still detect the change. If you want to modify the unobserved values, you should declare the non-enumerable property as an object and only modify its children._

### 2. By extending `Palindrom#filterLocalChange`

You can discard a generated patch by extending `Palindrom.filterLocalChange` function. This function accepts a JSON Patch operation and either returns it or returns a falsy value. Returning a falsy value results in ignoring this operation.

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
