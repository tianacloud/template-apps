CREATE TABLE math_score (id INTEGER PRIMARY KEY CHECK (id = 1), points INTEGER NOT NULL DEFAULT 0);
INSERT INTO math_score (id, points) VALUES (1, 0);
