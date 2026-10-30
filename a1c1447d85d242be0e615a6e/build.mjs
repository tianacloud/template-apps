import {mkdir,readFile,writeFile,copyFile,readdir} from 'node:fs/promises';
import {build} from 'esbuild';
const commit=process.argv[2]; if(!/^[0-9a-f]{40,64}$/.test(commit||'')) throw Error('Pass a full source commit');
const html=await readFile('index.html','utf8'); const css=await readFile('styles.css','utf8');
const body=html.match(/<body>([\s\S]*?)<script src="app.js"><\/script>/)[1];
await writeFile('body.js','export default '+JSON.stringify(body)+';'); await writeFile('css.js','export default '+JSON.stringify(css)+';');
const paths=(await readdir('template-files/images')).map(name=>'template-assets/images/'+name);
await mkdir('dist',{recursive:true}); await build({entryPoints:['entry.js'],bundle:true,format:'esm',outfile:'dist/app.js',define:{IMAGE_PATHS:JSON.stringify(Object.fromEntries(paths.map(p=>[p,true])))}});
await copyFile('public/icon.png','dist/icon.png'); const source=JSON.parse(await readFile('source.json','utf8'));console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'app.js',...source}));
