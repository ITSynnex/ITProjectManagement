const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const { sign } = require('../../config/jwt');

const login = (email, password) => {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) return null;
  const { password: _, ...safeUser } = user;
  const token = sign({ id: user.id, display_name: user.display_name, email: user.email, role: user.role, avatar_url: user.avatar_url });
  return { token, user: safeUser };
};

const getById = (id) =>
  db.prepare('SELECT id, email, display_name, role, avatar_url, created_at FROM users WHERE id = ?').get(id) || null;

module.exports = { login, getById };
