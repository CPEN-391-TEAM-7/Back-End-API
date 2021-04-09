const express = require("express");
const { v4: uuidv4 } = require('uuid');
const de1 = require("./de1");

const activityRoutes = express.Router();

const Activity = require("../../models/activity.model");
const Domain = require("../../models/domain.model");
const User = require("../../models/user.model");
const { forEach } = require("lodash");

const validListTypes = ["Whitelist", "Blacklist", "Safe", "Malicious", "Undefined"];

/** 
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
activityRoutes.route("/recent/:userID").post(function(req, res) {
    const userID = req.params.userID;
    const startDate = req.body.startDate;

    console.log(`GET /activity/recent/${userID}`);

    console.log(req.httpVersion);
    console.log("!!! Here is the startDate " + startDate);
    // Set optional body params to null if not in request
    const endDate = req.body.endDate ? req.body.endDate : null;
    const limit = req.body.limit ? req.body.limit : null;
    const listTypes = req.body.listTypes ? req.body.listTypes : null;

    const userFilter = {
        userID: userID
    };

    // Verify start date is after end date
    if (endDate && endDate > startDate) {
        console.log("Error, startDate must be after the endDate");
        res.status(400).send("Error, startDate must be after the endDate");
        return;
    }

    // Verify limit is a positive number
    if (limit && limit < 1) {
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
            console.log("Error, user not found");
            res.status(404).send("Error, user not found");
            return;

        } else {
            const proxyID = user.proxyID;

            let dateFilter = {};
            let activityFilter = {
                proxyID: proxyID
            };

            // Set activity filter based on start and end date params
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

            // Add list types to activity filter
            if (listTypes) {
                listTypeFilter = [];

                for (let i = 0; i < listTypes.length; i++) {
                    // Verify all list types are valid
                    if (!validListTypes.includes(listTypes[i])) {
                        console.log(`Error, invalid listType: ${listTypes[i]}`);
                        res.status(400).send(`Error, invalid listType: ${listTypes[i]}`);
                        return;
                    }

                    listTypeFilter.push({ listType: listTypes[i] })
                }

                activityFilter.$or = listTypeFilter;
            }

            // Get  a set limit of activities in order of most recent first using the created filters,
            // only retrieving the specified attributes
            if (limit) {
                Activity.find(activityFilter, "listType domainName timestamp ipAddress").sort({ timestamp: "desc" }).limit(limit).exec((err, activities) => {
                    if (err) {
                        console.log("Error fetching activities:", err);
                        res.status(400).send(err);
                        return;

                    } else if (activities.length < 1) {
                        console.log("Here is the startDate: " + startDate);
                        console.log("Error, activities not found");
                        res.status(404).send("Error, activities not found");
                        return;
                    }

                    console.log(activities);

                    let response = {
                        activities: activities
                    }

                    // Set last end date as the oldest activity timestamp returned
                    response.lastEndDate = activities[activities.length - 1].timestamp;
                    response.count = activities.length;

                    console.log("Sending activities");
                    res.status(200).send(response);
                });

            } else {
                // Get activities in order of most recent first using the created filters,
                // only retrieving the specified attributes
                Activity.find(activityFilter, "listType domainName timestamp ipAddress").sort({ timestamp: "desc" }).exec((err, activities) => {
                    if (err) {
                        console.log("Error fetching activities:", err);
                        res.status(400).send(err);
                        return;

                    } else if (activities.length < 1) {
                        console.log("Here is the startDate: " + startDate);
                        console.log("Error, activities not found");
                        res.status(404).send("Error, activities not found");
                        return;
                    }

                    let response = {
                        activities: activities
                    }

                    // Set last end date as the oldest activity timestamp returned
                    response.lastEndDate = activities[activities.length - 1].timestamp;
                    response.count = activities.length;

                    console.log("Sending recent activities");
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

/** 
 * @route GET /activity/allTimeMostRequested/:userID
 * @desc Get the all time most visited domains
 * @param userID String: the admin user sending the request
 * @body limit Integer: how many domains to return
 * @body listTypes Array[String]?: (optional) filter domains by list types
 * @return domains Array: an arrary of domains
 */
