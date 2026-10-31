CREATE TABLE IF NOT EXISTS fun_state (id TEXT PRIMARY KEY, payload TEXT NOT NULL, theme TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO fun_state (id,payload,theme,revision) VALUES ('main','[]','dark',0);
