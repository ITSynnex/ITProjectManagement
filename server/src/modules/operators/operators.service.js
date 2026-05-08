const db = require('../../config/db');

const list = () =>
  db.prepare('SELECT * FROM operators ORDER BY name ASC').all();

const listActive = () =>
  db.prepare("SELECT * FROM operators WHERE status = 'active' ORDER BY name ASC").all();

const create = ({ name, status = 'active' }) => {
  if (!name?.trim()) return { error: 'Operator name is required' };
  const existing = db.prepare('SELECT id FROM operators WHERE LOWER(name) = LOWER(?)').get(name.trim());
  if (existing) return { error: 'Operator name already exists' };
  const result = db.prepare(
    'INSERT INTO operators (name, status) VALUES (?, ?)'
  ).run(name.trim(), status);
  return db.prepare('SELECT * FROM operators WHERE id = ?').get(result.lastInsertRowid);
};

const update = (id, { name, status }) => {
  const op = db.prepare('SELECT id FROM operators WHERE id = ?').get(id);
  if (!op) return { error: 'Operator not found', status: 404 };
  if (name !== undefined) {
    const existing = db.prepare('SELECT id FROM operators WHERE LOWER(name) = LOWER(?) AND id != ?').get(name.trim(), id);
    if (existing) return { error: 'Operator name already exists' };
  }
  const fields = [];
  const values = [];
  if (name   !== undefined) { fields.push('name = ?');   values.push(name.trim()); }
  if (status !== undefined) { fields.push('status = ?'); values.push(status); }
  if (fields.length) {
    db.prepare(`UPDATE operators SET ${fields.join(', ')} WHERE id = ?`).run(...values, id);
  }
  return db.prepare('SELECT * FROM operators WHERE id = ?').get(id);
};

const remove = (id) => {
  const op = db.prepare('SELECT id FROM operators WHERE id = ?').get(id);
  if (!op) return { error: 'Operator not found', status: 404 };
  db.prepare('DELETE FROM operators WHERE id = ?').run(id);
  return { ok: true };
};

module.exports = { list, listActive, create, update, remove };
