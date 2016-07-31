'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

angular.module('bootstrapContextMenu', []).controller('ContextMenuController', ['$scope', '$document', '$element', '$window', function ($scope, $document, $element, $window) {
    var _this = this;

    var isVisible = false;
    // Contains menus and submenus created by this context menu
    var activeMenus = [];
    // Create nested menus at the left side
    var nestedAtLeft = false;

    // Keyboard input
    var KEYCODE_LEFT = 37;
    var KEYCODE_RIGHT = 39;
    var KEYCODE_UP = 38;
    var KEYCODE_DOWN = 40;
    var KEYCODE_CONFIRM = 13;
    var selectedMenuIndex = 0;
    var selectedButtonIndex = 0;

    var getMenuAtDepth = function getMenuAtDepth(depth) {
        var result = null;
        angular.forEach(activeMenus, function (menu) {
            if (menu.depth == depth) {
                result = menu;
            }
        });
        return result;
    };

    var isButtonItemEnabled = function isButtonItemEnabled(item) {
        if (typeof item.enabled === 'boolean') {
            return item.enabled;
        } else if (typeof item.enabled !== 'string') {
            return true;
        }
        return $scope.$eval(item.enabled);
    };

    // Moves menu at given position on the screen
    var setMenuPosition = function setMenuPosition(menuElement, x, y) {
        menuElement.css({
            position: 'absolute',
            left: x + 'px',
            top: y + 'px',
            // Menu should aways be on the top of all elements
            'z-index': 99999
        });
    };

    var handleItemClick = function handleItemClick(item) {
        if (!isButtonItemEnabled(item)) {
            return;
        }
        switch (_typeof(item.click)) {
            case 'function':
                item.click();
                break;
            case 'string':
                $scope.$eval(item.click);
                break;
            default:
                return;
        }
        _this.hide();
    };

    var handleItemMouseOver = function handleItemMouseOver(menu, button, item) {
        var fromKeyboard = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        // Remove keyboard selection
        if (activeMenus[selectedMenuIndex] && !fromKeyboard) {
            var selectedMenu = activeMenus[selectedMenuIndex];
            var selectedButton = selectedMenu.buttons[selectedButtonIndex];
            selectedButton.element.removeClass('active');
            selectedButtonIndex = 0;
            selectedMenuIndex = 0;
        }
        // Hide all nested menus at higher levels
        var menusToRemove = [];
        angular.forEach(activeMenus, function (m) {
            if (m.depth > menu.depth) {
                menusToRemove.push(m);
            }
        });
        angular.forEach(menusToRemove, function (m) {
            return _this.removeMenu(m);
        });

        // Show the nested menu
        if (item.submenu) {
            var position = angular.element(button).offset();
            var menuWidth = menu.element.width();
            var x = position.left + menuWidth;
            var y = position.top;

            var nestedMenu = _this.addMenu(x, y, item.submenu, menu.depth + 1, button);
            y = nestedMenu.element.offset().top;

            // Check menu for leaving the screen
            // Move menu to (0,0), to restore the maximal size, 
            // otherwise menu width could shrink at the edge
            // of the page
            setMenuPosition(nestedMenu.element, 0, 0);
            var nestedMenuWidth = nestedMenu.element.width();
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
    this.addMenu = function (x, y, items) {
        var depth = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
        var parentButtonElement = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];

        if ((typeof items === 'undefined' ? 'undefined' : _typeof(items)) !== 'object') {
            return null;
        }

        var div = angular.element('<div>');
        div.addClass('list-group context-menu');
        div.attr({ role: 'group' });

        var menu = {
            element: div,
            buttons: [],
            depth: depth, // level of nesting
            parentButtonElement: parentButtonElement
        };

        // Add menu buttons
        angular.forEach(items, function (item) {
            if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) !== 'object') {
                return;
            }
            var button = angular.element('<a>');
            button.addClass('list-group-item context-menu-item');
            button.append(item.text + '&nbsp;');
            button.attr({ href: '#' });

            if (item.submenu) {
                var span = angular.element('<span>');
                span.addClass('glyphicon glyphicon-triangle-right pull-right');
                button.append(span);
            }
            div.append(button);

            var isEnabled = isButtonItemEnabled(item);

            if (isEnabled) {
                button.on('click', function (event) {
                    return handleItemClick(item);
                });
                button.on('mouseover', function (event) {
                    return handleItemMouseOver(menu, button, item);
                });
            } else {
                button.addClass('disabled');
            }

            menu.buttons.push({ element: button, item: item });
        });

        // Add menu to the DOM
        angular.element($document).find('body').append(div);
        activeMenus.push(menu);

        // Check for leaving the screen vertically
        setMenuPosition(div, 0, 0);
        var menuHeight = div.height();
        y = Math.min(y, angular.element($window).height() - menuHeight + $window.pageYOffset);
        setMenuPosition(div, x, y);
        return menu;
    };

    this.removeMenu = function (menu) {
        if (!isVisible) {
            return;
        }
        var index = activeMenus.indexOf(menu);
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
    this.show = function (x, y, items) {
        isVisible = true;
        nestedAtLeft = false;

        var menu = _this.addMenu(x, y, items);
        y = menu.element.offset().top;

        // Check for leaving the screen horizontally
        setMenuPosition(menu.element, 0, 0);
        var menuWidth = menu.element.width();
        setMenuPosition(menu.element, x, y);

        if (x + menuWidth > angular.element($window).width()) {
            x -= menuWidth;
            setMenuPosition(menu.element, x, y);
            nestedAtLeft = true;
        }
    };

    this.hide = function () {
        if (!isVisible) {
            return;
        }
        isVisible = false;
        angular.forEach(activeMenus, function (menu) {
            menu.element.remove();
        });
        activeMenus = [];
    };

    $document.on('mousedown', function (event) {
        if (!isVisible) {
            return;
        }
        // Don't hide if target is a menu or a menu button
        if (angular.element(event.target).hasClass('context-menu') || angular.element(event.target).hasClass('context-menu-item')) {
            return;
        }
        // Hide otherwise
        _this.hide();
    });

    // Menu nvigation using keyboard      
    $document.on('keydown', function (event) {
        if (!isVisible) {
            return;
        }
        var selectedMenu = activeMenus[selectedMenuIndex];
        if (!selectedMenu) {
            selectedMenuIndex = 0;
            selectedButtonIndex = 0;
            return;
        }
        var selectedButton = selectedMenu.buttons[selectedButtonIndex];
        var previousSelectedButtonIndex = selectedButtonIndex;

        switch (event.keyCode) {
            // Choose button depending on menu direction
            case nestedAtLeft ? KEYCODE_RIGHT : KEYCODE_LEFT:
                var parentMenu = getMenuAtDepth(selectedMenu.depth - 1);
                if (parentMenu) {
                    var buttonIndex = 0;
                    // Get button that opens this submenu
                    angular.forEach(parentMenu.buttons, function (button, index) {
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
                    var nestedMenu = getMenuAtDepth(selectedMenu.depth + 1);
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
}]).directive('contextMenu', ['$rootScope', function ($rootScope) {
    return {
        controller: 'ContextMenuController',
        link: function link(scope, element, attrs, controller) {
            element.on('contextmenu', function (event) {
                $rootScope.$apply(function () {
                    event.preventDefault();
                    event.stopPropagation();
                    // Hide current menu if any is showing
                    if ($rootScope.activeContextMenuController) {
                        $rootScope.activeContextMenuController.hide();
                    }
                    // Show new menu
                    var items = scope.$eval(attrs.contextMenu);
                    controller.show(event.pageX, event.pageY, items);
                    $rootScope.activeContextMenuController = controller;
                });
            });
        }
    };
}]);
//# sourceMappingURL=bootstrapContextMenu.js.map
