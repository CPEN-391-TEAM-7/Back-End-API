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
    }
});

module.exports = mongoose.model('Proxy', Proxy);