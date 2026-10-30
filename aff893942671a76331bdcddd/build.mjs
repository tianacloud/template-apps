import {mkdir,copyFile,rm,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['assets/app.js'],bundle:true,format:'esm',platform:'browser',outfile:'dist/assets/app.js'});
for(const name of ['runtime.js','shell.html.gz','pixi.min.js','unsafe-eval.min.js','live2d.min.js','cubism2.js']) await copyFile('assets/'+name,'dist/assets/'+name);
await copyFile('assets/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...JSON.parse(await readFile('source.json','utf8'))}));
