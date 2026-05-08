const db = require('../../config/db');

const list = () =>
  db.prepare('SELECT * FROM departments ORDER BY name ASC').all();

const listActive = () =>
  db.prepare("SELECT * FROM departments WHERE status = 'active' ORDER BY name ASC").all();

const getById = (id) =>
  db.prepare('SELECT * FROM departments WHERE id = ?').get(id);

const create = ({ name, status = 'active' }) => {
  if (!name?.trim()) return { error: 'name is required' };
  const existing = db.prepare('SELECT id FROM departments WHERE LOWER(name) = LOWER(?)').get(name.trim());
  if (existing) return { error: 'Department name already exists' };
  const result = db.prepare(
    "INSERT INTO departments (name, status) VALUES (?, ?)"
  ).run(name.trim(), status);
  return db.prepare('SELECT * FROM departments WHERE id = ?').get(result.lastInsertRowid);
};

const update = (id, { name, status }) => {
  const dept = db.prepare('SELECT id FROM departments WHERE id = ?').get(id);
  if (!dept) return { error: 'Department not found', status: 404 };
  if (name !== undefined) {
    const existing = db.prepare('SELECT id FROM departments WHERE LOWER(name) = LOWER(?) AND id != ?').get(name.trim(), id);
    if (existing) return { error: 'Department name already exists' };
  }
  const fields = [];
  const values = [];
  if (name !== undefined) { fields.push('name = ?'); values.push(name.trim()); }
  if (status !== undefined) { fields.push('status = ?'); values.push(status); }
  if (fields.length) {
    db.prepare(`UPDATE departments SET ${fields.join(', ')} WHERE id = ?`).run(...values, id);
  }
  return db.prepare('SELECT * FROM departments WHERE id = ?').get(id);
};

const remove = (id) => {
  const dept = db.prepare('SELECT id FROM departments WHERE id = ?').get(id);
  if (!dept) return { error: 'Department not found', status: 404 };
  const inUse = db.prepare('SELECT COUNT(*) as n FROM plans WHERE department_id = ?').get(id).n;
  if (inUse > 0) return { error: 'Department is in use by projects', status: 400 };
  db.prepare('DELETE FROM departments WHERE id = ?').run(id);
  return { ok: true };
};

module.exports = { list, listActive, getById, create, update, remove };
