CREATE TABLE IF NOT EXISTS cooling_state (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO cooling_state(id,data,revision) VALUES(1,'{"items":[],"ff":0}',0);
