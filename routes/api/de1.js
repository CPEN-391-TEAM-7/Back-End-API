const express = require("express");
const dgram = require("dgram");
const { v4: uuidv4 } = require('uuid');

const UDP_PORT = 8082;

const de1Routes = express.Router();

const Activity = require('../../models/activity.model');
const Domain = require('../../models/domain.model');
const User = require('../../models/user.model');

/* 
 * @route GET /de1/verify/:proxyID
 * @desc Verify if a domain is safe, and updates domain in the DB if necessary
 * @param proxyID String: the proxy sending the request
 * @body domain String: the domain to verify
 * @body ipAddress String: the ip address of the device making to domain request
 * @return domain String: the name of the domain
 * @return safe Integer: a 1 for safe or a 0 for a malicious domain
 */
de1Routes.get('/verify/:proxyID', function(req, res) {
    const domainName = req.body.domainName;
    const ipAddress = req.body.ipAddress;
    const proxyID = req.params.proxyID;

    console.log(`GET /de1/verify/${proxyID}, ${domainName}, ${ipAddress}`);

    const response = {};

    // Check if a domain object already exists for this domain name and proxyID
    Domain.findOne({ "proxyID": proxyID, "domainName": domainName }, function(err, domain) {
        let newDomain = false;
        let domainID = null;
        let domainListType = "Undefined";
        let contactDE1 = false;
        let domainStatus = null;

        if (err) {
            console.log("Error:", err);
            res.status(400).send(err);

        } else if (domain) {
            console.log("Domain exists");

            // Get the list type and ID for activity logging and domain updating purposes
            domainID = domain.domainID;
            domainListType = domain.listType;

            // Check if domain list type already defined
            if (domainListType === "Whitelist" || domainListType === "Safe" || domainListType === "Blacklist" || domainListType === "Malicious") {
                response.domain = domainName;
                response.listType = domainListType;

            } else {
                console.log("Undefined domain");

                contactDE1 = true; // Flag to contact DE1 to get domain list type
            }

        } else {
            console.log("New domain");

            newDomain = true; // Flag that new domain needs to be created in DB

            contactDE1 = true; // Flag to contact DE1 to get domain list type
        }

        // Contact DE1 to determine domain list type
        if (contactDE1) {
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

            const de1Message = domainName.concat("\n");

            // Send the domain name to the DE1
            socket.send(de1Message, 0, de1Message.length, de1Port, de1IP, function(err) {
                if (err) {
                    console.log("Error sending DE1 message:", err);
                    resolve(null);
                }
                console.log(`UDP message sent to ${de1IP}:${de1Port}`);
            });

            // Close the socket if no response from DE1 after 3 sec
            let de1Timeout = setTimeout(function() {
                socket.close();
                console.log("Cannot Reach DE1-SoC");
                res.status(408).send("DE1 Timeout Error");
            }, 3000);

            // Receive response from the DE1
            socket.on("message", (msg, info) => {
                clearTimeout(de1Timeout); // Cancel 3 sec timer

                console.log(`Data received from client : ${msg}`);
                console.log(`Received ${msg.length} bytes from ${info.address}:${info.port}`);
                socket.close();

                domainStatus = getDomainStatus(msg.toString());

                // Set the response to proxy based off response from DE1
                response.domain = domainStatus.domain;
                response.listType = domainStatus.listType;

                // Get the list type for activity logging and domain object creating
                if (domainStatus.listType) {
                    domainListType = domainStatus.listType;
                }

                console.log("Response:", response);

                // Send timeout error if no response from DE1
                if (response.domain.length < 1 || response.listType.length < 1) {
                    console.log("DE1 Error");
                    res.status(400).send("DE1 Error");

                    // Check that the DE1 sent the response for the right domain
                } else if (response.domain !== domainName) {
                    console.log("Responses from DE1 out of order");
                    res.status(400).send("DE1 responses out of order");

                } else {
                    // If a new domain create an object for it in the DB
                    if (newDomain) {
                        domainID = createDomain(domainName, domainListType, proxyID);

                        // Update the object's list type if needed and increment number of accesses
                    } else {
                        updateListTypeAndIncrement(domainID, domainName, proxyID, domainListType);
                    }

                    // Record the domain request
                    createActivityRecord(domainID, domainName, proxyID, domainListType, ipAddress);

                    console.log("Send");

                    res.status(200).json(response);
                }
            });

            // Else, no need to contact DE1 to determine list type
        } else {
            // Update the object's list type if needed and increment number of accesses
            updateListTypeAndIncrement(domainID, domainName, proxyID, domainListType);

            // Record the domain request
            createActivityRecord(domainID, domainName, proxyID, domainListType, ipAddress);

            console.log("Send");

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
function getDomainStatus(domainStatus) {
    console.log(`getDomainStatus(${domainStatus})`);

    const domainResponse = {};
    let status = "";

    if (domainStatus) {
        console.log("DE1: ", domainStatus);
        // DE1 response in the format: "domain.com1" needs to be separated
        domainStatus = domainStatus.trim(); // trim white space and new lines
        domainResponse.domain = domainStatus.substr(0, domainStatus.length - 1);
        status = domainStatus.substr(domainStatus.length - 1);

    } else {
        domainResponse.domain = "";
    }

    // Set response to return list type for activity logging and updating/creating domain objects
    if (status === "0") {
        domainResponse.listType = "Safe";

    } else if (status === "1") {
        domainResponse.listType = "Malicious";

    } else if (status === "3" || status === "4") {
        console.log("Domain error status:", status);
        domainResponse.listType = "Undefined";

    } else if (status === "5" || status === "6") {
        console.log("DE1 error status:", status);
        domainResponse.listType = "";

    } else {
        domainResponse.listType = "";
    }

    return domainResponse;
}

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

/* 
 * @desc Update the domain's list type and increment number of accesses
 * @param domainID: the domain's ID
 * @param domainName: the domain 
 * @param domainListType: the list to update the domain to
 * @param proxy: the proxy's ID
 */
function updateListTypeAndIncrement(domainID, domainName, proxy, domainListType) {
    console.log(`updateListTypeAndIncrement(${domainID}, ${domainName}, ${proxy}, ${domainListType})`);
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
function createActivityRecord(domainID, domainName, proxy, domainListType, ipAddress) {
    console.log(`createActivityRecord(${domainID}, ${domainName}, ${proxy}, ${domainListType})`);
    const id = uuidv4();
    const now = Date.now();

    const newActivity = new Activity({
        activityID: id,
        domainID: domainID,
        domainName: domainName,
        proxyID: proxy,
        timestamp: now,
        listType: domainListType,
        ipAddress: ipAddress
    });

    newActivity
        .save()
        .catch((err) => {
            console.log("Error creating activity record:", err);
        });
}

module.exports = de1Routes;