CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL CHECK(json_valid(payload)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS records_created ON records(created_at DESC);
