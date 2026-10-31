CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK(id = 1), version INTEGER NOT NULL, data TEXT NOT NULL);
INSERT OR IGNORE INTO app_state (id, version, data) VALUES (1, 0, '{"myCity":"","people":[],"events":[],"ledger":[],"checks":{}}');
