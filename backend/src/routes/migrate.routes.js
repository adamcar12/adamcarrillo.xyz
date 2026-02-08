const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// TEMPORARY: Run database migration
router.get('/run', async (req, res) => {
    try {
        // Read the migration SQL file
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, '../../migrations/001_initial_schema.sql'),
            'utf8'
        );

        // Execute the migration
        await pool.query(migrationSQL);

        res.json({
            success: true,
            message: 'Database migration completed successfully!',
            note: 'Remember to remove this endpoint after running it once'
        });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
