require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const fs       = require('fs');
const path     = require('path');

const SCHEMA = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');

const setupTestDb = () => {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);

  const hash = (p) => bcrypt.hashSync(p, 10);
  db.prepare('INSERT INTO users (email, display_name, password, role) VALUES (?, ?, ?, ?)').run('admin@company.com', 'IT Manager',  hash('password123'), 'it_manager');
  db.prepare('INSERT INTO users (email, display_name, password, role) VALUES (?, ?, ?, ?)').run('pmo@company.com',   'PMO User',    hash('password123'), 'pmo');
  db.prepare('INSERT INTO users (email, display_name, password, role) VALUES (?, ?, ?, ?)').run('dev@company.com',   'Dev Operator',hash('password123'), 'dev_operation');

  const admin = db.prepare("SELECT id FROM users WHERE email = 'admin@company.com'").get();
  const pmo   = db.prepare("SELECT id FROM users WHERE email = 'pmo@company.com'").get();
  const dev   = db.prepare("SELECT id FROM users WHERE email = 'dev@company.com'").get();

  db.prepare("INSERT INTO plans (name, source, owner_id, progress, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)").run('Test Plan', 'IT', pmo.id, 0, '2026-01-01', '2026-12-31', 'on_track');
  const plan = db.prepare("SELECT id FROM plans WHERE name = 'Test Plan'").get();

  db.prepare('INSERT INTO buckets (plan_id, name, "order") VALUES (?, ?, ?)').run(plan.id, 'To Do', 0);
  db.prepare('INSERT INTO buckets (plan_id, name, "order") VALUES (?, ?, ?)').run(plan.id, 'Done',  1);
  const b1 = db.prepare("SELECT id FROM buckets WHERE plan_id = ? AND name = 'To Do'").get(plan.id);
  const b2 = db.prepare("SELECT id FROM buckets WHERE plan_id = ? AND name = 'Done'").get(plan.id);

  db.prepare('INSERT INTO tasks (plan_id, name, assigned_to, bucket_id, "order") VALUES (?, ?, ?, ?, ?)').run(plan.id, 'Task One', dev.id,  b1.id, 0);
  db.prepare('INSERT INTO tasks (plan_id, name, assigned_to, bucket_id, "order") VALUES (?, ?, ?, ?, ?)').run(plan.id, 'Task Two', pmo.id, b2.id, 1);
  const t1 = db.prepare("SELECT id FROM tasks WHERE name = 'Task One'").get();
  const t2 = db.prepare("SELECT id FROM tasks WHERE name = 'Task Two'").get();

  return { db, adminId: admin.id, pmoId: pmo.id, devId: dev.id, planId: plan.id, bucket1Id: b1.id, bucket2Id: b2.id, task1Id: t1.id, task2Id: t2.id };
};

const makeToken = (user) =>
  jwt.sign({ id: user.id, display_name: user.display_name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

module.exports = { setupTestDb, makeToken };
