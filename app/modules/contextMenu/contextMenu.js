'use strict';

angular.module('contextMenu', [])
    .controller('ContextMenuController', function ($scope, $document, $element) {
        // Элемент меню
        let menuElement;

        // Добавить меню/подменю
        this.addMenu = (x, y, items) => {
            let div = angular.element('<div>');
            div.addClass('btn-group-vertical');
            div.attr({role: 'group'});
            div.css({
                position: 'absolute',
                left: x + 'px',
                top: y + 'px'
            });

            angular.forEach(items, (item) => {
                let button = angular.element('<button>');
                button.addClass('btn');
                button.addClass('btn-default');
                button.text(item);
                div.append(button);
            });

            angular.element($document).find('body').append(div);

            menuElement = div;
        };

        // Отобразить контекстное меню
        this.showMenu = (x, y, scope, attrs, element) => {
            this.addMenu(x, y, [
                'action 1',
                'action 2',
                "action 3"
            ]);
        };
        
        // Удалить контекстное меню
        this.removeMenu = () => {
            if (!menuElement) {
                return;
            }            
            menuElement.remove();
            menuElement = undefined;
        };

        $document.on('mousedown', () => {
            if (!menuElement) {
                return;
            }
            this.removeMenu();
        });
    })

    .directive('contextMenu', function($document, $rootScope) {
        return {
            controller: 'ContextMenuController',
            link: (scope, element, attrs, controller) => {
                element.on('contextmenu', function (event) {
                    $rootScope.$apply(function() {
                        event.preventDefault();
                        event.stopPropagation();

                        if ($rootScope.activeContextMenuController) {
                            $rootScope.activeContextMenuController.removeMenu();
                        }
                        controller.showMenu(event.pageX, event.pageY, scope, attrs, element);
                        $rootScope.activeContextMenuController = controller;
                    });
                });
            }
        };
    });

    // .controller('ContextMenuController', function ($scope, $element, $rootScope, $document, $timeout) {
    //     // элемент, по которому было открыто меню
    //     var currentMenuElement;
        
    //     $scope.isVisible = false;
    //     $scope.isContextMenuScope = true;
    //     $scope.items = [];

    //     // Абсолютное позиционирование для меню
    //     $element.css({
    //         position: 'absolute'
    //     });

    //     var showSubMenu = function () {

    //     };

    //     // Событие, вызываемое директивой
    //     $rootScope.$on('showContextMenu', function (event, x, y, scope, attrs, element) {
    //         var properties = scope.$eval(attrs.contextMenu);
    //         if (typeof(properties) != 'object' || typeof(properties.items) != 'object') {
    //             return;
    //         }
    //         currentMenuElement = element;
    //         $scope.items = [];
    //         properties.items.forEach(function(item) {
    //             // CSS-класс, показывающий, включена ли кнопка
    //             var enabled = true;
    //             if (typeof(item.enabled) === 'string') {
    //                 enabled = scope.$eval(item.enabled);
    //             }
    //             $scope.items.push({
    //                 text: item.text,
    //                 enabled: enabled,
    //                 click: item.click,
    //                 submenu: item.submenu
    //             });
    //         });

    //         // Отображение меню в точке клика
    //         $scope.isVisible = true;
    //         // Скрыть меню, пока оно отрисовывается, чтобы избежать мигания
    //         angular.element($element).addClass("hidden");
    //         // offsetWidth равно нулю сразу после появления меню, поэтому нужно дождаться отрисовки
    //         $timeout(function () {
    //             angular.element($element).removeClass("hidden");

    //        	    var width = angular.element($element).prop("offsetWidth");
    //        	    var height = angular.element($element).prop("offsetHeight");
    //             var menuX = Math.min(x, window.innerWidth - width - 20);
    //             //var menuY = Math.min(y, window.innerHeight - height - 20);
    //             $element.css({
    //                 top: y + 'px',
    //                 left: menuX + 'px'
    //             });                   
    //         });
    //     });

    //     // Скрыть меню по клику в любом месте
    //     $document.on('mousedown', function (event) {
    //         $scope.$apply(function() {
    //             if (!event.target || !angular.element(event.target).scope().isContextMenuScope) {
    //                 $scope.hide();
    //             }
    //         });
    //     });

    //     $scope.itemClick = function (index) {
    //         var item = $scope.items[index];
    //         if (!item.enabled) {
    //             return;
    //         }            
    //         var click = item.click;
    //         switch (typeof(click)) {
    //             case 'function':
    //                 click(currentMenuElement);
    //                 break;
    //             case 'string':
    //                 currentMenuElement.scope().$eval(click);
    //             default:
    //                 break;
    //         }
    //         // Скрыть меню после выбора пункта
    //         $scope.hide();      
    //     };
        
    //     $scope.itemMouseOver = function (index) {
    //         var item = $scope.items[index];
    //         if (!item.enabled) {
    //             return;
    //         }       	
    //         if (item.submenu) {
    //             // console.log('Show submenu');
    //         }
    //     };

    //     // Скрыть активное контекстное меню
    //     $scope.hide = function () {
    //         $scope.isVisible = false;
    //         $scope.items = [];
    //         currentMenuElement = null;
    //     };
    // });