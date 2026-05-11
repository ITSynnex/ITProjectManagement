const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/app.db');
const SCHEMA_PATH = path.join(__dirname, '../db/schema.sql');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

// Safe migration: add new columns if they don't exist yet
const migrations = [
  "ALTER TABLE tasks ADD COLUMN status TEXT NOT NULL DEFAULT 'in_progress'",
  "ALTER TABLE tasks ADD COLUMN progress INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE tasks ADD COLUMN notes TEXT",
  "ALTER TABLE plans ADD COLUMN team TEXT",
  "ALTER TABLE plans ADD COLUMN department_id INTEGER",
  "ALTER TABLE plans ADD COLUMN operator_id INTEGER",
  "ALTER TABLE plans ADD COLUMN priority TEXT",
  "ALTER TABLE tasks ADD COLUMN assigned_operator_id INTEGER",
];
for (const sql of migrations) {
  try { db.exec(sql); } catch (_) { /* column already exists */ }
}

// Migration: create teams table if it doesn't exist
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      color      TEXT NOT NULL DEFAULT 'indigo',
      status     TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
} catch (e) { console.error('teams table migration error:', e.message); }

// Migration: seed default teams if table is empty
try {
  const count = db.prepare('SELECT COUNT(*) as n FROM teams').get();
  if (count.n === 0) {
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
  }
} catch (e) { console.error('teams seed migration error:', e.message); }

// Migration: remove CHECK constraints on plans.team and plans.status
try {
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='plans'").get();
  if (tableInfo && (tableInfo.sql.includes("CHECK(team IN") || tableInfo.sql.includes("CHECK(status IN"))) {
    db.pragma('foreign_keys = OFF');
    db.exec(`
      CREATE TABLE plans_new (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT NOT NULL,
        source        TEXT,
        team          TEXT,
        owner_id      INTEGER NOT NULL REFERENCES users(id),
        progress      INTEGER NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
        start_date    TEXT,
        end_date      TEXT,
        status        TEXT,
        operator_id   INTEGER REFERENCES operators(id),
        priority      TEXT CHECK(priority IN ('low','medium','high','critical')),
        department_id INTEGER REFERENCES departments(id),
        created_at    TEXT DEFAULT (datetime('now'))
      );
      INSERT INTO plans_new SELECT id, name, source, team, owner_id, progress, start_date, end_date, status, operator_id, priority, department_id, created_at FROM plans;
      DROP TABLE plans;
      ALTER TABLE plans_new RENAME TO plans;
    `);
    db.pragma('foreign_keys = ON');
  }
} catch (e) { console.error('plans constraint migration error:', e.message); }

// Migration: create plan_statuses table and seed if empty
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS plan_statuses (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      label      TEXT NOT NULL,
      color      TEXT NOT NULL DEFAULT 'default',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active  INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  const count = db.prepare('SELECT COUNT(*) as n FROM plan_statuses').get();
  if (count.n === 0) {
    const ins = db.prepare('INSERT OR IGNORE INTO plan_statuses (name, label, color, sort_order) VALUES (?, ?, ?, ?)');
    [
      ['not_started', 'Not Started', 'not_started', 1],
      ['ongoing',     'Ongoing',     'ongoing',     2],
      ['on_track',    'On Track',    'on_track',    3],
      ['at_risk',     'At Risk',     'at_risk',     4],
      ['completed',   'Completed',   'completed',   5],
      ['suspended',   'Suspended',   'suspended',   6],
      ['closed',      'Closed',      'closed',      7],
    ].forEach(row => ins.run(...row));
  }
} catch (e) { console.error('plan_statuses migration error:', e.message); }

module.exports = db;
