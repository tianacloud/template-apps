import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
test('schema and example data install twice without duplicate rows',()=>{
 const output=execFileSync('python3',['-c',`
import sqlite3,json
from pathlib import Path
db=sqlite3.connect(':memory:')
db.execute('PRAGMA foreign_keys=ON')
for _ in range(2):
 db.executescript(Path('schema.sql').read_text())
 db.executescript(Path('seed.sql').read_text())
assert not list(db.execute('PRAGMA foreign_key_check'))
print(json.dumps([db.execute('SELECT COUNT(*) FROM '+name).fetchone()[0] for name in ['cycle_tags','cycle_events','cycle_records']]))
`],{encoding:'utf8'});
 assert.deepEqual(JSON.parse(output),[4,6,21]);
});
