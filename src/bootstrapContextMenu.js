'use strict';

angular.module('bootstrapContextMenu', [])
    .controller('ContextMenuController', ['$scope', '$document', '$element', '$window', function ($scope, $document, $element, $window) {
        let isVisible = false;
        // Contains menus and submenus created by this context menu
        let activeMenus = [];
        // Create nested menus at the left side
        let nestedAtLeft = false;

        // Keyboard input
        const KEYCODE_LEFT = 37;
        const KEYCODE_RIGHT = 39;
        const KEYCODE_UP = 38;
        const KEYCODE_DOWN = 40;
        const KEYCODE_CONFIRM = 13;
        let selectedMenuIndex = 0;
        let selectedButtonIndex = 0;

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

        // Moves menu at given position on the screen
        let setMenuPosition = (menuElement, x, y) => {
            menuElement.css({
                position: 'absolute',
                left: x + 'px',
                top: y + 'px',
                // Menu should aways be on the top of all elements
                'z-index': 99999
            });
        };

        let handleItemClick = (item) => {
            if (!isButtonItemEnabled(item)) {
                return;
            }
            switch (typeof(item.click)) {
                case 'function':
                    item.click();
                    break;
                case 'string':
                    $scope.$eval(item.click);
                    break;
                default:
                    return;
            }
            this.hide();
        };

        let handleItemMouseOver = (menu, button, item, fromKeyboard=false) => {
            // Remove keyboard selection
            if (activeMenus[selectedMenuIndex] && !fromKeyboard) {
                let selectedMenu = activeMenus[selectedMenuIndex];
                let selectedButton = selectedMenu.buttons[selectedButtonIndex];
               	selectedButton.element.removeClass('active');
                selectedButtonIndex = 0;
                selectedMenuIndex = 0;
            }
            // Hide all nested menus at higher levels
            let menusToRemove = [];
            angular.forEach(activeMenus, (m) => {
                if (m.depth > menu.depth) {
                    menusToRemove.push(m);
                }
            });
            angular.forEach(menusToRemove, (m) => this.removeMenu(m));

            // Show the nested menu
            if (item.submenu) {
                let position = angular.element(button).offset();
                let menuWidth = menu.element.width();
                let x = position.left + menuWidth;
                let y = position.top;

                let nestedMenu = this.addMenu(x, y, item.submenu, menu.depth + 1, button);
                y = nestedMenu.element.offset().top;

                // Check menu for leaving the screen
                // Move menu to (0,0), to restore the maximal size, 
                // otherwise menu width could shrink at the edge
                // of the page
                setMenuPosition(nestedMenu.element, 0, 0);                
                let nestedMenuWidth = nestedMenu.element.width();
                setMenuPosition(nestedMenu.element, x, y);

                if (nestedAtLeft || x + nestedMenuWidth > angular.element($window).width()) {
                    x = position.left - nestedMenuWidth;
                    setMenuPosition(nestedMenu.element, x, y);
                    // All other menus should be created at the left side from now
                    nestedAtLeft = true;
                }
            }
        };

        /**
         * Create menu/submenu for this context menu
         * @param {Number} x - horizontal position
         * @param {Number} y - vertical position
         * @param {Array} items - array of menu elements
         * @param {Number} [0] depth - (for submenu only) level of nesting
         * @param {Element} [null] parentButtonElement - (for submenu only) parent menu button that opened this submenu
         */
        this.addMenu = (x, y, items, depth=0, parentButtonElement=null) => {
            if (typeof(items) !== 'object') {
                return null;
            }

            let div = angular.element('<div>');
            div.addClass('list-group context-menu');
            div.attr({role: 'group'});

            let menu = {
                element: div, 
                buttons: [],
                depth, // level of nesting
                parentButtonElement
            };

            // Add menu buttons
            angular.forEach(items, (item) => {
                if (typeof(item) !== 'object') {
                    return;
                }
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

                let isEnabled = isButtonItemEnabled(item);

                if (isEnabled) {                    
                    button.on('click', (event) => handleItemClick(item));
                    button.on('mouseover', (event) => handleItemMouseOver(menu, button, item));
                } else {
                    button.addClass('disabled');
                }

                menu.buttons.push({element: button, item});
            });

            // Add menu to the DOM
            angular.element($document).find('body').append(div);
            activeMenus.push(menu);

            // Check for leaving the screen vertically
            setMenuPosition(div, 0, 0);
            let menuHeight = div.height();            
            y = Math.min(y, angular.element($window).height() - menuHeight + $window.pageYOffset);
            setMenuPosition(div, x, y);
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
         * Show this context menu
         * @param {Number} x - horizontal position
         * @param {Number} y - vertical position
         * @param {Array} items - array of menu elements
         */
        this.show = (x, y, items) => {
            isVisible = true;
            nestedAtLeft = false;

            let menu = this.addMenu(x, y, items);
            y = menu.element.offset().top;

            // Check for leaving the screen horizontally
            setMenuPosition(menu.element, 0, 0);                
            let menuWidth = menu.element.width();
            setMenuPosition(menu.element, x, y);

            if (x + menuWidth > angular.element($window).width()) {
                x -= menuWidth;
                setMenuPosition(menu.element, x, y);
                nestedAtLeft = true;
            }
        };

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
            // Don't hide if target is a menu or a menu button
            if (angular.element(event.target).hasClass('context-menu') || 
                angular.element(event.target).hasClass('context-menu-item')) 
            {
                return;
            }
            // Hide otherwise
            this.hide();
        });

        // Menu nvigation using keyboard      
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
                // Choose button depending on menu direction
                case nestedAtLeft ? KEYCODE_RIGHT : KEYCODE_LEFT:
                    let parentMenu = getMenuAtDepth(selectedMenu.depth - 1);
                    if (parentMenu) {
                        let buttonIndex = 0;
                        // Get button that opens this submenu
                        angular.forEach(parentMenu.buttons, (button, index) => {
                            if (button.element == selectedMenu.parentButtonElement) {
                                buttonIndex = index;
                                return;
                            }
                        });
                        // Go to the parent menu
                        selectedMenuIndex = activeMenus.indexOf(parentMenu);
                        selectedMenu = activeMenus[selectedMenuIndex];
                        previousSelectedButtonIndex = -1;
                        selectedButtonIndex = buttonIndex;
                    } 
                    break;
                // Choose button depending on menu direction
                case nestedAtLeft ? KEYCODE_LEFT : KEYCODE_RIGHT:
                    if (selectedButton.item.submenu) {
                        let nestedMenu = getMenuAtDepth(selectedMenu.depth + 1);
                        if (nestedMenu) {
                            // Go to the nested menu
                            selectedMenuIndex = activeMenus.indexOf(nestedMenu);
                            selectedMenu = activeMenus[selectedMenuIndex];
                            previousSelectedButtonIndex = -1;
                            selectedButtonIndex = 0;
                        } 
                    }
                    break;
                case KEYCODE_UP:
                    selectedButtonIndex--;
                    if (selectedButtonIndex < 0) {
                        selectedButtonIndex = selectedMenu.buttons.length - 1;
                    }                    
                    break;
                case KEYCODE_DOWN:
                    selectedButtonIndex++;
                    if (selectedButtonIndex >= selectedMenu.buttons.length) {
                        selectedButtonIndex = 0;
                    }               
                    break;
                case KEYCODE_CONFIRM:
                    // Emulate mouse click to select an item
                    handleItemClick(selectedButton.item);
                    break;
            }
            if (selectedButtonIndex != previousSelectedButtonIndex) {
                event.preventDefault();
                // Remove the 'active' class from the previously selected button
                selectedButton.element.removeClass('active');
                // Select new button
                selectedButton = selectedMenu.buttons[selectedButtonIndex];
                selectedButton.element.addClass('active');
                // Emulate mouse over when selecting an item
                handleItemMouseOver(selectedMenu, selectedButton.element, selectedButton.item, true);
            }
        });
    }])

    .directive('contextMenu', ['$rootScope', function($rootScope) {
        return {
            controller: 'ContextMenuController',
            link: (scope, element, attrs, controller) => {
                element.on('contextmenu', function (event) {
                    $rootScope.$apply(function() {
                        event.preventDefault();
                        event.stopPropagation();
                        // Hide current menu if any is showing
                        if ($rootScope.activeContextMenuController) {
                            $rootScope.activeContextMenuController.hide();
                        }
                        // Show new menu
                        let items = scope.$eval(attrs.contextMenu);
                        controller.show(event.pageX, event.pageY, items);
                        $rootScope.activeContextMenuController = controller;
                    });
                });
            }
        };
    }]);