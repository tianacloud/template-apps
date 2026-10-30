import {readFile,writeFile,unlink,copyFile} from 'node:fs/promises';
import {build} from 'vite';
const commit=process.argv[2];
if(!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit||'')) throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && [source.git_instance_id,source.database_instance_id].some(x=>!x||x.startsWith('__TIANA_'))) throw Error('请填写实例 ID');
const html=await readFile('client/index.html','utf8');
const css=html.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1];
const body=html.match(/<body[^>]*>([\s\S]*?)<script/)[1];
const script=html.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];
const entry=`import {sql} from './db.js';\nwindow.gameStore={read:async()=>{const r=await sql('SELECT data FROM game_save WHERE id = 1');return r.rows[0]?.data||null},write:async value=>{if(value===null) await sql('DELETE FROM game_save WHERE id = 1');else await sql('INSERT INTO game_save(id,data) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',[value]);}};\ndocument.title='码农人生';const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.appendChild(style);document.body.innerHTML=${JSON.stringify(body)};\n${script}`;
await writeFile('client/.generated-entry.js',entry);
try {await build({configFile:false,define:{'process.env.NODE_ENV':JSON.stringify('production')},build:{lib:{entry:'client/.generated-entry.js',formats:['es'],fileName:()=> 'assets/app.js'},outDir:'dist',emptyOutDir:true}});await copyFile('public/icon.png','dist/icon.png');} finally {await unlink('client/.generated-entry.js');}
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
