const db = require('../../config/db');

const list = () =>
  db.prepare(`
    SELECT p.*, COUNT(t.id) as task_count
    FROM projects p
    LEFT JOIN tasks t ON t.project_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all();

const getById = (id) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!project) return null;
  project.tasks = db.prepare(`
    SELECT t.*, u.name as assignee_name
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assigned_to
    WHERE t.project_id = ?
    ORDER BY t.created_at ASC
  `).all(id);
  return project;
};

const create = (data, userId) => {
  const { title, description, priority, deadline } = data;
  const result = db.prepare(
    'INSERT INTO projects (title, description, priority, deadline, created_by) VALUES (?, ?, ?, ?, ?)'
  ).run(title, description || null, priority, deadline || null, userId);
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
};

const update = (id, data) => {
  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(id);
  if (!project) return null;
  const fields = ['title', 'description', 'priority', 'status', 'deadline'];
  const updates = fields.filter(f => data[f] !== undefined);
  if (!updates.length) return getById(id);
  const sql = `UPDATE projects SET ${updates.map(f => `${f} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ?`;
  db.prepare(sql).run(...updates.map(f => data[f]), id);
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
};

const remove = (id) => {
  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(id);
  if (!project) return false;
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return true;
};

module.exports = { list, getById, create, update, remove };
