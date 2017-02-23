var app = angular.module('MyApp', ['ngPartial', 'animateMeModule', 'xBtnModule', 'uiHandsontable']);

/**
 * AppController
 */
function AppController($scope) {
    $scope.mainFile = window.location.pathname;

    var palindrom = new PalindromDOM({
        remoteUrl: "/Palindrom/lab/angularjs/index.html",
        callback: function (obj) {
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    $scope[i] = obj[i];
                }
                $scope.$apply();
            }
        }
    });

    palindrom.onRemoteChange = function (patches) {
        jsonpatch.apply($scope, patches);
        $scope.$apply();
    };
}