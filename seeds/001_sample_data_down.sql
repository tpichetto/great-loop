-- Seed data rollback
-- Removes all sample data while preserving schema

BEGIN;

-- Delete in reverse order of dependencies
DELETE FROM refresh_tokens;
DELETE FROM comments;
DELETE FROM user_progress;
DELETE FROM landmarks;
DELETE FROM users;

COMMIT;
