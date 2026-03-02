import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { DATABASE_URL, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, NODE_ENV } = process.env;

let poolConfig;

// Prefer DATABASE_URL if available (Docker/containerized environment)
if (DATABASE_URL) {
  poolConfig = { connectionString: DATABASE_URL };
} else {
  // Fallback to individual environment variables (local development)
  if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error('Missing required database environment variables');
  }
  poolConfig = {
    host: DB_HOST,
    port: parseInt(DB_PORT || '5432'),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Optional: Test connection on startup
if (NODE_ENV !== 'test') {
  pool
    .query('SELECT NOW()')
    .then(() => {
      console.log('✅ Database connected successfully');
    })
    .catch((err) => {
      console.error('❌ Database connection failed:', err.message);
    });
}

export { pool as default };
