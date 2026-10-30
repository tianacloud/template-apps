-- Wallet: one row. Re-saving a day with fewer coins may leave a negative balance.
CREATE TABLE IF NOT EXISTS pool_wallet (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total_coins INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO pool_wallet (id, total_coins) VALUES (1, 0);

CREATE TABLE IF NOT EXISTS pool_tasks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  coins INTEGER NOT NULL CHECK (coins >= 0),
  is_built_in INTEGER NOT NULL DEFAULT 0 CHECK (is_built_in IN (0, 1)),
  category TEXT NOT NULL,
  position INTEGER NOT NULL
);

-- One diary per day; coins are snapshotted from the task list at save time.
CREATE TABLE IF NOT EXISTS pool_diaries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  mood TEXT NOT NULL,
  completed_task_ids TEXT NOT NULL,
  quantities TEXT NOT NULL,
  snapshots TEXT NOT NULL,
  earned_coins INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS pool_photos (
  id TEXT PRIMARY KEY,
  diary_id TEXT NOT NULL REFERENCES pool_diaries(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  file_path TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS pool_photos_diary ON pool_photos(diary_id, position);

CREATE TABLE IF NOT EXISTS pool_rewards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  required_coins INTEGER NOT NULL CHECK (required_coins >= 1),
  redeemed INTEGER NOT NULL DEFAULT 0 CHECK (redeemed IN (0, 1)),
  sort_order INTEGER,
  created_at INTEGER NOT NULL,
  redeemed_at INTEGER
);
