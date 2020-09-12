//Importing the Models
const User = require("../db/models/user");
const Email = require("../db/models/email");

//Importing the other utils for completing this function
const checkUpEmail = require("./checkupEmail");
const sendAllEmails = require("./sendAllEmails");

//Other modules i will need for this
const fs = require("fs");
const path = require("path");

const interval = async () => {

  //Ill get ALL the users first
  const arrayOfPeople = await User.find({ sendEmails: true }, (err, res) => {
    if (err) {
      console.log(err);
    }
  });
  
  // Run a forEach function for each person
  arrayOfPeople.forEach(async (people) => {

    //constitute the emailObj Ill need to send an email
    const emailObj = {
      firstname: people.firstName,
      username: people.username,
      date: people.timeOfAccountCreation,
    };

    //Update the number of confirmation emails sent to this person
    let sendEmailCount = people.sendEmailCount;
    const newSendEmailCount = sendEmailCount + 1;

    //Run a check for if a person hasnt confirmed their email for 30 times already
    if (sendEmailCount >= 30) {

      //Find the persons emails
      const emailsToSend = await Email.find({
        username: people.username,
      });
      
      //Run a forEach loop for each of his Emails
      emailsToSend.forEach(async (email) => {

        //Get the path of the emails file in assets
        const emailFilePath = path.join(
          __dirname + "/../db/assets/emails/" + email.filename + ".txt"
        );

        //Just being sure about scoping xD
        let textContent = "";
        
        //reading all the content of EACH email
        const fileName = fs.readFile(emailFilePath, (err, data) => {
          if (err) {
            console.log(err);
          }
          //The little paranoia of variable scoping oh so fun
          textContent = data.toString();

          //The variable scoping, was idiotic. But eh whatevs
          sendAllEmails(email.title, people.firstName, email.to, textContent);
        });
      });

      //Update all the emails sent property to true
      await Email.updateMany(
        {
          username: people.username,
        },
        {
          $set: {
            sent: true,
          },
        },
        (err, raw) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }
    // Updating the sendEmail count with the new email count from WAY up (line 34)
    await User.updateOne(
      {
        username: people.username,
        timeOfAccountCreation: people.timeOfAccountCreation,
      },
      {
        $set: {
          sendEmailCount: newSendEmailCount,
        },
      },
      (err, raw) => {
        if (err) {
          console.log(err);
        }
        console.log(raw, "FROM THE INTERVAL.JS FILE");
      }
    );
    //Sending the checkup mail
    await checkUpEmail(people.email, emailObj)
      .then((resp) => {})
      .catch((e) => console.log("error"));
  });
};

module.exports = interval;
