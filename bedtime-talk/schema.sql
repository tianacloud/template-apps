BEGIN;
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  audience TEXT NOT NULL CHECK (audience IN ('child', 'parent')),
  topic TEXT NOT NULL CHECK (topic IN ('school', 'feelings', 'proud', 'family', 'imagination')),
  content TEXT NOT NULL CHECK (length(trim(content)) BETWEEN 1 AND 300),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS questions_audience ON questions(audience, created_at);
CREATE TABLE IF NOT EXISTS answers (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  topic TEXT NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('child', 'parent')),
  responder TEXT NOT NULL CHECK (responder IN ('child', 'dad', 'mom')),
  content TEXT NOT NULL CHECK (length(trim(content)) BETWEEN 1 AND 5000),
  local_day TEXT NOT NULL,
  created_at TEXT NOT NULL,
  CHECK ((audience = 'child' AND responder = 'child') OR (audience = 'parent' AND responder IN ('dad', 'mom')))
);
CREATE INDEX IF NOT EXISTS answers_history ON answers(created_at DESC, id DESC);
CREATE TRIGGER IF NOT EXISTS answers_no_update BEFORE UPDATE ON answers
BEGIN SELECT RAISE(ABORT, 'Saved answers cannot be edited'); END;
CREATE TRIGGER IF NOT EXISTS answers_no_delete BEFORE DELETE ON answers
BEGIN SELECT RAISE(ABORT, 'Saved answers cannot be deleted'); END;
COMMIT;
