const nodemailer = require("nodemailer");

const sendAllEmails = async (title, firstname, to, text) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    secureConnection: true,
    port: 465,
    auth: {
      user: "*****",
      pass: "*****",
    },
  });

  // send mail with defined transport object
  let info = transporter
    .sendMail({
      from: '"*****" *****', // sender address
      to: to, // list of receivers
      //A little syncTactic sugar uWu
      subject: firstname + "'s last words: " + title, // Subject line
      //
      html: `<b> Hello. We are an organization that helps people send all their last words to people. We think ${firstname} 
      wanted to send you something in an event where he would die. So, we are sending you what he wanted to tell you.</b>
      <br>
      <br>
      <b> ${text} </b>
      `,
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => console.log(err));
};

module.exports = sendAllEmails;
