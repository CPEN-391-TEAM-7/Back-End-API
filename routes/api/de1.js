const express = require("express");
const dgram = require("dgram");
const { v4: uuidv4 } = require('uuid');
const de1Helper = require('../helper/de1Helper');

const UDP_PORT = 8082;

const de1Routes = express.Router();

const Domain = require('../../models/domain.model');

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

                domainStatus = de1Helper.getDomainStatus(msg.toString());

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
                        domainID = de1Helper.createDomain(domainName, domainListType, proxyID);

                        // Update the object's list type if needed and increment number of accesses
                    } else {
                        de1Helper.updateListTypeAndIncrement(domainID, domainName, proxyID, domainListType);
                    }

                    // Record the domain request
                    de1Helper.createActivityRecord(domainID, domainName, proxyID, domainListType, ipAddress);

                    console.log("Send");

                    res.status(200).json(response);
                }
            });

            // Else, no need to contact DE1 to determine list type
        } else {
            // Update the object's list type if needed and increment number of accesses
            de1Helper.updateListTypeAndIncrement(domainID, domainName, proxyID, domainListType);

            // Record the domain request
            de1Helper.createActivityRecord(domainID, domainName, proxyID, domainListType, ipAddress);

            console.log("Send");

            res.status(200).json(response);
        }

    }).catch(err => {
        console.log("Error:", err);
        res.status(400).send(err);
    });
});

module.exports = de1Routes;