const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Activity = new Schema({
    ActivityID: {
        type: Schema.Types.ObjectId
    },
    DomainID: {
        type: Schema.Types.ObjectId
    },
    DomainName: {
        type: String
    },
    UserID: {
        type: Schema.Types.ObjectId
    },
    Timestamp: {
        type: Date
    }
});

module.exports = mongoose.model('Activity', Activity);