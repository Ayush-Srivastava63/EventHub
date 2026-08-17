import pool from './pool';

/**
 * Database initialization script.
 * Creates all required tables with proper constraints, relationships, and indexes.
 * Run with: npm run db:init
 */
async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ─── Users Table ───
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        name          VARCHAR(100) NOT NULL,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role          VARCHAR(10)  NOT NULL DEFAULT 'user'
                      CHECK (role IN ('user', 'admin')),
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // ─── Events Table ───
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id            SERIAL PRIMARY KEY,
        title         VARCHAR(200) NOT NULL,
        description   TEXT NOT NULL,
        location      VARCHAR(255) NOT NULL,
        event_date    DATE NOT NULL,
        event_time    TIME NOT NULL,
        category      VARCHAR(50) NOT NULL DEFAULT 'general',
        capacity      INTEGER NOT NULL CHECK (capacity > 0),
        organizer_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // ─── Registrations Table ───
    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id            SERIAL PRIMARY KEY,
        user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_id      INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status        VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                      CHECK (status IN ('confirmed', 'cancelled')),
        UNIQUE(user_id, event_id)
      );
    `);

    // ─── Indexes for performance ───
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_organizer    ON events(organizer_id);
      CREATE INDEX IF NOT EXISTS idx_events_date         ON events(event_date);
      CREATE INDEX IF NOT EXISTS idx_events_category     ON events(category);
      CREATE INDEX IF NOT EXISTS idx_registrations_user  ON registrations(user_id);
      CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
    `);

    await client.query('COMMIT');
    console.log('✅ Database tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if executed directly
initializeDatabase()
  .then(() => {
    console.log('🎉 Database initialization complete');
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
