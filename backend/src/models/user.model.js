const pool = require('../config/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

/**
 * Create a new user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Created user (without password)
 */
const createUser = async (email, password) => {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const query = `
        INSERT INTO users (email, password_hash)
        VALUES ($1, $2)
        RETURNING id, email, created_at
    `;

    const result = await pool.query(query, [email, passwordHash]);
    return result.rows[0];
};

/**
 * Find user by email
 * @param {string} email
 * @returns {Promise<Object|null>} User object or null
 */
const findUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id
 * @returns {Promise<Object|null>} User object (without password) or null
 */
const findUserById = async (id) => {
    const query = 'SELECT id, email, created_at FROM users WHERE id = $1';
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
    findUserByEmail,
    findUserById,
    verifyPassword
};
