const express = require("express");
const bunyan = require("bunyan");

const domainRoutes = express.Router();

const Activity = require("../../models/activity.model");
const Domain = require("../../models/domain.model");
const User = require("../../models/user.model");

const log = bunyan.createLogger({ name: "BackendAPI" });

/* 
@route GET /domain/
@desc Test
*/

domainRoutes.route("/").get((req, res) => {
    res.status(200).send("Contacted Domain Endpoint");
});

/**
 * @route POST /domain/add
 * @desc for develppment purposes only.
 */

domainRoutes.post("/add", (req, res) => {
    const domainID = req.body.domainID;
    const proxyID = req.body.proxyID;
    const url = req.body.url;

    const newDomain = new Domain({
        domainID: domainID,
        proxyID: proxyID,
        domainName: url,
        num_of_accesses: 0,
    });

    newDomain
        .save()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
});

/**
 * Adding a domain to a blacklist or a whitelist
 * @route PUT /domain/update/:id
 * {
 *      userID:
 *      listType:
 *      domainName: www.example.com
 * }
 * // Find the proxyID by the userID
 */

domainRoutes.route("/update/:id").put((req, res) => {
    const body = req.body;

    const user = User.find({ userID: req.params.id });

    Domain.find({ proxyID: user.proxyID, domainName: body.domainName }).then(
        (domain) => {
            domain.listType = body.listType;
        }
    );
});

/**
 * @route get /domain/all
 * @desc gets all domain documents in the database.
 */

domainRoutes.route("/all").get((req, res) => {
    //endpoint for accessing all users in database
    Domain.find()
        .then((domains) => res.send(domains)) //Note here.
        .catch((err) => console.log(err));
});

module.exports = domainRoutes;
