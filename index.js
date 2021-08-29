'use strict';
// 3rd party modules
require('dotenv').config()

// internal modules
const server = require('./src/server');
const { db } = require('./src/auth/models/index'); //destructuring es6


db.sync().then(() => {
    server.start(process.env.PORT || 3000);
})
    .catch(console.error);