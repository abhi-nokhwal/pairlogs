const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');

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

// Get quiz
router.get('/:coupleId', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ coupleId: req.params.coupleId });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit quiz answers
router.post('/:coupleId/submit', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ coupleId: req.params.coupleId });
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
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
