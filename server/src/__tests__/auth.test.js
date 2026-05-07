const request = require('supertest');

jest.mock('../config/db', () => {
  const { setupTestDb } = require('./testHelpers');
  const h = setupTestDb();
  global.__authTestIds = h;
  return h.db;
});

const app = require('../app');

describe('POST /api/auth/login', () => {
  it('returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@company.com' });
    expect(res.status).toBe(400);
  });
  it('returns 401 for wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@company.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });
  it('returns 401 for unknown email', async () => {
    expect((await request(app).post('/api/auth/login').send({ email: 'nobody@x.com', password: 'password123' })).status).toBe(401);
  });
  it('returns token for it_manager (no password in response)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@company.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('it_manager');
    expect(res.body.user.password).toBeUndefined();
  });
  it('returns token for pmo', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'pmo@company.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('pmo');
  });
  it('returns token for dev_operation', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'dev@company.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('dev_operation');
  });
});

describe('GET /api/auth/me', () => {
  let token;
  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@company.com', password: 'password123' });
    token = res.body.token;
  });
  it('returns 401 with no token', async () => { expect((await request(app).get('/api/auth/me')).status).toBe(401); });
  it('returns 401 with invalid token', async () => {
    expect((await request(app).get('/api/auth/me').set('Authorization', 'Bearer bad.token')).status).toBe(401);
  });
  it('returns 401 with missing Bearer prefix', async () => {
    expect((await request(app).get('/api/auth/me').set('Authorization', token)).status).toBe(401);
  });
  it('returns current user with valid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('admin@company.com');
    expect(res.body.password).toBeUndefined();
  });
});
