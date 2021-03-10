const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const bunyan = require("bunyan");

const app = express();
const PORT = 4000;

const log = bunyan.createLogger({ name: "BackendAPI" });

const user = require("./routes/api/user");
const domain = require("./routes/api/domain");
const activity = require("./routes/api/activity");
const de1 = require("./routes/api/de1");

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://127.0.0.1:27017/Securify", { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
const connection = mongoose.connection;

connection.once("open", function() {
    console.log("MongoDB database connection established successfully");
});

app.use("/user", user);
app.use("/domain", domain);
app.use("/activity", activity);
app.use("/de1", de1);

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});