//Normal imports
const express = require("express");
const fs = require("fs");
const path = require("path");

//Extra imports for functional use
const Email = require("../db/models/email");
const User = require("../db/models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//Declaring my emailRouter
const emailRouter = express.Router();

//GET REQUESTS-------------------------------------------------------------------------

//email confirmation. If the confirmation link is clicked, then an email will be sent holding a jwt token
emailRouter.get("/emailconfirmation/:token", async (req, res) => {
  
  //getting the user details out of the token
  let user = jwt.verify(req.params.token, "email");

  //setting search parameters for the update 
  const searchObj = {
    username: user.username,
    timeOfAccountCreation: user.date,
  };

  //Updating isEmailConfirmed
  const foundUser = await User.updateOne(
    searchObj,
    {
      $set: {
        isEmailConfirmed: true,
      },
    },
    (err, raw) => {
      if (err) {
        res.send({
          error:
            "Something happened, Please try again later. And if you're still facing this, email us @something@outlook.com",
        });
      }
    }
  );
  res.send("<b>Your Email has been Verified!</b>");
});

// Checkup confirmation
emailRouter.get("/checkupConfirmation/:token", async (req, res) => {
  const token = req.params.token;
  
  //Same thing with the email confirmation
  const user = jwt.verify(token, "email");

  const checkupConfirmationObj = {
    username: user.username,
    timeOfAccountCreation: user.date,
  };

  const requiredUser = await User.findOne(checkupConfirmationObj);
  const sendEmailCount = requiredUser.sendEmailCount;

  //If sendEmailCount = 0, I dont want to have a negative integer.
  const newSendEmailCount = sendEmailCount == 0 ? 0 : sendEmailCount - 1;

  //Updating sendEmailCount
  await User.updateOne(checkupConfirmationObj, {
    $set: {
      sendEmails: false,
      sendEmailCount: newSendEmailCount,
    },
  });
  res.send('<b>Thank you for confirming us about your well being!</b>')
});

//POST REQUESTS-------------------------------------------------------------------------

//Set Emails
emailRouter.post("/email/set", async (req, res) => {
  let userDetails = await User.find({ username: req.body.username });

  //If User doesnt exist
  if (userDetails.length < 1) {
    res.send("YOURE NOT LOGGED IN");
  }
  //If user is logged in
  if (userDetails[0].token.includes(req.body.token)) {
    const presentDate = Date.now();
    let newFileName = jwt.sign(
      {
        date: presentDate,
        username: req.body.username,
        title: req.body.title,
      },
      "newFileName"
    );

    //Writing the file for the email content
    const newFile = path.join(
      __dirname + `/../db/assets/emails/${newFileName}.txt`
    );
    //Writing a new file with the email data
    await fs.writeFile(
      newFile,
      req.body.text,
      {
        encoding: "utf-8",
      },
      () => {}
    );
    let newEmail = new Email({
      ...req.body,
      filename: newFileName,
      timeOfEmailCreation: presentDate,
    });
    //Saving the Email
    await newEmail.save();
    res.send(newEmail);
  }
  //If user Is NOT logged in
  else {
    res.send("YOURE NOT LOGGED IN!");
  }
});

//Email Searching: This system would be easier but i added a better system of protection. The file addresses are secret.
// Im using jwt to name the files and then extracting the Object from the token to keep as an object
emailRouter.post("/my/emails", async (req, res) => {
  //Declaring the email file details array
  let arrayOfFileDetails = [];
  const emailFilesPath = path.join(__dirname + `/../db/assets/emails`);

  //Looping through All the files and then adding them to the array
  fs.readdir(emailFilesPath, (err, files) => {
    if (err) {
      res.send({
        error:
          "Something happened, Please try again later. And if you're still facing this, email us @something@outlook.com",
      });
      return;
    }
    files.forEach((file, index) => {
      const jwtToken = file.split(".txt")[0];

      // Extracting the file details from the jwt Token
      const fileDetails = jwt.verify(jwtToken, "newFileName");
      arrayOfFileDetails.push(fileDetails);
    });
    let searchDetails = arrayOfFileDetails.filter((details) => {
      return details.username == req.body.username;
    });
    res.send(searchDetails);
  });
});

//Search one email
emailRouter.post("/my/emails/id", async (req, res) => {
  //Finding the corresponding id of the email from the file system
  let foundJwt = req.body.filter(
    (item) =>
      item.username == req.query.u &&
      item.title == req.query.t &&
      item.date == req.query.d
  );
  //Find the email that corresponds from the filter
  let wantedEmail = await Email.findOne({
    timeOfEmailCreation: foundJwt[0].date,
    title: foundJwt[0].title,
    username: foundJwt[0].username,
  });

  //Determining the path of the email to be sent
  const emailFilesPath = path.join(__dirname + `/../db/assets/emails`);

  let requiredfile = "";

  //Initializing the file system part of this function
  fs.readdir(emailFilesPath, (err, files) => {
    if (err) {
      res.send({
        error:
          "Something happened, Please try again later. And if you're still facing this, email us @something@outlook.com",
      });
    }

    //Finding the actual file in the file sytem
    requiredfile = files.filter(
      (file) => file.split(".txt")[0] == wantedEmail.filename
    );

    //Reading the content of the wanted file
    fs.readFile(emailFilesPath + `/${requiredfile}`, async (err, data) => {
      if (err) {
        res.send({
          error:
            "Something happened, Please try again later. And if you're still facing this, email us @something@outlook.com",
        });
      }
      //Constructing an object that would be required for the Client
      const requiredObject = {
        title: wantedEmail.title,
        to: wantedEmail.to,
        createdAt: wantedEmail.timeOfEmailCreation,
        data: data.toString(),
      };
      //Sending Said object
      res.send(requiredObject);
    });
  });
});

//DELETE REQUESTS
emailRouter.delete("/email/delete", async (req, res) => {
  //Finding a file to delete from the list of files in the fs(FOR THIS, THE SEARCH X USERS EMAILS NEED TO BE REQUESTED FIRST)
  const fileToDelete = req.body.filter(
    (obj) =>
      obj.username == req.query.u &&
      obj.title == req.query.t &&
      obj.date == req.query.d
  );
  // Taking out the fs Path
  const emailFilesPath = path.join(__dirname + `/../db/assets/emails`);

  //Initializing the deletion in the Database
  await Email.findOneAndRemove(
    {
      username: fileToDelete[0].username,
      title: fileToDelete[0].title,
      timeOfEmailCreation: fileToDelete[0].date,
    },
    { useFindAndModify: false },
    (err, resp) => {
      if (err) {
        res.send({
          error:
            "Something happened, Please try again later. And if you're still facing this, email us @something@outlook.com",
        });
      }
      if (!resp) {
        res.send({
          error: 'Email doesnt exist in Database!'
        })
      } else {
        //Initializing the deletion in the fs Module
        fs.unlink(
          path.join(emailFilesPath + `/${resp.filename}.txt`),
          (err) => {
            if (err) {
              res.send({
                error:
                  "Something happened, Please try again later. And if you're still facing this, email us @something@outlook.com",
              });
            }
            //Sending the deleted file incase needed
            res.send(resp);
          }
        );
      }
    }
  );
});

//Email Router exporting
module.exports = emailRouter;
