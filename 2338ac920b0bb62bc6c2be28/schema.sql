CREATE TABLE IF NOT EXISTS prep_checklist (item_key TEXT PRIMARY KEY, checked INTEGER NOT NULL CHECK (checked IN (0, 1)));
