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
de1Routes.route('/verify').get(function(req, res) {

    let domains = req.body.domains;
    let proxy = req.query.proxyID;

    let allDomainsSubStr1 = "&&& "
    let allDomainsSubStr2 = allDomainsSubStr1.concat(domains.join(" "));
    let allDomains = allDomainsSubStr2.concat(" &&&");

    log.info("All Domains:", allDomains);

    // TODO: Check database to see if domain is already blacklisted or whitelisted before sending request

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

        const response = {
            domains: []
        };

        domainStatus.forEach(domainResponse => {
            let domainName = domainResponse.substr(0, domainName.length);
            let domainList = domainResponse.substr(domainName.length - 1);

            const status = {
                domain: domainName,
                list: domainList
            }

            response.domains.push(status);
        });

        log.info("Response:", response);

        clearTimeout(de1Timeout);

        res.status(200).json(response);
    });

    // TODO: blacklist or whitelist domain in DB based on response from de1

});

module.exports = de1Routes;