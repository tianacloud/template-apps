import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
const out='dist/assets'; await rm('dist',{recursive:true,force:true}); await mkdir(out,{recursive:true});
const html=await readFile('src/body.html','utf8'); const css=await readFile('src/style.css','utf8'); const logic=await readFile('src/logic.js','utf8');
const app=`document.body.innerHTML=${JSON.stringify(html)};\nconst style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.appendChild(style);\nconst load=(f)=>new Promise((ok,fail)=>{let s=document.createElement('script');s.src=new URL(f,import.meta.url).href;s.onload=ok;s.onerror=fail;document.head.appendChild(s)});\nawait load('pdf.min.js');await load('jspdf.umd.min.js');await load('UTIF.js');await load('dxf-parser.js');\n${logic}`;
await writeFile(`${out}/app.js`,app);
for(const [src,dst] of [['node_modules/pdfjs-dist/build/pdf.min.js','pdf.min.js'],['node_modules/pdfjs-dist/build/pdf.worker.min.js','pdf.worker.min.js'],['node_modules/jspdf/dist/jspdf.umd.min.js','jspdf.umd.min.js'],['node_modules/utif/UTIF.js','UTIF.js'],['node_modules/dxf-parser/dist/dxf-parser.js','dxf-parser.js'],['public/demo.png','demo.png']]) await copyFile(src,`${out}/${dst}`);
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8'));console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
