import test from 'node:test';
import { execFileSync } from 'node:child_process';

test('saved answers are immutable and preserve questions after editing or deleting', () => {
  execFileSync('python3', ['-c', `
import sqlite3
from pathlib import Path
db = sqlite3.connect(':memory:')
db.executescript(Path('schema.sql').read_text())
db.executescript(Path('seeds.sql').read_text())
assert db.execute('SELECT COUNT(*) FROM questions').fetchone()[0] == 40
db.execute("INSERT INTO answers VALUES ('answer','session','child-01','Original question','school','child','child','Original answer','2026-10-14','2026-10-14T12:00:00Z')")
db.execute("UPDATE questions SET content='Updated question' WHERE id='child-01'")
db.execute("DELETE FROM questions WHERE id='child-01'")
for statement in ["UPDATE answers SET content='Changed'", 'DELETE FROM answers']:
    try:
        db.execute(statement)
    except sqlite3.IntegrityError:
        pass
    else:
        raise AssertionError('A saved answer was changed')
assert db.execute('SELECT question_text, content FROM answers').fetchone() == ('Original question', 'Original answer')
try:
    db.execute("INSERT INTO answers VALUES ('invalid','session','parent-01','Question','school','parent','child','Answer','2026-10-14','2026-10-14T12:00:00Z')")
except sqlite3.IntegrityError:
    pass
else:
    raise AssertionError('A child answered a parent card')
`], { cwd: new URL('../', import.meta.url), stdio: 'pipe' });
});
