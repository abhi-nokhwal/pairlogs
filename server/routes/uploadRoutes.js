const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Configure storage for different file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Decide where to store file based on mimetype
    if (file.mimetype.startsWith('image/')) {
      cb(null, path.join(__dirname, '../uploads/images'));
    } else if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
      cb(null, path.join(__dirname, '../uploads/songs'));
    } else {
      // For any other file type
      cb(new Error('Invalid file type'), false);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Create multer upload instance
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow only images and audio files
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('audio/') || 
        file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

// Upload image file
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Return the file path that can be used to access the image
    const filePath = `/uploads/images/${req.file.filename}`;
    res.status(200).json({ filePath });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload song file
router.post('/song', upload.single('song'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Return the file path that can be used to access the song
    const filePath = `/uploads/songs/${req.file.filename}`;
    res.status(200).json({ filePath });
  } catch (error) {
    console.error('Song upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 