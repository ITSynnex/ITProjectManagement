CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password     TEXT NOT NULL,
  role         TEXT NOT NULL CHECK(role IN ('it_manager','pmo','dev_operation')),
  avatar_url   TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plans (
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

CREATE TABLE IF NOT EXISTS buckets (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id  INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  "order"  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tasks (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id      INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  assigned_to  INTEGER REFERENCES users(id),
  bucket_id    INTEGER REFERENCES buckets(id) ON DELETE SET NULL,
  start_date   TEXT,
  finish_date  TEXT,
  is_completed INTEGER NOT NULL DEFAULT 0 CHECK(is_completed IN (0,1)),
  "order"      INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT DEFAULT (datetime('now'))
);
