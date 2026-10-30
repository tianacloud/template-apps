CREATE TABLE IF NOT EXISTS profiles (id INTEGER PRIMARY KEY, nickname TEXT, avatar TEXT, pin_hash TEXT, pin_salt TEXT, current_child_id INTEGER);
CREATE TABLE IF NOT EXISTS children (id INTEGER PRIMARY KEY, name TEXT NOT NULL, avatar TEXT, sort_no INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL, emoji TEXT, points INTEGER, slot TEXT, days TEXT, active INTEGER DEFAULT 1, sort_no INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS rewards (id INTEGER PRIMARY KEY, name TEXT NOT NULL, emoji TEXT, cost INTEGER, memo TEXT, sort_no INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS goals (id INTEGER PRIMARY KEY, title TEXT NOT NULL, emoji TEXT, goal_type TEXT, target INTEGER, reward TEXT, sort_no INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS records (id INTEGER PRIMARY KEY, child_id INTEGER, date TEXT, task_id INTEGER, created_at INTEGER, UNIQUE(child_id,date,task_id));
CREATE TABLE IF NOT EXISTS points_log (id INTEGER PRIMARY KEY, child_id INTEGER, date TEXT, delta INTEGER, reason TEXT, created_at INTEGER);
CREATE TABLE IF NOT EXISTS child_events (id INTEGER PRIMARY KEY, child_id INTEGER, kind TEXT, ref_id TEXT, got_at INTEGER);
CREATE TABLE IF NOT EXISTS redeems (id INTEGER PRIMARY KEY, child_id INTEGER, reward_id INTEGER, name TEXT, emoji TEXT, cost INTEGER, date TEXT, status TEXT, created_at INTEGER, settled_at INTEGER);
