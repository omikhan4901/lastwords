//Normal imports
const express = require("express");

//Extra imports for functional use
const User = require("../db/models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//Utility imports
const sendEmail = require("../utils/sendEmail");

// Declaring my router
const userRouter = express.Router();

//GET REQUESTS---------------------------------------

//POST REQUESTS----------------------------------------

//User Details Edit
userRouter.post("/user/details/edit", async (req, res) => {
  //Checking if the changed thing is a password since passwords need to be hashed
  if (req.body.changes.password) {
    bcrypt.hash(req.body.changes.password, 8, async (err, hash) => {
      console.log("Details including password Changed!");
      if (err) {
        res.send({
          error:
            "Something happened, Please try again later. And if you're still facing this, email us @something@outlook.com",
        });
      }
      req.body.changes.password = hash;
      //Updating the changes
      let userDetail = await User.findOneAndUpdate(
        req.body._id,
        {
          $set: req.body.changes,
        },
        { useFindAndModify: false },
        (err, resp) => {
          if (err) {
            res.send({
              error:
                "Something happened, Please try again later. And if you're still facing this, email us @something@outlook.com",
            });
          }
        }
      );
      res.send(userDetail);
      return;
    });
  } else {

    //if password dont need to be changed,
   //Updating the changes
    let userDetail = await User.findByIdAndUpdate(
      req.body._id,
      {
        $set: req.body.changes,
      },
      { useFindAndModify: false },
      (err, resp) => {
        if (err) {
          res.send({
            error:
              "Something happened, Please try again later. And if you're still facing this, email us @something@outlook.com",
          });
        }
      }
    );
    res.send(userDetail);
  }
});

//Fetching Users Details
userRouter.post("/user/details", async (req, res) => {
  let userDetail = await User.find({ username: req.body.username });
  let isUserLoggedIn = userDetail[0].token.includes(req.body.cookie);

  if (!isUserLoggedIn) {
    res.send({
      error: "You are not logged in!",
    });
    return;
  }

  res.send(userDetail);
});

//User Signup----
userRouter.post("/users/signup", async (req, res) => {
  //Making the first jwt token for any user
  let jwtToken = jwt.sign(
    {
      date: Date.now(),
    },
    "superSecret"
  );
  req.body.username = req.body.username.toLowerCase();
  let stringPassword = req.body.password;

  //Checking if user already has the same username
  let isSameUsername = await User.find({ username: req.body.username }).exec();
  if (isSameUsername.length > 0) {
    res.send("Username already taken!");
    return;
  }

  //Checking if user already has the same email
  let isSameEmail = await User.find({ email: req.body.email }).exec();
  if (isSameEmail.length > 0) {
    res.send("Email already exists!");
    return;
  }

  //Hashing Password
  bcrypt.hash(stringPassword, 8, async (err, hash) => {
    if (err) {
      res.send({
        error:
          "Something happened, Please try again later. And if you're still facing this, email us @something@outlook.com",
      });
    }
    //Changing the text password into a hashed password
    req.body.password = hash;
    let token = [jwtToken];

    //Generating a new user in the database
    let newUser = new User({
      ...req.body,
      timeOfAccountCreation: Date.now(),
      token,
    });
    console.log(token);
    await newUser.save();
    const emailObj = {
      username: newUser.username,
      date: newUser.timeOfAccountCreation,
    };
    await sendEmail(newUser.email, emailObj);
    res.status(201).send(newUser);
  });
});

//User Login-------
userRouter.post("/user/login", async (req, res) => {
  let userDetails = await User.find({ username: req.body.username }).exec();

  //Checking if there even is a user w this username
  if (userDetails.length == 0) {
    res.send({
      error: "You are not signed up! Sign up first!",
    });
  }
  if (userDetails.isEmailConfirmed == false) {
    res.send({
      error: "Confirm your Email first!",
    });
    return;
  }

  //checking password
  bcrypt.compare(
    req.body.password,
    userDetails[0].password,
    async (err, result) => {
      if (err) {
        res.send({
          error:
            "Something happened, Please try again later. And if you're still facing this, email us @something@outlook.com",
        });
        return;
      }
      if (!result) {
        res.send({
          error: "WRONG PASSWORD!",
        });
        return;
      }

      //Memory optimization
      if (userDetails[0].token.length == 8) {
        userDetails[0].token.splice(1, 1);
      }

      // Adding new token
      let newToken = jwt.sign({ date: Date.now }, "loginkeyhabudubu");
      userDetails[0].token.push(newToken);

      //Updating New User
      await User.update(
        { username: req.body.username },
        {
          $set: {
            token: userDetails[0].token,
          },
        },
        (err, res) => {
          if (err) {
            res.send({
              error:
                "Something happened, Please try again later. And if you're still facing this, email us @something@outlook.com",
            });
          }
        }
      );
      res.send(userDetails);
    }
  );
});

//Exporting my router
module.exports = userRouter;
