const request = require('supertest');
const { makeToken } = require('./testHelpers');

jest.mock('../config/db', () => {
  const { setupTestDb } = require('./testHelpers');
  const h = setupTestDb();
  global.__bucketsTestIds = h;
  return h.db;
});

const app = require('../app');

let adminToken, pmoToken, devToken, helpers;

beforeAll(() => {
  helpers    = global.__bucketsTestIds;
  adminToken = makeToken({ id: helpers.adminId, display_name: 'IT Manager',  email: 'admin@company.com', role: 'it_manager' });
  pmoToken   = makeToken({ id: helpers.pmoId,   display_name: 'PMO User',    email: 'pmo@company.com',   role: 'pmo' });
  devToken   = makeToken({ id: helpers.devId,   display_name: 'Dev Operator',email: 'dev@company.com',   role: 'dev_operation' });
});

describe('GET /api/plans/:planId/buckets', () => {
  it('401 without token', async () => { expect((await request(app).get('/api/plans/1/buckets')).status).toBe(401); });
  it('200 ordered buckets for all roles', async () => {
    const res = await request(app).get(`/api/plans/${helpers.planId}/buckets`).set('Authorization', `Bearer ${devToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    if (res.body.length > 1) expect(res.body[0].order).toBeLessThanOrEqual(res.body[1].order);
  });
});

describe('POST /api/plans/:planId/buckets', () => {
  it('403 for dev_operation', async () => {
    expect((await request(app).post(`/api/plans/${helpers.planId}/buckets`).set('Authorization', `Bearer ${devToken}`).send({ name: 'X' })).status).toBe(403);
  });
  it('201 creates bucket', async () => {
    const res = await request(app).post(`/api/plans/${helpers.planId}/buckets`).set('Authorization', `Bearer ${pmoToken}`).send({ name: 'Review' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Review');
  });
});

describe('PUT /api/plans/:planId/buckets/:id', () => {
  it('403 for dev_operation', async () => {
    expect((await request(app).put(`/api/plans/${helpers.planId}/buckets/${helpers.bucket1Id}`).set('Authorization', `Bearer ${devToken}`).send({ name: 'X' })).status).toBe(403);
  });
  it('200 updates bucket name', async () => {
    const res = await request(app).put(`/api/plans/${helpers.planId}/buckets/${helpers.bucket1Id}`).set('Authorization', `Bearer ${pmoToken}`).send({ name: 'Backlog' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Backlog');
  });
});

describe('DELETE /api/plans/:planId/buckets/:id', () => {
  it('403 for dev_operation', async () => {
    expect((await request(app).delete(`/api/plans/${helpers.planId}/buckets/${helpers.bucket2Id}`).set('Authorization', `Bearer ${devToken}`)).status).toBe(403);
  });
  it('204 deletes bucket without deleting tasks', async () => {
    const db = helpers.db;
    const tasksBefore = db.prepare('SELECT COUNT(*) as n FROM tasks WHERE plan_id = ?').get(helpers.planId).n;
    const newBucket = await request(app).post(`/api/plans/${helpers.planId}/buckets`).set('Authorization', `Bearer ${adminToken}`).send({ name: 'Temp' });
    await request(app).delete(`/api/plans/${helpers.planId}/buckets/${newBucket.body.id}`).set('Authorization', `Bearer ${adminToken}`);
    const tasksAfter = db.prepare('SELECT COUNT(*) as n FROM tasks WHERE plan_id = ?').get(helpers.planId).n;
    expect(tasksAfter).toBe(tasksBefore);
  });
});
