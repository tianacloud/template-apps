import {build,transform} from 'esbuild';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const result=await build({entryPoints:['src/demo.jsx'],bundle:true,minify:true,format:'iife',target:'es2022',write:false,loader:{'.css':'text','.md':'text','.txt':'text'},plugins:[{name:'css-text',setup(b){b.onLoad({filter:/\.css$/},async args=>({contents:(await transform(await readFile(args.path,'utf8'),{loader:'css',minify:true})).code,loader:'text'}));}}],define:{'process.env.NODE_ENV':'"production"','process.env.TIANA_TEMPLATE_SOURCE_URL':'"https://github.com/tianacloud/template-apps"','process.env.TIANA_DEMO':'"true"'},legalComments:'none'});
const js=result.outputFiles[0].text.replaceAll('</script','<\\/script');
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>openGym · 训练日志</title></head><body><div id="app"></div><script>${js}</script></body></html>`;
if(Buffer.byteLength(html)>500000)throw new Error('预览超过 500 KB');
await mkdir('showcase',{recursive:true});await writeFile('showcase/preview.html',html);console.log(`Showcase ${Buffer.byteLength(html)} bytes`);
