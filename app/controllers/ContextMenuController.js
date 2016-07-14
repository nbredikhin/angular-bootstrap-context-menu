angular.module('app')
    .controller('ContextMenuController', function ($scope, $element, $rootScope, $document, $timeout) {
        // элемент, по которому было открыто меню
        var currentMenuElement;
        
        $scope.isVisible = false;
        $scope.isContextMenuScope = true;
        $scope.items = [];

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
            currentMenuElement = element;
            $scope.items = [];
            properties.items.forEach(function(item) {
                // CSS-класс, показывающий, включена ли кнопка
                var enabled = true;
                if (typeof(item.enabled) === 'string') {
                    enabled = scope.$eval(item.enabled);
                }
                $scope.items.push({
                    text: item.text,
                    enabled: enabled,
                    click: item.click,
                });
            });

            // Отображение меню в точке клика
            $scope.isVisible = true;
            // Скрыть меню, пока оно отрисовывается, чтобы избежать мигания
            angular.element($element).addClass("hidden");
            // offsetWidth равно нулю сразу после появления меню, поэтому нужно дождаться отрисовки
            $timeout(function () {
                angular.element($element).removeClass("hidden");

           	    var width = angular.element($element).prop("offsetWidth");
           	    var height = angular.element($element).prop("offsetHeight");
                var menuX = Math.min(x, window.innerWidth - width - 20);
                //var menuY = Math.min(y, window.innerHeight - height - 20);
                $element.css({
                    top: y + 'px',
                    left: menuX + 'px'
                });                   
            })
        });

        // Скрыть меню по клику в любом месте
        $document.on('mousedown', function (event) {
            $scope.$apply(function() {
                if (!event.target || !angular.element(event.target).scope().isContextMenuScope) {
                    $scope.hide();
                }
            });
        });

        $scope.itemClick = function (index) {
            var item = $scope.items[index];
            if (!item.enabled) {
                return;
            }            
            var click = item.click;
            switch (typeof(click)) {
                case 'function':
                    click(currentMenuElement);
                    break;
                case 'string':
                    currentMenuElement.scope().$eval(click);
                default:
                    break;
            }
            // Скрыть меню после выбора пункта
            $scope.hide();      
        };

        // Скрыть активное контекстное меню
        $scope.hide = function () {
            $scope.isVisible = false;
            $scope.items = [];
            currentMenuElement = null;
        }
    });