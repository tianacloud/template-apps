CREATE TABLE IF NOT EXISTS todos (id TEXT PRIMARY KEY, title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0, todo_date TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS todos_date ON todos(todo_date, created_at);
