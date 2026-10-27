import {readFile,writeFile,mkdir,rm,copyFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[a-f0-9]{40}$/.test(commit||'')) throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8')); if(process.env.TIANA_TEMPLATE_BUILD!=='1' && (!source.git_instance_id || source.git_instance_id.startsWith('__TIANA_'))) throw Error('请填写 Git 实例 ID');
const css=await readFile('client/styles.css','utf8'); const files=['store','icons','ui','charts','poster','nl','pages','pages2','app']; const scripts=await Promise.all(files.map(x=>readFile(`client/js/${x}.js`,'utf8')));
const body='<div id="app" class="app"></div><div id="modal-root"></div><div id="toast" class="toast" role="status" aria-live="polite"></div>';
const setup=`document.title='青禾记账 · 本地账本';const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.appendChild(style);document.body.innerHTML=${JSON.stringify(body)};\n`;
await rm('dist',{recursive:true,force:true});await mkdir('dist/assets',{recursive:true});await writeFile('dist/assets/app.js',setup+scripts.join('\n;\n'));await copyFile('public/icon.png','dist/icon.png');await copyFile('public/sw.js','dist/sw.js');
const standalone='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>青禾记账</title><style>'+css+'</style></head><body>'+body+scripts.map(s=>'<script>'+s.replace(/<\/script/gi,'<\\/script')+'</script>').join('')+'</body></html>';await writeFile('dist/standalone.html',standalone);
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
