const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new Schema({
    userID: {
        type: String
    },
    name: {
        type: String
    },
    proxyID: {
        type: String
    },
    googleAuthToken: {
        type: String
    }
});

module.exports = mongoose.model('User', User);