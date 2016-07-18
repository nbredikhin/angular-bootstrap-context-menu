const app = angular.module('app');

app.controller('ListController', function ($scope) {
    $scope.listItems = [
        "1", "2", "3"
    ]
});