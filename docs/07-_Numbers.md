### Numbers

Palindrom is a JavaScript library that binds client-side view-models to server side view-models. While Palindrom is a JavaScript library, the server may or may not be built with JavaScript. And this can result in some differences in data types, particularly in numbers. To quote MDN's [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) page:

>```
var biggestInt = 9007199254740991;
var smallestInt = -9007199254740991
```

> When parsing data that has been serialized to JSON, integer values falling out of this range can be expected to become corrupted when JSON parser coerces them to Number type. Using String instead is a possible workaround.

#### Numbers validation

To ensure the validity of your data all the time, Palindrom validates each number it comes across from both endpoints:

- **Server's endpoint**: It calls `onIncomingPatchValidationError` with a `RangeError` with an elaborate message.
- **Client's endpoint**: It calls `onOutgointPatchValidationError` with a `RangeError` with an elaborate message.

For more information about these callbacks, please refer to Section 2.
