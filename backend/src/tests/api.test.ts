import request from 'supertest';
import app from '../server';
import pool from '../db/pool';

// Clean up database connection after all tests
afterAll(async () => {
  await pool.end();
});

describe('Health Check', () => {
  it('GET /api/health should return success', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Authentication', () => {
  const testUser = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
  };
  let authToken: string;

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.name).toBe(testUser.name);
      expect(res.body.data.token).toBeDefined();
      // Password hash should never be returned
      expect(res.body.data.user.password_hash).toBeUndefined();

      authToken = res.body.data.token;
    });

    it('should return 409 for duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Bad', email: 'not-an-email', password: '123456' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Short', email: 'short@test.com', password: '12' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpass' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'test123' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(401);
    });
  });

  // Clean up test user
  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });
});

describe('Events API', () => {
  // Create an admin user for event operations
  const adminEmail = `admin_test_${Date.now()}@example.com`;
  let adminToken: string;
  let createdEventId: number;

  beforeAll(async () => {
    // Register a user then promote to admin
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin Test', email: adminEmail, password: 'admin123' });

    adminToken = res.body.data.token;

    // Directly promote to admin in DB for testing
    await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [adminEmail]);

    // Re-login to get token with admin role
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: 'admin123' });

    adminToken = loginRes.body.data.token;
  });

  describe('POST /api/events', () => {
    it('should create an event as admin', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Event',
          description: 'A test event for automated testing',
          location: 'Test City',
          event_date: '2026-12-25',
          event_time: '14:00',
          category: 'technology',
          capacity: 100,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Event');
      createdEventId = res.body.data.id;
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({
          title: 'Unauthorized Event',
          description: 'Should fail',
          location: 'Nowhere',
          event_date: '2026-12-25',
          event_time: '14:00',
          capacity: 50,
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/events', () => {
    it('should return a list of events', async () => {
      const res = await request(app).get('/api/events');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.events)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should support search query', async () => {
      const res = await request(app).get('/api/events?search=Test');

      expect(res.status).toBe(200);
      expect(res.body.data.events.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return event details', async () => {
      const res = await request(app).get(`/api/events/${createdEventId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdEventId);
      expect(res.body.data.title).toBe('Test Event');
    });

    it('should return 404 for non-existent event', async () => {
      const res = await request(app).get('/api/events/99999');
      expect(res.status).toBe(404);
    });
  });

  describe('Event Registration', () => {
    const regUserEmail = `reguser_${Date.now()}@example.com`;
    let regUserToken: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Reg User', email: regUserEmail, password: 'pass123' });
      regUserToken = res.body.data.token;
    });

    it('should register for an event', async () => {
      const res = await request(app)
        .post(`/api/events/${createdEventId}/register`)
        .set('Authorization', `Bearer ${regUserToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('confirmed');
    });

    it('should prevent duplicate registration', async () => {
      const res = await request(app)
        .post(`/api/events/${createdEventId}/register`)
        .set('Authorization', `Bearer ${regUserToken}`);

      expect(res.status).toBe(409);
    });

    it('should cancel registration', async () => {
      const res = await request(app)
        .delete(`/api/events/${createdEventId}/register`)
        .set('Authorization', `Bearer ${regUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
    });

    it('should return 401 for unauthenticated registration', async () => {
      const res = await request(app)
        .post(`/api/events/${createdEventId}/register`);

      expect(res.status).toBe(401);
    });

    afterAll(async () => {
      await pool.query('DELETE FROM registrations WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [regUserEmail]);
      await pool.query('DELETE FROM users WHERE email = $1', [regUserEmail]);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update an event as the organizer', async () => {
      const res = await request(app)
        .put(`/api/events/${createdEventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Test Event' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Test Event');
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete an event as the organizer', async () => {
      const res = await request(app)
        .delete(`/api/events/${createdEventId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 for deleted event', async () => {
      const res = await request(app).get(`/api/events/${createdEventId}`);
      expect(res.status).toBe(404);
    });
  });

  // Clean up admin user
  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [adminEmail]);
  });
});
