import { build } from 'esbuild';
import { mkdir, readFile, readdir, rm, cp } from 'node:fs/promises';
const source = JSON.parse(await readFile('source.json','utf8'));
if (source.entry !== 'assets/app.js') throw new Error('Entry must be assets/app.js');
await mkdir('dist',{recursive:true});
// Keep the root directory inode stable for a running local preview.
for (const entry of await readdir('dist')) await rm(`dist/${entry}`,{recursive:true,force:true});
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/main.tsx'],outfile:'dist/assets/app.js',bundle:true,format:'esm',platform:'browser',
  target:['es2022'],minify:true,legalComments:'eof',loader:{'.css':'text'},
  define:{'process.env.NODE_ENV':JSON.stringify('production')}});
await cp('public','dist',{recursive:true});
console.log('Built browser modules and icon. Entry: assets/app.js');
console.log(`TIANA_PROJECT_PARAMS ${JSON.stringify(source)}`);
