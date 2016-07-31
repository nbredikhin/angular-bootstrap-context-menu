const app = angular.module('app');

app.controller('UsersListController', function ($scope, users) {
    $scope.userContextMenu = [
        {text: 'Send private message', enabled: 'user.online', click: 'sendMessage(user)'},
        {text: 'Show full profile'},
        1,
        {text: 'Ban', enabled: 'user.group != "moderator"'},
        {text: 'Moar', submenu: [
            {text: 'Action 1'},
            {text: 'Action 2', enabled: 'false'},
            {text: 'Moar moar', submenu: [
                {text: 'Subsubmenu action 1'},
                {text: 'Subsubmenu action 2', enabled: 'false'},
                {text: 'Subsubmenu action 3', click: 'sendMessage(user)'}
            ]}
        ]},
        {text: 'Moar 2', submenu: [
            {text: 'Moar2 action 1'},
            {text: 'Moar2 action 2'},
            {text: 'Moar2 action 3'}
        ]}
    ];

    $scope.adminContextMenu = [
            {text: 'Send admin message'},
            {text: 'Remove admin rights'}
    ];

    $scope.sendMessage = (user) => {
        console.log('Send message to', user.name);
    };

    $scope.users = [];
    users()
        .then(function(users) {
            $scope.users = users;
        }, function(error) {
            $scope.users = [];
        });
});