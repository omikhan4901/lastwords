const mongoose = require("mongoose");


mongoose.connect(
  "mongodb://127.0.0.1:27017/last-words-api",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  (err) => {
    console.log("Connected to db!");
  }
);
