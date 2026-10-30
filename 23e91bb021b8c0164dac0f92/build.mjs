import {build} from 'esbuild';
import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
const body=await readFile('public/body.html','utf8'), css=await readFile('public/app.css','utf8'), logic=await readFile('public/logic.js','utf8');
const entry=`import {createTianaFetch} from '@tianacloud/serverless';
export async function mount(root, {files}) {
 const style=document.createElement('style'); style.textContent=${JSON.stringify(css)}; document.head.append(style);
 root.innerHTML=${JSON.stringify(body)};
 try {
  const response=await files.get('template-assets/bg.jpg'); if(!response.ok) throw Error('背景讀取失敗');
  const imageURL=URL.createObjectURL(await response.blob()); document.documentElement.style.setProperty('--background-image','url("'+imageURL+'")');
  if(typeof window.tiana?.auth?.getAccessToken!=='function') throw Error('登入狀態未準備');
  const connection=await window.tiana.connection(); if(connection.sql_api!=='hrana-v3') throw Error('資料庫協議不支援');
  const request=createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  async function execute(sql,values=[]) {
   const args=values.map(value=>({type:'text',value:String(value)}));
   const res=await request(connection.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
   if(!res.ok) throw Error('資料庫請求結果不明'); const data=await res.json(), item=data.results?.[0];
   if(item?.type!=='ok'||item.response?.type!=='execute') throw Error('資料庫操作失敗或結果不明');
   const result=item.response.result; return (result.rows||[]).map(row=>Object.fromEntries(result.cols.map((col,i)=>[col.name,row[i]?.value??null])));
  }
  ${logic}
  return ()=>{ URL.revokeObjectURL(imageURL); style.remove(); };
 } catch(error) { console.error(error); root.innerHTML='<p role="alert">無法讀取資料或背景，請檢查連線後重新開啟。</p>'; }
}`;
await mkdir('dist/assets',{recursive:true});
await build({stdin:{contents:entry,resolveDir:process.cwd(),sourcefile:'entry.js',loader:'js'},outfile:'dist/assets/app.js',bundle:true,format:'esm'});
await copyFile('public/icon.png','dist/icon.png');
const params={entry:'assets/app.js',...JSON.parse(await readFile('source.json','utf8'))};
if(/^[a-f0-9]{40}$/.test(process.argv[2]||'')) params.source_commit=process.argv[2];
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify(params));
