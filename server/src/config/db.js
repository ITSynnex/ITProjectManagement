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
];
for (const sql of migrations) {
  try { db.exec(sql); } catch (_) { /* column already exists */ }
}

// Migration: expand plans.status CHECK constraint to include new values
try {
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='plans'").get();
  if (tableInfo && !tableInfo.sql.includes('not_started')) {
    db.pragma('foreign_keys = OFF');
    db.exec(`
      CREATE TABLE plans_new (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        source     TEXT,
        team       TEXT CHECK(team IN ('DEV1','DEV2','INFRA','AI','PRODUCT')),
        owner_id   INTEGER NOT NULL REFERENCES users(id),
        progress   INTEGER NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
        start_date TEXT,
        end_date   TEXT,
        status     TEXT CHECK(status IN ('on_track','at_risk','closed','not_started','ongoing','completed','suspended')),
        created_at TEXT DEFAULT (datetime('now'))
      );
      INSERT INTO plans_new SELECT id, name, source, team, owner_id, progress, start_date, end_date, status, created_at FROM plans;
      DROP TABLE plans;
      ALTER TABLE plans_new RENAME TO plans;
    `);
    db.pragma('foreign_keys = ON');
  }
} catch (e) { console.error('plans status migration error:', e.message); }

module.exports = db;
