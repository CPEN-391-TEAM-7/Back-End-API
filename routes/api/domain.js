const express = require("express");
const bunyan = require("bunyan");
var _ = require("lodash");

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
 * This is for testing purposes only. For now, might as well keep it.
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
 * Adding a domain to a Blacklist or a Whitelist
 * @route PUT /domain/update
 * {
 *      userID:
 *      listType:
 *      domainName: www.example.com
 * }
 * // Find the proxyID by the userID
 */

domainRoutes.route("/update").put(async(req, res) => {
    const { userID, listType, domainName } = req.body;

    const valid_listType = _.includes(
        ["Whitelist", "Blacklist", "Safe", "Malicious", "Undefined"],
        listType
    );

    let response = {
        "status": "Failed",
        "domain": "",
        "msg": "",
    }

    if (!valid_listType) {
        console.log("It's not a valid listType");
        response.msg = `${listType} is not a valid listType`;

        res.json(response);

        return;
    }

    

    await User.findOne({ userID: userID }, async(err, _user) => {
        let _proxyID;

        if (err) {
            log.error("Error: " + err);
            response.msg = err;

            res.json(response); return;
        } 
        else if (_user) {
            _proxyID = _user.proxyID;

            const query = { 
                proxyID: _proxyID, 
                domainName: domainName 
            };

            const update = {
                listType: listType,
            }

            const options = {upsert: true, new: true, setDefaultsOnInsert: true}
            
            await Domain.findOneAndUpdate(query, update, options, (err, ret) => {
                if(err) {
                    response.msg = err;
                    res.json(response); return;
                }
                else {
                    response.status = "Success"
                    response.domain = ret;
                    response.msg = `Successfully aded domain to ${listType}`;
        
                    res.json(response); return;
                }
            });

        } 
        else {
            console.log("I didn't get the user");
            log.error("No such user exists");
            response.msg = "This user doesn't exist";

            res.json(response); return;
        }
    });
});

/**
 * @desc Fetch all domains in blacklist or whitelist
 */

domainRoutes.route("/:listType/:userID").get( async (req, res) => {
    const {userID, listType} = req.params;

    const valid_listType = _.includes(
        ["Whitelist", "Blacklist"],
        listType
    );

    if (!valid_listType) {
        console.log("It's not a valid listType");
        res.status("400").json({
            status: `400`,
            message: `${listType} is not a valid listType`,
        });
    }

    const findThis = {
        "listType": listType,
        "userID": userID
    }

    await Domain.find(findThis)
        .then(domains => {
            res.json({
                "msg": "Success",
                "list": domains
            })
        })
        .catch(err => {
            res.json({
                "msg": err,
                "list": []
            })
        });
})

/**
 * @route get /domain/all
 * @desc gets all domain documents in the database.
 */

domainRoutes.route("/all").get(async (req, res) => {
    //endpoint for accessing all users in database
    await Domain.find()
        .then((domains) => res.send(domains)) //Note here.
        .catch((err) => console.log(err));
});

module.exports = domainRoutes;