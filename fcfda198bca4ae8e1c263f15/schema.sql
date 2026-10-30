CREATE TABLE IF NOT EXISTS diary_state (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO diary_state (id,data,revision) VALUES (1,'{"male":{"name":"","avatar":""},"female":{"name":"","avatar":""},"anniversary":"","firstMet":"","memories":[]}',0);
