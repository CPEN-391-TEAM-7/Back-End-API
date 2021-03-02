const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Proxy = new Schema({
    proxyID: {
        type: String
    },
    ipAddress: {
        type: String
    },
    port: {
        type: Number
    },
    userID: {
        type: String
    },
});

module.exports = mongoose.model('Proxy', Proxy);