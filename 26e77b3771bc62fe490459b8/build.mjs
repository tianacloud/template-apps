import {mkdir,copyFile,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
const html=await readFile('index.html','utf8');
const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
const body=html.match(/<body>([\s\S]*?)<script>/)[1];
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
await mkdir('dist/assets',{recursive:true});
const entry=`import {createTianaFetch} from '@tianacloud/serverless';
document.title='四象限待办助手';\nconst style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.appendChild(style);\ndocument.getElementById('app').innerHTML=${JSON.stringify(body)};\n${script}\nObject.assign(window,{toggleAxis,addTask,removeTask,toggleDone,clearDone,exportTasks,startEdit,onDragStart,dragOver,dragLeave,drop,setFilter,render});
// Delegate interactions so they also work under a strict hosted CSP.
function taskId(el) { const card=el.closest('.task'); return card?.getAttribute('ondragstart')?.match(/onDragStart\\(event,'([^']+)'\\)/)?.[1]; }
document.addEventListener('click',e=>{ const el=e.target.closest('button'); if(!el) return; let fn; if(el.id==='impBtn') fn=()=>toggleAxis('imp'); else if(el.id==='urgBtn') fn=()=>toggleAxis('urg'); else if(el.matches('.add-btn')) fn=addTask; else if(el.dataset.f) fn=()=>setFilter(el.dataset.f,el); else if(el.matches('.export')) fn=exportTasks; else if(el.matches('.tool-link')) fn=clearDone; else if(el.matches('.del')) fn=()=>removeTask(taskId(el),el); if(fn){e.stopImmediatePropagation();fn();}},true);
document.addEventListener('change',e=>{if(e.target.matches('.task input[type=checkbox]')){e.stopImmediatePropagation();toggleDone(taskId(e.target));}},true);
document.addEventListener('input',e=>{if(e.target.id==='searchInput') render();},true);
document.addEventListener('dblclick',e=>{if(e.target.matches('.t-text')){e.stopImmediatePropagation();startEdit(e.target,taskId(e.target));}},true);
document.addEventListener('dragstart',e=>{if(e.target.matches('.task')){e.stopImmediatePropagation();onDragStart(e,taskId(e.target));}},true);
for(const [name,fn] of [['dragover',dragOver],['dragleave',dragLeave],['drop',drop]]) document.addEventListener(name,e=>{const el=e.target.closest('[data-q]');if(el){e.stopImmediatePropagation();if(name==='dragleave') fn(el); else fn(e,el);}},true);`;
await build({stdin:{contents:entry,resolveDir:process.cwd(),sourcefile:'app.js'},bundle:true,format:'iife',platform:'browser',outfile:'dist/assets/app.js'});
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
