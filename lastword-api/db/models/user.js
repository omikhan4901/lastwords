const mongoose = require("mongoose");

let UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 14,
    },
    password: {
      type: String,
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    token: {
      type: Array,
      required: true,
    },
    sendEmails: {
      type: Boolean,
      require: true,
      default: true,
    },
    timeOfAccountCreation: {
      type: Number,
      required: true,
    },
    sendEmailCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
    },
  }
);

let User = mongoose.model("User", UserSchema);

module.exports = User;
