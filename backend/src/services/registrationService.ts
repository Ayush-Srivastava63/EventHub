import pool from '../db/pool';
import { AppError } from '../middleware/errorHandler';

import { sendEmail } from './emailService';

// ─── Register for Event ───

export async function registerForEvent(userId: number, eventId: number) {
  // Check if event exists
  const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
  if (eventResult.rows.length === 0) {
    throw new AppError('Event not found', 404);
  }

  const event = eventResult.rows[0];

  // Check capacity using a count of confirmed registrations
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM registrations WHERE event_id = $1 AND status = 'confirmed'`,
    [eventId]
  );
  const currentRegistrations = parseInt(countResult.rows[0].count, 10);

  if (currentRegistrations >= event.capacity) {
    throw new AppError('Event is at full capacity', 400);
  }

  // Check for duplicate registration (UNIQUE constraint also prevents this at DB level)
  const existing = await pool.query(
    'SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2',
    [userId, eventId]
  );

  let finalRegistration;

  if (existing.rows.length > 0) {
    if (existing.rows[0].status === 'confirmed') {
      throw new AppError('You are already registered for this event', 409);
    }
    // Re-activate a cancelled registration
    const result = await pool.query(
      `UPDATE registrations SET status = 'confirmed', registered_at = NOW()
       WHERE user_id = $1 AND event_id = $2 RETURNING *`,
      [userId, eventId]
    );
    finalRegistration = result.rows[0];
  } else {
    const result = await pool.query(
      `INSERT INTO registrations (user_id, event_id, status)
       VALUES ($1, $2, 'confirmed')
       RETURNING *`,
      [userId, eventId]
    );
    finalRegistration = result.rows[0];
  }

  // --- Send Confirmation Email (Async) ---
  pool.query(`
    SELECT u.name, u.email, o.name AS organizer_name, o.email AS organizer_email 
    FROM users u 
    CROSS JOIN (SELECT name, email FROM users WHERE id = $2) o
    WHERE u.id = $1`, 
    [userId, event.organizer_id]
  ).then(userResult => {
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        const dateStr = new Date(event.event_date).toLocaleDateString();
        const html = `
          <h2>Registration Confirmed!</h2>
          <p>Hi ${user.name},</p>
          <p>You have successfully registered for <strong>${event.title}</strong>.</p>
          <p><strong>Date:</strong> ${dateStr}<br/>
             <strong>Time:</strong> ${event.event_time}<br/>
             <strong>Location:</strong> ${event.location}</p>
          <br/>
          <p>This event is organized by <strong>${user.organizer_name}</strong>. 
             If you have any questions, you can reply directly to this email.</p>
          <br/>
          <p>Thanks for using EventHub!</p>
        `;
        sendEmail(
          user.email, 
          `Registration Confirmed: ${event.title}`, 
          html,
          user.organizer_name,
          user.organizer_email
        );
      }
    })
    .catch(err => console.error('Failed to prepare registration email:', err));

  return finalRegistration;
}

// ─── Cancel Registration ───

export async function cancelRegistration(userId: number, eventId: number) {
  const result = await pool.query(
    `UPDATE registrations SET status = 'cancelled'
     WHERE user_id = $1 AND event_id = $2 AND status = 'confirmed'
     RETURNING *`,
    [userId, eventId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Registration not found or already cancelled', 404);
  }

  return result.rows[0];
}

// ─── Get User's Registrations (with event details via JOIN) ───

export async function getUserRegistrations(userId: number) {
  const result = await pool.query(
    `SELECT r.*, e.title, e.description, e.location, e.event_date, e.event_time,
            e.category, e.capacity, u.name AS organizer_name
     FROM registrations r
     JOIN events e ON r.event_id = e.id
     JOIN users u ON e.organizer_id = u.id
     WHERE r.user_id = $1
     ORDER BY r.registered_at DESC`,
    [userId]
  );

  return result.rows;
}

// ─── Get Event Registrations (for organizer/admin) ───

export async function getEventRegistrations(eventId: number, organizerId: number) {
  // Verify the organizer owns this event
  const eventResult = await pool.query('SELECT organizer_id FROM events WHERE id = $1', [eventId]);
  if (eventResult.rows.length === 0) {
    throw new AppError('Event not found', 404);
  }
  if (eventResult.rows[0].organizer_id !== organizerId) {
    throw new AppError('You can only view registrations for your own events', 403);
  }

  const result = await pool.query(
    `SELECT r.*, u.name, u.email
     FROM registrations r
     JOIN users u ON r.user_id = u.id
     WHERE r.event_id = $1
     ORDER BY r.registered_at DESC`,
    [eventId]
  );

  return result.rows;
}

// ─── Check if user is registered for an event ───

export async function checkRegistration(userId: number, eventId: number) {
  const result = await pool.query(
    `SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2 AND status = 'confirmed'`,
    [userId, eventId]
  );

  return result.rows.length > 0;
}
