function triggerMouseup(elem) {
  fireEvent((elem || document.body), 'mouseup')
}

//http://stackoverflow.com/questions/827716/emulate-clicking-a-link-with-javascript-that-works-with-ie
function fireEvent(obj, evt) {
  var fireOnThis = obj;
  if (document.createEvent) {
    var evObj = document.createEvent(evt.indexOf('mouse') > -1 ? 'MouseEvents' : 'KeyboardEvent');
    evObj.initEvent(evt, true, false);
    fireOnThis.dispatchEvent(evObj);

  } else if (document.createEventObject) {
    var evObj = document.createEventObject();
    fireOnThis.fireEvent('on' + evt, evObj);
  }
}