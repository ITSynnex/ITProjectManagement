CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password     TEXT NOT NULL,
  role         TEXT NOT NULL CHECK(role IN ('it_manager','pmo','dev_operation')),
  avatar_url   TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS operators (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  status     TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS departments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  status     TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS teams (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  color      TEXT NOT NULL DEFAULT 'indigo',
  status     TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plan_statuses (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  label      TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT 'default',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plans (
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

CREATE TABLE IF NOT EXISTS buckets (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id  INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  "order"  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tasks (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id               INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  assigned_to           INTEGER REFERENCES users(id),
  assigned_operator_id  INTEGER REFERENCES operators(id),
  bucket_id             INTEGER REFERENCES buckets(id) ON DELETE SET NULL,
  start_date            TEXT,
  finish_date           TEXT,
  is_completed          INTEGER NOT NULL DEFAULT 0 CHECK(is_completed IN (0,1)),
  "order"               INTEGER NOT NULL DEFAULT 0,
  created_at            TEXT DEFAULT (datetime('now'))
);
