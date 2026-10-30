import { build } from 'esbuild';
import { mkdir, readFile, copyFile } from 'node:fs/promises';

const source = JSON.parse(await readFile(process.env.MATERIAL_HANDBOOK_BINDINGS || new URL('../source.json', import.meta.url), 'utf8'));
if (process.env.TIANA_TEMPLATE_BUILD !== '1' && Object.values(source).some(value => String(value).includes('__TIANA_'))) {
  throw new Error('Fill source.json with the actual resource bindings, or supply MATERIAL_HANDBOOK_BINDINGS for author development.');
}
await mkdir(new URL('../dist/assets/', import.meta.url), { recursive: true });
await build({ entryPoints: ['src/app.js'], outdir: 'dist/assets', bundle: true, format: 'esm', platform: 'browser', target: 'es2022', minify: true, legalComments: 'eof', loader: { '.svg': 'dataurl' } });
await copyFile(new URL('../public/icon.png', import.meta.url), new URL('../dist/icon.png', import.meta.url));
const commit = process.argv[2];
console.log('TIANA_PROJECT_PARAMS ' + JSON.stringify({ ...source, ...(/^[a-f0-9]{40,64}$/.test(commit || '') ? { source_commit: commit } : {}) }));
