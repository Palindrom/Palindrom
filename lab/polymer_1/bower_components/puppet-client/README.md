# &lt;puppet-client&gt;

> Custom Element to bind server-side view models with HTML nodes (HTML Templates/Web Components/AngularJs Apps) using [PuppetJS](https://github.com/PuppetJs/PuppetJs) [communication](https://github.com/PuppetJs/PuppetJs/wiki/Server-communication) ([JSON-Patch](http://tools.ietf.org/html/rfc6902))

## Demo

[Example with Polymer app](http://PuppetJs.github.io/puppet-client/examples/polymer/)

## Install

Install the component using [Bower](http://bower.io/):

```sh
$ bower install puppet-client --save
```

Or [download as ZIP](https://github.com/PuppetJs/puppet-client/archive/master.zip).

## Usage

1. Import Web Components' polyfill:

    ```html
    <script src="bower_components/webcomponentsjs/webcomponents.js"></script>
    ```

2. Import Custom Element:

    ```html
    <link rel="import" href="bower_components/puppet-client/src/puppet-client.html">
    ```

3. Start using it!

    ```html
    <puppet-client ref="nodeToBind"></puppet-client>
    ```

## Attributes
All attributes are optional.
See [PuppetJS options](https://github.com/PuppetJs/PuppetJs#options-constructor-parameters)

Attribute          | Options       | Default                | Description
---                | ---           | ---                    | ---
`ref`              | *String*      |                        | **required** Id or object reference to DOM Element to bind with server
`remoteUrl`        | *String*      | `window.location.href` | Data (view model) server URL
`ignoreAdd`        | *String*      | `".*"`                 | Regular expression with local properties to ignore (see [PuppetJS.ignoreAdd](https://github.com/PuppetJs/PuppetJs#ignoring-local-changes-ignoreadd)). Should be given in string format, like `"_.+"`.
`useWebSocket`     | *String*      | `true`                 | Set to `false` to disable WebSocket (use HTTP)
`debug`            | *Boolean*     | `true`                 | Set to true to enable debugging mode
`onRemoteChange`   | *Function*    |                        | Helper callback triggered each time a patch is obtained from server
`localVersionPath` | *JSONPointer* | `"_ver#c$"`            | local version path, set to falsy do disable Versioned JSON Patch communication
`remoteVersionPath`| *JSONPointer* | `"_ver#s"`             | remote version path, set it to falsy to disable Double Versioned JSON Patch communication
`ot`               | *Boolean*     | `true`                 | `false` to disable OT
`purity`           | *Boolean*     | `false`                | true to enable purist mode of OT
`listen-to`		   | *String*      | `document.body`        | DOM node to listen to (see [PuppetDOM listenTo attribute](https://github.com/PuppetJs/PuppetJs#puppetdom))

## Events
Name                 | Arguments                                                             | Descriptions
---                  | ---                                                                   | ---
`patchreceived`      | *String* `data`, *String* `url`, *String*, `method`                   | Occurs when a JSON-patch is received.
`patchsent`          | *String* `data`, *String* `url`, *String*, `method`                   | Occurs when a JSON-patch is sent.
`socketstatechanged` | *int* `state`, *String* `url`, *String* `data`, *int* `code`, *String* `reason` | Occurs when sockets changes its state.

## Properties, Methods, Events

`<puppet-client>` inherits from `Puppet` so take a look at [PuppetJs API](https://github.com/PuppetJs/PuppetJs).

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

### Releases

To release new version run
```sh
grunt uglify bump

```
## History

For detailed changelog, check [Releases](https://github.com/PuppetJs/puppet-client/releases).

## License

[MIT License](http://opensource.org/licenses/MIT)
