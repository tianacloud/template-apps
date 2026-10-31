import { mkdir, copyFile, readFile } from 'node:fs/promises';
import { build } from 'esbuild';
const commit = process.argv[2];
if (!/^[a-f0-9]{40}$/.test(commit || '')) throw Error('full commit required');
await mkdir('dist', { recursive: true });
await build({ entryPoints: ['src/app.js'], bundle: true, format: 'iife', platform: 'browser', outfile: 'dist/app.js' });
await copyFile('public/icon.png', 'dist/icon.png');
const source = JSON.parse(await readFile('source.json', 'utf8'));
console.log('TIANA_PROJECT_PARAMS ' + JSON.stringify({ entry: 'app.js', ...source }));
