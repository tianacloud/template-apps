import { build } from 'esbuild';
import { readFile, mkdir, rm, copyFile } from 'node:fs/promises';
const commit=process.argv[2]; if (!/^[0-9a-f]{40,64}$/.test(commit||'')) throw Error('完整源码提交号必填');
const source=JSON.parse(await readFile('source.json','utf8'));
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/entry.js'],outfile:'dist/assets/app.js',bundle:true,format:'esm',loader:{'.html':'text','.css':'text'},alias:{'three':'./src/vendor/three.module.js','three/addons':'./src/vendor/addons'}});
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
