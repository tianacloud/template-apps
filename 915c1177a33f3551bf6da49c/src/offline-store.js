// Local mirror and pending offline changes. The cloud remains authoritative.
const DB='iron-planner-offline-v1';
function open(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>req.result.createObjectStore('state');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function run(mode,action){const db=await open();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('state',mode),store=tx.objectStore('state'),req=action(store);let value;req.onsuccess=()=>{value=req.result};tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
export const getLocal=key=>run('readonly',s=>s.get(key));
export const putLocal=(key,value)=>run('readwrite',s=>s.put(value,key));
export async function offlineIdentity(){return getLocal('active');}
