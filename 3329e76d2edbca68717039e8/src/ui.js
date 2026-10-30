import css from './style.css?inline';
export const preview=import.meta.env.MODE==='showcase';
const style=document.createElement('style');style.textContent=css;document.head.append(style);
export const $=(s)=>document.querySelector(s);
export const $$=(s)=>[...document.querySelectorAll(s)];
export const esc=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const clone=x=>structuredClone(x);
export const uid=()=>[...crypto.getRandomValues(new Uint32Array(4))].map(x=>x.toString(16).padStart(8,'0')).join('');
export function shell(name,english,links,content){
 document.title=name;
 $('#app').innerHTML=`${preview?'<div class="notice">示例体验 · 数据仅保留在本页 <button id="reset-example">恢复示例</button></div>':''}<header><div class="brand">${esc(name)}<small>${esc(english)}</small></div><nav>${links.map(([id,label])=>`<a class="${location.hash==='#'+id?'active':''}" href="#${id}">${esc(label)}</a>`).join('')}</nav></header><main>${content}<div id="status" class="status" role="status" aria-live="polite"></div></main><footer>留一点余地，把事情做得更明白。</footer>`;
}
export function message(text,error=false){const e=$('#status');if(e){e.textContent=text;e.className='status '+(error?'error':'success')}}
export function confirmAction(text,action){
 const wrap=document.createElement('div');wrap.className='overlay';wrap.innerHTML=`<div role="dialog" aria-modal="true" aria-label="确认操作"><h2>${esc(text)}</h2><p>此操作会更新当前内容。</p><div class="row"><button id="cancel-action">取消</button><button class="primary" id="confirm-action">确认</button></div></div>`;document.body.append(wrap);wrap.querySelector('#cancel-action').onclick=()=>wrap.remove();wrap.querySelector('#confirm-action').onclick=async()=>{wrap.remove();try{await action()}catch(e){message(e.message,true)}};wrap.querySelector('#cancel-action').focus();
}
export async function copy(text){try{await navigator.clipboard.writeText(text);message('已复制')}catch{message('复制不可用，请选择并复制文本',true)}}
export function download(text,name,type='text/plain'){if(preview){message('安装后可下载文件；示例体验仅保留本页内容');return}const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export function dayKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
