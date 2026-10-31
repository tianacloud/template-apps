CREATE TABLE IF NOT EXISTS tomato_state (id INTEGER PRIMARY KEY CHECK (id = 1), revision INTEGER NOT NULL DEFAULT 0, settings TEXT, data TEXT);
INSERT OR IGNORE INTO tomato_state (id, revision) VALUES (1, 0);
