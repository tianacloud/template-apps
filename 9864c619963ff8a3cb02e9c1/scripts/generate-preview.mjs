import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
const result = await build({entryPoints:['src/entry.js'], bundle:true, write:false, format:'esm', target:'esnext', minify:true, outdir:'out', plugins:[{name:'preview-only', setup(b) {
  b.onResolve({filter:/^@tianacloud\/serverless$/},()=>({path:'db',namespace:'preview'}));
  b.onResolve({filter:/^\.\/leaflet\.js$/},()=>({path:'leaflet',namespace:'preview'}));
  b.onLoad({filter:/.*/,namespace:'preview'},args=>({contents:args.path==='db' ? 'export const createTianaFetch = () => { throw new Error("preview has no database") }' : 'export default {}',loader:'js'}));
}}]});
const js=result.outputFiles.find(x=>x.path.endsWith('.js')).text.replaceAll('</script','<\\/script');
const css=result.outputFiles.find(x=>x.path.endsWith('.css')).text;
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}\n#preview-bar{display:flex;align-items:center;justify-content:center;background:#fff;color:#222;padding:6px;font:14px sans-serif} #preview-bar button{margin-left:10px}</style></head><body><script>window.TRAVEL_PREVIEW=true</script><script type="module">${js}\nconst bar=document.createElement('div');bar.id='preview-bar';bar.textContent='示例体验 · 状态仅保存在当前页面';const button=document.createElement('button');button.textContent='恢复示例';button.onclick=()=>window.resetTravelExample();bar.append(button);document.body.prepend(bar);</script></body></html>`;
await writeFile('showcase/preview.html',html); console.log('preview bytes',Buffer.byteLength(html));
