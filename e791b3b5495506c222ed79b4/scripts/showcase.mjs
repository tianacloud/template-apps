import {readFile,writeFile} from 'node:fs/promises';
const r=f=>readFile('src/'+f,'utf8');
const [body,css,takeout,icons,app]=await Promise.all(['body.html','style.css','takeout.js','icons.js','app.js'].map(r));
const d=JSON.parse(await readFile('template-files/data/recipes.json','utf8')); d.RECIPES=d.RECIPES.slice(0,80); const vars=Object.entries(d).map(([k,v])=>`const ${k}=${JSON.stringify(v)};`).join('\n');
await writeFile('showcase/preview.html',`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div style="padding:8px 12px;background:#fff7eb;text-align:center;font:14px sans-serif">示例体验 · 数据仅保存在当前页面 <button id="resetDemo" type="button">恢复示例</button></div>${body}<script>${vars}\n${takeout}\n${icons}\n${app}</script></body></html>`);
