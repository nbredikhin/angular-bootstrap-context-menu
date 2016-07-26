const app = angular.module('app', ['contextMenu']);

app.controller('UsersListController', function ($scope, users) {
    $scope.userContextMenu = [
        {text: 'Send private message', enabled: 'user.online'},
        {text: 'Show full profile'},
        // Условие, определяющее, включена ли кнопка
        {text: 'Ban', enabled: 'user.group != "moderator"'},
        // Подменю
        {text: 'Moar', submenu: [
            {text: 'Action 1'},
            {text: 'Action 2'},
            {text: 'Action 3'}
        ]}
    ];

    $scope.adminContextMenu = [
            {text: 'Send admin message'},
            {text: 'Remove admin rights'}
    ];

    $scope.users = [];
    users()
        .then(function(users) {
            $scope.users = users;
        }, function(error) {
            $scope.users = [];
        });
});