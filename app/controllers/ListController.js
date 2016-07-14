angular.module('app')
    .controller('ListController', function($scope) {
        $scope.text = "Text";

        $scope.playersList = [
            {name: 'Player_1', score: 123},
            {name: 'Player_2', score: 456},
            {name: 'Player_3', score: 789}
        ];

        $scope.listItemMenu = {
            someProperty: true,

            items: [
                {text: 'Send message', enabled: 'player.name == "Player_1"', click: function (element) {
                    
                }},
                {text: 'Remove'},
                {text: 'Dunno'}
            ]
        }
    });