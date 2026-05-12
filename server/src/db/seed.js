require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const hash = (p) => bcrypt.hashSync(p, 10);

// Users
const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (email, display_name, password, role) VALUES (?, ?, ?, ?)'
);
insertUser.run('admin@company.com', 'IT Manager',    hash('password123'), 'it_manager');
insertUser.run('pmo@company.com',   'PMO User',      hash('password123'), 'pmo');
insertUser.run('dev@company.com',   'Dev Operator',  hash('password123'), 'dev_operation');

const admin = db.prepare("SELECT id FROM users WHERE email = 'admin@company.com'").get();
const pmo   = db.prepare("SELECT id FROM users WHERE email = 'pmo@company.com'").get();
const dev   = db.prepare("SELECT id FROM users WHERE email = 'dev@company.com'").get();

// Plan Health
const insertHealth = db.prepare('INSERT OR IGNORE INTO plan_health (name, label, color, sort_order) VALUES (?, ?, ?, ?)');
[
  ['on_track',  'On Track',  'on_track',         1],
  ['at_risk',   'At Risk',   'at_risk',           2],
  ['off_track', 'Off Track', 'off_track',         3],
  ['critical',  'Critical',  'priority_critical', 4],
  ['n_a',       'N/A',       'default',           5],
].forEach(row => insertHealth.run(...row));

// Plan Statuses
const insertStatus = db.prepare('INSERT OR IGNORE INTO plan_statuses (name, label, color, sort_order) VALUES (?, ?, ?, ?)');
[
  ['not_started', 'Not Started', 'not_started', 1],
  ['ongoing',     'Ongoing',     'ongoing',     2],
  ['on_track',    'On Track',    'on_track',    3],
  ['at_risk',     'At Risk',     'at_risk',     4],
  ['completed',   'Completed',   'completed',   5],
  ['suspended',   'Suspended',   'suspended',   6],
  ['closed',      'Closed',      'closed',      7],
].forEach(row => insertStatus.run(...row));

// Teams
const insertTeam = db.prepare("INSERT OR IGNORE INTO teams (name, color) VALUES (?, ?)");
[
  ['DEV1',    'indigo'],
  ['DEV2',    'green'],
  ['AI',      'purple'],
  ['PRODUCT', 'rose'],
  ['NETWORK', 'cyan'],
  ['SYSTEM',  'orange'],
  ['SUPPORT', 'yellow'],
].forEach(([name, color]) => insertTeam.run(name, color));

// Plans (with team field)
const insertPlan = db.prepare(
  "INSERT OR IGNORE INTO plans (name, team, owner_id, progress, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
);
insertPlan.run('Q2 Network Infrastructure', 'NETWORK', pmo.id,   40, '2026-04-01', '2026-06-30', 'on_track');
insertPlan.run('Website Redesign',          'DEV1',    pmo.id,   20, '2026-05-01', '2026-07-31', 'at_risk');
insertPlan.run('AI Chatbot Integration',    'AI',      admin.id, 10, '2026-05-15', '2026-08-31', 'on_track');
insertPlan.run('DevOps Pipeline Setup',     'DEV2',    admin.id,  0, '2026-06-01', '2026-09-30', 'on_track');
insertPlan.run('Product Roadmap Q3',        'PRODUCT', pmo.id,   60, '2026-04-01', '2026-09-30', 'on_track');

const plan1 = db.prepare("SELECT id FROM plans WHERE name = 'Q2 Network Infrastructure'").get();
const plan2 = db.prepare("SELECT id FROM plans WHERE name = 'Website Redesign'").get();
const plan3 = db.prepare("SELECT id FROM plans WHERE name = 'AI Chatbot Integration'").get();
const plan4 = db.prepare("SELECT id FROM plans WHERE name = 'DevOps Pipeline Setup'").get();
const plan5 = db.prepare("SELECT id FROM plans WHERE name = 'Product Roadmap Q3'").get();

// Buckets
const insertBucket = db.prepare(
  'INSERT OR IGNORE INTO buckets (plan_id, name, "order") VALUES (?, ?, ?)'
);

for (const planId of [plan1.id, plan2.id, plan3.id, plan4.id, plan5.id]) {
  insertBucket.run(planId, 'To Do',       0);
  insertBucket.run(planId, 'In Progress', 1);
  insertBucket.run(planId, 'Done',        2);
}

const getBucket = (planId, name) =>
  db.prepare("SELECT id FROM buckets WHERE plan_id = ? AND name = ?").get(planId, name);

const p1todo = getBucket(plan1.id, 'To Do');
const p1prog = getBucket(plan1.id, 'In Progress');
const p1done = getBucket(plan1.id, 'Done');
const p2todo = getBucket(plan2.id, 'To Do');
const p2prog = getBucket(plan2.id, 'In Progress');
const p3todo = getBucket(plan3.id, 'To Do');
const p4todo = getBucket(plan4.id, 'To Do');
const p5todo = getBucket(plan5.id, 'To Do');
const p5done = getBucket(plan5.id, 'Done');

// Tasks
const insertTask = db.prepare(
  'INSERT OR IGNORE INTO tasks (plan_id, name, assigned_to, bucket_id, start_date, finish_date, is_completed, "order") VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);

// Plan 1 — NETWORK
insertTask.run(plan1.id, 'Audit current network topology',  dev.id,   p1done.id, '2026-04-01', '2026-04-10', 1, 0);
insertTask.run(plan1.id, 'Design new network architecture', pmo.id,   p1prog.id, '2026-04-11', '2026-04-25', 0, 1);
insertTask.run(plan1.id, 'Procure network hardware',        admin.id, p1todo.id, '2026-04-20', '2026-05-15', 0, 2);
insertTask.run(plan1.id, 'Deploy new switches/routers',     dev.id,   p1todo.id, '2026-05-16', '2026-06-01', 0, 3);

// Plan 2 — DEV1
insertTask.run(plan2.id, 'Gather requirements',             pmo.id,   p2prog.id, '2026-05-01', '2026-05-10', 0, 0);
insertTask.run(plan2.id, 'Create wireframes',               dev.id,   p2todo.id, '2026-05-11', '2026-05-25', 0, 1);
insertTask.run(plan2.id, 'Develop homepage',                dev.id,   p2todo.id, '2026-05-26', '2026-06-15', 0, 2);

// Plan 3 — AI
insertTask.run(plan3.id, 'Define use cases',                pmo.id,   p3todo.id, '2026-05-15', '2026-05-31', 0, 0);
insertTask.run(plan3.id, 'Select LLM provider',             admin.id, p3todo.id, '2026-06-01', '2026-06-15', 0, 1);

// Plan 4 — DEV2
insertTask.run(plan4.id, 'Setup CI/CD pipeline',            dev.id,   p4todo.id, '2026-06-01', '2026-06-30', 0, 0);
insertTask.run(plan4.id, 'Configure staging environment',   dev.id,   p4todo.id, '2026-07-01', '2026-07-31', 0, 1);

// Plan 5 — PRODUCT
insertTask.run(plan5.id, 'Define Q3 features',              pmo.id,   p5done.id, '2026-04-01', '2026-04-15', 1, 0);
insertTask.run(plan5.id, 'Stakeholder review',              admin.id, p5done.id, '2026-04-16', '2026-04-30', 1, 1);
insertTask.run(plan5.id, 'Prioritize backlog',              pmo.id,   p5todo.id, '2026-05-01', '2026-05-15', 0, 2);

console.log('Seed complete');
