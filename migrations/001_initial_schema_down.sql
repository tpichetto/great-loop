-- Migration: 001_initial_schema
-- Description: Rollback all tables created in initial schema

BEGIN;

-- Drop triggers first
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
DROP TRIGGER IF EXISTS update_landmarks_updated_at ON landmarks;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in order respecting foreign key dependencies
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS landmarks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

COMMIT;
