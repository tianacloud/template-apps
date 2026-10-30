CREATE TABLE IF NOT EXISTS codex_settings (id INTEGER PRIMARY KEY CHECK (id = 1), theme TEXT NOT NULL CHECK (theme IN ('light', 'dark')));
