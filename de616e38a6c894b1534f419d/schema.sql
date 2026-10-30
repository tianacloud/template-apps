CREATE TABLE IF NOT EXISTS game_state (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO game_state (id, data, revision) VALUES (1, '{}', 0);
