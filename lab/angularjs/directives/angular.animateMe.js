angular.module('animateMeModule', [])
  .directive('animateMe', function () {
    // return the directive link function. (compile function not needed)
    function animateElement(element) {
      var step = 0
        , duration = 30
        , indentInterval;

      function easeOutQuad(t) {
        //https://gist.github.com/gre/1650294
        return t * (2 - t)
      }

      function refreshPosition() {
        //calculate progress
        var progress = easeOutQuad(step / duration);
        step++;

        //render new position
        var position = parseInt(-200 + 200 * progress);
        element.style.marginLeft = position + 'px';

        //stop animation when finished
        if (position >= 0) {
          clearInterval(indentInterval);
        }
      }

      //motion
      indentInterval = setInterval(function () {
        refreshPosition();
      }, 30);

      refreshPosition();
    }

    return function (scope, element, attrs) {
      animateElement(element[0]);
    }
  });