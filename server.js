const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongooseConnect = require("./mongooseConnect");

const user = require("./routes/api/user");
const domain = require("./routes/api/domain");
const activity = require("./routes/api/activity");
const de1 = require("./routes/api/de1");

const server = express();
const PORT = 4000;

server.use(cors());
server.use(bodyParser.json());

server.use("/user", user);
server.use("/domain", domain);
server.use("/activity", activity);
server.use("/de1", de1);

mongooseConnect.connect()
    .on('error', (err) =>
        console.log("Cannot connect to DB: ", err)
    );

server.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});

module.exports = server;