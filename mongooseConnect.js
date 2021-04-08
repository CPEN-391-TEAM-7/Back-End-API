const mongoose = require('mongoose');

function connect(env) {
    mongoose.connect(`mongodb://127.0.0.1:27017/${env}`, { useNewUrlParser: true, useFindAndModify: false });
    mongoose.connection.once("open", function() {
        console.log("MongoDB database connection established successfully");
    });
    return mongoose.connection
}

function close() {
    return mongoose.disconnect();
}

module.exports = { connect, close };