CREATE TABLE IF NOT EXISTS habit_state (id INTEGER PRIMARY KEY CHECK (id = 1), document TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO habit_state (id, document, revision) VALUES (1, '{}', 0);
