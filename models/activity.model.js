const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Activity = new Schema({
    activityID: {
        type: Schema.Types.ObjectId
    },
    domainID: {
        type: Schema.Types.ObjectId
    },
    domainName: {
        type: String
    },
    userID: {
        type: Schema.Types.ObjectId
    },
    timestamp: {
        type: Date
    }
});

module.exports = mongoose.model('Activity', Activity);