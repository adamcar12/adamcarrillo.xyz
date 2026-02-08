const { verifyToken } = require('../utils/jwt');

/**
 * Middleware to verify JWT token
 */
const authenticateToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        // Verify token
        const decoded = verifyToken(token);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = {
    authenticateToken
};
