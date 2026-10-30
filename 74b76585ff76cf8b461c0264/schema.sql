CREATE TABLE IF NOT EXISTS filament_inventory (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO filament_inventory (id, payload, revision) VALUES (1, '[]', 0);
