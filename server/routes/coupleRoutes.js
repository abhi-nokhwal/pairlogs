const express = require('express');
const router = express.Router();
const Couple = require('../models/Couple');
const { v4: uuidv4 } = require('uuid');

// Register new couple
router.post('/register', async (req, res) => {
  try {
    const { coupleId, partnerOneName, partnerOneEmail, partnerTwoName, partnerTwoEmail, password } = req.body;
    
    // Check if coupleId already exists
    const existingCouple = await Couple.findOne({ coupleId });
    if (existingCouple) {
      return res.status(400).json({ message: 'Couple ID already exists' });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const couple = new Couple({
      coupleId,
      password,
      partnerOne: {
        name: partnerOneName,
        email: partnerOneEmail
      },
      partnerTwo: {
        name: partnerTwoName,
        email: partnerTwoEmail
      }
    });

    await couple.save();
    
    // Return the token and coupleId
    res.status(201).json({ 
      message: 'Couple registered successfully',
      token: couple.token,
      coupleId: couple.coupleId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get couple by token
router.get('/token/:token', async (req, res) => {
  try {
    const couple = await Couple.findOne({ token: req.params.token });
    if (!couple) {
      return res.status(404).json({ message: 'Couple not found' });
    }
    res.json(couple);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login with coupleId and password
router.post('/login', async (req, res) => {
  try {
    const { coupleId, password } = req.body;
    
    if (!coupleId || !password) {
      return res.status(400).json({ message: 'Please provide both Couple ID and password' });
    }

    // Find the couple by ID
    const couple = await Couple.findOne({ coupleId });
    if (!couple) {
      return res.status(404).json({ message: 'Account not found. Please check your Couple ID.' });
    }
    
    // Verify password
    const isMatch = await couple.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password.' });
    }
    
    // Return data needed for login
    res.json({
      token: couple.token,
      coupleId: couple.coupleId
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// Get couple by ID (for login verification - DEPRECATED)
router.get('/id/:coupleId', async (req, res) => {
  try {
    const couple = await Couple.findOne({ coupleId: req.params.coupleId });
    if (!couple) {
      return res.status(404).json({ message: 'Couple not found. Please check your Couple ID.' });
    }
    
    // Return minimal data needed for login - just the token to redirect to the space
    res.json({
      token: couple.token,
      coupleId: couple.coupleId
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;