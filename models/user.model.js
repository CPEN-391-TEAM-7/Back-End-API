const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let User = new Schema({
    userID: {
        // Probably generated on the mobileapp
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    proxyID: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("User", User);
