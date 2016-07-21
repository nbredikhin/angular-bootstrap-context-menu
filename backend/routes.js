'use strict';

const namegen = require('./namegen.js');

module.exports = (app) => {
    var usersList = [];

    for (let i = 0; i < 10; i++) {
        usersList.push({
            name: namegen(),
            group: Math.random() > 0.8 ? 'admin' : 'user',
            online: Math.random() > 0.5
        });
    }
    app.get('/users', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        res.setHeader('Access-Control-Allow-Credentials', true);        
        res.send(usersList);
    });
};