import pool from '../db/pool';

async function promoteAllToAdmin() {
  try {
    await pool.query("UPDATE users SET role = 'admin'");
    console.log("All users successfully promoted to 'admin'");
  } catch (error) {
    console.error('Error updating roles:', error);
  } finally {
    await pool.end();
  }
}

promoteAllToAdmin();
