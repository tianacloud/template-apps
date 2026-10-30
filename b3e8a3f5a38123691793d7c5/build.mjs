import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {build} from 'esbuild';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const [body,css,logic,params]=await Promise.all(['src/body.html','src/style.css','src/logic.js','source.json'].map(p=>readFile(p,'utf8')));
const names=['qMW27B4qFcFnSWSL3EcGXt.jpg','xhM6ZtrZnyt7N8BETgA0cy.jpg','csHRvcKXZe5Oq4CmNWZqpA.jpg','C9BAC69yr16SX0HKoGm11R.jpg','sO0E37jjR24DHvtBdP7gzv.jpg'];
const prefix=`import {createTianaFetch} from '@tianacloud/serverless';
export async function mount(root,{files}) {
try {
 const connection=await window.tiana.connection();
 if(connection.sql_api!=='hrana-v3' || !window.tiana.auth?.getAccessToken) throw Error('数据库连接不可用');
 const http=createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
 async function execute(sql,args=[]) { const response=await http(connection.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})}); if(!response.ok) throw Error('数据库请求未确认'); const result=(await response.json()).results?.[0]; if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作未确认'); return result.response.result; }
 const row=await execute('SELECT data FROM learning_progress WHERE id=1');
 const initialState=row.rows?.length ? JSON.parse(row.rows[0][0].value) : null;
 let chain=Promise.resolve(), failed=false;
 function queueSave(value) { if(failed) return; chain=chain.then(()=>execute('INSERT INTO learning_progress(id,data) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',[{type:'text',value}])).catch(()=>{failed=true;const notice=document.createElement('div');notice.setAttribute('role','alert');notice.style.cssText='position:fixed;top:0;z-index:99999;background:#fff3cd;color:#332;padding:12px';notice.textContent='保存结果未确认，请刷新后核对云端进度。';root.append(notice)}); }
 const imageUrls={}; for(const name of ${JSON.stringify(names)}) imageUrls[name]=await files.getUrl('template-assets/images/'+name);
 const style=document.createElement('style'); style.textContent=${JSON.stringify(css)}; document.head.appendChild(style);
 document.title='五千年，等你来挖 · 七年级历史寻宝记';
 root.innerHTML=${JSON.stringify(body)}.replace('__ASSET_BASE__qMW27B4qFcFnSWSL3EcGXt.jpg',imageUrls['qMW27B4qFcFnSWSL3EcGXt.jpg']);
`;
const source=logic.replace(/"__ASSET_BASE__([^" ]+)"/g,(_,file)=>`imageUrls[${JSON.stringify(file)}]`);
await writeFile('dist/entry.js',prefix+source+`\n} catch(error) {root.textContent='无法连接学习进度或素材，请检查连接后重新打开。'; console.error(error);}\n}`);
await build({entryPoints:['dist/entry.js'],bundle:true,format:'esm',outfile:'dist/assets/app.js'}); await rm('dist/entry.js'); await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...JSON.parse(params)}));
