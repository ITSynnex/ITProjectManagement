const db = require('../../config/db');

const recalcProgress = (planId) => {
  const total     = db.prepare('SELECT COUNT(*) as n FROM tasks WHERE plan_id = ?').get(planId).n;
  const completed = db.prepare('SELECT COUNT(*) as n FROM tasks WHERE plan_id = ? AND is_completed = 1').get(planId).n;
  const progress  = total === 0 ? 0 : Math.round((completed / total) * 100);
  db.prepare('UPDATE plans SET progress = ? WHERE id = ?').run(progress, planId);
  return progress;
};

const list = () =>
  db.prepare(`
    SELECT p.*, u.display_name as owner_name, u.avatar_url as owner_avatar
    FROM plans p
    JOIN users u ON u.id = p.owner_id
    ORDER BY p.created_at DESC
  `).all();

const getById = (id) => {
  const plan = db.prepare(`
    SELECT p.*, u.display_name as owner_name, u.avatar_url as owner_avatar
    FROM plans p JOIN users u ON u.id = p.owner_id
    WHERE p.id = ?
  `).get(id);
  if (!plan) return null;

  plan.buckets = db.prepare('SELECT * FROM buckets WHERE plan_id = ? ORDER BY "order" ASC').all(id);
  plan.tasks = db.prepare(`
    SELECT t.*, u.display_name as assignee_name, u.avatar_url as assignee_avatar
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assigned_to
    WHERE t.plan_id = ?
    ORDER BY t."order" ASC
  `).all(id);
  return plan;
};

const create = (data, userId) => {
  const { name, team, start_date, end_date, status, owner_id } = data;
  const resolvedOwner = owner_id || userId;
  const result = db.prepare(
    'INSERT INTO plans (name, team, owner_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, team || null, resolvedOwner, start_date || null, end_date || null, status || null);
  return db.prepare(`
    SELECT p.*, u.display_name as owner_name, u.avatar_url as owner_avatar
    FROM plans p JOIN users u ON u.id = p.owner_id WHERE p.id = ?
  `).get(result.lastInsertRowid);
};

const update = (id, data) => {
  const plan = db.prepare('SELECT id FROM plans WHERE id = ?').get(id);
  if (!plan) return null;
  const fields = ['name','team','progress','start_date','end_date','status'].filter(f => data[f] !== undefined);
  if (fields.length) {
    const sql = `UPDATE plans SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...fields.map(f => data[f]), id);
  }
  return db.prepare(`
    SELECT p.*, u.display_name as owner_name, u.avatar_url as owner_avatar
    FROM plans p JOIN users u ON u.id = p.owner_id WHERE p.id = ?
  `).get(id);
};

const remove = (id) => {
  const plan = db.prepare('SELECT id FROM plans WHERE id = ?').get(id);
  if (!plan) return false;
  db.prepare('DELETE FROM plans WHERE id = ?').run(id);
  return true;
};

module.exports = { list, getById, create, update, remove, recalcProgress };
