const app = angular.module('app', ['contextMenu']);

app.controller('UsersListController', function ($scope, users) {
    $scope.userContextMenu = [
        {text: 'Send private message', enabled: 'user.online', click: 'sendMessage(user)'},
        {text: 'Show full profile'},
        // Условие, определяющее, включена ли кнопка
        {text: 'Ban', enabled: 'user.group != "moderator"'},
        // Подменю
        {text: 'Moar', submenu: [
            {text: 'Action 1'},
            {text: 'Action 2'},
            {text: 'Moar moar', submenu: [
                {text: 'Subsubmenu action 1'},
                {text: 'Subsubmenu action 2'},
                {text: 'Subsubmenu action 3'}
            ]}
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