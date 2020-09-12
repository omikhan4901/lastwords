const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const mainEmail = async (email, obj) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    secureConnection: true,
    port: 465,
    auth: {
      user: '****',
      pass: "***",
    },
  });
  
  let token = jwt.sign(obj, "email");
  let link = "http://localhost:3000/emailconfirmation/" + token;
  console.log(link);

  // send mail with defined transport object
  let info = transporter
    .sendMail({
      from: '"****" ******', // sender address
      to: email, // list of receivers
      subject: "Confirm your Email!", // Subject line
      // text: "Hello world?", // plain text body
      html: `<p>Hello! Please Click this link to confirm your email! <a href=${link}>${link}</a></p>`, // html body
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => console.log(err));
};

module.exports = mainEmail;
