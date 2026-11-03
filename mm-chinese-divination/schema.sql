CREATE TABLE IF NOT EXISTS divination_history (
  app_id TEXT NOT NULL,
  id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  reading_json TEXT NOT NULL,
  PRIMARY KEY (app_id, id)
);
CREATE INDEX IF NOT EXISTS divination_history_date ON divination_history (app_id, created_at DESC);
CREATE TRIGGER IF NOT EXISTS divination_history_limit AFTER INSERT ON divination_history BEGIN
  DELETE FROM divination_history WHERE app_id = NEW.app_id AND rowid IN (
    SELECT rowid FROM divination_history WHERE app_id = NEW.app_id ORDER BY rowid DESC LIMIT -1 OFFSET 500
  );
END;
