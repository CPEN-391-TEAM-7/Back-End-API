const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Schema = mongoose.Schema;

// This model will always be created by the proxy

const Domain = new Schema({
    domainID: {
        // a randomly generated ID by Proxy
        type: String,
        index: true,
        require: true, 
        unique: true,
        sparse: true
    },
    proxyID: {
        type: String,
        require: true, 
        sparse: true
    },
    domainName: {
        // a URL
        type: String,
        default: "www.empty.com"
    },
    listType: {
        // Blacklist, Whitelist, Safe, Unsafe, undefined
        type: String,
        enum: ["Whitelist", "Blacklist", "Safe", "Malicious", "Undefined"],
        default: "Undefined",
    },
    num_of_accesses: {
        // Number of accesses to this domain
        type: Number,
        default: 0
    },
});

module.exports = mongoose.model("Domain", Domain);