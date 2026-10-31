import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
const html=readFileSync('index.html','utf8');
const body=html.split('<body>')[1].split('<script src="assets/engine.js">')[0];
const scripts=['assets/engine.js','assets/charts.js','assets/app.js'].map(f=>readFileSync(f,'utf8')).join('\n');
mkdirSync('dist/assets',{recursive:true});
writeFileSync('dist/assets/app.js',`export async function mount(root, context) {
root.innerHTML=${JSON.stringify(body)};
try { const response = await context.files.get('template-assets/demo.csv'); if (!response.ok) throw new Error('read failed'); window.DEMO_CSV = await response.text(); window.DEMO_META = {title: '示范井组 Z12 / Z15 / Z18'}; } catch (error) { root.innerHTML = '<p role="alert">示范数据读取失败，请检查网络后重新打开应用。</p>'; return; }\nconst link=document.createElement('link'); link.rel='stylesheet'; link.href=new URL('./style.css',import.meta.url).href; document.head.appendChild(link);\n${scripts}
}`);
copyFileSync('assets/style.css','dist/assets/style.css'); copyFileSync('icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(readFileSync('source.json')).git_instance_id}));
