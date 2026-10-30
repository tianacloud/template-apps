CREATE TABLE IF NOT EXISTS expiry_data (
  app_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (app_id, key)
);
