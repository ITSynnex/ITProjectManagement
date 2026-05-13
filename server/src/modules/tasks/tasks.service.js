const db = require('../../config/db');
const { recalcProgress } = require('../plans/plans.service');

const taskWithAssignee = (id) =>
  db.prepare(`
    SELECT t.*, u.display_name as assignee_name, u.avatar_url as assignee_avatar,
           b.name as bucket_name,
           op.name as operator_name
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assigned_to
    LEFT JOIN buckets b ON b.id = t.bucket_id
    LEFT JOIN operators op ON op.id = t.assigned_operator_id
    WHERE t.id = ?
  `).get(id);

const deriveStatus = (task, today = new Date().toISOString().slice(0, 10)) => {
  if (task.is_completed) return 'completed';
  if (task.finish_date && task.finish_date < today && task.status !== 'blocked') return 'delayed';
  return task.status || 'in_progress';
};

const listByPlan = (planId, filters = {}) => {
  const conditions = ['t.plan_id = ?'];
  const params = [planId];

  if (filters.assigned_to) { conditions.push('t.assigned_to = ?'); params.push(filters.assigned_to); }
  if (filters.bucket_id)   { conditions.push('t.bucket_id = ?');   params.push(filters.bucket_id); }
  if (filters.search)      { conditions.push("t.name LIKE ?");      params.push(`%${filters.search}%`); }
  if (filters.start_date)  { conditions.push('t.start_date >= ?');  params.push(filters.start_date); }
  if (filters.finish_date) { conditions.push('t.finish_date <= ?'); params.push(filters.finish_date); }

  return db.prepare(`
    SELECT t.*, u.display_name as assignee_name, u.avatar_url as assignee_avatar,
           b.name as bucket_name,
           op.name as operator_name
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assigned_to
    LEFT JOIN buckets b ON b.id = t.bucket_id
    LEFT JOIN operators op ON op.id = t.assigned_operator_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY t."order" ASC
  `).all(...params);
};

const create = (planId, data) => {
  const { name, assigned_to, bucket_id, start_date, finish_date } = data;
  const maxOrder = db.prepare('SELECT MAX("order") as m FROM tasks WHERE plan_id = ?').get(planId).m ?? -1;
  const result = db.prepare(
    'INSERT INTO tasks (plan_id, name, assigned_to, bucket_id, start_date, finish_date, "order") VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(planId, name, assigned_to || null, bucket_id || null, start_date || null, finish_date || null, maxOrder + 1);
  recalcProgress(planId);
  return taskWithAssignee(result.lastInsertRowid);
};

const update = (id, data, userRole) => {
  if (!['it_manager', 'pmo'].includes(userRole)) return { error: 'Forbidden', status: 403 };
  const task = db.prepare('SELECT id, plan_id FROM tasks WHERE id = ?').get(id);
  if (!task) return { error: 'Task not found', status: 404 };

  const allowed = ['name','assigned_to','assigned_operator_id','bucket_id','start_date','finish_date','is_completed','status','progress','notes','"order"'];
  const fields = Object.keys(data).filter(f => allowed.includes(f) || f === 'order');
  const dbFields = fields.map(f => f === 'order' ? '"order"' : f);

  if (fields.length) {
    const sql = `UPDATE tasks SET ${dbFields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...fields.map(f => data[f]), id);
  }
  if ('is_completed' in data) recalcProgress(task.plan_id);
  return taskWithAssignee(id);
};

const toggleComplete = (id, userRole) => {
  if (!['it_manager', 'pmo'].includes(userRole)) return { error: 'Forbidden', status: 403 };
  const task = db.prepare('SELECT id, plan_id, is_completed FROM tasks WHERE id = ?').get(id);
  if (!task) return { error: 'Task not found', status: 404 };
  const newVal = task.is_completed ? 0 : 1;
  db.prepare('UPDATE tasks SET is_completed = ? WHERE id = ?').run(newVal, id);
  recalcProgress(task.plan_id);
  return taskWithAssignee(id);
};

const remove = (id, userRole) => {
  if (!['it_manager', 'pmo'].includes(userRole)) return { error: 'Forbidden', status: 403 };
  const task = db.prepare('SELECT id, plan_id FROM tasks WHERE id = ?').get(id);
  if (!task) return { error: 'Task not found', status: 404 };
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  recalcProgress(task.plan_id);
  return { ok: true };
};

module.exports = { listByPlan, create, update, toggleComplete, remove };
