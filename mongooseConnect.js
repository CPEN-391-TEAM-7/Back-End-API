const mongoose = require('mongoose');

function connect() {
    mongoose.connect(`mongodb://127.0.0.1:27017/Securify`, { useNewUrlParser: true, useFindAndModify: false });
    mongoose.connection.once("open", function() {
        console.log(`MongoDB database connection established successfully`);
    });
    return mongoose.connection
}

function close() {
    return mongoose.disconnect();
}

module.exports = { connect, close };