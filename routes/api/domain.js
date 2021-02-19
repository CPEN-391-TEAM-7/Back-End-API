const express = require("express");
const bunyan = require("bunyan");

const domainRoutes = express.Router();

const Activity = require('../../models/activity.model');
const Domain = require('../../models/domain.model');
const User = require('../../models/user.model');

/* 
@route GET /domain/
@desc Test
*/
domainRoutes.route('/').get(function(req, res) {

    res.status(200).send("Contacted Domain Endpoint");

});

module.exports = domainRoutes;