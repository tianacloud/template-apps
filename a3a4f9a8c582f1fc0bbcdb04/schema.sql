CREATE TABLE IF NOT EXISTS notebook_entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notebook_attachments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  size INTEGER NOT NULL CHECK (size >= 0),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS notebook_entries_updated ON notebook_entries(updated_at DESC, id);

CREATE TABLE IF NOT EXISTS notebook_pending_uploads (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, path TEXT NOT NULL,
  size INTEGER NOT NULL, created_at TEXT NOT NULL, upload_id TEXT NOT NULL
);
