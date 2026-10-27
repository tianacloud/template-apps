const root = new URL('./original/', import.meta.url);
const allowed = ['index','computer','majors','regions','departments','cooccur','exclusive'];
const route = location.hash.slice(1) || 'index';
const page = allowed.includes(route) ? route : 'index';
const response = await fetch(new URL(page + '.html', root));
if (!response.ok) throw new Error('页面加载失败');
const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
document.title = doc.title;
for (const style of doc.head.querySelectorAll('style,link[rel=stylesheet]')) {
  const el = style.cloneNode(true);
  if (el.tagName === 'LINK') el.href = new URL(el.getAttribute('href'),root).href;
  document.head.append(el);
}
document.body.innerHTML = doc.body.innerHTML;
for (const script of document.body.querySelectorAll('script')) script.remove();
document.addEventListener('click', e => {
 const a=e.target.closest('a'); if(!a) return;
 const href=a.getAttribute('href')||''; const match=href.match(/^(index|computer|majors|regions|departments|cooccur|exclusive)\.html$/);
 if(match){e.preventDefault();location.hash=match[1];location.reload();}
},true);
let inlineIndex=0;
for (const original of doc.body.querySelectorAll('script')) {
 const script=document.createElement('script');
 if(original.src){ script.src=new URL(original.getAttribute('src'),root).href; await new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=reject;document.body.append(script)}); }
 else { script.src=new URL(`${page}-inline-${inlineIndex++}.js`,root).href; await new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=reject;document.body.append(script)}); }
}
