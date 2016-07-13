var app = angular.module('app');

app.directive('contextMenu', function($parse) {
    return function(scope, element) {
        element.bind('contextmenu', function (event) {
            scope.$apply(function() { 
                event.preventDefault();
                console.log("Custom context menu");
            });
        });
    };
});