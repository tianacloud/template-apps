CREATE TABLE IF NOT EXISTS gx_store (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, content TEXT NOT NULL);
INSERT OR IGNORE INTO gx_store(id, revision, content) VALUES(1,0,'{"state.md":"# 四书 · 状态\n\n| 单元 | 状态 | 周档位 |\n| --- | --- | --- |\n"}');

CREATE TABLE IF NOT EXISTS gx_preferences (key TEXT PRIMARY KEY, value TEXT NOT NULL);
