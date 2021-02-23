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
@route GET /de1/verify?proxyID=<proxyID>&domain=<domainName>
@desc Verify if a domain is safe
*/
de1Routes.route('/verify/:proxyID').get(function(req, res) {

    let domains = req.query.domains;
    let proxyID = req.params.proxyID;

    let domainCount = domains.length;
    let safeDomains = [];
    let unsafeDomains = [];

    let allDomains = "&&& "

    // TODO: Check database to see if domain is already blacklisted or whitelisted before sending request
    domains.forEach(domain => {
        Domain.findOne({ "proxyID": proxyID, "domainName": domain }, (err, domain) => {

            if (err) {
                res.status(400).send(err);

            } else if (domain) {
                if (domain.listType === "whitelist" || domain.listType === "safe") {
                    safeDomains.push(domain);

                } else if (domain.listType === "blacklist" || domain.listType === "unsafe") {
                    unsafeDomains.push(domain)

                } else {
                    allDomains = allDomains.concat(domain);
                }
            }

        }).catch(err => {
            res.status(400).send(err);
        });
    });

    allDomains = allDomains.concat(" &&&");

    log.info("All Domains:", allDomains);

    const response = {
        domains: []
    };

    if (domainCount > (safeDomains.length + unsafeDomains.length)) {
        const socket = dgram.createSocket("udp4");

        socket.bind(UDP_PORT, function() {
            log.info("Server is running UDP on Port: " + UDP_PORT);
        });

        socket.on("listening", () => {
            let addr = socket.address();
            log.info(`Listening for UDP packets at ${addr.address}:${addr.port}`);
        });

        let de1IP = "50.98.133.70";
        let de1Port = 41234;

        let de1Timeout = setTimeout(function() {
            socket.close();
            res.status(408).send("Timeout Error");
        }, 5000);

        socket.send(allDomains, 0, allDomains.length, de1Port, de1IP, function(err) {
            if (err)
                throw err;
            log.info('UDP message sent to ' + de1IP + ':' + de1Port);
        });

        socket.on("message", (msg, info) => {
            log.info(`Data received from client : ${msg}`);
            log.info(`Received ${msg.length} bytes from ${info.address}:${info.port}`);
            socket.close();

            // DE1 response in the format: "domain.com1"
            let domainStatus = (msg.toString().split(" "));

            domainStatus.forEach(domainResponse => {
                let domainName = domainResponse.substr(0, domainName.length - 1);
                let domainSafe = domainResponse.substr(domainName.length - 1);

                const status = {
                    domain: domainName,
                    safe: domainSafe
                }

                response.domains.push(status);
            });

            // TODO: blacklist or whitelist domain in DB based on response from de1
        });

    }

    safeDomains.forEach(safeDomain => {
        const status = {
            domain: safeDomain,
            safe: 1
        }

        response.domains.push(status);
    });

    unsafeDomains.forEach(unsafeDomain => {
        const status = {
            domain: unsafeDomain,
            safe: 0
        }

        response.domains.push(status);
    });

    log.info("Response:", response);

    clearTimeout(de1Timeout);

    res.status(200).json(response);

});

module.exports = de1Routes;