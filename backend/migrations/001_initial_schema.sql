-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS entries CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journal entries table
CREATE TABLE entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags table (many-to-many relationship with entries)
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_created_at ON entries(created_at DESC);
CREATE INDEX idx_tags_entry_id ON tags(entry_id);
CREATE INDEX idx_tags_name ON tags(tag_name);

-- Full-text search indexes for content searching
CREATE INDEX idx_entries_content_search ON entries USING GIN(to_tsvector('english', content));
CREATE INDEX idx_entries_title_search ON entries USING GIN(to_tsvector('english', title));

-- Success message
SELECT 'Database schema created successfully!' as message;
