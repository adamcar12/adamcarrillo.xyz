const pool = require('../config/database');

/**
 * Create a new journal entry with tags
 * @param {number} userId
 * @param {string} title
 * @param {string} content
 * @param {Array<string>} tags
 * @returns {Promise<Object>} Created entry
 */
const createEntry = async (userId, title, content, tags = []) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert entry
        const entryQuery = `
            INSERT INTO entries (user_id, title, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const entryResult = await client.query(entryQuery, [userId, title, content]);
        const entry = entryResult.rows[0];

        // Insert tags
        if (tags.length > 0) {
            const tagQuery = `
                INSERT INTO tags (entry_id, tag_name)
                VALUES ($1, $2)
            `;
            for (const tag of tags) {
                await client.query(tagQuery, [entry.id, tag.trim().toLowerCase()]);
            }
        }

        await client.query('COMMIT');

        // Fetch entry with tags
        return await findEntryById(entry.id, userId);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Find entry by ID (with authorization check)
 * @param {number} entryId
 * @param {number} userId
 * @returns {Promise<Object|null>} Entry with tags or null
 */
const findEntryById = async (entryId, userId) => {
    const query = `
        SELECT
            e.*,
            COALESCE(
                json_agg(t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL),
                '[]'
            ) as tags
        FROM entries e
        LEFT JOIN tags t ON e.id = t.entry_id
        WHERE e.id = $1 AND e.user_id = $2
        GROUP BY e.id
    `;
    const result = await pool.query(query, [entryId, userId]);
    return result.rows[0] || null;
};

/**
 * Find all entries for a user with pagination, search, and filtering
 * @param {number} userId
 * @param {Object} options - { page, limit, search, tag, sortBy, order }
 * @returns {Promise<Object>} { entries, total, page, pages }
 */
const findEntriesByUser = async (userId, options = {}) => {
    const {
        page = 1,
        limit = 20,
        search = '',
        tag = '',
        sortBy = 'created_at',
        order = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    const allowedSortFields = ['created_at', 'updated_at', 'title'];
    const allowedOrders = ['ASC', 'DESC'];

    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = allowedOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    let whereClause = 'WHERE e.user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    // Add search filter (full-text search on title and content)
    if (search) {
        whereClause += ` AND (
            to_tsvector('english', e.title) @@ plainto_tsquery('english', $${paramIndex})
            OR to_tsvector('english', e.content) @@ plainto_tsquery('english', $${paramIndex})
        )`;
        params.push(search);
        paramIndex++;
    }

    // Add tag filter
    if (tag) {
        whereClause += ` AND e.id IN (
            SELECT entry_id FROM tags WHERE tag_name = $${paramIndex}
        )`;
        params.push(tag.toLowerCase());
        paramIndex++;
    }

    // Get total count
    const countQuery = `
        SELECT COUNT(DISTINCT e.id) as total
        FROM entries e
        ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get entries with tags
    const entriesQuery = `
        SELECT
            e.*,
            COALESCE(
                json_agg(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL),
                '[]'
            ) as tags
        FROM entries e
        LEFT JOIN tags t ON e.id = t.entry_id
        ${whereClause}
        GROUP BY e.id
        ORDER BY e.${sortField} ${sortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const entriesResult = await pool.query(entriesQuery, params);

    return {
        entries: entriesResult.rows,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
    };
};

/**
 * Update an entry
 * @param {number} entryId
 * @param {number} userId
 * @param {string} title
 * @param {string} content
 * @param {Array<string>} tags
 * @returns {Promise<Object>} Updated entry
 */
const updateEntry = async (entryId, userId, title, content, tags = []) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if entry belongs to user
        const checkQuery = 'SELECT id FROM entries WHERE id = $1 AND user_id = $2';
        const checkResult = await client.query(checkQuery, [entryId, userId]);
        if (checkResult.rows.length === 0) {
            throw new Error('Entry not found or unauthorized');
        }

        // Update entry
        const updateQuery = `
            UPDATE entries
            SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 AND user_id = $4
            RETURNING *
        `;
        await client.query(updateQuery, [title, content, entryId, userId]);

        // Delete old tags
        const deleteTagsQuery = 'DELETE FROM tags WHERE entry_id = $1';
        await client.query(deleteTagsQuery, [entryId]);

        // Insert new tags
        if (tags.length > 0) {
            const tagQuery = 'INSERT INTO tags (entry_id, tag_name) VALUES ($1, $2)';
            for (const tag of tags) {
                await client.query(tagQuery, [entryId, tag.trim().toLowerCase()]);
            }
        }

        await client.query('COMMIT');

        // Fetch updated entry with tags
        return await findEntryById(entryId, userId);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Delete an entry
 * @param {number} entryId
 * @param {number} userId
 * @returns {Promise<boolean>} True if deleted
 */
const deleteEntry = async (entryId, userId) => {
    const query = 'DELETE FROM entries WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await pool.query(query, [entryId, userId]);
    return result.rowCount > 0;
};

module.exports = {
    createEntry,
    findEntryById,
    findEntriesByUser,
    updateEntry,
    deleteEntry
};
