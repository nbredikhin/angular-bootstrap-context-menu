'use strict';

const namegen = require('./namegen.js');

module.exports = (app) => {
    var usersList = [];

    for (let i = 0; i < 10; i++) {
        usersList.push({
            name: namegen()
        });
    }
    app.get('/', (req, res) => {
        res.send(usersList);
    });
};