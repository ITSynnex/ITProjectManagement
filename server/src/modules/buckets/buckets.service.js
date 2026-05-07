const db = require('../../config/db');

const listByPlan = (planId) =>
  db.prepare('SELECT * FROM buckets WHERE plan_id = ? ORDER BY "order" ASC').all(planId);

const create = (planId, name) => {
  const maxOrder = db.prepare('SELECT MAX("order") as m FROM buckets WHERE plan_id = ?').get(planId).m ?? -1;
  const result = db.prepare('INSERT INTO buckets (plan_id, name, "order") VALUES (?, ?, ?)').run(planId, name, maxOrder + 1);
  return db.prepare('SELECT * FROM buckets WHERE id = ?').get(result.lastInsertRowid);
};

const update = (id, data) => {
  const bucket = db.prepare('SELECT id FROM buckets WHERE id = ?').get(id);
  if (!bucket) return null;
  const fields = ['name','"order"'].filter((_, i) => [data.name, data.order][i] !== undefined);
  const vals   = [data.name, data.order].filter(v => v !== undefined);
  if (fields.length) db.prepare(`UPDATE buckets SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`).run(...vals, id);
  return db.prepare('SELECT * FROM buckets WHERE id = ?').get(id);
};

const remove = (id) => {
  const bucket = db.prepare('SELECT id FROM buckets WHERE id = ?').get(id);
  if (!bucket) return false;
  db.prepare('DELETE FROM buckets WHERE id = ?').run(id);
  return true;
};

module.exports = { listByPlan, create, update, remove };
