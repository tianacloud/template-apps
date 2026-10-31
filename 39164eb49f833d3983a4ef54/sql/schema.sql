CREATE TABLE IF NOT EXISTS xingji_workspaces (
  app_id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 0 CHECK(revision >= 0),
  document TEXT NOT NULL CHECK(json_valid(document)),
  operation_id TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS xingji_receipts (
  app_id TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  PRIMARY KEY (app_id, operation_id)
);
CREATE TRIGGER IF NOT EXISTS xingji_receipt_insert AFTER INSERT ON xingji_workspaces
BEGIN
  INSERT INTO xingji_receipts(app_id, operation_id, revision)
  VALUES (NEW.app_id, NEW.operation_id, NEW.revision);
END;
CREATE TRIGGER IF NOT EXISTS xingji_receipt_update AFTER UPDATE ON xingji_workspaces
BEGIN
  INSERT INTO xingji_receipts(app_id, operation_id, revision)
  VALUES (NEW.app_id, NEW.operation_id, NEW.revision);
END;
