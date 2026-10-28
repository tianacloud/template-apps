import './app.css';
const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./app.css',import.meta.url).href;document.head.appendChild(style);
import body from './body.html?raw';
import { createTianaFetch } from '@tianacloud/serverless';
document.getElementById('app').innerHTML=body;
const overlay=document.createElement('div');overlay.id='loading-overlay';overlay.textContent='正在连接账本…';overlay.style.cssText='position:fixed;inset:0;z-index:99999;background:#fff;display:grid;place-items:center';document.body.appendChild(overlay);
let conn,fetcher,chain=Promise.resolve();
async function execute(sql,args=[]){
 const response=await fetcher(conn.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
 if(!response.ok)throw Error('SQL request failed');const b=await response.json();const x=b.results?.[0];if(x?.type!=='ok'||x.response?.type!=='execute')throw Error('SQL rejected or unknown');return x.response.result;
}
window.ledgerStore={async connect(){if(!window.tiana?.auth?.getAccessToken)throw Error('auth unavailable');conn=await window.tiana.connection();if(conn.sql_api!=='hrana-v3')throw Error('unsupported protocol');fetcher=createTianaFetch({origin:conn.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});},async load(){let r=await execute('SELECT data FROM ledger WHERE id=1');return r.rows?.[0]?.[0]?.value||null;},async save(data){chain=chain.then(()=>execute('INSERT INTO ledger(id,data) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',[{type:'text',value:data}]));return chain;}};
await import('./legacy.js');
