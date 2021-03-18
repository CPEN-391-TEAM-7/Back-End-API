const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Activity = new Schema({
    activityID: {
        type: String
    },
    domainID: {
        type: String
    },
    domainName: {
        type: String
    },
    proxyID: {
        type: String
    },
    timestamp: {
        type: Date
    },
    listType: {
        // Blacklist, Whitelist, Safe, Unsafe, Undefined
        type: String,
        enum: ["Whitelist", "Blacklist", "Safe", "Malicious", "Undefined"],
        default: "Undefined",
    }
});

module.exports = mongoose.model('Activity', Activity);