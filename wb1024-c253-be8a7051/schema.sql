CREATE TABLE IF NOT EXISTS baby_documents (id TEXT PRIMARY KEY, kind TEXT NOT NULL, document TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS baby_documents_kind ON baby_documents(kind);
