const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new Schema({
    userID: {
        type: Schema.Types.ObjectId
    },
    name: {
        type: String
    },
    proxyID: {
        type: Schema.Types.ObjectId
    },
    googleAuthToken: {
        type: String
    }
});

module.exports = mongoose.model('User', User);