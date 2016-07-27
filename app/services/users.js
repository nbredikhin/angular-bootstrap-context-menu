angular.module('app')
    .factory('users', function ($q, $http) {
        return function() {
            return $http.get('http://localhost:3000/users')
                .then(function(response) {
                    return response.data;
                }, function(response) {
                    return $q.reject(response.status + " " + response.data.error);
                });
        };
    });