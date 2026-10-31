CREATE TABLE IF NOT EXISTS classroom_state (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO classroom_state (id, payload, revision) VALUES (1, '{"classes":[],"settings":{"sound":true}}', 0);
