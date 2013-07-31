// creative the directives as re-usable components
angular
  .module('xBtnModule', [])
  .directive('btnGroup', function () {
    return {
      restrict: 'E',
      link: function (scope, element, attrs) {
        var $wrapper = $('<div class="btn-group"></div>');
        element.replaceWith($wrapper);
        $wrapper.append(element);
        $wrapper.after($('<div class="clear"></div>'));
      }
    };
  })

  .directive('btn', function () {
    return {
      scope: {
        'skin': '@',
        'label': '@',
        'value': '@'
      },
      restrict: 'E',
      replace: true,
      template: '<div class="btn {{ skin }}">' +
        '<div class="small">{{ label }}</div>' +
        '<div class="big">{{ value }}</div>' +
        '</div>',
      link: function (scope, element, attrs) {
      }
    };
  });