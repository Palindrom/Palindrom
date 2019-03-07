export async function sleep(milliseconds) {
    return new Promise(r => setTimeout(r, milliseconds));
}
export function createAndClickOnLinkWithoutPrevention(
    href,
    parent,
    target,
    download
) {
    parent = parent || document.body;
    const a = document.createElement('A');
    a.innerHTML = 'Link';
    a.href = href;
    (target || target === '') && a.setAttribute('target', target);
    (download || download === '') && a.setAttribute('download', download);
    parent.appendChild(a);
    clickElement(a);
    parent.removeChild(a);
}

export function getTestURL(pathname, isRelative, ws = false) {
    if (isRelative) {
        return `/${pathname}`;
    }
    return (
        (ws ? 'ws:' : window.location.protocol) +
        '//' +
        window.location.host +
        `/${pathname}`
    );
}
export function createAndClickOnLink(href, parent, target) {
    parent = parent || document.body;
    const a = document.createElement('A');
    a.innerHTML = 'Link';
    a.href = href;
    target && (a.target = target);
    parent.appendChild(a);
    parent.addEventListener('click', clickHandler);
    clickElement(a);
    parent.removeEventListener('click', clickHandler);
    parent.removeChild(a);
}
export function createAndClickOnLinkNested(href, parent) {
    parent = parent || document.body;
    const a = document.createElement('A');
    a.innerHTML = '<strong>Link</strong>';
    a.href = href;
    parent.appendChild(a);
    parent.addEventListener('click', clickHandler);
    clickElement(a.firstChild);
    parent.removeEventListener('click', clickHandler);
    parent.removeChild(a);
}

export function clickElement(element) {
    if (window.MouseEvent) {
        const event = new window.MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }
}

export function createAndClickOnLinkNestedShadowDOM(href, parent) {
    parent = parent || document.body;
    const div = document.createElement('DIV');
    parent.appendChild(div);

    const a = document.createElement('A');
    a.innerHTML = '<strong>Link</strong>';
    a.href = href;
    div.createShadowRoot().appendChild(a);
    parent.addEventListener('click', clickHandler);
    clickElement(a.firstChild);

    parent.removeEventListener('click', clickHandler);
    parent.removeChild(div);
}
export function createAndClickOnLinkNestedShadowDOMContent() {
    const btn = document.querySelector('my-menu-button strong');
    btn.click();
}

export function clickHandler(event) {
    event.preventDefault();
}