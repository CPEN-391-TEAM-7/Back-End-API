const express = require("express");
const bunyan = require("bunyan");
const mongoose = require("mongoose");

const userRoutes = express.Router();

const Activity = require("../../models/activity.model");
const Domain = require("../../models/domain.model");
const User = require("../../models/user.model");

const log = bunyan.createLogger({ name: "BackendAPI" });

/* 
@route GET /user/
@desc Test
*/
userRoutes.route("/").get(function (req, res) {
    res.status(200).send("Contacted User Endpoint");
});
/**
 * @route POST /user/add
 * @desc endpoint for adding a new user document in the database.
 *
 *  An endpoint for manually creating a user for devlopment purposes.
 * {
 *      userID:
 *      name:
 *      proxyID:
 *      googleAuthToken:
 * }
 */

userRoutes.route("/add").post((req, res) => {
    const body = req.body;

    const newUser = new User({
        userID: body.userID,
        name: body.name,
        proxyID: body.proxyID,
        googleAuthToken: body.googleAuthToken,
    });

    newUser.save().then((result) => {
        res.json(newUser);
    });
});

/**
 * @route GET /users/all
 */

userRoutes.route("/all").get((req, res) => {
    User.find()
        .then((users) => {
            res.json(users);
        })
        .catch((err) => {
            console.log(err);
        });
});

module.exports = userRoutes;
