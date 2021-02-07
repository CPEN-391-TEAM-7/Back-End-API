const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new Schema({
    UserID: {
        type: Schema.Types.ObjectId
    },
    Name: {
        type: String
    },
    GoogleAuthToken: {
        type: String
    }
});

module.exports = mongoose.model('User', User);