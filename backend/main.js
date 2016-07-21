'use strict';

const express = require('express');
const bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const routes = require('./routes.js')(app);

var server = app.listen(3000, () => {
    console.log('Listening on port: ' + server.address().port);
});