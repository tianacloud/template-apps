PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS zhiji_periods (
  id TEXT PRIMARY KEY NOT NULL,
  start_date TEXT UNIQUE NOT NULL CHECK(start_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  end_date TEXT CHECK(end_date IS NULL OR (end_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' AND end_date >= start_date)),
  end_unknown INTEGER NOT NULL DEFAULT 0 CHECK(end_unknown IN (0, 1) AND (end_unknown = 0 OR end_date IS NULL)),
  gap_before INTEGER NOT NULL CHECK(gap_before IN (0, 1)),
  note TEXT,
  source TEXT NOT NULL CHECK(source IN ('USER', 'IMPORT')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TRIGGER IF NOT EXISTS zhiji_period_insert BEFORE INSERT ON zhiji_periods
WHEN EXISTS (SELECT 1 FROM zhiji_periods p WHERE p.start_date <= CASE WHEN NEW.end_unknown = 1 THEN NEW.start_date ELSE COALESCE(NEW.end_date, '9999-12-31') END AND NEW.start_date <= CASE WHEN p.end_unknown = 1 THEN p.start_date ELSE COALESCE(p.end_date, '9999-12-31') END)
BEGIN SELECT RAISE(ABORT, 'ZH_PERIOD_OVERLAP'); END;
CREATE TRIGGER IF NOT EXISTS zhiji_period_update BEFORE UPDATE ON zhiji_periods
WHEN EXISTS (SELECT 1 FROM zhiji_periods p WHERE p.id <> NEW.id AND p.start_date <= CASE WHEN NEW.end_unknown = 1 THEN NEW.start_date ELSE COALESCE(NEW.end_date, '9999-12-31') END AND NEW.start_date <= CASE WHEN p.end_unknown = 1 THEN p.start_date ELSE COALESCE(p.end_date, '9999-12-31') END)
BEGIN SELECT RAISE(ABORT, 'ZH_PERIOD_OVERLAP'); END;

CREATE TABLE IF NOT EXISTS zhiji_daily_logs (
  date TEXT PRIMARY KEY NOT NULL CHECK(date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  bleeding_type TEXT CHECK(bleeding_type IS NULL OR bleeding_type IN ('NONE', 'MENSTRUATION', 'SPOTTING', 'UNKNOWN')),
  flow_level TEXT CHECK(flow_level IS NULL OR flow_level IN ('NONE', 'LIGHT', 'MEDIUM', 'HEAVY')),
  blood_colors TEXT CHECK(blood_colors IS NULL OR (json_valid(blood_colors) AND json_type(blood_colors) = 'array')),
  pain_score INTEGER CHECK(pain_score IS NULL OR (typeof(pain_score) = 'integer' AND pain_score BETWEEN 0 AND 10)),
  pain_locations TEXT CHECK(pain_locations IS NULL OR (json_valid(pain_locations) AND json_type(pain_locations) = 'array')),
  symptoms TEXT CHECK(symptoms IS NULL OR (json_valid(symptoms) AND json_type(symptoms) = 'array')),
  moods TEXT CHECK(moods IS NULL OR (json_valid(moods) AND json_type(moods) = 'array')),
  sleep_hours REAL CHECK(sleep_hours IS NULL OR sleep_hours BETWEEN 0 AND 24),
  sleep_quality TEXT CHECK(sleep_quality IS NULL OR sleep_quality IN ('POOR', 'FAIR', 'GOOD')),
  bowel_events TEXT CHECK(bowel_events IS NULL OR (json_valid(bowel_events) AND json_type(bowel_events) = 'array')),
  intimacy_events TEXT CHECK(intimacy_events IS NULL OR (json_valid(intimacy_events) AND json_type(intimacy_events) = 'array')),
  discharge TEXT CHECK(discharge IS NULL OR (json_valid(discharge) AND json_type(discharge) = 'object')),
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS zhiji_unknown_dates ON zhiji_daily_logs(date) WHERE bleeding_type = 'UNKNOWN';
CREATE TABLE IF NOT EXISTS zhiji_absence_confirmations (
  id TEXT PRIMARY KEY NOT NULL,
  anchor_period_id TEXT NOT NULL REFERENCES zhiji_periods(id) ON DELETE CASCADE,
  through_date TEXT NOT NULL CHECK(through_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  created_at TEXT NOT NULL,
  UNIQUE(anchor_period_id, through_date)
);
CREATE TABLE IF NOT EXISTS zhiji_prediction_snapshots (
  id TEXT PRIMARY KEY NOT NULL,
  anchor_period_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('BASE', 'CONDITIONAL')),
  algorithm_version TEXT NOT NULL,
  facts_revision INTEGER NOT NULL,
  generated_at TEXT NOT NULL,
  generated_local_date TEXT NOT NULL,
  origin TEXT NOT NULL CHECK(origin IN ('APP', 'BACKUP')),
  input_json TEXT NOT NULL CHECK(json_valid(input_json)),
  output_json TEXT NOT NULL CHECK(json_valid(output_json)),
  UNIQUE(anchor_period_id, kind, algorithm_version, facts_revision)
);
CREATE INDEX IF NOT EXISTS zhiji_snapshot_anchor ON zhiji_prediction_snapshots(anchor_period_id, generated_at, id);
CREATE TRIGGER IF NOT EXISTS zhiji_snapshot_immutable BEFORE UPDATE ON zhiji_prediction_snapshots
BEGIN SELECT RAISE(ABORT, 'ZH_SNAPSHOT_IMMUTABLE'); END;
CREATE TABLE IF NOT EXISTS zhiji_prediction_evaluations (
  snapshot_id TEXT PRIMARY KEY NOT NULL REFERENCES zhiji_prediction_snapshots(id) ON DELETE CASCADE,
  anchor_period_id TEXT NOT NULL,
  is_baseline INTEGER NOT NULL CHECK(is_baseline IN (0, 1)),
  status TEXT NOT NULL CHECK(status IN ('PENDING', 'EVALUATED', 'SKIPPED_GAP', 'INVALIDATED')),
  reason TEXT,
  target_period_id TEXT,
  target_date TEXT,
  absolute_error INTEGER CHECK(absolute_error IS NULL OR absolute_error >= 0),
  evaluated_at TEXT NOT NULL,
  facts_revision INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS zhiji_one_baseline ON zhiji_prediction_evaluations(anchor_period_id) WHERE is_baseline = 1 AND status <> 'INVALIDATED';
CREATE TABLE IF NOT EXISTS zhiji_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value_json TEXT NOT NULL CHECK(json_valid(value_json)),
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS zhiji_state (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  facts_revision INTEGER NOT NULL,
  last_write_id TEXT
);
INSERT OR IGNORE INTO zhiji_state(id, facts_revision, last_write_id) VALUES(1, 0, NULL);
