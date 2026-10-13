PRAGMA foreign_keys = ON;
BEGIN IMMEDIATE;
ALTER TABLE zhiji_periods ADD COLUMN end_unknown INTEGER NOT NULL DEFAULT 0 CHECK(end_unknown IN (0, 1) AND (end_unknown = 0 OR end_date IS NULL));
DROP TRIGGER zhiji_period_insert;
DROP TRIGGER zhiji_period_update;
CREATE TRIGGER zhiji_period_insert BEFORE INSERT ON zhiji_periods
WHEN EXISTS (SELECT 1 FROM zhiji_periods p WHERE p.start_date <= CASE WHEN NEW.end_unknown = 1 THEN NEW.start_date ELSE COALESCE(NEW.end_date, '9999-12-31') END AND NEW.start_date <= CASE WHEN p.end_unknown = 1 THEN p.start_date ELSE COALESCE(p.end_date, '9999-12-31') END)
BEGIN SELECT RAISE(ABORT, 'ZH_PERIOD_OVERLAP'); END;
CREATE TRIGGER zhiji_period_update BEFORE UPDATE ON zhiji_periods
WHEN EXISTS (SELECT 1 FROM zhiji_periods p WHERE p.id <> NEW.id AND p.start_date <= CASE WHEN NEW.end_unknown = 1 THEN NEW.start_date ELSE COALESCE(NEW.end_date, '9999-12-31') END AND NEW.start_date <= CASE WHEN p.end_unknown = 1 THEN p.start_date ELSE COALESCE(p.end_date, '9999-12-31') END)
BEGIN SELECT RAISE(ABORT, 'ZH_PERIOD_OVERLAP'); END;
COMMIT;
