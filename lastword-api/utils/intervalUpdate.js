const User = require("../db/models/user");

const intervalUpdate = async () => {
  //Pretty self explanatory figure it out chump
  await User.updateMany(
    {},
    {
      $set: {
        sendEmails: true,
      },
    },
    (err, raw) => {
      if (err) {
        console.log(err);
      }
      console.log(raw, 'FROM THE INTERVALUPDATE.JS FILE');
    }
  );
};

module.exports = intervalUpdate;
