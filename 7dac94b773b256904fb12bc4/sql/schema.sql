CREATE TABLE IF NOT EXISTS riji_workspaces (
  app_id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 0 CHECK(revision >= 0),
  document TEXT NOT NULL CHECK(json_valid(document)),
  operation_id TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS riji_receipts (
  app_id TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  PRIMARY KEY (app_id, operation_id)
);
CREATE TRIGGER IF NOT EXISTS riji_receipt_insert AFTER INSERT ON riji_workspaces
BEGIN
  INSERT INTO riji_receipts(app_id, operation_id, revision)
  VALUES (NEW.app_id, NEW.operation_id, NEW.revision);
END;
CREATE TRIGGER IF NOT EXISTS riji_receipt_update AFTER UPDATE ON riji_workspaces
BEGIN
  INSERT INTO riji_receipts(app_id, operation_id, revision)
  VALUES (NEW.app_id, NEW.operation_id, NEW.revision);
END;
