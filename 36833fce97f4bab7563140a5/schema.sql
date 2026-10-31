CREATE TABLE IF NOT EXISTS family_state (id TEXT PRIMARY KEY, state TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO family_state (id,state,revision) VALUES ('home','null',0);
