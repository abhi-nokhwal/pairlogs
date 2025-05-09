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

// Update a gallery item
router.put('/:coupleId/gallery/:imageId', async (req, res) => {
  try {
    const { caption } = req.body;
    const space = await PersonalSpace.findOne({ coupleId: req.params.coupleId });
    
    const imageIndex = space.gallery.findIndex(img => img._id.toString() === req.params.imageId);
    
    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    space.gallery[imageIndex].caption = caption;
    await space.save();
    
    res.json(space);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a gallery item
router.delete('/:coupleId/gallery/:imageId', async (req, res) => {
  try {
    const space = await PersonalSpace.findOne({ coupleId: req.params.coupleId });
    
    const imageIndex = space.gallery.findIndex(img => img._id.toString() === req.params.imageId);
    
    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Remove the image from the gallery array
    space.gallery.splice(imageIndex, 1);
    await space.save();
    
    res.json(space);
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

// Update a song
router.put('/:coupleId/songs/:songId', async (req, res) => {
  try {
    const { title, artist, url } = req.body;
    const space = await PersonalSpace.findOne({ coupleId: req.params.coupleId });
    
    const songIndex = space.songs.findIndex(song => song._id.toString() === req.params.songId);
    
    if (songIndex === -1) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    if (title) space.songs[songIndex].title = title;
    if (artist) space.songs[songIndex].artist = artist;
    if (url) space.songs[songIndex].url = url;
    
    await space.save();
    res.json(space);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a song
router.delete('/:coupleId/songs/:songId', async (req, res) => {
  try {
    const space = await PersonalSpace.findOne({ coupleId: req.params.coupleId });
    
    const songIndex = space.songs.findIndex(song => song._id.toString() === req.params.songId);
    
    if (songIndex === -1) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    // Remove the song from the songs array
    space.songs.splice(songIndex, 1);
    await space.save();
    
    res.json(space);
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

// Update a note
router.put('/:coupleId/notes/:noteId', async (req, res) => {
  try {
    const { content } = req.body;
    const space = await PersonalSpace.findOne({ coupleId: req.params.coupleId });
    
    const noteIndex = space.notes.findIndex(note => note._id.toString() === req.params.noteId);
    
    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    space.notes[noteIndex].content = content;
    await space.save();
    
    res.json(space);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a note
router.delete('/:coupleId/notes/:noteId', async (req, res) => {
  try {
    const space = await PersonalSpace.findOne({ coupleId: req.params.coupleId });
    
    const noteIndex = space.notes.findIndex(note => note._id.toString() === req.params.noteId);
    
    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Remove the note from the notes array
    space.notes.splice(noteIndex, 1);
    await space.save();
    
    res.json(space);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;