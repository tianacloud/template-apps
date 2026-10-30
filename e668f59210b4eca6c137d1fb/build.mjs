import {build} from 'esbuild';
import fs from 'node:fs/promises';
await fs.mkdir('dist/assets',{recursive:true});
const css=await fs.readFile('src/style.css','utf8'), body=await fs.readFile('src/body.html','utf8');
await build({entryPoints:['src/game.js'],outfile:'dist/assets/app.js',bundle:true,format:'iife',minify:true,banner:{js:`const style=document.createElement("style");style.textContent=${JSON.stringify(css)};document.head.appendChild(style);document.getElementById("app").innerHTML=${JSON.stringify(body)};`}});
await fs.copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...JSON.parse(await fs.readFile('source.json','utf8'))}));
