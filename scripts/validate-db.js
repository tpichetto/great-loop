#!/usr/bin/env node

/**
 * Database Connection Validation Script
 * Tests database connectivity and verifies schema setup on application startup
 */

const { Client } = require('pg');

async function validateDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'landmarks_db',
    user: process.env.DB_USER || 'landmarks_user',
    password: process.env.DB_PASSWORD || 'landmarks_password',
  });

  try {
    console.log('Validating database connection...');
    await client.connect();
    console.log('OK: Database connection established');

    // Test PostGIS extension
    console.log('Checking PostGIS extension...');
    const postgisResult = await client.query(
      "SELECT postgis_lib_version(), postgis_proj_version()"
    );
    console.log(`OK: PostGIS version: ${postgisResult.rows[0].postgis_lib_version}`);
    console.log(`OK: PROJ version: ${postgisResult.rows[0].postgis_proj_version}`);

    // Verify required tables exist
    console.log('Verifying required tables...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('users', 'landmarks', 'user_progress', 'comments', 'refresh_tokens')
      ORDER BY table_name;
    `);

    const requiredTables = ['users', 'landmarks', 'user_progress', 'comments', 'refresh_tokens'];
    const existingTables = tablesResult.rows.map(row => row.table_name);

    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

            if (missingTables.length > 0) {
                console.error(`ERROR: Missing tables: ${missingTables.join(', ')}`);
                console.error('   Please run migrations first.');
                process.exit(1);
            }

            console.log('OK: All required tables exist');

            // Verify PostGIS geography column
            console.log('Verifying PostGIS geography column...');
    const geographyResult = await client.query(`
      SELECT column_name, type
      FROM information_schema.columns
      WHERE table_name = 'landmarks'
        AND column_name = 'location'
        AND udt_name = 'geography';
    `);

            if (geographyResult.rows.length === 0) {
                console.error('ERROR: PostGIS geography column not found on landmarks table');
                process.exit(1);
            }

            console.log('OK: PostGIS geography column configured correctly');

            // Test spatial query
            console.log('Testing spatial query functionality...');
    const spatialResult = await client.query(`
      SELECT
        id,
        name,
        ST_AsText(location) as location_wkt,
        ST_X(location::geometry) as lon,
        ST_Y(location::geometry) as lat
      FROM landmarks
      LIMIT 1;
    `);

    if (spatialResult.rows.length > 0) {
      const landmark = spatialResult.rows[0];
      console.log(`OK: Spatial query working: "${landmark.name}" at (${landmark.lat}, ${landmark.lon})`);
    } else {
      console.warn('WARNING: No landmarks found in database. Consider running seed data.');
    }

    // Test indexes
    console.log('Checking indexes...');
    const indexesResult = await client.query(`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('users', 'landmarks', 'user_progress', 'comments', 'refresh_tokens')
      ORDER BY tablename, indexname;
    `);

    console.log(`OK: Found ${indexesResult.rows.length} indexes on core tables`);

    console.log('\nSUCCESS: Database validation successful!');
    console.log('   Your database is ready for use.\n');

    await client.end();
    process.exit(0);

    } catch (error) {
        console.error('\nERROR: Database validation failed:');
        console.error(`   Error: ${error.message}`);

        if (error.code === 'ECONNREFUSED') {
            console.error('   Database server is not running. Start it with: docker-compose up -d');
        } else if (error.code === '28P01') {
            console.error('   Authentication failed. Check your database credentials.');
        } else if (error.code === '3D000') {
            console.error('   Database does not exist. Please create the database first.');
        }

        process.exit(1);
    }
}

validateDatabase();
