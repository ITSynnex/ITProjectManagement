const request = require('supertest');
const { makeToken } = require('./testHelpers');

jest.mock('../config/db', () => {
  const { setupTestDb } = require('./testHelpers');
  const h = setupTestDb();
  global.__tasksTestIds = h;
  return h.db;
});

const app = require('../app');

let adminToken, pmoToken, devToken, helpers;

beforeAll(() => {
  helpers    = global.__tasksTestIds;
  adminToken = makeToken({ id: helpers.adminId, display_name: 'IT Manager',  email: 'admin@company.com', role: 'it_manager' });
  pmoToken   = makeToken({ id: helpers.pmoId,   display_name: 'PMO User',    email: 'pmo@company.com',   role: 'pmo' });
  devToken   = makeToken({ id: helpers.devId,   display_name: 'Dev Operator',email: 'dev@company.com',   role: 'dev_operation' });
});

describe('GET /api/plans/:planId/tasks', () => {
  it('401 without token', async () => { expect((await request(app).get('/api/plans/1/tasks')).status).toBe(401); });
  it('200 for all roles', async () => {
    for (const tok of [adminToken, pmoToken, devToken]) {
      const res = await request(app).get(`/api/plans/${helpers.planId}/tasks`).set('Authorization', `Bearer ${tok}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
  it('filters by search param', async () => {
    const res = await request(app).get(`/api/plans/${helpers.planId}/tasks?search=Task One`).set('Authorization', `Bearer ${pmoToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every(t => t.name.includes('Task One'))).toBe(true);
  });
});

describe('POST /api/plans/:planId/tasks', () => {
  it('403 for dev_operation', async () => {
    expect((await request(app).post(`/api/plans/${helpers.planId}/tasks`).set('Authorization', `Bearer ${devToken}`).send({ name: 'X' })).status).toBe(403);
  });
  it('400 for missing name', async () => {
    expect((await request(app).post(`/api/plans/${helpers.planId}/tasks`).set('Authorization', `Bearer ${pmoToken}`).send({})).status).toBe(400);
  });
  it('201 creates task', async () => {
    const res = await request(app).post(`/api/plans/${helpers.planId}/tasks`).set('Authorization', `Bearer ${pmoToken}`).send({ name: 'New Task', bucket_id: helpers.bucket1Id });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New Task');
  });
});

describe('PUT /api/tasks/:id', () => {
  it('403 for dev_operation', async () => {
    expect((await request(app).put(`/api/tasks/${helpers.task1Id}`).set('Authorization', `Bearer ${devToken}`).send({ name: 'X' })).status).toBe(403);
  });
  it('404 for unknown task', async () => {
    expect((await request(app).put('/api/tasks/9999').set('Authorization', `Bearer ${pmoToken}`).send({ name: 'X' })).status).toBe(404);
  });
  it('200 updates task', async () => {
    const res = await request(app).put(`/api/tasks/${helpers.task1Id}`).set('Authorization', `Bearer ${pmoToken}`).send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
  });
});

describe('PATCH /api/tasks/:id/complete', () => {
  it('403 for dev_operation', async () => {
    expect((await request(app).patch(`/api/tasks/${helpers.task1Id}/complete`).set('Authorization', `Bearer ${devToken}`)).status).toBe(403);
  });
  it('toggles 0→1', async () => {
    const res = await request(app).patch(`/api/tasks/${helpers.task2Id}/complete`).set('Authorization', `Bearer ${pmoToken}`);
    expect(res.status).toBe(200);
    expect(res.body.is_completed).toBe(1);
  });
  it('toggles 1→0', async () => {
    // task2 is already 1 from previous test; one more patch brings it back to 0
    const res = await request(app).patch(`/api/tasks/${helpers.task2Id}/complete`).set('Authorization', `Bearer ${pmoToken}`);
    expect(res.body.is_completed).toBe(0);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('403 for dev_operation', async () => {
    expect((await request(app).delete(`/api/tasks/${helpers.task1Id}`).set('Authorization', `Bearer ${devToken}`)).status).toBe(403);
  });
  it('204 deletes task', async () => {
    const created = await request(app).post(`/api/plans/${helpers.planId}/tasks`).set('Authorization', `Bearer ${pmoToken}`).send({ name: 'ToDelete' });
    expect((await request(app).delete(`/api/tasks/${created.body.id}`).set('Authorization', `Bearer ${adminToken}`)).status).toBe(204);
  });
});
