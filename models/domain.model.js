const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Domain = new Schema({
    DomainID: {
        type: Schema.Types.ObjectId
    },
    UserID: {
        type: Schema.Types.ObjectId
    },
    DomainName: {
        type: String
    },
    ListType: {
        type: String
    }
});

module.exports = mongoose.model('Domain', Domain);