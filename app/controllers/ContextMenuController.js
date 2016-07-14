angular.module('app')
    .controller('ContextMenuController', function ($scope, $element, $rootScope, $document) {
        $element.css({
            position: 'absolute'
        });

        $scope.isVisible = false;
        $rootScope.$on('showContextMenu', function (event, x, y) {
            $scope.isVisible = true;
            $element.css({
                top: y + 'px',
                left: x + 'px'
            });
        });

        $document.on('mousedown', function (event) {
            $scope.$apply(function() {
                $scope.isVisible = false;
                console.log('hide');
            });
        });
    });