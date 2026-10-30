CREATE TABLE IF NOT EXISTS practice_progress (
  app_id TEXT PRIMARY KEY,
  payload TEXT NOT NULL DEFAULT '{"stats":{}}',
  revision INTEGER NOT NULL DEFAULT 0,
  mutation_id TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT ''
);
