const express = require("express");
const dgram = require("dgram");
const bunyan = require("bunyan");
const url = require("url");
const { v4: uuidv4 } = require('uuid');

const UDP_PORT = 8082;

const de1Routes = express.Router();

const Activity = require('../../models/activity.model');
const Domain = require('../../models/domain.model');
const User = require('../../models/user.model');

const log = bunyan.createLogger({ name: "BackendAPI" });

/* 
 * @route GET /de1/verify?proxyID=<proxyID>&domains=<domainName>
 * @desc Verify if a domain is safe
 * @param domain: the domain to verify
 * @param proxyID: the proxy sending the request
 */
de1Routes.get('/verify/:proxyID', async function(req, res) {

    let domainName = req.query.domain;
    let proxyID = req.params.proxyID;

    console.log(`Verify ${domainName} sent from ${proxyID}`);

    const response = {};

    // Check if a domain object already exists for this domain name and proxyID
    await Domain.findOne({ "proxyID": proxyID, "domainName": domainName }, async(err, domain) => {
        let newDomain = false;
        let domainID = null;
        let domainListType = "Undefined";

        if (err) {
            console.log("Error:", err);
            res.status(400).send(err);

        } else if (domain) {
            // Get the list type and ID for activity logging and domain updating purposes
            domainID = domain.domainID;
            domainListType = domain.listType;

            // Mark domain as safe if already whitelisted or safe
            if (domain.listType === "Whitelist" || domain.listType === "Safe") {
                response.domain = domainName;
                response.safe = 1;

                // Mark domain as unsafe if already blacklisted or unsafe
            } else if (domain.listType === "Blacklist" || domain.listType === "Malicious") {
                response.domain = domainName;
                response.safe = 0;

                // Else, send domain to DE1 to verify if it is safe
            } else {
                let domainStatus = await getDomainStatus(domainName); // Get the domain status from the DE1

                // Set the response to proxy based off response from DE1
                response.domain = domainStatus.domain;
                response.safe = domainStatus.safe;

                // Get the list type for activity logging and domain updating
                if (domainStatus.listType) {
                    domainListType = domainStatus.listType;
                }
            }

            // Else, send domain to DE1 to verify if it is safe
        } else {
            newDomain = true; // Flag that new domain needs to be created in DB

            let domainStatus = await getDomainStatus(domainName); // Get the domain status from the DE1

            // Set the response to proxy based off response from DE1
            response.domain = domainStatus.domain;
            response.safe = domainStatus.safe;

            // Get the list type for activity logging and domain object creating
            if (domainStatus.listType) {
                domainListType = domainStatus.listType;
            }
        }

        console.log("Response:", response);

        // Send timeout error if no response from DE1
        if (response.domain.length < 1 || response.safe.length < 1) {
            res.status(408).send("Timeout Error");

            // Check that the DE1 sent the response for the right domain
        } else if (response.domain !== domainName) {
            console.log("Responses from DE1 out of order");
            res.status(400).send("DE1 responses out of order");

        } else {

            // If a new domain create an object for it in the DB
            if (newDomain) {
                domainID = await createDomain(domainName, domainListType, proxyID);

                // Update the object's list type if needed and increment number of accesses
            } else {
                updateListTypeAndIncrement(domainID, domainName, proxyID, domainListType);
            }

            // Record the domain request
            createActivityRecord(domainID, domainName, proxyID, domainListType);

            res.status(200).json(response);
        }

    }).catch(err => {
        console.log("Error:", err);
        res.status(400).send(err);
    });
});

/* 
 * @desc Get the status of a domain from the DE1
 * @param domainName: the domain to verify
 * @return The formatted reponse message
 */
