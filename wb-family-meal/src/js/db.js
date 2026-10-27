import { sql } from './sql.js';
let user;
const rows = async (query, args=[]) => (await sql(query,args)).rows.map(row => Object.fromEntries(Object.entries(row).map(([k,v]) => [k, ['id','family_id','category_id','dish_id','order_id','sort_order','is_active','qty','price','total_count','seen_by_cook'].includes(k) && v !== null ? Number(v) : k === 'tags' ? JSON.parse(v || '[]') : v])));
const one = async (query,args=[]) => (await rows(query,args))[0] || null;
const encode = (v) => Array.isArray(v) ? JSON.stringify(v) : typeof v === 'boolean' ? Number(v) : v;
async function insert(table,payload) { const keys=Object.keys(payload); return one(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')}) RETURNING *`,keys.map(k=>encode(payload[k]))); }
async function update(table,id,patch) { const keys=Object.keys(patch); return one(`UPDATE ${table} SET ${keys.map(k=>`${k}=?`).join(',')} WHERE id=? RETURNING *`,[...keys.map(k=>encode(patch[k])),Number(id)]); }
async function remove(table,id) { return (await sql(`DELETE FROM ${table} WHERE id=?`,[Number(id)])).affectedRows; }
export async function getSession() { if (!user) { const res=await fetch('./_tiana/session',{credentials:'same-origin'}); if(!res.ok) throw new Error('无法读取登录身份'); const data=await res.json(); const id=data.user?.user_id || data.user?.id; if(!id) throw new Error('当前会话缺少用户身份'); user={id,name:data.user.display_name || data.user.username || data.user.label || '家人'}; } return {user}; }
export async function getUserId(){return (await getSession()).user.id;}
export async function fetchMembership(){ const u=(await getSession()).user; let m=await one('SELECT * FROM members WHERE owner_id=?',[u.id]); if(!m) { await sql('INSERT OR IGNORE INTO members(owner_id,nickname,role) VALUES(?,?,?)',[u.id,u.name,'diner']); m=await one('SELECT * FROM members WHERE owner_id=?',[u.id]); } return m; }
export async function fetchFamily(){return one('SELECT * FROM family WHERE id=1');}
export async function listMembers(){return rows('SELECT * FROM members ORDER BY created_at,id');}
export async function updateMember(id,p){return update('members',id,p)}
export async function updateFamily(id,p){return update('family',id,p)}
export async function listCategories(){return rows('SELECT * FROM categories ORDER BY sort_order,id')}
export async function createCategory(p){return insert('categories',p)}
export async function updateCategory(id,p){return update('categories',id,p)}
export async function deleteCategory(id){await sql('UPDATE dishes SET category_id=NULL WHERE category_id=?',[Number(id)]); return remove('categories',id)}
export async function listDishes(){return rows('SELECT * FROM dishes WHERE is_active=1 ORDER BY sort_order,id DESC')}
export async function getDish(id){return one('SELECT * FROM dishes WHERE id=?',[Number(id)])}
export async function createDish(p){return insert('dishes',p)}
export async function updateDish(id,p){return update('dishes',id,p)}
export async function deleteDish(id){return remove('dishes',id)}
export async function listFridgeItems(){return rows('SELECT * FROM fridge_items ORDER BY created_at DESC,id DESC')}
export async function createFridgeItem(p){return insert('fridge_items',p)}
export async function updateFridgeItem(id,p){return update('fridge_items',id,p)}
export async function deleteFridgeItem(id){return remove('fridge_items',id)}
export async function clearFridgeItems(){return (await sql('DELETE FROM fridge_items')).affectedRows}
export async function listOrders(){return rows('SELECT * FROM orders ORDER BY created_at DESC,id DESC LIMIT 80')}
export async function listOrderItems(ids){return ids.length ? rows(`SELECT * FROM order_items WHERE order_id IN (${ids.map(()=>'?').join(',')})`,ids.map(Number)) : []}
export async function createOrderWithItems({familyId,ordererName,mealType,note,serveDate,items}) { return insert('orders',{family_id:familyId,owner_id:await getUserId(),orderer_name:ordererName,meal_type:mealType,note:note||'',serve_date:serveDate,total_count:items.reduce((n,i)=>n+i.qty,0),items_json:JSON.stringify(items)}); }
export async function updateOrder(id,p){return update('orders',id,p)}
export async function deleteOrder(id){return remove('orders',id)}
const PENDING_PREFIX='family-meal-upload:';
async function digest(blob){const bytes=await blob.arrayBuffer();return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function finishUpload(info){
 const files=window.tiana?.files;if(!files)throw Error('文件功能未就绪');
 let status=await files.uploadStatus(info.uploadId);if(!status.completed)status=await files.completeUpload(info.uploadId);if(!status.completed)throw Error('上传尚未确认，请稍后恢复');
 const response=await files.get(info.path);if(!response.ok)throw Error('图片下载核对失败，请稍后恢复');const blob=await response.blob();if(blob.size!==info.size || await digest(blob)!==info.sha256)throw Error('图片摘要核对不一致，请保留记录并检查');
 const existing=await one('SELECT * FROM dishes WHERE upload_key=?',[info.key]);let result=existing;
 if(!result){const payload={...info.payload,image_path:info.path,upload_key:info.key};try{result=info.dishId?await updateDish(info.dishId,payload):await createDish(payload);}catch(err){result=await one('SELECT * FROM dishes WHERE upload_key=?',[info.key]);if(!result)throw Error('菜品保存结果未确认，请稍后恢复');}}
 if(!result)throw Error('菜品不存在，请检查后恢复');localStorage.removeItem(PENDING_PREFIX+info.key);return result;
}
export async function saveDishWithImage(file,payload,dishId=null){
 if(file.size>8*1024*1024)throw Error('请选择 8MB 以内的图片');
 if(Object.keys(localStorage).some(k=>k.startsWith(PENDING_PREFIX)))throw Error('有未完成的图片上传，请先刷新并恢复');
 const files=window.tiana?.files;if(!files)throw Error('文件功能未就绪');const key=crypto.randomUUID();const ext=(file.name.split('.').pop()||'jpg').replace(/[^a-zA-Z0-9]/g,'');const path=`dishes/${key}.${ext}`;
 const info={key,path,size:file.size,sha256:await digest(file),payload,dishId,uploadId:''};
 try { await files.put(path,file,{onPrepared:r=>{info.uploadId=String(r.id);localStorage.setItem(PENDING_PREFIX+key,JSON.stringify(info));}}); }
 catch(err){if(!info.uploadId)throw err;}
 if(!info.uploadId)throw Error('上传凭据未确认，请检查文件状态');
 try{return await finishUpload(info)}catch(err){throw Error('图片上传或保存尚未确认，请保留记录并稍后刷新恢复：'+err.message)}
}
export async function recoverPendingUploads(){const keys=Object.keys(localStorage).filter(k=>k.startsWith(PENDING_PREFIX));let recovered=0;for(const key of keys){const info=JSON.parse(localStorage.getItem(key));await finishUpload(info);recovered++;}return recovered;}
export async function removeStorageObjects(paths){for(const path of paths) await window.tiana.files.delete(path)}
export async function signImagePaths(paths){const out={};for(const p of paths)out[p]=await window.tiana.files.getUrl(p);return out;}
