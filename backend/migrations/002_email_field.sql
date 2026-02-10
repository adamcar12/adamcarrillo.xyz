-- Migration: Replace username with email
-- Add email column, migrate data, drop username

ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- Migrate existing username data to email (for any existing users)
UPDATE users SET email = username;

-- Make email NOT NULL and UNIQUE after data migration
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Drop old username column and its index
DROP INDEX IF EXISTS idx_users_username;
ALTER TABLE users DROP COLUMN username;

-- Create index on email for fast lookups
CREATE INDEX idx_users_email ON users(email);
