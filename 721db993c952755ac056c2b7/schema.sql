CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,
  file_path TEXT NOT NULL,
  description TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  revision INTEGER NOT NULL DEFAULT 0,
  last_mutation_id TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);
