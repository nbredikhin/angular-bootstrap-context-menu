'use strict';

angular.module('contextMenu', [])
    .controller('ContextMenuController', function ($scope, $document, $element) {
        // Элемент меню
        let isVisible = false;
        let menuElements = [];

        let handleItemClick = (item) => {    
            switch (typeof(item.click)) {
                case 'function':
                    click();
                    break;
                case 'string':
                    console.log($scope.$eval(item.click));
                    break;
            }

            this.hideMenu();
        };

        // Добавить меню/подменю
        this.addMenu = (x, y, items) => {
            let div = angular.element('<div>');
            div.addClass('btn-group-vertical context-menu');
            div.attr({role: 'group'});
            div.css({
                position: 'absolute',
                left: x + 'px',
                top: y + 'px'
            });

            // Добавить кнопки
            angular.forEach(items, (item) => {
                let button = angular.element('<button>');
                button.addClass('btn btn-default text-left context-menu-item');
                button.text(item.text);
                div.append(button);

                // Включена ли кнопка
                let isEnabled = true;
                if (typeof(item.enabled) === 'string') {
                    isEnabled = $scope.$eval(item.enabled);
                    if (!isEnabled) {
                        button.addClass('disabled');
                    }
                }

                // Обработка нажатия
                if (isEnabled) {                    
                    button.on('click', (event) => handleItemClick(item));
                }
            });

            // Добавить меню
            angular.element($element).append(div);
            menuElements.push(div);
        };

        // Отобразить контекстное меню
        this.showMenu = (x, y, items) => {
            this.addMenu(x, y, items);
            isVisible = true;
        };
        
        // Удалить контекстное меню
        this.hideMenu = () => {
            if (!isVisible) {
                return;
            }            
            isVisible = false;
            angular.forEach(menuElements, (element) => {
                element.remove();
            });
            menuElements = [];
        };

        $document.on('mousedown', (event) => {
            if (!isVisible) {
                return;
            }
            if (angular.element(event.target).hasClass('context-menu') || 
                angular.element(event.target).hasClass('context-menu-item')) 
            {
                return;
            }
            this.hideMenu();
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
                            $rootScope.activeContextMenuController.hideMenu();
                        }
                        let items = scope.$eval(attrs.contextMenu);
                        controller.showMenu(event.pageX, event.pageY, items);
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