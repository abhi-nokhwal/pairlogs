const express = require("express");
const multer = require("multer");
const Image = require("../models/Image");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Create this folder manually
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("image"), async (req, res) => {
  const { caption } = req.body;
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

  try {
    const newImage = new Image({ imageUrl, caption });
    await newImage.save();
    res.status(201).json(newImage);
  } catch (err) {
    res.status(500).json({ error: "Failed to upload image" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

module.exports = router;
