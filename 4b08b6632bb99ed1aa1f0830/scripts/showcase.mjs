import {readFile,writeFile} from 'node:fs/promises';
import {transform} from 'esbuild';
import vm from 'node:vm';
const html=await readFile('index.html','utf8');
const body=html.split('<body>')[1].split('<script src=')[0].replaceAll('导入内容保存于应用文件存储。','预览中的导入内容只在当前页面保留。').replaceAll('文档规则审查在浏览器本地运行，收藏和自检保存在应用数据库。','预览数据仅在当前页面保留。');
const css=await readFile('assets/css/app.css','utf8');
const names=['meta','regulations-cn','regulations-cn-ext','regulations-intl','registration-flow','review-rules','self-check','fulltext','market'];
const chunks=await Promise.all(names.map(n=>readFile(`data/${n}.js`,'utf8')));
const app=await readFile('assets/js/app.js','utf8');
for (const i of [1,2,3]) { const sandbox={window:{}}; vm.runInNewContext(chunks[i],sandbox); const [key,value]=Object.entries(sandbox.window)[0]; chunks[i]='window.'+key+'='+JSON.stringify(value.slice(0,12))+';'; }
const script=`${chunks.join('\n;\n')}
const initialBody=${JSON.stringify(body)};
function startDemo(){const cache=new Map();window.medregStorage={getItem:k=>cache.get(k)??null,setItem:(k,v)=>cache.set(k,String(v))};document.getElementById('demo-app').innerHTML=initialBody;
${app}
}
document.getElementById('demo-reset').addEventListener('click',startDemo); startDemo();`;
const js=(await transform(script,{minify:true,charset:'utf8'})).code.replaceAll('</script','<\\/script');
const content=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>医械法规云 · 示例体验</title><style>${css}\n.demo-bar{position:sticky;top:0;z-index:9999;background:#edf6ff;padding:8px 16px;font:14px sans-serif}.demo-bar button{margin-left:16px}</style></head><body><div class="demo-bar">示例体验：仅展示部分法规，更改只保留在本页面 <button id="demo-reset">恢复示例</button></div><div id="demo-app"></div><script>${js}<\/script></body></html>`;
if(Buffer.byteLength(content)>500000)throw Error(`预览超过大小限制: ${Buffer.byteLength(content)}`);
await writeFile('showcase/preview.html',content);
