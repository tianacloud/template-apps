import {build} from 'esbuild';
import {readFile,mkdir,rm,copyFile,writeFile} from 'node:fs/promises';
const commit=process.argv[2],local=commit==='--local';
if(!local&&!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit||''))throw Error('构建需要完整源码提交号；本地检查使用 build:local。');
const source=JSON.parse(await readFile('source.json','utf8'));
if(!local&&!process.env.TIANA_TEMPLATE_BUILD){for(const key of ['database_instance_id','git_instance_id'])if(!/^[A-Za-z0-9-]{8,128}$/.test(source[key])||source[key].startsWith('__'))throw Error('请先在source.json填写实际资源ID。');}
const licenseBanner='/*!\n'+(await readFile('THIRD_PARTY_NOTICES.txt','utf8')).replaceAll('*/','* /')+'\n*/';
await mkdir('dist/assets',{recursive:true});
for(const f of ['app.js','app.css'])await rm('dist/assets/'+f,{force:true});
await build({entryPoints:['src/entry.js'],bundle:true,format:'esm',outfile:'dist/assets/app.js',minify:true,target:'es2022',loader:{'.css':'text'},define:{__SHOWCASE__:'false','process.env.NODE_ENV':'"production"'},plugins:[{name:'runtime-data',setup(build){build.onResolve({filter:/^\.\/data\.js$/},args=>({path:new URL('../src/runtime-data.js',import.meta.url).pathname}));}}],legalComments:'eof',banner:{js:licenseBanner}});
await copyFile('public/icon.png','dist/icon.png');
if(local)await writeFile('dist/index.html','<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="app"></div><script type="module" src="./assets/app.js"></script></html>');
else console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
