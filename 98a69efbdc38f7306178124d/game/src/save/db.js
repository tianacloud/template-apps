import { createTianaFetch } from '@tianacloud/serverless';
async function sql(statement, values = []) {
 const auth = window.tiana?.auth;
 if (typeof auth?.getAccessToken !== 'function') throw new Error('账号鉴权未就绪');
 const connection = await window.tiana.connection();
 if (connection.sql_api !== 'hrana-v3') throw new Error('数据库协议不支持');
 const transport = createTianaFetch({origin:connection.origin,auth,requestBodyMode:'buffered'});
 const args=values.map(v=>Number.isInteger(v)?{type:'integer',value:String(v)}:{type:'text',value:String(v)});
 const response=await transport(`${connection.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args,want_rows:true}},{type:'close'}]})});
 if(!response.ok) throw new Error('数据库操作结果未知，请刷新核对');
 const result=(await response.json()).results?.[0];
 if(result?.type!=='ok'||result.response?.type!=='execute') throw new Error('数据库操作失败或结果未知，请刷新核对');
 return result.response.result.rows||[];
}
let writes = Promise.resolve();
export async function saveSlot(slot,data) {const payload={...data,slot:Number(slot),savedAt:Date.now()}; const op = writes.then(() => sql('INSERT INTO saves (slot,payload) VALUES (?,?) ON CONFLICT(slot) DO UPDATE SET payload=excluded.payload',[payload.slot,JSON.stringify(payload)])); writes = op; await op; return payload;}
export async function loadSlot(slot) {const rows=await sql('SELECT payload FROM saves WHERE slot=?',[Number(slot)]); return rows.length?JSON.parse(rows[0][0].value):null;}
export async function listSlots() {return (await sql('SELECT payload FROM saves ORDER BY slot')).map(row=>JSON.parse(row[0].value));}
export async function deleteSlot(slot) {await sql('DELETE FROM saves WHERE slot=?',[Number(slot)]);}

export function exportSave(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `艾泽残响-存档-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function pickJsonFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';
    document.getElementById('save-file-picker')?.remove();
    input.id = 'save-file-picker';
    document.body.appendChild(input);
    input.onchange = () => {
      input.remove();
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => {
        try { resolve(JSON.parse(String(reader.result))); }
        catch (e) { resolve(null); }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}