async function getDomainStatus(domainName) {
    const domainStatus = await verfiyDomain(domainName);

    const domainResponse = {};

    if (domainStatus) {
        // DE1 response in the format: "domain.com1" needs to be separated
        domainResponse.domain = domainStatus.substr(0, domainName.length - 1);
        domainResponse.safe = domainStatus.substr(domainName.length - 1);
    } else {
        // For no response from DE1 set response to empty
        domainResponse.domain = "";
        domainResponse.safe = "";
    }

    // Set response to return list type for activity logging and updating/creating domain objects
    if (domainResponse.safe === 1) {
        domainResponse.listType = "Safe";

    } else if (domainResponse.safe === 0) {
        domainResponse.listType = "Malicious";
    }

    return domainResponse;
}

/* 
 * @desc Contact the DE1 to verify if the domain is safe 
 * @param domainName: the domain to verify
 * @return The message from the DE1, a domain followed by a 1 for safe or 0 for malicous, eg. "google.com1"
 */
function verfiyDomain(domainName) {
    return new Promise((resolve, reject) => {

        // Create UDP socket listening on port 8082
        const socket = dgram.createSocket("udp4");

        socket.bind(UDP_PORT, function() {
            console.log(`Server is running UDP on Port: ${UDP_PORT}`);
        });

        socket.on("listening", () => {
            let addr = socket.address();
            console.log(`Listening for UDP packets at ${addr.address}:${addr.port}`);
        });

        const de1IP = "50.98.133.70";
        const de1Port = 41234;

        // Send the domain name to the DE1
        socket.send(domainName, 0, domainName.length, de1Port, de1IP, function(err) {
            if (err) {
                console.log("Error sending DE1 message:", err);
                resolve(null);
            }
            console.log(`UDP message sent to ${de1IP}:${de1Port}`);
        });

        // Close the socket if no response from DE1 after 3 sec
        let de1Timeout = setTimeout(function() {
            socket.close();
            console.log("Timeout Error");
            resolve(null);
        }, 3000);

        // Receive response from the DE1
        socket.on("message", (msg, info) => {
            clearTimeout(de1Timeout); // Cancel 3 sec timer

            console.log(`Data received from client : ${msg}`);
            console.log(`Received ${msg.length} bytes from ${info.address}:${info.port}`);
            socket.close();

            let domainStatus = msg.toString();
            resolve(domainStatus); // Return the response
        });
    })
}

/* 
 * @desc Create a new domain object in the DB
 * @param domainName: the domain 
 * @param listType: the list the domain will be put on
 * @param proxy: the proxy's ID
 * @return The ID of the domain object
 */
async function createDomain(domainName, listType, proxy) {
    const id = uuidv4();

    const newDomain = new Domain({
        domainID: id,
        proxyID: proxy,
        domainName: domainName,
        listType: listType,
        num_of_accesses: 1,
    });

    await newDomain
        .save()
        .catch((err) => {
            console.log("Error creating domain:", err);
        });

    return id;
}

/* 
 * @desc Update the domain's list type and increment number of accesses
 * @param domainID: the domain's ID
 * @param domainName: the domain 
 * @param domainListType: the list to update the domain to
 * @param proxy: the proxy's ID
 */
async function updateListTypeAndIncrement(domainID, domainName, proxy, domainListType) {
    const filter = {
        domainID: domainID,
        proxyID: proxy,
        domainName: domainName
    }

    const update = {
        listType: domainListType,
        $inc: {
            num_of_accesses: 1
        }
    };

    Domain.findOneAndUpdate(filter, update)
        .catch((err) => {
            console.log("Error updating domain:", err);
        });
}

/* 
 * @desc Create a new activity based on the domain request
 * @param domainID: the domain's ID
 * @param domainName: the domain 
 * @param domainListType: the list to update the domain to
 * @param proxy: the proxy's ID
 */
async function createActivityRecord(domainID, domainName, proxy, domainListType) {
    const id = uuidv4();
    const now = Date.now();

    const newActivity = new Activity({
        activityID: id,
        domainID: domainID,
        domainName: domainName,
        proxyID: proxy,
        timestamp: now,
        status: domainListType
    });

    newActivity
        .save()
        .catch((err) => {
            console.log("Error creating activity record:", err);
        });
}

module.exports = de1Routes;