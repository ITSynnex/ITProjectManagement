const db = require('../../config/db');

const recalcProgress = (planId) => {
  const total     = db.prepare('SELECT COUNT(*) as n FROM tasks WHERE plan_id = ?').get(planId).n;
  const completed = db.prepare('SELECT COUNT(*) as n FROM tasks WHERE plan_id = ? AND is_completed = 1').get(planId).n;
  const progress  = total === 0 ? 0 : Math.round((completed / total) * 100);
  db.prepare('UPDATE plans SET progress = ? WHERE id = ?').run(progress, planId);
  return progress;
};

const COLS = `
  p.*, u.display_name as owner_name, u.avatar_url as owner_avatar,
  d.name as department_name,
  op.name as operator_name,
  tm.color as team_color,
  pb.name as bucket_name
`;

const FROM_JOINS = `
  FROM plans p
  JOIN users u ON u.id = p.owner_id
  LEFT JOIN departments d ON d.id = p.department_id
  LEFT JOIN operators op ON op.id = p.operator_id
  LEFT JOIN teams tm ON tm.name = p.team
  LEFT JOIN plan_buckets pb ON pb.id = p.bucket_id
`;

const list = () =>
  db.prepare(`
    SELECT ${COLS},
      (SELECT b.name FROM buckets b WHERE b.plan_id = p.id ORDER BY b."order" ASC LIMIT 1) as current_bucket
    ${FROM_JOINS}
    ORDER BY p.created_at DESC
  `).all();

const getById = (id) => {
  const plan = db.prepare(`SELECT ${COLS} ${FROM_JOINS} WHERE p.id = ?`).get(id);
  if (!plan) return null;

  plan.buckets = db.prepare('SELECT * FROM buckets WHERE plan_id = ? ORDER BY "order" ASC').all(id);
  plan.tasks = db.prepare(`
    SELECT tk.*, u.display_name as assignee_name, u.avatar_url as assignee_avatar
    FROM tasks tk
    LEFT JOIN users u ON u.id = tk.assigned_to
    WHERE tk.plan_id = ?
    ORDER BY tk."order" ASC
  `).all(id);
  return plan;
};

const create = (data, userId) => {
  const { name, team, start_date, end_date, status, health, owner_id, department_id, operator_id, priority, bucket_id } = data;
  const resolvedOwner = owner_id || userId;
  const result = db.prepare(
    'INSERT INTO plans (name, team, owner_id, start_date, end_date, status, health, department_id, operator_id, priority, bucket_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(name, team || null, resolvedOwner, start_date || null, end_date || null, status || null, health || null, department_id || null, operator_id || null, priority || null, bucket_id || null);
  return db.prepare(`SELECT ${COLS} ${FROM_JOINS} WHERE p.id = ?`).get(result.lastInsertRowid);
};

const update = (id, data) => {
  const plan = db.prepare('SELECT id FROM plans WHERE id = ?').get(id);
  if (!plan) return null;
  const fields = ['name','team','owner_id','progress','start_date','end_date','status','health','department_id','operator_id','priority','bucket_id'].filter(f => data[f] !== undefined);
  if (fields.length) {
    const sql = `UPDATE plans SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...fields.map(f => data[f]), id);
  }
  return db.prepare(`SELECT ${COLS} ${FROM_JOINS} WHERE p.id = ?`).get(id);
};

const remove = (id) => {
  const plan = db.prepare('SELECT id FROM plans WHERE id = ?').get(id);
  if (!plan) return false;
  db.prepare('DELETE FROM plans WHERE id = ?').run(id);
  return true;
};

const listWithTasks = () => {
  const plans = list();
  return plans.map(plan => ({
    ...plan,
    tasks: db.prepare(
      'SELECT * FROM tasks WHERE plan_id = ? ORDER BY "order" ASC'
    ).all(plan.id),
  }));
};

module.exports = { list, listWithTasks, getById, create, update, remove, recalcProgress };
