import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

/**
 * PostgreSQL connection pool.
 * Uses environment variables for configuration — never hardcode credentials.
 * Supports SSL for cloud-hosted PostgreSQL (e.g., Neon).
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'event_management',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Log connection status on first successful query
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
  process.exit(-1);
});

export default pool;
