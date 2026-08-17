import pool from '../db/pool';

async function updateAdminName() {
  try {
    await pool.query("UPDATE users SET name = 'Ayush Raj' WHERE email = 'admin@example.com'");
    console.log("Admin name successfully updated to 'Ayush Raj'");
  } catch (error) {
    console.error('Error updating admin name:', error);
  } finally {
    await pool.end();
  }
}

updateAdminName();
