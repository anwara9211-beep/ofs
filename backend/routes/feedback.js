const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// @route   POST /api/feedback
// @desc    Submit new feedback
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, category, message } = req.body;

        if (!name || !email || !category || !message) {
            return res.status(400).json({ success: false, message: 'Please provide all fields' });
        }

        const feedback = await Feedback.create({
            name,
            email,
            category,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: feedback
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error. Could not submit feedback.' });
    }
});

// @route   GET /api/feedback
// @desc    Get all feedback
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: feedbacks.length,
            data: feedbacks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error. Could not fetch feedback.' });
    }
});

module.exports = router;
