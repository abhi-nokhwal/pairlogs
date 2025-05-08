const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    coupleId: {
      type: String,
      required: true,
      unique: true,
    },
    partnerOne: {
      type: String,
      required: true,
    },
    partnerTwo: {
      type: String,
      required: true,
    },
    secretCode: {
      type: String, // could be derived from a quiz or a shared phrase
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
