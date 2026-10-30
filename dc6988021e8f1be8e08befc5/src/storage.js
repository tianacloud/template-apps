import {createTianaFetch} from '@tianacloud/serverless';
export async function openStorage(){
 const connection=await window.tiana.connection();
 if(connection.sql_api!=='hrana-v3')throw Error('此应用需要 hrana-v3 数据库连接');
 const sqlFetch=createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
 async function execute(sql,args=[]){
  const response=await sqlFetch(`${connection.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:args.map(value=>typeof value==='number'?{type:'integer',value:String(value)}:{type:'text',value}),want_rows:true}},{type:'close'}]})});
  if(!response.ok)throw Error('数据库未确认结果，请重新读取存档核对');
  const body=await response.json(),result=body.results?.[0];if(result?.type!=='ok'||result.response?.type!=='execute')throw Error(result?.error?.message||'数据库未确认结果');
  const {rows,cols}=result.response.result;return rows.map(row=>Object.fromEntries(cols.map((col,i)=>[col.name,row[i].value??null])));
 }
 return {
  async read(){const [row]=await execute('SELECT data_json, updated_at FROM beatdown_save WHERE slot = 1');return row?{data:JSON.parse(row.data_json),updatedAt:Number(row.updated_at)}:null;},
  save:(data)=>execute('INSERT INTO beatdown_save (slot, data_json, updated_at) VALUES (1, ?, ?) ON CONFLICT(slot) DO UPDATE SET data_json=excluded.data_json, updated_at=excluded.updated_at',[JSON.stringify(data),Date.now()])
 };
}
