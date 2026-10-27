import {mkdir,copyFile,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
for(const name of ['app.js','runtime.js','data.json.gz','shell.html.gz','pixi.min.js','unsafe-eval.min.js','live2d.min.js','cubism2.js']) await copyFile('assets/'+name,'dist/assets/'+name);
await copyFile('assets/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js'}));
