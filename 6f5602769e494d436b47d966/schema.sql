CREATE TABLE IF NOT EXISTS weekdesk_state (id INTEGER PRIMARY KEY CHECK (id=1), data TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO weekdesk_state (id,data,revision) VALUES (1,'{"tasks":[],"isOwner":false}',0);
