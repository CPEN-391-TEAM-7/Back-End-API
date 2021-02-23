const express = require("express");
const dgram = require("dgram");
const bunyan = require("bunyan");
const url = require("url");

const UDP_PORT = 8082;

const de1Routes = express.Router();

const Activity = require('../../models/activity.model');
const Domain = require('../../models/domain.model');
const User = require('../../models/user.model');

const log = bunyan.createLogger({ name: "BackendAPI" });

/* 
@route GET /de1/verify?proxyID=<proxyID>&domains=<domainName>
@desc Verify if a domain is safe
@param domain: the domain to verify
@param proxyID: the proxy sending the request
*/
de1Routes.route('/verify/:proxyID').get(function(req, res) {

    let domainName = req.query.domain;
    let proxyID = req.params.proxyID;

    log.info(`Verify ${domain} sent from ${proxyID}`);

    const response = {
        domain: domainName,
    };

    // Check if a domain object already exists for this domain name and proxyID
    Domain.findOne({ "proxyID": proxyID, "domainName": domainName }, (err, domain) => {
        if (err) {
            log.info("Error:", err);
            res.status(400).send(err);

        } else if (domain) {
            // Mark domain as safe if already whitelisted or safe
            if (domain.listType === "whitelist" || domain.listType === "safe") {
                response.safe = 1;

                // Mark domain as unsafe if already blacklisted or unsafe
            } else if (domain.listType === "blacklist" || domain.listType === "unsafe") {
                response.safe = 0;

                // Else, send domain to DE1 to verify if it is safe
            } else {
                // Create UDP socket
                const socket = dgram.createSocket("udp4");

                socket.bind(UDP_PORT, function() {
                    log.info(`Server is running UDP on Port: ${UDP_PORT}`);
                });

                socket.on("listening", () => {
                    let addr = socket.address();
                    log.info(`Listening for UDP packets at ${addr.address}:${addr.port}`);
                });

                let de1IP = "50.98.133.70";
                let de1Port = 41234;

                // Close the socket if no response from DE1 after 5 sec
                let de1Timeout = setTimeout(function() {
                    socket.close();
                    log.info("Timeout Erro:");
                    res.status(408).send("Timeout Error");
                }, 5000);

                // Send the domain name to the DE1
                socket.send(domainName, 0, domainName.length, de1Port, de1IP, function(err) {
                    if (err) {
                        log.info("Error:", err);
                        res.status(400).send(err);
                        throw err;
                    }
                    log.info(`UDP message sent to ${de1IP}:${de1Port}`);
                });

                // Receive response from the DE1
                socket.on("message", (msg, info) => {
                    clearTimeout(de1Timeout);

                    log.info(`Data received from client : ${msg}`);
                    log.info(`Received ${msg.length} bytes from ${info.address}:${info.port}`);
                    socket.close();

                    // DE1 response in the format: "domain.com1" needs to be separated
                    let domainStatus = msg.toString();
                    let name = domainStatus.substr(0, domainName.length - 1);
                    let status = domainStatus.substr(domainName.length - 1);

                    // Check that the DE1 sent the response for the right domain
                    if (name === domainName) {
                        response.safe = status;
                    } else {
                        log.info("Responses from DE1 out of order");
                        res.status(400).send("DE1 responses out of order");
                    }
                });
            }

            log.info("Response:", response);

            res.status(200).json(response);
        }

    }).catch(err => {
        log.info("Error:", err);
        res.status(400).send(err);
    });

    // TODO: blacklist or whitelist domain in DB based on response from de1
});

module.exports = de1Routes;