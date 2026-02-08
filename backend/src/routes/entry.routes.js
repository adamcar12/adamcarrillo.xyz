const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getEntries,
    getEntryById,
    createNewEntry,
    updateExistingEntry,
    deleteExistingEntry
} = require('../controllers/entry.controller');

// All routes require authentication
router.use(authenticateToken);

// GET /api/entries - Get all entries for user (with pagination, search, filters)
router.get('/', getEntries);

// GET /api/entries/:id - Get single entry
router.get('/:id', getEntryById);

// POST /api/entries - Create new entry
router.post('/', createNewEntry);

// PUT /api/entries/:id - Update entry
router.put('/:id', updateExistingEntry);

// DELETE /api/entries/:id - Delete entry
router.delete('/:id', deleteExistingEntry);

module.exports = router;
