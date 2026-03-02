#!/usr/bin/env python3

"""
Database Connection Validation Script (Python version)
Tests database connectivity and verifies schema setup on application startup
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

def validate_database():
    """Validate database connection and schema setup"""
    connection_params = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432'),
        'database': os.getenv('DB_NAME', 'landmarks_db'),
        'user': os.getenv('DB_USER', 'landmarks_user'),
        'password': os.getenv('DB_PASSWORD', 'landmarks_password'),
    }

    try:
        print('Validating database connection...')
        conn = psycopg2.connect(**connection_params)
        print('OK: Database connection established')

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Test PostGIS extension
            print('Checking PostGIS extension...')
            cur.execute("SELECT postgis_lib_version(), postgis_proj_version()")
            result = cur.fetchone()
            print(f'OK: PostGIS version: {result["postgis_lib_version"]}')
            print(f'OK: PROJ version: {result["postgis_proj_version"]}')

            # Verify required tables exist
            print('Verifying required tables...')
            cur.execute("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name IN ('users', 'landmarks', 'user_progress', 'comments', 'refresh_tokens')
                ORDER BY table_name;
            """)

            rows = cur.fetchall()
            existing_tables = [row['table_name'] for row in rows]
            required_tables = ['users', 'landmarks', 'user_progress', 'comments', 'refresh_tokens']

            missing_tables = [table for table in required_tables if table not in existing_tables]

            if missing_tables:
                print(f'ERROR: Missing tables: {", ".join(missing_tables)}')
                print('   Please run migrations first.')
                sys.exit(1)

            print('OK: All required tables exist')

            # Verify PostGIS geography column
            print('Verifying PostGIS geography column...')
            cur.execute("""
                SELECT column_name, type
                FROM information_schema.columns
                WHERE table_name = 'landmarks'
                  AND column_name = 'location'
                  AND udt_name = 'geography';
            """)

            if cur.rowcount == 0:
                print('ERROR: PostGIS geography column not found on landmarks table')
                sys.exit(1)

            print('OK: PostGIS geography column configured correctly')

            # Test spatial query
            print('Testing spatial query functionality...')
            cur.execute("""
                SELECT
                    id,
                    name,
                    ST_AsText(location) as location_wkt,
                    ST_X(location::geometry) as lon,
                    ST_Y(location::geometry) as lat
                FROM landmarks
                LIMIT 1;
            """)

            result = cur.fetchone()
            if result:
                print(f'OK: Spatial query working: "{result["name"]}" at ({result["lat"]}, {result["lon"]})')
            else:
                print('WARNING: No landmarks found in database. Consider running seed data.')

            # Check indexes
            print('Checking indexes...')
            cur.execute("""
                SELECT COUNT(*) as index_count
                FROM pg_indexes
                WHERE schemaname = 'public'
                  AND tablename IN ('users', 'landmarks', 'user_progress', 'comments', 'refresh_tokens');
            """)

            result = cur.fetchone()
            print(f'OK: Found {result["index_count"]} indexes on core tables')

        print('\nSUCCESS: Database validation successful!')
        print('   Your database is ready for use.\n')

        conn.close()
        sys.exit(0)

    except psycopg2.OperationalError as e:
        print('\nERROR: Database validation failed:')
        print(f'   Error: {e}')

        if 'Connection refused' in str(e):
            print('   Database server is not running. Start it with: docker-compose up -d')
        elif 'password authentication failed' in str(e):
            print('   Authentication failed. Check your database credentials.')
        elif 'database' in str(e) and 'does not exist' in str(e):
            print('   Database does not exist. Please create the database first.')

        sys.exit(1)

if __name__ == '__main__':
    validate_database()
