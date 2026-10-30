import {build} from 'esbuild';import fs from 'node:fs/promises';
const notices=await fs.readFile('THIRD_PARTY_NOTICES','utf8');
await fs.mkdir('dist/assets',{recursive:true});await build({entryPoints:['src/entry.js'],outfile:'dist/assets/app.js',bundle:true,format:'esm',minify:true,banner:{js:'/*!\n'+notices.replaceAll('*/','* /')+'\n*/'},loader:{'.css':'text','.html':'text','.png':'dataurl'}});await fs.copyFile('public/icon.png','dist/icon.png');await fs.copyFile('THIRD_PARTY_NOTICES','dist/THIRD_PARTY_NOTICES.txt');
const params={entry:'assets/app.js',...JSON.parse(await fs.readFile('source.json','utf8'))};const commit=process.argv[2];if(commit&&/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/.test(commit))params.source_commit=commit;console.log('TIANA_PROJECT_PARAMS '+JSON.stringify(params));
