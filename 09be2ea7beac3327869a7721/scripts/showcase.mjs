import {readFile,writeFile} from 'node:fs/promises';
const css=await readFile('src/style.css','utf8'),body=await readFile('src/layout.html','utf8');
let js=await readFile('src/circuit.js','utf8');
js=js.replace("if(!confirm('清空画板上所有元件与导线？')) return;",'');
const badge='<div style="position:fixed;bottom:8px;right:12px;z-index:30;background:white;border:1px solid #dde3ef;border-radius:8px;padding:6px 10px;color:#64748b;font:12px sans-serif">示例体验，数据仅保留在本页 <button id="resetDemo">恢复示例</button></div>';
await writeFile('showcase/preview.html',`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>电学实验室</title><style>${css}</style></head><body>${body}${badge}<script>${js}\ndocument.querySelector('#resetDemo').addEventListener('click',()=>{state.mode='sim';document.querySelectorAll('#modeSeg button').forEach(b=>b.classList.toggle('on',b.dataset.mode==='sim'));loadPreset(0)});</script></body></html>`);
