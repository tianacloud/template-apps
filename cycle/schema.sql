CREATE TABLE IF NOT EXISTS cycle_tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK(length(trim(name)) BETWEEN 1 AND 24)
);
CREATE TABLE IF NOT EXISTS cycle_events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 80),
  interval_days INTEGER NOT NULL CHECK(interval_days BETWEEN 1 AND 36500),
  first_due TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(tags)),
  icon TEXT NOT NULL DEFAULT 'sparkles',
  color TEXT NOT NULL DEFAULT 'green',
  archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0,1)),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS cycle_records (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES cycle_events(id),
  occurred_at TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0 CHECK(duration BETWEEN 0 AND 525600),
  note TEXT NOT NULL DEFAULT '',
  photos TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(photos)),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS cycle_records_event_time ON cycle_records(event_id, occurred_at DESC);
