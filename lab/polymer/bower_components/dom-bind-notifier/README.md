# &lt;dom-bind-notifier&gt;

> Adds good old Object.observe to Polymer 1.x template binding (dom-bind)

So you no longer have to worry about notifying your elements.
With single element, you get real TWO-way data-binding for HTML Templates.
DOM stays in sync with any JS object you provide.


## Demo

[Check it live!](http://Juicy.github.io/dom-bind-notifier)

## Install

Install the component using [Bower](http://bower.io/):

```sh
$ bower install dom-bind-notifier --save
```

Or [download as ZIP](https://github.com/Juicy/dom-bind-notifier/archive/gh-pages.zip).

## Usage

1. Import Web Components' polyfill, if needed:

    ```html
    <script src="bower_components/webcomponentsjs/webcomponents.js"></script>
    ```

2. Import Custom Element:

    ```html
    <link rel="import" href="bower_components/dom-bind-notifier/dom-bind-notifier.html">
    ```

3. Start using it!

    ```html
    <template is="dom-bind">
      <!-- your magic goes here -->
      <h1>{{path.to.my.magic}}</h1>
      <dom-bind-notifier observed-object="{{path.to}}" path="path.to" deep></dom-bind-notifier>
    </template>
    ```
    Use it always inside `dom-bind`, preferably as the last child.

## Object.observe

Please note, that we use [`Object.observe` & `Array.observe`](http://wiki.ecmascript.org/doku.php?id=harmony:observe), so if your environment does not support it, you will need a shim.

## Polymer 0.5.x to 1.0.x

If your old code looked as follows:

```html
<template id="root" bind>
    <label>Company name <input value="{{name}}"></label>
    <h3>Employee list:</h3>
    <template repeat="{{employees}}">
        <li><template if="{{htmlDev}}">★</template><input type="text" value="{{firstName}}"/></li>
    </template>
</template>
<script>
 document.getElementById("root").model = my_DB_data_handle_by_my_awsome_app;
</script>
```
You can now get same behavior in Polymer 1.0.x with:
```html
<template id="root" is="dom-bind">
    <label>Company name <input value="{{model.name::input}}"></label>
    <h3>Employee list:</h3>
    <template is="dom-repeat" items="{{model.employees}}">
        <li><template is="dom-if" if="{{item.htmlDev}}" restamp>★</template><input type="text" value="{{item.firstName::input}}"/></li>
    </template>
    <dom-bind-notifier observed-object="{{model}}" path="model" deep></dom-bind-notifier>
</template>
<script>
 document.getElementById("root").model = my_DB_data_handle_by_my_awsome_app;
</script>
```


## Options

Attribute         | Options   | Default | Description
---               | ---       | ---     | ---
`path`            | *String*  |         | (**required**) Path of observed object in scope of `ref`erenced `dom-bind`
`deep`            | *Boolean* | `false` | Should we observe objects deeply
`ref`             | *String*  |         | Id of `dom-bind` element to notify, if not given will use next sibling, or containing dom-bind.
`observed-object` | *Object*  |         | Object to bind to, if other `dombind.get(path)`

## Events

Event    | Details                                       | Description
---      | ---                                           | ---
`change` | *Array* of changes in `Object.observe` format | Triggers when `dom-bind` gets notified with some changes

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

For detailed changelog, check [Releases](https://github.com/Juicy/dom-bind-notifier/releases).

## License

[MIT License](http://opensource.org/licenses/MIT)
