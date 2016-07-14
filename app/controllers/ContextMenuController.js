angular.module('app')
    .controller('ContextMenuController', function ($scope, $element, $rootScope, $document) {
        // Scope элемента, по которому было открыто меню
        var menuElementScope;
        
        $scope.isVisible = false;
        $scope.items = [
            // {text: 'item 1'},
            // {text: 'item 2'},
            // {text: 'item 3'}
        ];

        // Абсолютное позиционирование для меню
        $element.css({
            position: 'absolute'
        });

        // Событие, вызываемое директивой
        $rootScope.$on('showContextMenu', function (event, x, y, scope, attrs, element) {
            var properties = scope.$eval(attrs.contextMenu);
            if (typeof(properties) != 'object' || typeof(properties.items) != 'object') {
                return;
            }
            menuElementScope = scope;
            $scope.items = [];
            properties.items.forEach(function(item) {
                // CSS-класс, показывающий, включена ли кнопка
                var enabledClass = '';
                if (typeof(item.enabled) === 'string') {
                    var enabled = scope.$eval(item.enabled);
                    if (!enabled) {
                        enabledClass = 'disabled';
                    }
                }
                $scope.items.push({
                    text: item.text,
                    enabledClass: enabledClass,
                    click: item.click,
                });
            });

            // Отображение меню в точке клика
            $scope.isVisible = true;
            $element.css({
                top: y + 'px',
                left: x + 'px'
            });
        });

        // Скрыть меню по клику в любом месте
        $document.on('mousedown', function (event) {
            $scope.$apply(function() {
                $scope.isVisible = false;
            });
        });
    });