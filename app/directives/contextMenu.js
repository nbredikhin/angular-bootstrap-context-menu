var app = angular.module('app');

app.directive('contextMenu', function($document, $rootScope) {
    return {
        link: function(scope, element, attrs) {
            element.on('contextmenu', function (event) {
                $rootScope.$apply(function() {
                    event.preventDefault();
                    $rootScope.$emit('showContextMenu', event.pageX, event.pageY, scope, attrs, element);
                });
            });
        }
    }
});