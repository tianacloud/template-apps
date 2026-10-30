CREATE TABLE IF NOT EXISTS oncall_scores (
  app_id TEXT NOT NULL,
  scenario_id TEXT NOT NULL,
  total INTEGER NOT NULL CHECK (total BETWEEN 0 AND 100),
  grade TEXT NOT NULL CHECK (grade IN ('S', 'A', 'B', 'C', 'D')),
  mttr INTEGER NOT NULL CHECK (mttr >= 0),
  impact INTEGER NOT NULL CHECK (impact >= 0),
  ts INTEGER NOT NULL,
  PRIMARY KEY (app_id, scenario_id)
);
