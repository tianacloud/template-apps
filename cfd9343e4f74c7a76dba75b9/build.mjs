import {build} from 'esbuild';
import {readFile,mkdir,rm,copyFile} from 'node:fs/promises';
const bindings=JSON.parse(await readFile(process.env.CALCULUS_BINDINGS || 'source.json','utf8'));
const commit=process.argv[2];
await mkdir('dist',{recursive:true});
for(const name of ['assets','icon.png']) await rm('dist/'+name,{force:true,recursive:true});
await build({entryPoints:['app-entry.js'],outdir:'dist/assets',entryNames:'app',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'eof',loader:{'.html':'text','.css':'text'}});
await copyFile('icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({...bindings,...(/^[a-f0-9]{40}$/.test(commit||'')?{source_commit:commit}:{})}));
