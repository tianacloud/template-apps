import {readFileSync,cpSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true}); mkdirSync('dist/assets',{recursive:true}); for (const name of ['app.js','styles.css','lib']) cpSync('app/'+name,'dist/assets/'+name,{recursive:true}); cpSync('icon.png','dist/icon.png');
const body=readFileSync('body.html','utf8');
writeFileSync('dist/assets/entry.js',`export async function mount(root, context) { window.templateFiles = context.files; root.insertAdjacentHTML('beforeend',${JSON.stringify(body)}); const link=document.createElement('link'); link.rel='stylesheet'; link.href=new URL('./styles.css',import.meta.url); document.head.append(link); const script=document.createElement('script'); script.src=new URL('./app.js',import.meta.url); document.body.append(script); }`);
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/entry.js',...JSON.parse(readFileSync('source.json','utf8'))}));
