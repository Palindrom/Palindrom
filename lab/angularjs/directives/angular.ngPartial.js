angular.module('ngPartial', []).directive('ngPartial', function ($http, $templateCache, $compile, $parse) {
  return {
    restrict: 'ECA',
    terminal: true,
    compile: function (element, attr) {
      var srcExp = attr.ngPartial || attr.src,
        onloadExp = attr.onload || '';

      return function (scope, element) {
        var changeCounter = 0,
          childScope;

        var clearContent = function () {
          if (childScope) {
            childScope.$destroy();
            childScope = null;
          }

          element.html('');
        };

        scope.$watch(srcExp, function ngIncludeWatchAction(value) {
          var thisChangeId = ++changeCounter;

          if (value) {
            if (value.indexOf('/') === 0 || value.indexOf('./') === 0) {
              $http.get(value, {cache: $templateCache}).success(function (response) {
                if (thisChangeId !== changeCounter) return;

                if (childScope) childScope.$destroy();
                childScope = scope.$new();

                element.html(response);
                $compile(element.contents())(childScope);

                childScope.$emit('$includeContentLoaded');
                scope.$eval(onloadExp);
              }).error(function () {
                  if (thisChangeId === changeCounter) clearContent();
                });
            }
            else {
              if (thisChangeId !== changeCounter) return;

              if (childScope) childScope.$destroy();
              childScope = scope.$new();

              element.html(value);
              $compile(element.contents())(childScope);

              childScope.$emit('$includeContentLoaded');
              scope.$eval(onloadExp);
            }
          }
          else {
            clearContent();
          }
        });
      };
    }
  };
});