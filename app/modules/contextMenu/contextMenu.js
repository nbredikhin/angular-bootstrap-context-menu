'use strict';

angular.module('contextMenu', [])
    .controller('ContextMenuController', function ($scope, $document, $element) {
        // Элемент меню
        let isVisible = false;
        let activeMenus = [];

        let handleItemClick = (item) => {    
            switch (typeof(item.click)) {
                case 'function':
                    click();
                    break;
                case 'string':
                    $scope.$eval(item.click);
                    break;
            }

            this.hide();
        };

        let handleItemMouseOver = (event, menu, button, item) => {
            // Скрыть все вложенные меню уровнем выше
            let menusToRemove = [];
            angular.forEach(activeMenus, (m) => {
                if (m.depth > menu.depth) {
                    menusToRemove.push(m);
                }
            });
            angular.forEach(menusToRemove, (m) => this.removeMenu(m));

            // Отобразить вложенное меню
            if (item.submenu) {
                let position = angular.element(button).offset();
                let x = position.left + angular.element(menu.element).width();
                let y = position.top;
                this.addMenu(x, y, item.submenu, menu.depth + 1);
            }
        };

        // Добавить меню/подменю
        this.addMenu = (x, y, items, depth = 0) => {
            let div = angular.element('<div>');
            div.addClass('btn-group-vertical context-menu');
            div.attr({role: 'group'});
            div.css({
                position: 'absolute',
                left: x + 'px',
                top: y + 'px'
            });

            let menu = {
                element: div, 
                depth // Уровень вложенности
            };

            // Добавить кнопки
            angular.forEach(items, (item) => {
                let button = angular.element('<button>');
                button.addClass('btn btn-default text-left context-menu-item');                
                button.append(item.text);
               	if (item.submenu) {
                    let span = angular.element('<span>');
                    span.addClass('glyphicon glyphicon-triangle-right');
                    button.append(span);
                }
                div.append(button);

                // Включена ли кнопка
                let isEnabled = true;
                if (typeof(item.enabled) === 'string') {
                    isEnabled = $scope.$eval(item.enabled);
                    if (!isEnabled) {
                        button.addClass('disabled');
                    }
                }

                // Обработка мыши
                if (isEnabled) {                    
                    button.on('click', (event) => handleItemClick(item));
                    button.on('mouseover', (event) => handleItemMouseOver(event, menu, button, item));
                }
            });

            // Добавить меню
            angular.element($document).find('body').append(div);
            activeMenus.push(menu);
        };

        this.removeMenu = (menu) => {
            if (!isVisible) {
                return;
            }
            let index = activeMenus.indexOf(menu);
            if (index < 0) {
                return;
            }
            activeMenus.splice(index, 1);
            menu.element.remove();
        };

        // Отобразить контекстное меню
        this.show = (x, y, items) => {
            this.addMenu(x, y, items);
            isVisible = true;
        };
        
        // Удалить контекстное меню
        this.hide = () => {
            if (!isVisible) {
                return;
            }            
            isVisible = false;
            angular.forEach(activeMenus, (menu) => {
                menu.element.remove();
            });
            activeMenus = [];
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
            this.hide();
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
                            $rootScope.activeContextMenuController.hide();
                        }
                        let items = scope.$eval(attrs.contextMenu);
                        controller.show(event.pageX, event.pageY, items);
                        $rootScope.activeContextMenuController = controller;
                    });
                });
            }
        };
    });