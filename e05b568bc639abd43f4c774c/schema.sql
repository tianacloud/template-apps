CREATE TABLE IF NOT EXISTS weekly_store (id TEXT PRIMARY KEY CHECK(id='main'), payload TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO weekly_store(id,payload,revision) VALUES('main','{"weeks":{}}',0);
