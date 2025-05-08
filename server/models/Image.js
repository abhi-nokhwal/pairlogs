const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    coupleId: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    uploadedBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
