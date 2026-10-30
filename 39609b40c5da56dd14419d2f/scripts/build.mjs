import {mkdir, copyFile, readFile, rm} from 'node:fs/promises';
import {build} from 'esbuild';
const commit = process.argv[2];
if (!/^[0-9a-f]{40,64}$/.test(commit || '')) throw new Error('需要完整提交号');
const source = JSON.parse(await readFile('source.json', 'utf8'));
await mkdir('dist', {recursive: true});
await rm('dist/assets', {recursive: true, force: true});
await mkdir('dist/assets', {recursive: true});
await build({entryPoints: ['src/app.js'], outfile: 'dist/assets/app.js', bundle: true,
  format: 'esm', platform: 'browser', target: 'es2022', minify: true, legalComments: 'none'});
await copyFile('src/style.css', 'dist/assets/style.css');
await copyFile('public/icon.png', 'dist/icon.png');
console.log('TIANA_PROJECT_PARAMS ' + JSON.stringify({entry: 'assets/app.js', ...source, source_commit: commit}));
