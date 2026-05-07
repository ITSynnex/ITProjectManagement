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
];
for (const sql of migrations) {
  try { db.exec(sql); } catch (_) { /* column already exists */ }
}

module.exports = db;
