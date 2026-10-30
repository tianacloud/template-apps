CREATE TABLE IF NOT EXISTS gym_records (
  kind TEXT NOT NULL CHECK(kind IN ('setting','routine','workout','weight','exercise','active','override','photo')),
  id TEXT NOT NULL,
  payload TEXT NOT NULL CHECK(json_valid(payload)),
  revision INTEGER NOT NULL DEFAULT 1 CHECK(revision > 0),
  deleted INTEGER NOT NULL DEFAULT 0 CHECK(deleted IN (0,1)),
  mutation_id TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(kind, id)
);
CREATE INDEX IF NOT EXISTS gym_records_kind_updated ON gym_records(kind, deleted, updated_at);
