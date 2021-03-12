const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// This model will always be created by the proxy

const Domain = new Schema({
    domainID: {
        // a randomly generated ID by Proxy
        type: String,
        unique: true,
        required: true,
    },
    proxyID: {
        type: String,
    },
    domainName: {
        // a URL
        type: String,
    },
    listType: {
        // BlackList, WhiteList, Safe, Unsafe, undefined
        type: String,
        enum: ["Whitelist", "Blacklist", "Safe", "Malicious", "Undefined"],
        default: "Undefined",
    },
    num_of_accesses: {
        // Number of accesses to this domain
        type: Number,
    },
});

module.exports = mongoose.model("Domain", Domain);