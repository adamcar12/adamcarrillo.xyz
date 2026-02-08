const {
    createEntry,
    findEntryById,
    findEntriesByUser,
    updateEntry,
    deleteEntry
} = require('../models/entry.model');

/**
 * Get all entries for authenticated user
 */
const getEntries = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page, limit, search, tag, sortBy, order } = req.query;

        const options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            search: search || '',
            tag: tag || '',
            sortBy: sortBy || 'created_at',
            order: order || 'DESC'
        };

        const result = await findEntriesByUser(userId, options);
        res.json(result);
    } catch (error) {
        console.error('Get entries error:', error);
        res.status(500).json({ error: 'Failed to fetch entries' });
    }
};

/**
 * Get single entry by ID
 */
const getEntryById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const entryId = parseInt(req.params.id);

        if (isNaN(entryId)) {
            return res.status(400).json({ error: 'Invalid entry ID' });
        }

        const entry = await findEntryById(entryId, userId);
        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.json({ entry });
    } catch (error) {
        console.error('Get entry error:', error);
        res.status(500).json({ error: 'Failed to fetch entry' });
    }
};

/**
 * Create new entry
 */
const createNewEntry = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, content, tags = [] } = req.body;

        // Validate input
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        if (title.length > 255) {
            return res.status(400).json({ error: 'Title must be 255 characters or less' });
        }

        if (!Array.isArray(tags)) {
            return res.status(400).json({ error: 'Tags must be an array' });
        }

        const entry = await createEntry(userId, title, content, tags);
        res.status(201).json({
            success: true,
            message: 'Entry created successfully',
            entry
        });
    } catch (error) {
        console.error('Create entry error:', error);
        res.status(500).json({ error: 'Failed to create entry' });
    }
};

/**
 * Update existing entry
 */
const updateExistingEntry = async (req, res) => {
    try {
        const userId = req.user.userId;
        const entryId = parseInt(req.params.id);
        const { title, content, tags = [] } = req.body;

        if (isNaN(entryId)) {
            return res.status(400).json({ error: 'Invalid entry ID' });
        }

        // Validate input
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        if (title.length > 255) {
            return res.status(400).json({ error: 'Title must be 255 characters or less' });
        }

        if (!Array.isArray(tags)) {
            return res.status(400).json({ error: 'Tags must be an array' });
        }

        const entry = await updateEntry(entryId, userId, title, content, tags);
        res.json({
            success: true,
            message: 'Entry updated successfully',
            entry
        });
    } catch (error) {
        console.error('Update entry error:', error);
        if (error.message === 'Entry not found or unauthorized') {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.status(500).json({ error: 'Failed to update entry' });
    }
};

/**
 * Delete entry
 */
const deleteExistingEntry = async (req, res) => {
    try {
        const userId = req.user.userId;
        const entryId = parseInt(req.params.id);

        if (isNaN(entryId)) {
            return res.status(400).json({ error: 'Invalid entry ID' });
        }

        const deleted = await deleteEntry(entryId, userId);
        if (!deleted) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.json({
            success: true,
            message: 'Entry deleted successfully'
        });
    } catch (error) {
        console.error('Delete entry error:', error);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
};

module.exports = {
    getEntries,
    getEntryById,
    createNewEntry,
    updateExistingEntry,
    deleteExistingEntry
};
