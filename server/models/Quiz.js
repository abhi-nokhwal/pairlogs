const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  coupleId: {
    type: String,
    required: true,
    ref: 'Couple'
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    }
  }],
  attempts: {
    count: { type: Number, default: 0 },
    lastAttempt: { type: Date },
    lockedUntil: { type: Date }
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Quiz", quizSchema);