const express = require("express");
const userRoutes = express.Router();

const Activity = require('../../models/activity.model');
const Domain = require('../../models/domain.model');
const User = require('../../models/user.model');

/* 
@route GET /domain/
@desc Test
*/
userRoutes.route('/').get(function(req, res) {

    res.status(200).send("Contacted User Endpoint");

});

module.exports = userRoutes;