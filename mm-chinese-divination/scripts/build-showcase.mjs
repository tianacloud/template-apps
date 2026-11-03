import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const result=await build({entryPoints:['src/main.js'],bundle:true,write:false,format:'iife',minify:true,plugins:[{name:'preview',setup(build){
 build.onResolve({filter:/^\.\/api\.js$/},()=>({path:resolve('showcase/mock-api.js')}));
 build.onResolve({filter:/^\.\/load-style\.js$/},()=>({path:'empty',namespace:'empty'}));
 build.onLoad({filter:/.*/,namespace:'empty'},()=>({contents:''}));
 build.onLoad({filter:/style\.css$/},()=>({contents:''}));
 build.onLoad({filter:/shell\.html$/},async({path})=>({contents:(await readFile(path,'utf8')).replace('保存的卦象存于此应用，获授权者可共享查看所问何事、所起何卦与所得何断。','演示数据仅在当前页面保留，刷新后清空。'),loader:'text'}));
}}],loader:{'.html':'text'}});
const css=await readFile('src/style.css','utf8');
const js=result.outputFiles[0].text.replace('保存的卦象存于此应用，获授权者可共享查看所问何事、所起何卦与所得何断。','演示数据仅在当前页面保留，刷新后清空。').replaceAll('</script','<\\/script');
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>灵签易占</title><style>${css}</style></head><body><div id="app"></div><script>${js}</script></body></html>`;
if(Buffer.byteLength(html)>500000)throw new Error('preview exceeds 500 KB');
await writeFile('showcase/preview.html',html);
