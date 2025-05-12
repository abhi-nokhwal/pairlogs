const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const coupleSchema = new mongoose.Schema({
  coupleId: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
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

// Pre-save middleware to hash password
coupleSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords for login
coupleSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Couple", coupleSchema);