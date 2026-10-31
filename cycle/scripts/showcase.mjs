import { build } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
await build({ resolve:{ alias:[{find:'./repository.js',replacement:resolve('src/demo-repository.js')}] }, build: { outDir: '.test-output/showcase', minify:true } });
const js=await readFile('.test-output/showcase/assets/app.js','utf8');
const css=await readFile('.test-output/showcase/assets/app.css','utf8');
// The standalone preview embeds the same application and replaces only its repository.
const script=js;
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>周期 · 示例体验</title><style>${css}</style></head><body><div id="app"></div><script type="module">${script.replaceAll('</script','<\\/script')}</script></body></html>`;
if(Buffer.byteLength(html)>500000) throw new Error('预览 HTML 超过 500 KB。');
await mkdir('showcase',{recursive:true});await writeFile('showcase/preview.html',html);
console.log(`showcase/preview.html: ${Buffer.byteLength(html)} bytes`);
