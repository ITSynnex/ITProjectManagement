const db = require('../../config/db');

const list = () =>
  db.prepare('SELECT * FROM plan_statuses ORDER BY sort_order ASC, name ASC').all();

const listActive = () =>
  db.prepare('SELECT * FROM plan_statuses WHERE is_active = 1 ORDER BY sort_order ASC, name ASC').all();

const create = ({ name, label, color = 'default', sort_order = 0, bucket }) => {
  if (!name?.trim())  return { error: 'Status name is required' };
  if (!label?.trim()) return { error: 'Status label is required' };
  const existing = db.prepare('SELECT id FROM plan_statuses WHERE LOWER(name) = LOWER(?)').get(name.trim());
  if (existing) return { error: 'Status name already exists' };
  const result = db.prepare(
    'INSERT INTO plan_statuses (name, label, color, sort_order, bucket) VALUES (?, ?, ?, ?, ?)'
  ).run(name.trim(), label.trim(), color, sort_order, bucket?.trim() || null);
  return db.prepare('SELECT * FROM plan_statuses WHERE id = ?').get(result.lastInsertRowid);
};

const update = (id, { name, label, color, sort_order, is_active, bucket }) => {
  const row = db.prepare('SELECT id FROM plan_statuses WHERE id = ?').get(id);
  if (!row) return { error: 'Status not found', status: 404 };
  if (name !== undefined) {
    const existing = db.prepare('SELECT id FROM plan_statuses WHERE LOWER(name) = LOWER(?) AND id != ?').get(name.trim(), id);
    if (existing) return { error: 'Status name already exists' };
  }
  const fields = [];
  const values = [];
  if (name       !== undefined) { fields.push('name = ?');       values.push(name.trim()); }
  if (label      !== undefined) { fields.push('label = ?');      values.push(label.trim()); }
  if (color      !== undefined) { fields.push('color = ?');      values.push(color); }
  if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
  if (is_active  !== undefined) { fields.push('is_active = ?');  values.push(is_active ? 1 : 0); }
  if (bucket     !== undefined) { fields.push('bucket = ?');     values.push(bucket?.trim() || null); }
  if (fields.length) {
    db.prepare(`UPDATE plan_statuses SET ${fields.join(', ')} WHERE id = ?`).run(...values, id);
  }
  return db.prepare('SELECT * FROM plan_statuses WHERE id = ?').get(id);
};

const remove = (id) => {
  const row = db.prepare('SELECT id FROM plan_statuses WHERE id = ?').get(id);
  if (!row) return { error: 'Status not found', status: 404 };
  db.prepare('DELETE FROM plan_statuses WHERE id = ?').run(id);
  return { ok: true };
};

module.exports = { list, listActive, create, update, remove };
