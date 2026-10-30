CREATE TABLE IF NOT EXISTS game_records (id TEXT PRIMARY KEY, kind TEXT NOT NULL, properties TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS game_records_kind ON game_records(kind);
CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY, value TEXT NOT NULL);
