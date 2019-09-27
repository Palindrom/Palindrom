# Numbers

Palindrom is a JavaScript library that binds client-side view-models to server side view-models. While Palindrom is a JavaScript library, the server may or may not be built with JavaScript. And this can result in some differences in data types, particularly in numbers. To quote MDN's [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) page:

```js
var biggestInt = 9007199254740991;
var smallestInt = -9007199254740991
```

> When parsing data that has been serialized to JSON, integer values falling out of this range can be expected to become corrupted when JSON parser coerces them to Number type. Using String instead is a possible workaround.

It is not a limitation of JSON, but of JavaScript, that all numbers are stored in memory as float64 (equivalent to `Double` in C#). This means that numbers larger than +/- **9007199254740991** cannot be used in JavaScript without losing precision. 

#### Numbers validation

To ensure the validity of your data, Palindrom validates each number it receives from the remote and throws an error when it encounters an out-of-range value. It calls `onIncomingPatchValidationError` with a `RangeError` with an elaborate message.

For more information about this callback, please refer to Section 2.

> Please note, that Palindrom operates in JavaScript environment, that means Numbers above `MAX_SAFE_INTEGER` are also not safe for local Palindrom. `JSONPatcherProxy` used by Palindrom to observe changes in your local object may not observe the changes that happen above `MAX_SAFE_INTEGER`, see [limitations section in JSONPatcherProxy README](https://github.com/Palindrom/JSONPatcherProxy#limitations). This means, no error will be thrown and no patch will be issued when you change, for example `Number.MAX_SAFE_INTEGER + 1` to `Number.MAX_SAFE_INTEGER + 2`.
