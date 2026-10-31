import {build} from 'esbuild';
import {readdir,readFile,writeFile,rm,mkdir,copyFile} from 'node:fs/promises';
const small={};
for (const name of await readdir('small-images')) { const bytes=await readFile('small-images/'+name); if(bytes.length>16384) throw Error('small image too large'); small[name]='data:image/png;base64,'+bytes.toString('base64'); }
await writeFile('small-images.json',JSON.stringify(small));
await writeFile('external-images.json',JSON.stringify(await readdir('template-files/images')));
await rm('dist',{recursive:true,force:true});await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['entry.js'],outfile:'dist/assets/app.js',bundle:true,format:'esm',minify:true});
await copyFile('public/js/game.js','dist/assets/game.js');await copyFile('public/js/phaser.min.js','dist/assets/phaser.min.js');await copyFile('public/icon.png','dist/icon.png');await copyFile('PHASER-LICENSE.md','dist/PHASER-LICENSE.md');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...JSON.parse(await readFile('source.json','utf8'))}));
