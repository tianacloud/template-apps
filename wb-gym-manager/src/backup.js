const encoder = new TextEncoder(), decoder = new TextDecoder();
const b64 = bytes => btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
const un64 = text => Uint8Array.from(atob(text), char => char.charCodeAt(0));
async function keyFor(password,salt,usage){const base=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:210000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,[usage]);}
export async function encodeBackup(records,password=''){
 const plain=JSON.stringify({version:1,records});
 if(!password)return JSON.stringify({version:1,encrypted:false,data:plain});
 const salt=crypto.getRandomValues(new Uint8Array(16)), iv=crypto.getRandomValues(new Uint8Array(12));
 const key=await keyFor(password,salt,'encrypt');
 const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,encoder.encode(plain));
 return JSON.stringify({version:1,encrypted:true,salt:b64(salt),iv:b64(iv),data:b64(new Uint8Array(cipher))});
}
function legacyDecrypt(value,password){let seed=5381;for(let i=0;i<password.length;i++)seed=((seed<<5)+seed+password.charCodeAt(i))>>>0;const input=un64(value), output=new Uint8Array(input.length);for(let i=0;i<input.length;i++)output[i]=input[i]^((seed+i*131)>>>0&255);return decoder.decode(output);}
export async function decodeBackup(text,password=''){
 const envelope=JSON.parse(text);let raw;
 if(envelope.encrypted===true){if(!password)throw new Error('请输入备份密码');const key=await keyFor(password,un64(envelope.salt),'decrypt');try{raw=decoder.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(envelope.iv)},key,un64(envelope.data)));}catch{throw new Error('密码错误或备份已损坏');}}
 else if(envelope.enc===true){if(!password)throw new Error('请输入备份密码');raw=legacyDecrypt(envelope.data,password);}
 else if(envelope.encrypted===false||envelope.enc===false)raw=envelope.data;
 else raw=text;
 let payload;try{payload=typeof raw==='string'?JSON.parse(raw):raw;}catch{throw new Error('密码错误或备份已损坏');}
 if(!Array.isArray(payload.records)){
  if(!Array.isArray(payload.orders)||!Array.isArray(payload.customers))throw new Error('不是有效的备份文件');
  const map={orders:'order',customers:'customer',coaches:'coach',stores:'store',courses:'course'};
  payload={records:Object.entries(map).flatMap(([key,kind])=>(payload[key]||[]).map((value,i)=>({kind,id:String(value.id??i),payload:kind==='coach'?{...value,bankName:value.bank?.name||value.bankName||'',account:value.bank?.account||value.account||'',holder:value.bank?.holder||value.holder||''}:value}))).concat(payload.settings?[{kind:'settings',id:'default',payload:payload.settings}]:[])};
 }
 const kinds=new Set(['order','customer','coach','store','course','settings']), ids=new Set();
 if(payload.records.length>10000)throw new Error('备份记录过多');
 for(const r of payload.records){if(!kinds.has(r.kind)||typeof r.id!=='string'||!r.id||typeof r.payload!=='object'||!r.payload||Array.isArray(r.payload))throw new Error('备份记录格式无效');const key=r.kind+'\0'+r.id;if(ids.has(key))throw new Error('备份包含重复记录');ids.add(key);}
 return payload.records;
}
