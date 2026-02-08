const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login } = require('../controllers/auth.controller');

// Rate limiter for authentication endpoints (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: { error: 'Too many attempts, please try again later' }
});

// POST /api/auth/register - Register new user
router.post('/register', authLimiter, register);

// POST /api/auth/login - Login user
router.post('/login', authLimiter, login);

module.exports = router;
