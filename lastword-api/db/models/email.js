const mongoose = require("mongoose");

let EmailSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    timeOfEmailCreation: {
      type: Number,
    },
    to: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true
    },
    sent: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

let Email = mongoose.model("Email", EmailSchema);

module.exports = Email;
