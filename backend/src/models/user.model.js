const pool = require('../config/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

/**
 * Create a new user
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>} Created user (without password)
 */
const createUser = async (username, password) => {
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const query = `
        INSERT INTO users (username, password_hash)
        VALUES ($1, $2)
        RETURNING id, username, created_at
    `;

    const result = await pool.query(query, [username, passwordHash]);
    return result.rows[0];
};

/**
 * Find user by username
 * @param {string} username
 * @returns {Promise<Object|null>} User object or null
 */
const findUserByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id
 * @returns {Promise<Object|null>} User object (without password) or null
 */
const findUserById = async (id) => {
    const query = 'SELECT id, username, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Verify user password
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>} True if password matches
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
    createUser,
    findUserByUsername,
    findUserById,
    verifyPassword
};
