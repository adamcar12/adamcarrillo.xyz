const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getTags } = require('../controllers/tag.controller');

// All routes require authentication
router.use(authenticateToken);

// GET /api/tags - Get all tags for user with counts
router.get('/', getTags);

module.exports = router;
