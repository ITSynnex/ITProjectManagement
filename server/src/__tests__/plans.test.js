const request = require('supertest');
const { makeToken } = require('./testHelpers');

jest.mock('../config/db', () => {
  const { setupTestDb } = require('./testHelpers');
  const h = setupTestDb();
  global.__plansTestIds = h;
  return h.db;
});

const app = require('../app');

let adminToken, pmoToken, devToken, helpers;

beforeAll(() => {
  helpers    = global.__plansTestIds;
  adminToken = makeToken({ id: helpers.adminId, display_name: 'IT Manager',  email: 'admin@company.com', role: 'it_manager' });
  pmoToken   = makeToken({ id: helpers.pmoId,   display_name: 'PMO User',    email: 'pmo@company.com',   role: 'pmo' });
  devToken   = makeToken({ id: helpers.devId,   display_name: 'Dev Operator',email: 'dev@company.com',   role: 'dev_operation' });
});

describe('GET /api/plans', () => {
  it('401 without token', async () => { expect((await request(app).get('/api/plans')).status).toBe(401); });
  it('200 for all roles with owner_name', async () => {
    for (const tok of [adminToken, pmoToken, devToken]) {
      const res = await request(app).get('/api/plans').set('Authorization', `Bearer ${tok}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    }
    const res = await request(app).get('/api/plans').set('Authorization', `Bearer ${pmoToken}`);
    expect(res.body[0]).toHaveProperty('owner_name');
  });
});

describe('GET /api/plans/:id', () => {
  it('404 for unknown id', async () => {
    expect((await request(app).get('/api/plans/9999').set('Authorization', `Bearer ${adminToken}`)).status).toBe(404);
  });
  it('200 with buckets and tasks', async () => {
    const res = await request(app).get(`/api/plans/${helpers.planId}`).set('Authorization', `Bearer ${pmoToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.buckets)).toBe(true);
    expect(Array.isArray(res.body.tasks)).toBe(true);
  });
});

describe('POST /api/plans', () => {
  it('401 without token', async () => { expect((await request(app).post('/api/plans').send({ name: 'X' })).status).toBe(401); });
  it('403 for dev_operation', async () => {
    expect((await request(app).post('/api/plans').set('Authorization', `Bearer ${devToken}`).send({ name: 'X' })).status).toBe(403);
  });
  it('400 for missing name', async () => {
    expect((await request(app).post('/api/plans').set('Authorization', `Bearer ${pmoToken}`).send({})).status).toBe(400);
  });
  it('201 for pmo', async () => {
    const res = await request(app).post('/api/plans').set('Authorization', `Bearer ${pmoToken}`).send({ name: 'New Plan', status: 'on_track' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New Plan');
  });
  it('201 for it_manager', async () => {
    const res = await request(app).post('/api/plans').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Admin Plan' });
    expect(res.status).toBe(201);
  });
});

describe('PUT /api/plans/:id', () => {
  it('403 for dev_operation', async () => {
    expect((await request(app).put(`/api/plans/${helpers.planId}`).set('Authorization', `Bearer ${devToken}`).send({ name: 'X' })).status).toBe(403);
  });
  it('200 update plan status', async () => {
    const res = await request(app).put(`/api/plans/${helpers.planId}`).set('Authorization', `Bearer ${pmoToken}`).send({ status: 'at_risk' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('at_risk');
  });
});

describe('DELETE /api/plans/:id', () => {
  it('403 for dev_operation', async () => {
    expect((await request(app).delete(`/api/plans/${helpers.planId}`).set('Authorization', `Bearer ${devToken}`)).status).toBe(403);
  });
  it('204 delete plan', async () => {
    const created = await request(app).post('/api/plans').set('Authorization', `Bearer ${adminToken}`).send({ name: 'ToDelete' });
    expect((await request(app).delete(`/api/plans/${created.body.id}`).set('Authorization', `Bearer ${adminToken}`)).status).toBe(204);
  });
});
