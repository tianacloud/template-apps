CREATE TABLE IF NOT EXISTS warm_state (id INTEGER PRIMARY KEY CHECK (id = 1), document TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO warm_state (id, document, revision) VALUES (1, '{}', 0);
