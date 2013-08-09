//https://developer.mozilla.org/en-US/docs/Web/Guide/DOM/Events/Creating_and_triggering_events
function triggerMouseup(elem) {
  var event = new MouseEvent('mouseup', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
  (elem || document.body).dispatchEvent(event);
}