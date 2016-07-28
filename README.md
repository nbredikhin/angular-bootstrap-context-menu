# angular-context-menu

__angular-conext-menu__ is an [AngularJS](https://angularjs.org/) module for creating simple context menus.

## Usage
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

```html
<div context-menu="exampleContextMenu">
    <!-- ... -->
</div>

<!-- In the directive you can also use expressions: -->
<div context-menu="user.group == 'admin' ? adminContextMenu : userContextMenu">
    <!-- ... -->
</div>
```

## Installation
In order to install and build the project you need [Node.js](https://nodejs.org/), [Gulp](http://gulpjs.com/) and [Bower](https://bower.io/) installed on your system.
Clone this repository and run the following commands:
```bash
cd angular-context-menu
npm install
```
Bower components will be automatically installed too.

To start test aplication you can simply run
```bash
gulp watch
```
Then in another terminal window/tab run
```bash
npm start
```
It will build the project and start the development server. To specify another port, you can use `gulp watch --port 7777`

__Enjoy!__