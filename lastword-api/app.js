//Basic Express stuff
const express = require("express");
const app = express();
require("./db/db"); //Database
//Bringing my routes
const userRouter = require("./routes/user");
const emailRouter = require("./routes/email");

//Extra libraries I'll need
const cron = require("node-cron");

//Importing the interval functions to maintain the state of the database
const interval = require("./utils/interval");
const intervalUpdate = require("./utils/intervalUpdate");

//Configuring port
let port = process.env.PORT || 3000;

//parsing all json files
app.use(express.json());

//Using my routes
app.use(userRouter);
app.use(emailRouter);

//Every 70 Hours, the sendEmail property of all users will be set to true
cron.schedule("* */70 * * *", () => {
  intervalUpdate();
});

//Every 72 hours, the users that have sendEmail property set to true will get an Email with
// A confirmation link. Also, the sentEmailCount will be +1. If the link is pressed, it will set the true to false
// and the sentEmailCount will be -1. If sentEmailCount is >= 30, all the users emails will be sent
cron.schedule("* */72 * * *", () => {
  interval();
});

//Initializing the server
app.listen(port, () => {
  console.log("Server is up on port " + port + ".");
});
