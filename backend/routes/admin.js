const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// @route   POST /api/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Simple hardcoded check
    if (username === 'admin' && password === 'admin123') {
        const payload = {
            user: {
                id: 'admin_user'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ success: true, token });
            }
        );
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

module.exports = router;
