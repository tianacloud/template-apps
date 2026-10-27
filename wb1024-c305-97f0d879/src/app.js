const base = new URL('.', import.meta.url);
const [body, worker] = await Promise.all(['body.html','worker.txt'].map(x => fetch(new URL(x, base)).then(r => { if (!r.ok) throw Error(x); return r.text(); })));
document.body.innerHTML = body;
const style = document.createElement('link'); style.rel='stylesheet'; style.href=new URL('style.css', base); document.head.append(style);
const box = document.createElement('script'); box.type='text/heji-worker'; box.id='hejiWorkerSrc'; box.textContent=worker; document.head.append(box);
for(let i=2;i<=12;i++){ await new Promise((resolve,reject)=>{const s=document.createElement('script');s.charset='utf-8';s.src=new URL(`script${i}.js`,base);s.onload=resolve;s.onerror=reject;document.body.append(s);}); }
document.dispatchEvent(new Event('DOMContentLoaded'));
