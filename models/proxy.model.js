const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Proxy = new Schema({
    proxyID: {
        type: Schema.Types.ObjectId
    },
    ipAddress: {
        type: String
    },
    port: {
        type: Number
    },
    userID: {
        type: Schema.Types.ObjectId
    },
});

module.exports = mongoose.model('Proxy', Proxy);