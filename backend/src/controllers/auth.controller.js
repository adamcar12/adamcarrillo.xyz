const { createUser, findUserByEmail, verifyPassword } = require('../models/user.model');
const { generateToken } = require('../utils/jwt');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register a new user
 */
const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Validate email format
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }

        if (email.length > 255) {
            return res.status(400).json({ error: 'Email must be less than 255 characters' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await findUserByEmail(email.toLowerCase());
        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        // Create user
        const newUser = await createUser(email.toLowerCase(), password);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: {
                id: newUser.id,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

/**
 * Login user
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await findUserByEmail(email.toLowerCase());
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email
        });

        res.json({
            success: true,
            token,
            email: user.email
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};

module.exports = {
    register,
    login
};
