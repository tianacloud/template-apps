CREATE TABLE IF NOT EXISTS baby_records (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('profile','growth','meal','food','ledger','category','todo','vaccine','tooth','milestone')),
  day TEXT NOT NULL DEFAULT '',
  data TEXT NOT NULL CHECK(json_valid(data))
);
CREATE INDEX IF NOT EXISTS baby_records_kind_day ON baby_records(kind, day);
