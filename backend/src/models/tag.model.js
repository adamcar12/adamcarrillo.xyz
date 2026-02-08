const pool = require('../config/database');

/**
 * Get all unique tags for a user with counts
 * @param {number} userId
 * @returns {Promise<Object>} { tags: Array<string>, counts: Object }
 */
const getTagsByUser = async (userId) => {
    const query = `
        SELECT
            t.tag_name,
            COUNT(*) as count
        FROM tags t
        INNER JOIN entries e ON t.entry_id = e.id
        WHERE e.user_id = $1
        GROUP BY t.tag_name
        ORDER BY count DESC, t.tag_name ASC
    `;
    const result = await pool.query(query, [userId]);

    const tags = result.rows.map(row => row.tag_name);
    const counts = {};
    result.rows.forEach(row => {
        counts[row.tag_name] = parseInt(row.count);
    });

    return { tags, counts };
};

module.exports = {
    getTagsByUser
};
