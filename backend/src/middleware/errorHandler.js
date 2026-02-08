/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // PostgreSQL unique violation (duplicate entry)
    if (err.code === '23505') {
        return res.status(409).json({ error: 'Duplicate entry' });
    }

    // PostgreSQL foreign key violation
    if (err.code === '23503') {
        return res.status(400).json({ error: 'Referenced resource does not exist' });
    }

    // Default error
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
};

module.exports = errorHandler;
