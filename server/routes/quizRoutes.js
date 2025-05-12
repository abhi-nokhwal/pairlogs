const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Couple = require('../models/Couple');

// Create quiz
router.post('/create', async (req, res) => {
  try {
    const { coupleId, questions, createdBy } = req.body;
    const quiz = new Quiz({ coupleId, questions, createdBy });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get quiz by couple ID
router.get('/couple/:coupleId', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ coupleId: req.params.coupleId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get quiz by token
router.get('/:token', async (req, res) => {
  try {
    // First find the couple by token
    const couple = await Couple.findOne({ token: req.params.token });
    if (!couple) {
      return res.status(404).json({ message: 'Couple not found' });
    }
    
    // Then find the quiz by coupleId
    const quiz = await Quiz.findOne({ coupleId: couple.coupleId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit quiz answers with token
router.post('/:token/submit', async (req, res) => {
  try {
    // First find the couple by token
    const couple = await Couple.findOne({ token: req.params.token });
    if (!couple) {
      return res.status(404).json({ message: 'Couple not found' });
    }
    
    // Then find the quiz by coupleId
    const quiz = await Quiz.findOne({ coupleId: couple.coupleId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    const { answers } = req.body;

    // Check if quiz is locked
    if (quiz.attempts.lockedUntil && quiz.attempts.lockedUntil > new Date()) {
      return res.status(429).json({ 
        message: 'Too many attempts. Please try again later.',
        lockedUntil: quiz.attempts.lockedUntil
      });
    }

    // Verify answers
    const isCorrect = quiz.questions.every((q, i) => 
      q.answer.toLowerCase() === answers[i].toLowerCase()
    );

    if (isCorrect) {
      quiz.attempts = { count: 0, lastAttempt: new Date() };
      await quiz.save();
      return res.json({ success: true });
    }

    // Update attempts
    quiz.attempts.count += 1;
    if (quiz.attempts.count >= 5) {
      quiz.attempts.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    } else if (quiz.attempts.count >= 8) {
      quiz.attempts.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
    await quiz.save();

    res.status(400).json({ 
      message: 'Incorrect answers',
      attemptsLeft: 5 - quiz.attempts.count
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
