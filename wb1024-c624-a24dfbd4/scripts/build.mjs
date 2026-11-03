import { build } from 'vite';
import { readFile } from 'node:fs/promises';
await build();
const source = JSON.parse(await readFile('source.json', 'utf8'));
console.log('TIANA_PROJECT_PARAMS ' + JSON.stringify({entry:'assets/app.js', ...source, source_commit:process.argv[2]}));
