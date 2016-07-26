'use strict';

angular.module('contextMenu', [])
    .controller('ContextMenuController', function ($scope, $document, $element, $window) {
        // Отображается ли меню        
        let isVisible = false;
        // Все меню/подменю, принадлежащие этому контекстному меню
        let activeMenus = [];

        // Текущее выделенное меню
        let selectedMenuIndex = 0;        
        // Выделенная кнопка в текущем меню
        let selectedButtonIndex = 0;        

        // Возвращает меню на указанном уровне вложенности
        let getMenuAtDepth = (depth) => {
            let result = null;
            angular.forEach(activeMenus, (menu) => {
                if (menu.depth == depth) {
                    result = menu;
                }
            });
            return result;
        };

        let isButtonItemEnabled = (item) => {
            if (typeof(item.enabled) === 'boolean') {
                return item.enabled;
            } else if (typeof(item.enabled) !== 'string') {
                return true;
            }
            return $scope.$eval(item.enabled);
        };

        let setMenuPosition = (menuElement, x, y) => {
            menuElement.css({
                position: 'absolute',
                left: x + 'px',
                top: y + 'px',
                // Меню должно всегда быть сверху
                'z-index': 99999
            });
        };

        // Нажатие на кнопку меню
        let handleItemClick = (item) => {
            if (!isButtonItemEnabled(item)) {
                return;
            }
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

        // Наведение на кнопку меню
        let handleItemMouseOver = (menu, button, item, fromKeyboard = false) => {
            // Сброс выделения с клавиатуры
            if (activeMenus[selectedMenuIndex] && !fromKeyboard) {
                let selectedMenu = activeMenus[selectedMenuIndex];
                let selectedButton = selectedMenu.buttons[selectedButtonIndex];
               	selectedButton.element.removeClass('active');
                selectedButtonIndex = 0;
                selectedMenuIndex = 0;
            }
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
                let menuWidth = angular.element(menu.element).outerWidth();
                let x = position.left + menuWidth;
                let y = position.top;
                // Добавить меню
                let nestedMenu = this.addMenu(x, y, item.submenu, menu.depth + 1, button);
                nestedMenu.element.addClass('hidden');
                // Проверка выхода за границы экрана
                setTimeout(() => {
                    nestedMenu.element.removeClass('hidden');
                    let nestedMenuWidth = angular.element(nestedMenu.element).outerWidth();
                    if (x + nestedMenuWidth > angular.element($window).width()) {
                        x = position.left - nestedMenuWidth;
                        setMenuPosition(nestedMenu.element, x, y);
                    }
                });
            }
        };

        // Добавить меню/подменю
        /**
         * Добаить меню/подменю 
         * @param {Number} x - Позиция меню по горизонтали
         * @param {Number} y - Позиция меню по вертикали
         * @param {Array} items - Элементы меню
         * @param {Number} [0] depth - Уровень вложенности меню
         * @param {Element} [null] parentButtonElement - Кнопка родительского меню, открывающая это вложенное меню
         */
        this.addMenu = (x, y, items, depth = 0, parentButtonElement = null) => {
            let div = angular.element('<div>');
            div.addClass('list-group context-menu');
            div.attr({role: 'group'});
            setMenuPosition(div, x, y);

            let menu = {
                element: div, 
                buttons: [],
                depth, // Уровень вложенности
                parentButtonElement
            };

            // Добавить кнопки
            angular.forEach(items, (item) => {
                let button = angular.element('<a>');
                button.addClass('list-group-item context-menu-item');  
                button.append(item.text + '&nbsp;');
                button.attr({href: '#'});

                if (item.submenu) {
                    let span = angular.element('<span>');
                    span.addClass('glyphicon glyphicon-triangle-right pull-right');
                    button.append(span);
                }                
                div.append(button);

                // Включена ли кнопка
                let isEnabled = isButtonItemEnabled(item);

                if (isEnabled) {                    
                    button.on('click', (event) => handleItemClick(item));
                    button.on('mouseover', (event) => handleItemMouseOver(menu, button, item));
                } else {
                    button.addClass('disabled');
                }

                menu.buttons.push({element: button, item});
            });

            // Добавить меню
            angular.element($document).find('body').append(div);
            activeMenus.push(menu);
            return menu;
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

        /**
         * Отобразить это контекстное меню
         * @param {Number} x - позиция меню по горизонтали
         * @param {Number} y - позиция меню по вертикали
         * @param {Array} items - элементы меню
         */
        this.show = (x, y, items) => {
            this.addMenu(x, y, items);      
            isVisible = true;
        };
        
        // Скрыть контекстное меню
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
            // Если был клик по меню, не скрывать его
            if (angular.element(event.target).hasClass('context-menu') || 
                angular.element(event.target).hasClass('context-menu-item')) 
            {
                return;
            }
            this.hide();
        });

        // Управление с клавиатуры
        
        $document.on('keydown', (event) => {
            if (!isVisible) {
                return;
            }
            let selectedMenu = activeMenus[selectedMenuIndex];
            if (!selectedMenu) {
                selectedMenuIndex = 0;
                selectedButtonIndex = 0;
                return;
            }
            let selectedButton = selectedMenu.buttons[selectedButtonIndex];
            let previousSelectedButtonIndex = selectedButtonIndex;
            switch (event.keyCode) {
                // Left
                case 37:
                    // Получение родительского меню
                    let parentMenu = getMenuAtDepth(selectedMenu.depth - 1);
                    if (parentMenu) {
                        let buttonIndex = 0;
                        // Поиск кнопки, которая открывает это вложенное меню
                        angular.forEach(parentMenu.buttons, (button, index) => {
                            if (button.element == selectedMenu.parentButtonElement) {
                                buttonIndex = index;
                                return;
                            }
                        });
                        // Переход на родительское меню
                        selectedMenuIndex = activeMenus.indexOf(parentMenu);
                        selectedMenu = activeMenus[selectedMenuIndex];
                        previousSelectedButtonIndex = -1;
                        selectedButtonIndex = buttonIndex;
                    } 
                    break;
                // Right
                case 39:
                    if (selectedButton.item.submenu) {
                        // Получение вложенного меню
                        let nestedMenu = getMenuAtDepth(selectedMenu.depth + 1);
                        if (nestedMenu) {
                            // Переход во вложенное меню
                            selectedMenuIndex = activeMenus.indexOf(nestedMenu);
                            selectedMenu = activeMenus[selectedMenuIndex];
                            previousSelectedButtonIndex = -1;
                            selectedButtonIndex = 0;
                        } 
                    }
                    break;
                // Up
                case 38:
                    // Перемещение вверх по текущему меню
                    selectedButtonIndex--;
                    if (selectedButtonIndex < 0) {
                        selectedButtonIndex = selectedMenu.buttons.length - 1;
                    }                    
                    break;
                // Down
                case 40:
                    // Перемещение вниз по текущему меню
                    selectedButtonIndex++;
                    if (selectedButtonIndex >= selectedMenu.buttons.length) {
                        selectedButtonIndex = 0;
                    }               
                    break;
                // Enter
                case 13:
                    // Выбор элемента меню
                    handleItemClick(selectedButton.item);
                    break;
            }
            if (selectedButtonIndex != previousSelectedButtonIndex) {
                event.preventDefault();
                // Убрать класс с предыдущей выделенной кнопки
                selectedButton.element.removeClass('active');
                // Новая выделенная кнопка
                selectedButton = selectedMenu.buttons[selectedButtonIndex];
                selectedButton.element.addClass('active');
                // Имитация наведения мыши
                handleItemMouseOver(selectedMenu, selectedButton.element, selectedButton.item, true);
            }
        });
    })

    .directive('contextMenu', function($rootScope) {
        return {
            controller: 'ContextMenuController',
            link: (scope, element, attrs, controller) => {
                element.on('contextmenu', function (event) {
                    $rootScope.$apply(function() {
                        event.preventDefault();
                        event.stopPropagation();
                        // Скрыть текущее меню, если оно есть
                        if ($rootScope.activeContextMenuController) {
                            $rootScope.activeContextMenuController.hide();
                        }
                        // Отобразить меню
                        let items = scope.$eval(attrs.contextMenu);
                        controller.show(event.pageX, event.pageY, items);
                        $rootScope.activeContextMenuController = controller;
                    });
                });
            }
        };
    });