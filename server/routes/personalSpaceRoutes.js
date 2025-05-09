const express = require('express');
const router = express.Router();
const PersonalSpace = require('../models/PersonalSpace');

// Get personal space
router.get('/:coupleId', async (req, res) => {
  try {
    const space = await PersonalSpace.findOne({ coupleId: req.params.coupleId });
    res.json(space);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new personal space
router.post('/', async (req, res) => {
  try {
    const { coupleId } = req.body;
    
    // Check if personal space already exists
    const existingSpace = await PersonalSpace.findOne({ coupleId });
    if (existingSpace) {
      return res.status(200).json(existingSpace);
    }
    
    // Create new personal space
    const newSpace = new PersonalSpace({
      coupleId,
      gallery: [],
      songs: [],
      notes: []
    });
    
    await newSpace.save();
    res.status(201).json(newSpace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to gallery
router.post('/:coupleId/gallery', async (req, res) => {
  try {
    const { imageUrl, caption, addedBy } = req.body;
    const space = await PersonalSpace.findOne({ coupleId: req.params.coupleId });
    space.gallery.push({ imageUrl, caption, addedBy });
    await space.save();
    res.status(201).json(space);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add song
router.post('/:coupleId/songs', async (req, res) => {
  try {
    const { title, artist, url, addedBy } = req.body;
    const space = await PersonalSpace.findOne({ coupleId: req.params.coupleId });
    space.songs.push({ title, artist, url, addedBy });
    await space.save();
    res.status(201).json(space);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add note
router.post('/:coupleId/notes', async (req, res) => {
  try {
    const { content, addedBy } = req.body;
    const space = await PersonalSpace.findOne({ coupleId: req.params.coupleId });
    space.notes.push({ content, addedBy });
    await space.save();
    res.status(201).json(space);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;