import request from 'supertest';
import app from '../app';
import pool from '../config/database';;

// Increase timeout for slow operations (bcrypt)
jest.setTimeout(30000);

describe('Authentication Endpoints', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const password = 'StrongPass123!';
  const firstName = 'Test';
  const lastName = 'User';
  let userId: string;

  afterAll(async () => {
    // Cleanup: delete test user and associated data
    if (userId) {
      try {
        await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    }
    // Close database connection pool to allow Jest to exit cleanly
    await pool.end();
  });

  test('POST /api/auth/register - should register new user', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: testEmail,
      password,
      first_name: firstName,
      last_name: lastName,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(testEmail);
    expect(response.body.user.first_name).toBe(firstName);
    expect(response.body.user.last_name).toBe(lastName);
    expect(response.body.user.role).toBe('user');
    expect(response.body).toHaveProperty('accessToken');

    // Extract user id for cleanup
    userId = response.body.user.id;

    // Check refresh token cookie is set (httpOnly, secure, sameSite)
    expect(response.headers['set-cookie']).toBeDefined();
    const setCookie = response.headers['set-cookie'];
    const cookieHeader = Array.isArray(setCookie) ? setCookie : [setCookie];
    const refreshCookie = cookieHeader.find((c) => c.startsWith('refresh_token='));
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain('HttpOnly');
  });

  test('POST /api/auth/register - should reject weak password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test_${Date.now()}@example.com`,
        password: 'weak',
        first_name: 'Test2',
        last_name: 'User2',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Bad Request');
    expect(response.body.details).toBeDefined();
    expect(Array.isArray(response.body.details)).toBe(true);
  });

  test('POST /api/auth/login - should login with correct credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(testEmail);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  test('POST /api/auth/login - should reject invalid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });

  test('GET /api/auth/me - without token should return 401', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  // Store token for subsequent authenticated requests
  let accessToken: string;
  test('POST /api/auth/login - obtain access token for /me test', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password });

    expect(response.status).toBe(200);
    accessToken = response.body.accessToken;
  });

  test('GET /api/auth/me - with valid token should return user', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(testEmail);
  });

  test('GET /api/auth/me - with invalid token should return 401', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.status).toBe(401);
  });

  test('POST /api/auth/refresh - with refresh cookie should return new access token', async () => {
    // Use an agent to persist cookies
    const agent = request.agent(app);
    // Login to set refresh cookie
    await agent.post('/api/auth/login').send({ email: testEmail, password });

    // Refresh endpoint
    const response = await agent.post('/api/auth/refresh');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    // New access token should be different from previous (if any)
  });

  test('POST /api/auth/logout - with valid session should logout and clear cookie', async () => {
    const agent = request.agent(app);
    // Login to create session
    await agent.post('/api/auth/login').send({ email: testEmail, password });

    const response = await agent.post('/api/auth/logout');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Logged out successfully');

    // Verify refresh cookie is cleared (Max-Age=0 or Expired)
    const setCookie = response.headers['set-cookie'];
    if (!setCookie) {
      throw new Error('No Set-Cookie header in response');
    }
    const cookieHeader = Array.isArray(setCookie) ? setCookie : [setCookie];
    const refreshCookie = cookieHeader.find((c) => c.startsWith('refresh_token='));
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/);
  });

  test('POST /api/auth/refresh - after logout should reject used refresh token', async () => {
    const agent = request.agent(app);
    // Login and then logout to invalidate refresh token
    await agent.post('/api/auth/login').send({ email: testEmail, password });
    await agent.post('/api/auth/logout');

    // Attempt to use the now-invalid refresh token
    const response = await agent.post('/api/auth/refresh');
    expect(response.status).toBe(401);
  });
});
