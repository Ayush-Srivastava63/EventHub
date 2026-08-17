import pool from '../db/pool';
import bcrypt from 'bcrypt';

async function createAdmin() {
  try {
    const name = process.env.ADMIN_NAME || 'Admin User';
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'adminpassword123';

    // Check if exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log('Admin user already exists. Updating role to admin just in case.');
      await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [email]);
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'admin')`,
        [name, email, passwordHash]
      );
      console.log('Admin user created successfully.');
    }
    
    console.log('--- ADMIN CREDENTIALS ---');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('-------------------------');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();
