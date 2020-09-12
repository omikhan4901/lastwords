const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
//email, obj

const checkUpEmail = async (email, obj) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    secureConnection: true,
    port: 465,
    auth: {
      user: "*****",
      pass: "*****",
    },
  });

  const tokenObj = {
    username: obj.username,
    date: obj.date,
  };
  let token = jwt.sign(tokenObj, "email");
  let link = "http://localhost:3000/checkupConfirmation/" + token;
    // send mail with defined transport object
  let info = transporter
    .sendMail({
      from: '"******" *****', // sender address
      to: email, // list of receivers
      subject: `Are you okay ${obj.firstname}`, // Subject line
      html: `<p>Hello! If you receive this mail after not too long of signing up, we apologize! We send this Email to our users
      every 3 days to check up on them. But dont worry from the next time you'll get your checkup email in due time!
      </p>
      <br>
      <br>
      <p> So ${obj.username}, We are very worried about you. And we want you to tell us if you are okay or not. If you are, please click 
      this link: <a href=${link}>Click this in order to tell us that youre fine.</a>
      `, // html body
    })
    .catch((err) => console.log(err));
};

module.exports = checkUpEmail;
