-- Migration: 001_initial_schema
-- Description: Create initial tables for landmarks application with PostGIS
-- Up: Apply this migration to create all tables
-- Down: Rollback all tables

BEGIN;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Landmarks table with PostGIS geography column
CREATE TABLE IF NOT EXISTS landmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('historical', 'natural', 'cultural', 'architectural', 'recreational')),
    image_urls TEXT[] NOT NULL DEFAULT '{}',
    opening_hours JSONB NULL,
    admission_fee DECIMAL(10, 2) NULL,
    contact_info JSONB NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User progress tracking table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    landmark_id UUID NOT NULL REFERENCES landmarks(id) ON DELETE CASCADE,
    visited_at TIMESTAMP NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('discovered', 'visited', 'completed')),
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, landmark_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    landmark_id UUID NOT NULL REFERENCES landmarks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INTEGER NULL CHECK (rating >= 1 AND rating <= 5),
    helpful_count INTEGER NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table for JWT rotation
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance

-- Users: email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Landmarks: GIST index for spatial queries (PostGIS)
CREATE INDEX IF NOT EXISTS idx_landmarks_location ON landmarks USING GIST(location);

-- Landmarks: category lookup
CREATE INDEX IF NOT EXISTS idx_landmarks_category ON landmarks(category);

-- User progress: composite index for user-specific queries
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_landmark_id ON user_progress(landmark_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);

-- Comments: queries by landmark and creation time
CREATE INDEX IF NOT EXISTS idx_comments_landmark_id ON comments(landmark_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at_desc ON comments(landmark_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_helpful_count ON comments(helpful_count DESC);

-- Refresh tokens: token lookup and user queries
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Triggers for automatic timestamp updates

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for landmarks table
CREATE TRIGGER update_landmarks_updated_at
    BEFORE UPDATE ON landmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for comments table
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
