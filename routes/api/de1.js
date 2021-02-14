const express = require("express");
const dgram = require("dgram");

const UDP_PORT = 8082;

const de1Routes = express.Router();

const Activity = require('../../models/activity.model');
const Domain = require('../../models/domain.model');
const User = require('../../models/user.model');

/* 
@route GET /de1/verify?proxyID=<proxyID>&domain=<domainName>
@desc Verify if a domain is safe
*/
de1Routes.route('/verify').get(function(req, res) {

    let domain = req.query.domain;
    let proxy = req.query.proxyID;

    // TODO: Check database to see if domain is already blacklisted or whitelisted before sending request

    const socket = dgram.createSocket("udp4");

    socket.bind(UDP_PORT, function() {
        console.log("Server is running UDP on Port: " + UDP_PORT);
    });

    socket.on("listening", () => {
        let addr = socket.address();
        console.log(`Listening for UDP packets at ${addr.address}:${addr.port}`);
    });

    // Switch to DE1 values
    let de1IP = "localhost";
    let de1Port = 1234;

    socket.send(domain, 0, domain.length, de1Port, de1IP, function(err) {
        if (err)
            throw err;
        console.log('UDP message sent to ' + de1IP + ':' + de1Port);
    });

    socket.on("message", (msg, info) => {
        console.log(`Data received from client : ${msg}`);
        console.log(`Received ${msg.length} bytes from ${info.address}:${info.port}`);
        socket.close();

        // DE1 response in the format: "domain.com 1"
        domainStatus = (msg.toString().split(" "));

        const response = {
            domain: domainStatus[0],
            status: domainStatus[1],
        }

        res.status(200).json(response);

        // TODO: blacklist or whitelist domain in DB based on response from de1
    });

});

module.exports = de1Routes;