activityRoutes.route("/allTimeMostRequested/:userID").post(function(req, res) {
    const userID = req.params.userID;
    const limit = req.body.limit;

    console.log(`GET /activity/allTimeMostRequested/${userID}`);

    // Set optional body params to null if not in request
    const listTypes = req.body.listTypes ? req.body.listTypes : null;

    const userFilter = {
        userID: userID
    };

    // Verify limit is a positive number
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
            console.log("Error, user not found");
            res.status(404).send("Error, user not found");
            return;

        } else {

            const proxyID = user.proxyID;

            let domainFilter = {
                proxyID: proxyID
            };

            // Add list types to domain filter
            if (listTypes) {
                listTypeFilter = [];

                for (let i = 0; i < listTypes.length; i++) {
                    // Verify all list types are valid
                    if (!validListTypes.includes(listTypes[i])) {
                        console.log(`Error, invalid listType: ${listTypes[i]}`);
                        res.status(400).send(`Error, invalid listType: ${listTypes[i]}`);
                        return;
                    }

                    listTypeFilter.push({ listType: listTypes[i] })
                }

                domainFilter.$or = listTypeFilter;
            }

            console.log(domainFilter);

            // Get domains in order of most active first using the created filters
            Domain.find(domainFilter, "domainName listType num_of_accesses").sort({ num_of_accesses: "desc" }).limit(limit).exec((err, domains) => {
                if (err) {
                    console.log("Error fetching domains:", err);
                    res.status(400).send(err);
                    return;

                } else if (domains.length < 1) {
                    console.log("Error, domains not found");
                    res.status(404).send("Error, domains not found");
                    return;
                }

                console.log(domains);

                let response = {
                    domains: domains
                }

                console.log("Sending all time most active domains");
                res.status(200).send(response);
            });

        }
    }).catch(err => {
        console.log("Error:", err);
        res.status(400).send(err);
        return;
    });
});

/** 
 * @route GET /activity/recent/:userID
 * @desc Get the most recent domain requests
 * @param userID String: the admin user sending the request
 * @body startDate Date: datetime to start querying backwards from (inclusive)
 * @body endDate Date: datetime to query forwards from (inclusive)
 * @body limit Integer?: (optional) how many domain requests to return
 * @body listTypes Array[String]?: (optional) filter domain requests by list types
 * @return activities Array: an arrary of domain request logs
 * @return lastEndDate Date: the timestamp of the oldest domain request
 * @return count Integer:  the number of domain requests
 */
activityRoutes.route("/mostRequested/:userID").post(function(req, res) {
    const userID = req.params.userID;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    console.log(`GET /activity/mostRequested/${userID}`);

    // Set optional body params to null if not in request
    const limit = req.body.limit ? req.body.limit : null;
    const listTypes = req.body.listTypes ? req.body.listTypes : null;

    const userFilter = {
        userID: userID
    };

    // Verify start date is after end date
    if (endDate > startDate) {
        console.log("Error, startDate must be after the endDate");
        res.status(400).send("Error, startDate must be after the endDate");
        return;
    }

    // Verify limit is a positive number
    if (limit && limit < 1) {
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
            console.log("Error, user not found");
            res.status(404).send("Error, user not found");
            return;

        } else {
            const proxyID = user.proxyID;

            let activityFilter = {
                proxyID: proxyID
            };

            // Set activity filter based on start and end date params
            let dateFilter = {
                "$gte": endDate,
                "$lte": startDate
            };

            activityFilter.timestamp = dateFilter;

            // Add list types to activity filter
            if (listTypes) {
                listTypeFilter = [];

                for (let i = 0; i < listTypes.length; i++) {
                    // Verify all list types are valid
                    if (!validListTypes.includes(listTypes[i])) {
                        console.log(`Error, invalid listType: ${listTypes[i]}`);
                        res.status(400).send(`Error, invalid listType: ${listTypes[i]}`);
                        return;
                    }

                    listTypeFilter.push({ listType: listTypes[i] })
                }

                activityFilter.$or = listTypeFilter;
            }

            // Get activities in order of most recent first using the created filters
            Activity.find(activityFilter, "domainName listType timestamp").sort({ timestamp: "desc" }).exec((err, activities) => {
                if (err) {
                    console.log("Error fetching activities:", err);
                    res.status(400).send(err);
                    return;

                } else if (activities.length < 1) {
                    console.log("Error, activities not found");
                    res.status(404).send("Error, activities not found");
                    return;
                }

                let domainsCount = {};

                // Count number of domain requests per domain and assign list type
                for (let i = 0; i < activities.length; i++) {
                    const domainName = activities[i].domainName;
                    const list = activities[i].listType;
                    domainsCount[domainName] = domainsCount[domainName] ? { count: domainsCount[domainName].count + 1, listType: domainsCount[domainName].listType } : { count: 1, listType: list };
                }

                // Convert to an array for sorting
                let domains = Object.keys(domainsCount).map(function(key) {
                    return [key, domainsCount[key]];
                });

                // Sort domains by number of accesses
                domains.sort(function(first, second) {
                    return second[1].count - first[1].count;
                });

                // Cut down the list if there is a limit
                if (limit) {
                    domains = domains.slice(0, limit);
                }

                let mostRequested = [];

                domains.forEach((domain) => {
                    let object = {
                        "domainName": domain[0],
                        "count": domain[1].count,
                        "listType": domain[1].listType
                    };
                    mostRequested.push(object);
                });

                let response = { mostRequested };

                console.log("Sending most requested domains");
                res.status(200).send(response);
            });
        }

    }).catch(err => {
        console.log("Error:", err);
        res.status(400).send(err);
        return;
    });
});

