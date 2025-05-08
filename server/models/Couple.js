const mongoose = require("mongoose");

const CoupleSchema = new mongoose.Schema({
  coupleId: {
    type: String,
    required: true,
    unique: true,
  },
  quizAnswer: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Couple", CoupleSchema);
