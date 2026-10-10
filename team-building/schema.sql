CREATE TABLE IF NOT EXISTS dining_events (
  id TEXT PRIMARY KEY,
  doc TEXT,
  revision INTEGER,
  status TEXT GENERATED ALWAYS AS (json_extract(doc, '$.status')) STORED,
  created_at TEXT GENERATED ALWAYS AS (json_extract(doc, '$.createdAt')) STORED,
  terms TEXT GENERATED ALWAYS AS (json_extract(doc, '$.searchTerms')) STORED
);
CREATE INDEX IF NOT EXISTS dining_events_active ON dining_events(status, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS dining_events_recent ON dining_events(created_at DESC, id DESC);
CREATE VIRTUAL TABLE IF NOT EXISTS dining_search USING fts5(terms, content='dining_events', content_rowid='rowid');
CREATE TRIGGER IF NOT EXISTS dining_search_insert AFTER INSERT ON dining_events BEGIN
  INSERT INTO dining_search("rowid", terms) VALUES (new."rowid", new.terms);
END;
CREATE TRIGGER IF NOT EXISTS dining_search_update AFTER UPDATE OF doc ON dining_events WHEN old.terms IS NOT new.terms BEGIN
  INSERT INTO dining_search(dining_search, "rowid", terms) VALUES ('delete', old."rowid", old.terms);
  INSERT INTO dining_search("rowid", terms) VALUES (new."rowid", new.terms);
END;
CREATE TABLE IF NOT EXISTS dining_profiles (id TEXT PRIMARY KEY, name TEXT, avatar TEXT, color TEXT);
