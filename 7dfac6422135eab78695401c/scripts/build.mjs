import {build} from 'esbuild';
import {readFile,mkdir,rm,writeFile,copyFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit||'')) throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
const html=await readFile('client/index.html','utf8'); const body=html.match(/<body>([\s\S]*?)<script src="food-db.js"><\/script>/)[1];
const css=await readFile('client/style.css','utf8'); const scripts=await Promise.all(['food-db.js','sample-photos.js','sample-data.js','app.js'].map(x=>readFile('client/'+x,'utf8')));
const events=await readFile('client/events.js','utf8');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const prefix=`import {createTianaFetch} from '@tianacloud/serverless';
export async function mount(root, {files}) {
 if (!files || !window.tiana?.auth?.getAccessToken) throw new Error('应用服务尚未就绪');
 const conn = await window.tiana.connection();
 if (conn.sql_api !== 'hrana-v3') throw new Error('不支持当前数据库协议');
 const sqlFetch = createTianaFetch({origin:conn.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
 async function execute(sql,args=[]) {
   const response=await sqlFetch(conn.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
   if(!response.ok) throw new Error('数据库操作结果未知');
   const body=await response.json(), statement=body.results?.[0];
   if(statement?.type!=='ok'||statement.response?.type!=='execute') throw new Error('数据库操作未确认');
   return statement.response.result;
 }
 const rows=await execute('SELECT value FROM nutri_state WHERE id=1');
 const initialValues=rows.rows?.length ? JSON.parse(rows.rows[0][0].value) : {};
 const photoUrls=new Map();
 for(const meal of initialValues.zs_meals_v1||[]) if(meal.photo && !meal.photo.startsWith('sample:')) { try { photoUrls.set(meal.photo,await files.getUrl(meal.photo)); } catch (_) { console.warn('餐食照片暂时不可读取'); } }
 let busy=false; const eventController=new AbortController();
 document.title='知食 · 每天知道自己吃了什么'; const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.appendChild(style);root.innerHTML=${JSON.stringify(body)};
`;
await writeFile('dist/assets/entry.js',prefix+scripts.join('\n;\n')+'\nObject.assign(window,{Onb,App,Add,Me,Sheet,Sample});\n'+events+'\nreturn () => { eventController.abort(); style.remove(); root.replaceChildren(); };\n}\n');
await build({entryPoints:['dist/assets/entry.js'],bundle:true,format:'esm',platform:'browser',outfile:'dist/assets/app.js'}); await rm('dist/assets/entry.js');
await copyFile('public/icon.png','dist/icon.png'); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
