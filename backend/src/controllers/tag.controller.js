const { getTagsByUser } = require('../models/tag.model');

/**
 * Get all tags for authenticated user
 */
const getTags = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await getTagsByUser(userId);
        res.json(result);
    } catch (error) {
        console.error('Get tags error:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
};

module.exports = {
    getTags
};
