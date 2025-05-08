const express = require("express");
const User = require("../models/User.js");

const router = express.Router();

// Create a new couple account
router.post("/register", async (req, res) => {
  const { coupleId, partnerOne, partnerTwo, secretCode } = req.body;

  try {
    const existing = await User.findOne({ coupleId });
    if (existing)
      return res.status(400).json({ message: "Couple ID already exists" });

    const newUser = new User({ coupleId, partnerOne, partnerTwo, secretCode });
    await newUser.save();

    res
      .status(201)
      .json({ message: "Account created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error creating account", error });
  }
});

// Login using couple ID + quiz/code
router.post("/login", async (req, res) => {
  const { coupleId, secretCode } = req.body;

  try {
    const user = await User.findOne({ coupleId });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.secretCode !== secretCode) {
      return res.status(401).json({ message: "Incorrect secret code" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
});

module.exports = router;
