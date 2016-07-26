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

        let handleItemMouseOver = (event, menu, button, item) => {
            if (!item.submenu) {
                return;
            }
            let position = angular.element(button).offset();
            let x = position.left + angular.element(menu).width();
            let y = position.top;
            this.addMenu(x, y, item.submenu);
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
                    button.on('mouseover', (event) => handleItemMouseOver(event, div, button, item));
                }
            });

            // Добавить меню
            angular.element($document).find('body').append(div);
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