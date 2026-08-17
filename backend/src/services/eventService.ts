import pool from '../db/pool';
import { Event, CreateEventDTO, UpdateEventDTO, EventQueryParams } from '../types';
import { AppError } from '../middleware/errorHandler';
import { sendEmail } from './emailService';

// ─── Get All Events (with search, filter, pagination, sorting) ───

export async function getEvents(params: EventQueryParams) {
  const { search, category, page = 1, limit = 12, sort = 'date_asc' } = params;

  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  // Search by title or description
  if (search) {
    conditions.push(`(LOWER(e.title) LIKE $${paramIndex} OR LOWER(e.description) LIKE $${paramIndex})`);
    values.push(`%${search.toLowerCase()}%`);
    paramIndex++;
  }

  // Filter by category
  if (category) {
    conditions.push(`e.category = $${paramIndex}`);
    values.push(category);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sorting
  const sortMap: Record<string, string> = {
    date_asc: 'e.event_date ASC, e.event_time ASC',
    date_desc: 'e.event_date DESC, e.event_time DESC',
    title_asc: 'e.title ASC',
    title_desc: 'e.title DESC',
  };
  const orderBy = sortMap[sort] || sortMap.date_asc;

  // Count total for pagination
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM events e ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Fetch events with organizer name and registration count using JOINs
  const offset = (page - 1) * limit;
  values.push(limit, offset);

  const result = await pool.query(
    `SELECT e.*, u.name AS organizer_name,
            COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS registration_count
     FROM events e
     JOIN users u ON e.organizer_id = u.id
     LEFT JOIN registrations r ON e.id = r.event_id
     ${whereClause}
     GROUP BY e.id, u.name
     ORDER BY ${orderBy}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    values
  );

  return {
    events: result.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get Single Event ───

export async function getEventById(eventId: number) {
  const result = await pool.query(
    `SELECT e.*, u.name AS organizer_name,
            COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS registration_count
     FROM events e
     JOIN users u ON e.organizer_id = u.id
     LEFT JOIN registrations r ON e.id = r.event_id
     WHERE e.id = $1
     GROUP BY e.id, u.name`,
    [eventId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Event not found', 404);
  }

  return result.rows[0];
}

// ─── Create Event ───

export async function createEvent(data: CreateEventDTO, organizerId: number): Promise<Event> {
  const result = await pool.query(
    `INSERT INTO events (title, description, location, event_date, event_time, category, capacity, organizer_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [data.title, data.description, data.location, data.event_date, data.event_time, data.category || 'general', data.capacity, organizerId]
  );

  return result.rows[0] as Event;
}

// ─── Update Event ───

export async function updateEvent(eventId: number, data: UpdateEventDTO, userId: number): Promise<Event> {
  // Verify ownership
  const existing = await pool.query('SELECT organizer_id FROM events WHERE id = $1', [eventId]);
  if (existing.rows.length === 0) {
    throw new AppError('Event not found', 404);
  }
  if (existing.rows[0].organizer_id !== userId) {
    throw new AppError('You can only edit your own events', 403);
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const updatableFields: (keyof UpdateEventDTO)[] = [
    'title', 'description', 'location', 'event_date', 'event_time', 'category', 'capacity',
  ];

  for (const field of updatableFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramIndex++}`);
      values.push(data[field]);
    }
  }

  if (fields.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  fields.push('updated_at = NOW()');
  values.push(eventId);

  const result = await pool.query(
    `UPDATE events SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  const updatedEvent = result.rows[0] as Event;

  // --- Send Update Email to all registered users (Async) ---
  pool.query(
    `SELECT u.name, u.email, o.name AS organizer_name, o.email AS organizer_email 
     FROM registrations r 
     JOIN users u ON r.user_id = u.id 
     CROSS JOIN (SELECT name, email FROM users WHERE id = $2) o
     WHERE r.event_id = $1 AND r.status = 'confirmed'`,
    [eventId, updatedEvent.organizer_id]
  ).then(userResult => {
    userResult.rows.forEach(user => {
      const dateStr = new Date(updatedEvent.event_date).toLocaleDateString();
      const html = `
        <h2>Event Update!</h2>
        <p>Hi ${user.name},</p>
        <p>An event you are registered for has been updated: <strong>${updatedEvent.title}</strong>.</p>
        <p><strong>Date:</strong> ${dateStr}<br/>
           <strong>Time:</strong> ${updatedEvent.event_time}<br/>
           <strong>Location:</strong> ${updatedEvent.location}</p>
        <br/>
        <p>If you have questions, you can reply directly to the organizer, <strong>${user.organizer_name}</strong>.</p>
        <p>Please check the portal for more details.</p>
      `;
      sendEmail(
        user.email, 
        `Event Updated: ${updatedEvent.title}`, 
        html,
        user.organizer_name,
        user.organizer_email
      );
    });
  }).catch(err => console.error('Failed to notify users of event update:', err));

  return updatedEvent;
}

// ─── Delete Event ───

export async function deleteEvent(eventId: number, userId: number): Promise<void> {
  const existing = await pool.query('SELECT organizer_id FROM events WHERE id = $1', [eventId]);
  if (existing.rows.length === 0) {
    throw new AppError('Event not found', 404);
  }
  if (existing.rows[0].organizer_id !== userId) {
    throw new AppError('You can only delete your own events', 403);
  }

  await pool.query('DELETE FROM events WHERE id = $1', [eventId]);
}

// ─── Get Events by Organizer ───

export async function getEventsByOrganizer(organizerId: number) {
  const result = await pool.query(
    `SELECT e.*,
            COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS registration_count
     FROM events e
     LEFT JOIN registrations r ON e.id = r.event_id
     WHERE e.organizer_id = $1
     GROUP BY e.id
     ORDER BY e.event_date DESC`,
    [organizerId]
  );

  return result.rows;
}

// ─── Get Categories ───

export async function getCategories(): Promise<string[]> {
  const result = await pool.query('SELECT DISTINCT category FROM events ORDER BY category');
  return result.rows.map((row) => row.category);
}

// ─── Admin Stats ───

export async function getAdminStats(organizerId: number) {
  const totalEvents = await pool.query(
    'SELECT COUNT(*) FROM events WHERE organizer_id = $1',
    [organizerId]
  );

  const totalRegistrations = await pool.query(
    `SELECT COUNT(r.id) FROM registrations r
     JOIN events e ON r.event_id = e.id
     WHERE e.organizer_id = $1 AND r.status = 'confirmed'`,
    [organizerId]
  );

  const upcomingEvents = await pool.query(
    'SELECT COUNT(*) FROM events WHERE organizer_id = $1 AND event_date >= CURRENT_DATE',
    [organizerId]
  );

  const totalCapacity = await pool.query(
    'SELECT COALESCE(SUM(capacity), 0) AS total FROM events WHERE organizer_id = $1',
    [organizerId]
  );

  return {
    totalEvents: parseInt(totalEvents.rows[0].count, 10),
    totalRegistrations: parseInt(totalRegistrations.rows[0].count, 10),
    upcomingEvents: parseInt(upcomingEvents.rows[0].count, 10),
    totalCapacity: parseInt(totalCapacity.rows[0].total, 10),
    availableSeats: parseInt(totalCapacity.rows[0].total, 10) - parseInt(totalRegistrations.rows[0].count, 10),
  };
}
