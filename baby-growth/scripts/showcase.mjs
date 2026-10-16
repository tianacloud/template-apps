import {build} from 'vite';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
process.env.VITE_SHOWCASE='true';
await build({build:{outDir:'dist-showcase',rollupOptions:{output:{inlineDynamicImports:true}}}});
const js=await readFile('dist-showcase/assets/app.js','utf8');
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>宝贝成长记 · 示例体验</title></head><body><div id="app"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script></body></html>`;
if(Buffer.byteLength(html)>500000)throw new Error('预览超过 500 KB。');
await mkdir('showcase',{recursive:true});await writeFile('showcase/preview.html',html);console.log(`showcase: ${Buffer.byteLength(html)} bytes`);
