# Landmarks Database Schema

PostgreSQL database with PostGIS extension for a landmark exploration application.

## Features

- **PostgreSQL 15** with **PostGIS 3.4** extension
- Full geospatial support for location-based queries
- User management and authentication
- Landmark catalog with categories, images, and contact info
- User progress tracking (discovered, visited, completed)
- Public comments and ratings
- JWT refresh token management
- Comprehensive indexes for performance
- Automatic timestamp management

## Database Schema

### Core Tables

| Table            | Description                                   |
| ---------------- | --------------------------------------------- |
| `users`          | User accounts with profile data               |
| `landmarks`      | Landmark/POI data with geospatial coordinates |
| `user_progress`  | Track user visits and status                  |
| `comments`       | Public comments with ratings                  |
| `refresh_tokens` | JWT token rotation storage                    |

### PostGIS Geography

The `landmarks.location` column uses `GEOGRAPHY(Point, 4326)` for:

- Accurate distance calculations (meters, miles, km)
- Spatial queries across the globe
- No projection headaches (uses WGS84)

## Quick Start

### 1. Start Database

```bash
docker-compose up -d
```

This starts PostgreSQL with PostGIS on port 5432.

### 2. Run Migrations

Using Node.js validation/migration runner:

```bash
node scripts/validate-db.js
```

Or manually with psql:

```bash
psql -h localhost -U landmarks_user -d landmarks_db -f migrations/001_initial_schema.sql
```

### 3. Load Seed Data (Optional)

```bash
psql -h localhost -U landmarks_user -d landmarks_db -f seeds/001_sample_data.sql
```

### 4. Validate Setup

```bash
node scripts/validate-db.js
# or
python3 scripts/validate-db.py
```

## Sample Landmarks (10 diverse locations)

1. **Eiffel Tower** (Paris, France) - Historical
2. **Great Wall of China** (China) - Historical
3. **Grand Canyon** (Arizona, USA) - Natural
4. **Victoria Falls** (Zambia/Zimbabwe) - Natural
5. **Taj Mahal** (Agra, India) - Cultural
6. **Machu Picchu** (Peru) - Cultural
7. **Sydney Opera House** (Australia) - Architectural
8. **Burj Khalifa** (Dubai, UAE) - Architectural
9. **Central Park** (New York, USA) - Recreational
10. **Niagara Falls** (US-Canada border) - Recreational
11. **Pyramids of Giza** (Egypt) - Historical (bonus)

## Migration Commands

### Apply all migrations

```bash
for file in migrations/*.sql; do
  echo "Applying $file"
  psql -h localhost -U landmarks_user -d landmarks_db -f "$file"
done
```

### Rollback all migrations

```bash
for file in migrations/*_down.sql; do
  echo "Rolling back $file"
  psql -h localhost -U landmarks_user -d landmarks_db -f "$file"
done
```

## Database Credentials

- **Host**: localhost
- **Port**: 5432
- **Database**: landmarks_db
- **Username**: landmarks_user
- **Password**: landmarks_password

## Spatial Query Examples

```sql
-- Find landmarks within 50km of a point
SELECT
    id,
    name,
    ST_Distance(location, ST_GeogFromText('SRID=4326;POINT(-73.965355 40.782864)')) as distance_meters
FROM landmarks
WHERE ST_DWithin(
    location,
    ST_GeogFromText('SRID=4326;POINT(-73.965355 40.782864)'),
    50000  -- 50 kilometers in meters
)
ORDER BY distance_meters;

-- Find nearest landmarks (using Haversine via PostGIS)
SELECT
    id,
    name,
    ST_Distance(location, ST_GeogFromText('SRID=4326;POINT(2.294481 48.858370)')) as distance_meters
FROM landmarks
ORDER BY location <-> ST_GeogFromText('SRID=4326;POINT(2.294481 48.858370)')
LIMIT 10;
```

## Database Connection Example (Node.js)

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'landmarks_db',
  user: process.env.DB_USER || 'landmarks_user',
  password: process.env.DB_PASSWORD || 'landmarks_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
(async () => {
  const client = await pool.connect();
  const result = await client.query('SELECT NOW()');
  console.log('Database time:', result.rows[0]);
  client.release();
})();
```

## Environment Variables

| Variable      | Default            | Description       |
| ------------- | ------------------ | ----------------- |
| `DB_HOST`     | localhost          | Database host     |
| `DB_PORT`     | 5432               | Database port     |
| `DB_NAME`     | landmarks_db       | Database name     |
| `DB_USER`     | landmarks_user     | Database username |
| `DB_PASSWORD` | landmarks_password | Database password |

## Indexes

- `idx_users_email` - email lookup
- `idx_landmarks_location` (GIST) - spatial queries
- `idx_landmarks_category` - category filtering
- `idx_user_progress_user_id` - user progress lookups
- `idx_user_progress_landmark_id` - landmark popularity
- `idx_user_progress_status` - status filtering
- `idx_comments_landmark_id` - landmark comments
- `idx_comments_user_id` - user comment history
- `idx_comments_created_at_desc` - latest comments first
- `idx_comments_helpful_count` - helpful comment ranking
- `idx_refresh_tokens_user_id` - token revocation
- `idx_refresh_tokens_token` - token lookup
- `idx_refresh_tokens_expires_at` - cleanup job

## Constraints

- **Primary Keys**: UUIDs (gen_random_uuid())
- **Foreign Keys**: CASCADE on delete
- **Unique**: (user_id, landmark_id) on user_progress
- **Check**: rating (1-5), status enum, category enum
- **Not Null**: All required business fields
- **Triggers**: auto-update `updated_at` on users, landmarks, comments

## Performance Tips

1. Use `ST_DWithin()` for radius searches (uses GIST index)
2. Use `<->` operator for nearest neighbor searches
3. Add covering indexes for frequent query patterns
4. Consider partitioning `comments` by `landmark_id` for very large datasets
5. Tune `maintenance_work_mem` for large bulk inserts
6. Use connection pooling (see examples above)

## Troubleshooting

### Migration fails with "extension postgis does not exist"

Ensure the PostGIS container is ready:

```bash
docker-compose logs -f postgres
# Wait for "PostgreSQL init process complete"
```

### Connection refused

Make sure the database is running:

```bash
docker-compose ps
# Should show postgres running
```

### Role/password mismatch

The docker-compose uses default credentials. If you changed them, update the connection parameters.

## File Structure

```
.
├── docker-compose.yml          # Database container
├── init-db.sql                 # PostGIS extension enable
├── migrations/
│   ├── 001_initial_schema.sql        # create tables + indexes
│   └── 001_initial_schema_down.sql   # rollback
├── seeds/
│   ├── 001_sample_data.sql          # sample data
│   └── 001_sample_data_down.sql     # clear sample data
├── scripts/
│   ├── validate-db.js         # Node.js validation
│   └── validate-db.py         # Python validation
└── README.md                  # This file
```

## License

MIT
