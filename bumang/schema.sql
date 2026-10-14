CREATE TABLE IF NOT EXISTS bumang_tasks (
  app_id TEXT NOT NULL,
  id TEXT NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
  note TEXT NOT NULL DEFAULT '' CHECK (length(note) <= 2000),
  important INTEGER NOT NULL DEFAULT 0 CHECK (important IN (0, 1)),
  urgent INTEGER NOT NULL DEFAULT 0 CHECK (urgent IN (0, 1)),
  day TEXT CHECK (day IS NULL OR day GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
  start_minute INTEGER CHECK (start_minute IS NULL OR (day IS NOT NULL AND start_minute BETWEEN 0 AND 1425)),
  duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes BETWEEN 15 AND 1440),
  done INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
  done_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (start_minute IS NULL OR start_minute + duration_minutes <= 1440),
  PRIMARY KEY (app_id, id)
);
CREATE INDEX IF NOT EXISTS bumang_tasks_open ON bumang_tasks (app_id, done, done_at);
CREATE INDEX IF NOT EXISTS bumang_tasks_day ON bumang_tasks (app_id, day, start_minute);
