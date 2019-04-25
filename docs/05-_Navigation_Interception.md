# Navigation Interception

PalindromDOM gives a regular HTML document the benefits of a single-page application by adding a special optimisation to the internal web links.

Regular links in the current host are cancelled and replaced by a GET `XMLHttpRequest` to the same URL with `Accept: application/json-patch+json` header. Upon this request, the server modifies the model and responds with a patch that contains the minimum set of changes to navigate to the URL.

The browser navigation (i.e. the back, forward and reload buttons) is preserved by the use of the HTML5 History API.

Only links in the current host without the target attribute or with the target attribute set to `_self` are intercepted.

### How to disable interception for an HTML link

Sometimes, you need to disable interception even for links within the application. And as mentioned above, if you set the target attribute to anything else than `_self`, the navigation from that anchor will not be intercepted.

Example:

```html
<a href="internalLink.html" target="_top">Go to internal link</a>
```

... even if `internalLink.html` is part of your application, PalindromDOM will not intercept the navigation and the browser will issue a full HTTP request to `internalLink.html`.

As the value of the `target` attribute, you might consider one of the following keywords that have a special meaning in HTML:

-   `_top` - load the URL into the current browser tab or window
-   `_blank` - load the URL into a new browser tab or window

You can find more information on the `target` attribute at [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a).

### Cancellable events before and after navigation

Before and after morphing the page upon navigation within your app, Palindrom dispatches bubbling navigation events, `palindrom-before-navigation` and `palindrom-after-navigation`. You can use these events to watch or even cancel navigation.

To cancel Palindrom navigation, you can cancel `palindrom-before-navigation` event by calling `event.preventDefault()` inside your event handler. Then, after you show your confirmation box or whatever purpose you canceled the navigation for, you can continue the navigation by calling `palindrom.morphUrl` to the same URL. To record the navigation URL, you can get it from `event.detail.href` of `palindrom-before-navigation` event.

#### Note

A programmatic call to `palindrom.morphUrl` also triggers the navigation events listed above. To distinguish between the events caused by a user interaction and a call to `palindrom.morphUrl`, you may use a local variable.

##### Example

```js
let handledNavigation = false;
document.addEventListener('palindrom-before-navigation', event => {
    if (!handledNavigation) {
        if (confirm('Are you sure you want to leave this page?')) {
            // to prevent futher blockage
            handledNavigation = true;
            palindrom.morphUrl(event.detail.href);
        } else {
            // to show the dialog when navigation happens again
            handledNavigation = false;
        }
    }
});
```

Palindrom only triggers the events `palindrom-before-navigation` and `palindrom-after-navigation` for the intercepted links. For non-intercepted links, you may use the native [beforeunload](`https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event`) event.
