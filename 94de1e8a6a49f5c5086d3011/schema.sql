CREATE TABLE IF NOT EXISTS task_state (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, data TEXT NOT NULL);
INSERT OR IGNORE INTO task_state(id, revision, data) VALUES (1, 0, '{}');
