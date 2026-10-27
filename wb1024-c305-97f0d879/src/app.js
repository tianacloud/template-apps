const base = new URL('.', import.meta.url);
const body=await fetch(new URL('body.html',base)).then(r=>r.text());
document.body.innerHTML = body;
const style = document.createElement('link'); style.rel='stylesheet'; style.href=new URL('style.css', base); document.head.append(style);
const marker=document.createElement('script');marker.dataset.ocrEntry='';marker.src=import.meta.url;marker.type='application/json';document.head.append(marker);
for(let i=2;i<=12;i++){ await new Promise((resolve,reject)=>{const s=document.createElement('script');s.charset='utf-8';s.src=new URL(`script${i}.js`,base);s.onload=resolve;s.onerror=reject;document.body.append(s);}); }
document.dispatchEvent(new Event('DOMContentLoaded'));
