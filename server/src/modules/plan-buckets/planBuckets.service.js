const db = require('../../config/db');

const getById = (id) =>
  db.prepare('SELECT * FROM plan_buckets WHERE id = ?').get(id);

const list = () =>
  db.prepare('SELECT * FROM plan_buckets ORDER BY sort_order ASC, id ASC').all();

const getActive = () =>
  db.prepare('SELECT * FROM plan_buckets WHERE is_active = 1 ORDER BY sort_order ASC, id ASC').all();

const create = ({ name, color = 'default', sort_order = 0 }) => {
  if (!name?.trim()) return { error: 'Bucket name is required' };
  const existing = db.prepare('SELECT id FROM plan_buckets WHERE LOWER(name) = LOWER(?)').get(name.trim());
  if (existing) return { error: 'Bucket name already exists' };
  const result = db.prepare(
    'INSERT INTO plan_buckets (name, color, sort_order) VALUES (?, ?, ?)'
  ).run(name.trim(), color, sort_order);
  return getById(result.lastInsertRowid);
};

const update = (id, data) => {
  const record = getById(id);
  if (!record) return { error: 'Bucket not found', status: 404 };
  const { name, color, sort_order, is_active } = data;
  const fields = [];
  const values = [];
  if (name       !== undefined) { fields.push('name = ?');       values.push(name.trim()); }
  if (color      !== undefined) { fields.push('color = ?');      values.push(color); }
  if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
  if (is_active  !== undefined) { fields.push('is_active = ?');  values.push(is_active ? 1 : 0); }
  if (fields.length) {
    db.prepare(`UPDATE plan_buckets SET ${fields.join(', ')} WHERE id = ?`).run(...values, id);
  }
  return getById(id);
};

const remove = (id) => {
  const record = getById(id);
  if (!record) return { error: 'Bucket not found', status: 404 };
  const count = db.prepare('SELECT COUNT(*) as n FROM plans WHERE bucket_id = ?').get(id).n;
  if (count > 0) return { error: `Cannot delete: ${count} project(s) use this bucket` };
  db.prepare('DELETE FROM plan_buckets WHERE id = ?').run(id);
  return { ok: true };
};

module.exports = { list, getActive, getById, create, update, remove };
