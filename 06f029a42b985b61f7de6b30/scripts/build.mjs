import {build} from 'esbuild';
import {readFile,mkdir,copyFile} from 'node:fs/promises';
const c=process.argv[2]; if(!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(c||'')) throw Error('完整提交号必需');
const s=JSON.parse(await readFile('source.json')); await mkdir('dist/assets',{recursive:true}); await build({entryPoints:['app.js'],outfile:'dist/assets/app.js',bundle:true,format:'esm'}); await copyFile('app.css','dist/assets/app.css'); await copyFile('public/icon.png','dist/icon.png'); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...s}));
