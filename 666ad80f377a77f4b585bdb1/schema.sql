CREATE TABLE IF NOT EXISTS album_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS photos (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 original_path TEXT NOT NULL,
 thumbnail_path TEXT NOT NULL,
 preview_path TEXT NOT NULL,
 width INTEGER NOT NULL,
 height INTEGER NOT NULL,
 bytes INTEGER NOT NULL,
 category TEXT NOT NULL DEFAULT '日常',
 favorite INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL,
 attribution TEXT,
 source_url TEXT
);
CREATE INDEX IF NOT EXISTS photos_created ON photos(created_at DESC, id);
CREATE TABLE IF NOT EXISTS comments (
 id TEXT PRIMARY KEY,
 photo_id TEXT NOT NULL,
 body TEXT NOT NULL,
 author TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS comments_photo ON comments(photo_id, created_at);

CREATE TABLE IF NOT EXISTS photo_groups (name TEXT PRIMARY KEY, title TEXT NOT NULL);
INSERT INTO photo_groups(name,title) VALUES('宠物','毛茸茸的朋友'),('风景','去有风的地方') ON CONFLICT(name) DO NOTHING;
CREATE INDEX IF NOT EXISTS photos_category_created ON photos(category,created_at DESC,id DESC);
