const bcrypt = require('bcryptjs');
const db = require('../../config/db');

const list = () =>
  db.prepare('SELECT id, email, display_name, role, avatar_url, created_at FROM users ORDER BY created_at ASC').all();

const create = (email, display_name, password, role, avatar_url) => {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return { error: 'Email already exists' };
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (email, display_name, password, role, avatar_url) VALUES (?, ?, ?, ?, ?)'
  ).run(email, display_name, hash, role, avatar_url || null);
  return db.prepare('SELECT id, email, display_name, role, avatar_url, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
};

const remove = (id) => {
  const managerCount = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'it_manager'").get().cnt;
  const target = db.prepare('SELECT role FROM users WHERE id = ?').get(id);
  if (!target) return { error: 'User not found', status: 404 };
  if (target.role === 'it_manager' && managerCount <= 1)
    return { error: 'Cannot delete the last IT Manager', status: 400 };
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return { ok: true };
};

module.exports = { list, create, remove };
