const express = require('express');
const router = express.Router();
const Couple = require('../models/Couple');
const { v4: uuidv4 } = require('uuid');

// Register new couple
router.post('/register', async (req, res) => {
  try {
    const { coupleId, partnerOneName, partnerOneEmail, partnerTwoName, partnerTwoEmail } = req.body;
    
    // Check if coupleId already exists
    const existingCouple = await Couple.findOne({ coupleId });
    if (existingCouple) {
      return res.status(400).json({ message: 'Couple ID already exists' });
    }

    const couple = new Couple({
      coupleId,
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

module.exports = router;