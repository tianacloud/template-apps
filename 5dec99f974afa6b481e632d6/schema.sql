CREATE TABLE IF NOT EXISTS sword_state (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sword_rank (category TEXT NOT NULL, player TEXT NOT NULL, record TEXT NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY(category, player));