/** 
 * @route POST /activity/log/:proxyID
 * @desc Log a domain request
 * @param proxyID String: the proxy sending the request
 * @body listType String: the list the domain belongs to 
 * @body domainName String: the name of the domain being logged
 */
activityRoutes.post("/log/:proxyID", function(req, res) {
    const proxyID = req.params.proxyID;
    const listType = req.body.listType;
    const domainName = req.body.domainName;
    const ipAddress = req.body.ipAddress;

    console.log("Domain Name: ", domainName, "IP Adress: ", ipAddress);

    let domainID;

    console.log(`POST /activity/log/${proxyID}`);

    Domain.findOne({ "proxyID": proxyID, "domainName": domainName }, function(err, domain) {
        if (err) {
            console.log("Error:", err);
            res.status(400).send(err);
            return;

        } else if (!domain) {
            // Create new domain object if one does not exist
            domainID = createDomain(domainName, listType, proxyID);

        } else {
            // Increment the number of accesses
            domain.update({
                $inc: {
                    num_of_accesses: 1
                }
            });
        }

        const id = uuidv4();
        const now = Date.now();

        // Create new activity log
        const newActivity = new Activity({
            activityID: id,
            domainID: domainID,
            domainName: domainName,
            proxyID: proxyID,
            timestamp: now,
            listType: listType,
            ipAddress: ipAddress
        });

        console.log("Create Activity: ", newActivity);

        newActivity
            .save()
            .catch((err) => {
                console.log("Error creating activity record:", err);
            });

        console.log("Activity logged");
        res.status(202).send("Activity logged");

    });
});


/**
 * This endpoint returns all activities associated with the proxyID.
 * @body proxyID
 * @returns activities
 * @returns status
 */
activityRoutes.route("/all").get((req, res) => {
    console.log("/all");

    const { proxyID } = req.body;

    console.log(proxyID.toString());

    Activity.find({ proxyID: proxyID })
        .then((activities) => {
            res.status(200).json({
                "status": "Successful",
                "activities": activities
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({
                "status": "Failed",
                "msg": err
            })
        });
});

/* 
 * @desc Create a new domain object in the DB
 * @param domainName: the domain 
 * @param listType: the list the domain will be put on
 * @param proxy: the proxy's ID
 * @return The ID of the domain object
 */
function createDomain(domainName, listType, proxy) {
    console.log(`createDomain(${domainName}, ${listType}, ${proxy})`);
    const id = uuidv4();

    const newDomain = new Domain({
        domainID: id,
        proxyID: proxy,
        domainName: domainName,
        listType: listType,
        num_of_accesses: 1,
    });

    newDomain
        .save()
        .catch((err) => {
            console.log("Error creating domain:", err);
        });

    return id;
}

module.exports = activityRoutes;