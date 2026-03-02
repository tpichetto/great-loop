/**
 * Database Connection Pool and Example Queries
 * Demonstrates proper connection pooling and query patterns
 */

const { Pool } = require('pg');
require('dotenv').config();

// Configure connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'landmarks_db',
  user: process.env.DB_USER || 'landmarks_user',
  password: process.env.DB_PASSWORD || 'landmarks_password',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Wait 2 seconds for connection
  maxUses: 7500, // Reconnect after 7.5k queries (PostgreSQL limit is 10k)
});

// Test connection on startup
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Testing database connection...');
    const result = await client.query('SELECT NOW() as current_time, version()');
    console.log('OK: Database connected:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].version);

    // Verify PostGIS
    const postgisResult = await client.query(
      "SELECT postgis_lib_version() as postgis_version, postgis_proj_version() as proj_version"
    );
    console.log('PostGIS:', postgisResult.rows[0].postgis_version);
    console.log('PROJ:', postgisResult.rows[0].proj_version);

    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}

// Error handling for pool
pool.on('error', (err) => {
  console.error('ERROR: Database pool error:', err);
  // In production, you might want to exit or alert here
});

/**
 * Example Queries
 */

// 1. Find landmarks by category with pagination
async function getLandmarksByCategory(category, limit = 20, offset = 0) {
  const query = `
    SELECT
      id,
      name,
      description,
      latitude,
      longitude,
      category,
      image_urls,
      admission_fee,
      contact_info,
      created_at
    FROM landmarks
    WHERE category = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [category, limit, offset]);
  return result.rows;
}

// 2. Find landmarks near a location using PostGIS geography
async function findNearbyLandmarks(lat, lon, radiusKm = 50, limit = 20) {
  const query = `
    SELECT
      id,
      name,
      description,
      latitude,
      longitude,
      category,
      ST_Distance(location, ST_GeogFromText($1)) as distance_meters,
      image_urls
    FROM landmarks
    WHERE ST_DWithin(
      location,
      ST_GeogFromText($1),
      $2 * 1000  -- Convert km to meters
    )
    ORDER BY location <-> ST_GeogFromText($1)
    LIMIT $3
  `;
  // Create geography WKT: 'SRID=4326;POINT(lon lat)'
  const point = `SRID=4326;POINT(${lon} ${lat})`;
  const result = await pool.query(query, [point, radiusKm, limit]);
  return result.rows;
}

// 3. Get user progress with landmark details
async function getUserProgressWithLandmarks(userId) {
  const query = `
    SELECT
      up.id,
      up.status,
      up.visited_at,
      up.notes,
      up.created_at,
      l.name as landmark_name,
      l.category,
      l.location as landmark_location
    FROM user_progress up
    JOIN landmarks l ON up.landmark_id = l.id
    WHERE up.user_id = $1
    ORDER BY up.visited_at DESC NULLS LAST, up.created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

// 4. Get top rated comments for a landmark
async function getTopComments(landmarkId, limit = 10) {
  const query = `
    SELECT
      c.id,
      c.content,
      c.rating,
      c.helpful_count,
      c.created_at,
      u.first_name,
      u.last_name,
      u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.landmark_id = $1
      AND c.is_public = TRUE
    ORDER BY c.helpful_count DESC, c.created_at DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [landmarkId, limit]);
  return result.rows;
}

// 5. Add a comment with optimistic increment
async function addComment(userId, landmarkId, content, rating = null) {
  const query = `
    INSERT INTO comments (user_id, landmark_id, content, rating)
    VALUES ($1, $2, $3, $4)
    RETURNING id, created_at, updated_at
  `;
  const result = await pool.query(query, [userId, landmarkId, content, rating]);
  return result.rows[0];
}

// 6. Mark comment as helpful (atomic increment)
async function markCommentHelpful(commentId) {
  const query = `
    UPDATE comments
    SET helpful_count = helpful_count + 1
    WHERE id = $1
    RETURNING helpful_count
  `;
  const result = await pool.query(query, [commentId]);
  return result.rows[0];
}

// 7. Find most visited landmarks
async function getPopularLandmarks(limit = 10) {
  const query = `
    SELECT
      l.id,
      l.name,
      l.category,
      COUNT(up.id) as visit_count,
      AVG(c.rating) as avg_rating,
      COUNT(c.id) as comment_count
    FROM landmarks l
    LEFT JOIN user_progress up ON l.id = up.landmark_id AND up.status = 'visited'
    LEFT JOIN comments c ON l.id = c.landmark_id AND c.rating IS NOT NULL
    GROUP BY l.id
    ORDER BY visit_count DESC, avg_rating DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
}

// 8. Get user by email (for authentication)
async function getUserByEmail(email) {
  const query = `
    SELECT id, email, password_hash, first_name, last_name, avatar_url, created_at
    FROM users
    WHERE email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
}

// 9. Revoke refresh tokens for a user (security)
async function revokeAllUserTokens(userId) {
  const query = `
    UPDATE refresh_tokens
    SET revoked = TRUE
    WHERE user_id = $1 AND revoked = FALSE
    RETURNING id
  `;
  const result = await pool.query(query, [userId]);
  return result.rowCount;
}

// 10. Clean up expired tokens (cron job)
async function cleanupExpiredTokens() {
  const query = `
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW() OR revoked = TRUE
    RETURNING id
  `;
  const result = await pool.query(query);
  return result.rowCount;
}

// Initialize database on startup
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      pool.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Failed to initialize database:', err);
      pool.end();
      process.exit(1);
    });
}

module.exports = {
  pool,
  initializeDatabase,
  getLandmarksByCategory,
  findNearbyLandmarks,
  getUserProgressWithLandmarks,
  getTopComments,
  addComment,
  markCommentHelpful,
  getPopularLandmarks,
  getUserByEmail,
  revokeAllUserTokens,
  cleanupExpiredTokens,
};
