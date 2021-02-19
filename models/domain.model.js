const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Domain = new Schema({
    domainID: {
        type: Schema.Types.ObjectId
    },
    proxyID: {
        type: Schema.Types.ObjectId
    },
    domainName: {
        type: String
    },
    listType: {
        type: String
    }
});

module.exports = mongoose.model('Domain', Domain);