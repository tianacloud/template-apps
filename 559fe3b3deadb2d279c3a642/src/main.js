import './style.css';
import body from './body.html?raw';
import { initializeQuiz } from './quiz.js';
import { createTianaFetch } from '@tianacloud/serverless';
const sheet=document.createElement('link'); sheet.rel='stylesheet'; sheet.href=new URL('app.css',import.meta.url).href; document.head.appendChild(sheet);
async function query(sql, args) {
  const c = await window.tiana.connection();
  if (c.sql_api !== 'hrana-v3') throw new Error('当前数据库协议不支持参数化操作');
  const send = createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  const response = await send(`${c.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:args.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw new Error('数据库请求未确认');
  const result=(await response.json()).results?.[0];
  if(result?.type!=='ok' || result.response?.type!=='execute') throw new Error('数据库操作失败');
  return result.response.result;
}
window.quizDatabase = {from() {return {select() {return {eq(_field,code) {return {async maybeSingle() {try {const r=await query('SELECT progress FROM sync_slots WHERE code = ?', [code]); return {data:r.rows?.length ? {progress:JSON.parse(r.rows[0][0].value)}:null,error:null};} catch(error){return {data:null,error};}}};}}}, async upsert(row) {try {await query('INSERT INTO sync_slots (code, progress) VALUES (?, ?) ON CONFLICT(code) DO UPDATE SET progress=excluded.progress',[row.code,JSON.stringify(row.progress)]);return {error:null};} catch(error){return {error};}}};}};
export async function mount(root, context) {
  root.innerHTML = body;
  root.inert = true;
  try {
    const response = await context.files.get('template-assets/question-bank.json');
    if (!response.ok) throw new Error('题库读取失败');
    Object.assign(window, await response.json());
    await initializeQuiz();
    root.inert = false;
  } catch (error) {
    root.textContent = '题库或进度读取失败，请刷新页面重试。';
    console.error(error);
  }
} 
