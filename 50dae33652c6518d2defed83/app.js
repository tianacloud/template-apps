const base = new URL("../", import.meta.url);
const load = src => new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=new URL(src,base);s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
const css=document.createElement("link");css.rel="stylesheet";css.href=new URL("style.css",base);document.head.appendChild(css);
const response=await fetch(new URL("body.html",base));document.getElementById("app").innerHTML=await response.text();
await load("vendor/pdf-lib.min.js");await load("vendor/pdf.min.js");await import(new URL("logic.js",base));
