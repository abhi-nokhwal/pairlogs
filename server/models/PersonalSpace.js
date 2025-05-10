const mongoose = require("mongoose");

// Reaction schema
const reactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['HEART', 'SMILE', 'LAUGH', 'WOW', 'SAD'],
    required: true
  },
  addedBy: {
    type: String,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Gallery item schema
const galleryItemSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  caption: {
    type: String
  },
  addedBy: {
    type: String
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  reactions: [reactionSchema]
});

// Song schema
const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: String
  },
  url: {
    type: String,
    required: true
  },
  addedBy: {
    type: String
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  reactions: [reactionSchema]
});

// Note schema
const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  addedBy: {
    type: String
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  reactions: [reactionSchema]
});

// Personal space schema
const personalSpaceSchema = new mongoose.Schema({
  coupleId: {
    type: String,
    required: true,
    ref: 'Couple'
  },
  gallery: [galleryItemSchema],
  songs: [songSchema],
  notes: [noteSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model("PersonalSpace", personalSpaceSchema);