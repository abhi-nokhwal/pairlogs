const mongoose = require("mongoose");

const personalSpaceSchema = new mongoose.Schema({
  coupleId: {
    type: String,
    required: true,
    ref: 'Couple'
  },
  gallery: [{
    imageUrl: String,
    caption: String,
    addedBy: String,
    addedAt: { type: Date, default: Date.now }
  }],
  songs: [{
    title: String,
    artist: String,
    url: String,
    addedBy: String,
    addedAt: { type: Date, default: Date.now }
  }],
  notes: [{
    content: String,
    addedBy: String,
    addedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("PersonalSpace", personalSpaceSchema);