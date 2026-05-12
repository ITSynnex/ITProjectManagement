const db = require('../../config/db');

const list = () =>
  db.prepare('SELECT * FROM plan_health ORDER BY sort_order ASC, name ASC').all();

const listActive = () =>
  db.prepare('SELECT * FROM plan_health WHERE is_active = 1 ORDER BY sort_order ASC, name ASC').all();

const create = ({ name, label, color = 'default', sort_order = 0 }) => {
  if (!name?.trim())  return { error: 'Health name is required' };
  if (!label?.trim()) return { error: 'Health label is required' };
  const existing = db.prepare('SELECT id FROM plan_health WHERE LOWER(name) = LOWER(?)').get(name.trim());
  if (existing) return { error: 'Health name already exists' };
  const result = db.prepare(
    'INSERT INTO plan_health (name, label, color, sort_order) VALUES (?, ?, ?, ?)'
  ).run(name.trim(), label.trim(), color, sort_order);
  return db.prepare('SELECT * FROM plan_health WHERE id = ?').get(result.lastInsertRowid);
};

const update = (id, { name, label, color, sort_order, is_active }) => {
  const row = db.prepare('SELECT id FROM plan_health WHERE id = ?').get(id);
  if (!row) return { error: 'Health not found', status: 404 };
  if (name !== undefined) {
    const existing = db.prepare('SELECT id FROM plan_health WHERE LOWER(name) = LOWER(?) AND id != ?').get(name.trim(), id);
    if (existing) return { error: 'Health name already exists' };
  }
  const fields = [];
  const values = [];
  if (name       !== undefined) { fields.push('name = ?');       values.push(name.trim()); }
  if (label      !== undefined) { fields.push('label = ?');      values.push(label.trim()); }
  if (color      !== undefined) { fields.push('color = ?');      values.push(color); }
  if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
  if (is_active  !== undefined) { fields.push('is_active = ?');  values.push(is_active ? 1 : 0); }
  if (fields.length) {
    db.prepare(`UPDATE plan_health SET ${fields.join(', ')} WHERE id = ?`).run(...values, id);
  }
  return db.prepare('SELECT * FROM plan_health WHERE id = ?').get(id);
};

const remove = (id) => {
  const row = db.prepare('SELECT id FROM plan_health WHERE id = ?').get(id);
  if (!row) return { error: 'Health not found', status: 404 };
  db.prepare('DELETE FROM plan_health WHERE id = ?').run(id);
  return { ok: true };
};

module.exports = { list, listActive, create, update, remove };
