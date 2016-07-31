# angular-bootstrap-context-menu

__angular-bootstrap-context-menu__ is an [AngularJS](https://angularjs.org/) module for creating simple context menus.

[Check out the demo](https://codepen.io/dcr30/pen/VjdxPW).

## Usage
__1.__ Install:
```bash
bower install angular-boostrap-context-menu
```
__2.__ Include `'bootstrapContextMenu'` module module in your application.

__3.__ Write some JavaScript:

```javascript
/* ... controller code ... */

$scope.someVar = 5;
$scope.someAction = function () {
    // Do something
};
var someFunction = function () {
    // Do something else
};

$scope.exampleContextMenu = [
    // Use strings containing expressions as click handlers:
    { text: 'Button text', click: 'someAction(someVar + 1)' },
    // ...or use functions as handlers
    { text: 'Another button', click: someFunction },
    
    // "enabled" allows you to specify a condition to disable the button.
    { text: 'Disabled button', enabled: false },
    // Make button disabled using expressions:
    { text: 'Another disabled button', enabled: 'someVar > 10' },

    // You can also create nested context menus:
    { text: 'Show more stuff', submenu: [
        { text: 'Nested menu button' },
        { text: 'Another nested menu button' },

        // You can even create nested menus inside of other nested menus
        { text: 'Actions', submenu: [
            { text: 'Action 1' },
            { text: 'Action 2' },
        ]}
    ]}
];
```
...and HTML:
```html
<div context-menu="exampleContextMenu">
    <!-- ... -->
</div>

<!-- In the directive you can also use expressions: -->
<div context-menu="user.group == 'admin' ? adminContextMenu : userContextMenu">
    <!-- ... -->
</div>
```

[Check out the demo at codepen](https://codepen.io/dcr30/pen/VjdxPW)
## Building
In order to build the project you need [Node.js](https://nodejs.org/), [Gulp](http://gulpjs.com/) and [Bower](https://bower.io/) installed on your system.
Clone this repository and run the following commands:
```bash
cd angular-bootstrap-context-menu
npm install
```
Bower components will be automatically installed too.

To build scripts run:
```bash
gulp
```
It will process the output to the `./dist` folder.

__Enjoy!__