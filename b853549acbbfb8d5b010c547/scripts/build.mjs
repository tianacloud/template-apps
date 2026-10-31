import { readFile, mkdir, writeFile, copyFile, rm } from 'node:fs/promises';
const html=await readFile('app.html','utf8');
const style=html.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1];
const body=html.match(/<body[^>]*>([\s\S]*?)<script[^>]*>/i)?.[1];
const script=html.match(/<script[^>]*>([\s\S]*?)<\/script>/i)?.[1];
if(!style||!body||!script) throw Error('Invalid application HTML');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const faces=[['sans',[300,400,500,600,700]],['serif',[400,600,700]]].flatMap(([family,weights])=>weights.map(weight=>({family,weight})));
await writeFile('dist/assets/app.js',`export async function mount(root, context) {
const loaded=[]; let style;
try {
for(const {family,weight} of ${JSON.stringify(faces)}) { const response=await context.files.get('template-assets/fonts/'+family+'-'+weight+'.woff2'); if(!response.ok) throw Error('字体读取失败'); const font=new FontFace('Noto '+(family==='serif'?'Serif':'Sans')+' SC',await response.arrayBuffer(),{weight:String(weight),display:'swap'}); await font.load(); document.fonts.add(font); loaded.push(font); }
document.title='随遇而旅'; style=document.createElement('style'); style.textContent=${JSON.stringify(style)}; document.head.appendChild(style); root.innerHTML=${JSON.stringify(body)};
${script}
return ()=>{style.remove(); loaded.forEach(font=>document.fonts.delete(font));};
} catch(error) { loaded.forEach(font=>document.fonts.delete(font)); if(style) style.remove(); root.textContent='字体加载失败，请检查网络后重新打开。'; console.error(error); }
}`);
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
