const express = require("express");
const bunyan = require("bunyan");

const activityRoutes = express.Router();

const Activity = require('../../models/activity.model');
const Domain = require('../../models/domain.model');
const User = require('../../models/user.model');

const validListTypes = ["WhiteList", "BlackList", "Safe", "Malicious", "Undefined"];

/* 
 * @route GET /activity/recent/:userID
 * @desc Get the most recent domain requests
 * @param userID String: the admin user sending the request
 * @body startDate Date: datetime to start querying backwards from (inclusive)
 * @body endDate Date?: (optional) datetime to query forwards from (inclusive)
 * @body limit Integer?: (optional) how many domain requests to return
 * @body listTypes Array[String]?: (optional) filter domain requests by list types
 * @return activities Array: an arrary of domain request logs
 * @return lastEndDate Date: the timestamp of the oldest domain request
 * @return count Integer:  the number of domain requests
 */
activityRoutes.route('/recent/:userID').get(function(req, res) {
    const userID = req.params.userID;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate ? req.body.endDate : null;
    const limit = req.body.limit ? req.body.limit : null;
    const listTypes = req.body.listTypes ? req.body.listTypes : null;

    console.log(`GET /activity/recent/${userID}`);

    const userFilter = {
        userID: userID
    };

    if (endDate && endDate > startDate) {
        console.log("Error, startDate must be after the endDate");
        res.status(400).send("Error, startDate must be after the endDate");
        return;
    }

    if (limit < 1) {
        console.log(("Error, limit must be at least 1"));
        res.status(400).send("Error, limit must be at least 1");
        return;
    }

    User.findOne(userFilter, function(err, user) {
        if (err) {
            console.log("Error:", err);
            res.status(400).send(err);
            return;

        } else if (!user) {
            console.log("Error, user not found:", err);
            res.status(404).send(err);
            return;

        } else {
            const proxyID = user.proxyID;

            let dateFilter = {};
            let activityFilter = {
                proxyID: proxyID
            };

            if (endDate) {
                dateFilter = {
                    "$gte": endDate,
                    "$lte": startDate
                };

            } else {
                dateFilter = {
                    "$lte": startDate
                };
            }

            activityFilter.timestamp = dateFilter;

            if (listTypes) {
                listTypeFilter = [];

                for (let i = 0; i < listTypes.length; i++) {
                    if (!validListTypes.includes(listTypes[i])) {
                        console.log(`Error, invalid listType: ${listTypes[i]}`);
                        res.status(400).send(`Error, invalid listType: ${listTypes[i]}`);
                        return;
                    }

                    console.log('here');

                    listTypeFilter.push({ status: listTypes[i] })
                }

                console.log('here1');

                activityFilter.$or = listTypeFilter;
            }

            console.log('here2');

            if (limit) {
                Activity.find(activityFilter).sort({ timestamp: 'desc' }).limit(limit).exec((err, activities) => {
                    let response = {
                        activities: activities
                    }

                    response.lastEndDate = activities[activities.length - 1].timestamp;
                    response.count = activities.length;

                    console.log("Sending activities");
                    res.status(200).send(response);
                });

            } else {
                Activity.find(activityFilter).sort({ timestamp: 'desc' }).exec((err, activities) => {
                    let response = {
                        activities: activities
                    }

                    response.lastEndDate = activities[activities.length - 1].timestamp;
                    response.count = activities.length;

                    console.log("Sending activities");
                    res.status(200).send(response);
                });
            }
        }

    }).catch(err => {
        console.log("Error:", err);
        res.status(400).send(err);
        return;
    });
});

module.exports = activityRoutes;