import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
const r=f=>readFile('src/'+f,'utf8');
const [body,css,data,takeout,icons,app]=await Promise.all(['body.html','style.css','data.js','takeout.js','icons.js','app.js'].map(r));
const subset=vm.runInNewContext(data+'\nJSON.stringify({CATS,INGREDIENTS,PANTRY,RECIPES:RECIPES.slice(0,80)})');
const d=JSON.parse(subset); const vars=Object.entries(d).map(([k,v])=>`const ${k}=${JSON.stringify(v)};`).join('\n');
await writeFile('showcase/preview.html',`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body>${body}<script>${vars}\n${takeout}\n${icons}\n${app}</script></body></html>`);
