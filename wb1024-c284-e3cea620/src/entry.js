const base=new URL('.',import.meta.url);
const css=document.createElement('link'); css.rel='stylesheet'; css.href=new URL('style.css',base); document.head.append(css);
const html=await fetch(new URL('body.html',base)).then(r=>{if(!r.ok)throw new Error('页面资源加载失败');return r.text()});
document.body.innerHTML=html;
for(let i=0;i<7;i++){await new Promise((resolve,reject)=>{let s=document.createElement('script');s.charset='utf-8';s.src=new URL(i+'.js',base);s.onload=resolve;s.onerror=reject;document.body.append(s)})}
