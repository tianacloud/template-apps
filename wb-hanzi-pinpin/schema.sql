PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
  code TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  folder TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'ended')),
  round_no INTEGER NOT NULL DEFAULT 1,
  current_index INTEGER NOT NULL DEFAULT 0,
  max_components INTEGER NOT NULL DEFAULT 3,
  radical_names TEXT NOT NULL DEFAULT '{}',
  stories TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  ended_at TEXT
);
CREATE INDEX IF NOT EXISTS rooms_owner ON rooms (owner_id, created_at DESC);

CREATE TABLE IF NOT EXISTS room_chars (
  room_code TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  idx INTEGER NOT NULL,
  char TEXT NOT NULL,
  lesson TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (room_code, idx)
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY NOT NULL,
  room_code TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  help_count INTEGER NOT NULL DEFAULT 0,
  help_char INTEGER NOT NULL DEFAULT -1
);
CREATE INDEX IF NOT EXISTS students_room ON students (room_code, joined_at);

CREATE TABLE IF NOT EXISTS answers (
  room_code TEXT NOT NULL,
  student_id TEXT NOT NULL,
  char_index INTEGER NOT NULL,
  char TEXT NOT NULL,
  parts TEXT NOT NULL DEFAULT '[]',
  formation TEXT NOT NULL DEFAULT '',
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  elapsed_ms INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0 CHECK (correct IN (0, 1)),
  helped INTEGER NOT NULL DEFAULT 0 CHECK (helped IN (0, 1)),
  hint_triggered INTEGER NOT NULL DEFAULT 0 CHECK (hint_triggered IN (0, 1)),
  updated_at TEXT NOT NULL,
  PRIMARY KEY (room_code, student_id, char_index)
);
CREATE INDEX IF NOT EXISTS answers_room ON answers (room_code, updated_at DESC);

CREATE TABLE IF NOT EXISTS char_sets (
  id TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  chars TEXT NOT NULL DEFAULT '',
  shared INTEGER NOT NULL DEFAULT 0 CHECK (shared IN (0, 1)),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS char_sets_owner ON char_sets (owner_id, created_at DESC);

CREATE TABLE IF NOT EXISTS char_overrides (
  owner_id TEXT NOT NULL,
  char TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'A',
  parts TEXT NOT NULL,
  lock_parts TEXT NOT NULL DEFAULT '[]',
  structure TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (owner_id, char)
);

CREATE TABLE IF NOT EXISTS char_stories (
  owner_id TEXT NOT NULL,
  char TEXT NOT NULL,
  story TEXT NOT NULL,
  PRIMARY KEY (owner_id, char)
);

CREATE TABLE IF NOT EXISTS practice_records (
  id TEXT PRIMARY KEY NOT NULL,
  char TEXT NOT NULL,
  correct INTEGER NOT NULL DEFAULT 0 CHECK (correct IN (0, 1)),
  attempts INTEGER NOT NULL DEFAULT 0,
  elapsed_ms INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS practice_recent ON practice_records (created_at DESC, char);
