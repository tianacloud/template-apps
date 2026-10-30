CREATE TABLE IF NOT EXISTS word_progress (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO word_progress (id,data,revision) VALUES (1,'{}',0);
