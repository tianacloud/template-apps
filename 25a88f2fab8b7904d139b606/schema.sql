CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id = 1), revision INTEGER NOT NULL, payload TEXT NOT NULL);
INSERT OR IGNORE INTO app_state (id, revision, payload) VALUES (1, 0, '{"logs":[],"tasks":[]}');
