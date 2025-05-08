const express = require("express");
const router = express.Router();
const Couple = require("../models/Couple");

// Create couple account
router.post("/create", async (req, res) => {
  const { coupleId, quizAnswer } = req.body;

  try {
    // Check if coupleId already exists
    const existing = await Couple.findOne({ coupleId });
    if (existing) {
      return res.status(400).json({ message: "Couple ID already in use." });
    }

    const newCouple = new Couple({ coupleId, quizAnswer });
    await newCouple.save();

    res.status(201).json({ message: "Couple account created successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { coupleId, quizAnswer } = req.body;

  try {
    const couple = await Couple.findOne({ coupleId });
    if (!couple || couple.quizAnswer !== quizAnswer) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res
      .status(200)
      .json({ message: "Login successful", coupleId: couple.coupleId });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
