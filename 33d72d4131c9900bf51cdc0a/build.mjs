import {readFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {build} from 'esbuild';
const commit=process.argv[2];if(!/^[0-9a-f]{40}$/.test(commit||''))throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
await rm('dist',{recursive:true,force:true});await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/entry.js'],bundle:true,format:'esm',platform:'browser',target:'es2020',outfile:'dist/assets/app.js',loader:{'.html':'text','.css':'text'}});
await copyFile('public/icon.png','dist/icon.png');console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
