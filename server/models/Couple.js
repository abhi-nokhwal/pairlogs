const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const coupleSchema = new mongoose.Schema({
  coupleId: {
    type: String,
    required: true,
    unique: true
  },
  token: {
    type: String,
    default: () => uuidv4(),
    unique: true
  },
  partnerOne: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  partnerTwo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Couple", coupleSchema);