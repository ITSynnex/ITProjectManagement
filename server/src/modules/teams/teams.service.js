const db = require('../../config/db');

const list = () =>
  db.prepare('SELECT * FROM teams ORDER BY name ASC').all();

const listActive = () =>
  db.prepare("SELECT * FROM teams WHERE status = 'active' ORDER BY name ASC").all();

const create = ({ name, color = 'indigo', status = 'active' }) => {
  if (!name?.trim()) return { error: 'Team name is required' };
  const existing = db.prepare('SELECT id FROM teams WHERE LOWER(name) = LOWER(?)').get(name.trim());
  if (existing) return { error: 'Team name already exists' };
  const result = db.prepare(
    'INSERT INTO teams (name, color, status) VALUES (?, ?, ?)'
  ).run(name.trim(), color, status);
  return db.prepare('SELECT * FROM teams WHERE id = ?').get(result.lastInsertRowid);
};

const update = (id, { name, color, status }) => {
  const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(id);
  if (!team) return { error: 'Team not found', status: 404 };
  if (name !== undefined) {
    const existing = db.prepare('SELECT id FROM teams WHERE LOWER(name) = LOWER(?) AND id != ?').get(name.trim(), id);
    if (existing) return { error: 'Team name already exists' };
  }
  const fields = [];
  const values = [];
  if (name   !== undefined) { fields.push('name = ?');   values.push(name.trim()); }
  if (color  !== undefined) { fields.push('color = ?');  values.push(color); }
  if (status !== undefined) { fields.push('status = ?'); values.push(status); }
  if (fields.length) {
    db.prepare(`UPDATE teams SET ${fields.join(', ')} WHERE id = ?`).run(...values, id);
  }
  return db.prepare('SELECT * FROM teams WHERE id = ?').get(id);
};

const remove = (id) => {
  const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(id);
  if (!team) return { error: 'Team not found', status: 404 };
  db.prepare('DELETE FROM teams WHERE id = ?').run(id);
  return { ok: true };
};

module.exports = { list, listActive, create, update, remove };
