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
 * @route POST /user/register
 * @desc endpoint for adding a new user document in the database.
 *
 *  An endpoint for manually creating a user for devlopment purposes.
 * {
 *      userID:
 *      name:
 * }
 */

userRoutes.route("/register").post(async(req, res) => {
    const { userID, name } = req.body;

    const newUser = new User({
        userID: userID,
        name: name,
        proxyID: uuidv4(),
    });

    await User.findOne({ userID: userID }, async(err, user) => {
        if (err) {
            log.error("Error: " + err);
            res.status("400").json({
                "msg": "Unknown error",
                "error": err
            })
        } else if (user) {
            res.status("409").json({
                "msg": "User exsits",
                "user": user
            })
        } else {
            newUser.save()
                .then(result => {
                    res.status("200").json({
                        "msg": "Successful",
                        "user": result,
                    });
                })
                .catch(err => {
                    res.status("400").json({
                        "msg": "Unknown Error",
                        "error": err
                    })
                });
        }
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