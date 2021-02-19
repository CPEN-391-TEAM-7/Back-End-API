const express = require("express");
const bunyan = require("bunyan");

const userRoutes = express.Router();

const Activity = require('../../models/activity.model');
const Domain = require('../../models/domain.model');
const User = require('../../models/user.model');

const log = bunyan.createLogger({ name: "BackendAPI" });

/* 
@route GET /user/
@desc Test
*/
userRoutes.route('/').get(function(req, res) {

    res.status(200).send("Contacted User Endpoint");

});

module.exports = userRoutes;