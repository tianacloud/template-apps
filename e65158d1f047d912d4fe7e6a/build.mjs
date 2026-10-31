import fs from 'node:fs/promises';
import {build} from 'esbuild';
const html=await fs.readFile('src/editor.html','utf8');
const style=html.match(/<style[^>]*>([\s\S]*?)<\/style>/i)[1];
let body=html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)[1];
const scripts=[];
body=body.replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi,(_,attrs,code)=>{scripts.push(code);return attrs.includes('detector-code')?'<script id="detector-code" type="text/plain">'+code+'</script>':''});
await fs.mkdir('dist/assets',{recursive:true});
const boot=`import {createTianaFetch} from '@tianacloud/serverless';
export async function mount(root,{files:cloudFiles}) {
async function cloudQuery(sql,values=[]) {
 const c=await window.tiana.connection();
 if(c.sql_api!=='hrana-v3'||!window.tiana.auth?.getAccessToken)throw new Error('数据库连接尚未就绪');
 const send=createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
 const response=await send(c.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:values.map(value=>({type:'text',value:String(value)})),want_rows:true}},{type:'close'}]})});
 if(!response.ok)throw new Error('数据库操作结果未确认，请刷新后检查');
 const result=(await response.json()).results?.[0];if(result?.type!=='ok'||result.response?.type!=='execute')throw new Error('数据库操作失败');return result.response.result;
}
async function cloudPreference(key,value){await cloudQuery('INSERT INTO preferences (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,value]);}
async function cloudLoadPreferences(){const result=await cloudQuery('SELECT key,value FROM preferences');return Object.fromEntries(result.rows.map(row=>[row[0].value,row[1].value]));}
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:${JSON.stringify(style)}}));
root.innerHTML=${JSON.stringify(body)};
`;
await fs.writeFile('dist/generated-entry.js',boot+scripts.join('\n;\n')+'\n}\n');
await build({entryPoints:['dist/generated-entry.js'],outfile:'dist/assets/app.js',bundle:true,format:'esm',platform:'browser'});
await fs.rm('dist/generated-entry.js');
await fs.copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...JSON.parse(await fs.readFile('source.json','utf8'))}));
