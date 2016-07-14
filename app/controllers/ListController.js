angular.module('app')
    .controller('ListController', function($scope) {
        $scope.text = "Text";

        $scope.playersList = [
            {name: 'Player_1', score: 201},
            {name: 'Player_2', score: 152},
            {name: 'Player_3', score: 234},
            {name: 'Player_4', score: 0},
            {name: 'Player_5', score: 14},
            {name: 'Player_6', score: 542},
            {name: 'Player_7', score: 320},
        ];

        $scope.removePlayer = function (index) {
            if (index == 0) {
                return;
            }
            $scope.playersList.splice(index, 1);
        }

        $scope.addPlayer = function () {
            var id = $scope.playersList.length + 1;
            var score = Math.floor(Math.random() * 600);
            $scope.playersList.push({
                name: 'Player_' + id, 
                score: score
            });
        }

        $scope.listItemMenu = {
            someProperty: true,

            items: [
                {text: 'Example action 1', enabled: 'player.score > 200'},
                {text: 'Example action 2'},
                {text: 'Remove', enabled: 'player.name != "Player_1"', click: function (element) {
                    $scope.removePlayer(element.scope().$index);
                }}
            ]
        }        

        $scope.mainMenu = {
            items: [
                {text: 'Add player', click: function (element) {
                    $scope.addPlayer();
                }},
                {text: 'Remove all players', click: function (element) {
                    $scope.playersList = [
                        {name: 'Player_1', score: 201},
                    ];
                }}
            ]         
        };
    });