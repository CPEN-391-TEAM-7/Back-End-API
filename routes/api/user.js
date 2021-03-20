const express = require("express");
const bunyan = require("bunyan");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userRoutes = express.Router();

const Activity = require("../../models/activity.model");
const Domain = require("../../models/domain.model");
const User = require("../../models/user.model");

const log = bunyan.createLogger({ name: "BackendAPI" });

/* 
@route GET /user/
@desc Test
*/
userRoutes.route("/").get(function(req, res) {
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
 * }
 */

userRoutes.route("/register").post((req, res) => {
    const body = req.body;

    const newUser = new User({
        userID: body.userID,
        name: body.name,
        proxyID: uuidv4(),
    });

    newUser.save()
        .then(result => {
            res.json({
                "user": result,
                "msg": "Successful"
            });
        })
        .catch(err => {
            res.json({
                "msg": err
            })
        });
});

/**
 * @route GET /user/all
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